"""Portfolio Strategist main orchestrator graph.

Uses LangGraph Send API for parallel worker dispatch and
Annotated reducers for result merging.
"""

import os
import asyncio
import json
from datetime import datetime

from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langchain_groq import ChatGroq
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send

from agent.portfolio.state import PortfolioState, WorkerInputState
from agent.portfolio.config import PortfolioConfiguration
from agent.portfolio.prompts import (
    clarification_prompt,
    innovation_story_prompt,
    get_current_date,
)
from agent.portfolio.heuristics import apply_all_heuristics, format_heuristic_summary
from connectors.iqvia import IQVIAConnector
from connectors.trials import ClinicalTrialsConnector
from connectors.patents import PatentsConnector
from connectors.exim import EXIMConnector
from connectors.internal import InternalDocsConnector
from connectors.web import WebSearchConnector

load_dotenv()

if os.getenv("GROQ_API_KEY") is None:
    raise ValueError("GROQ_API_KEY is not set")

# Initialize connectors
iqvia_connector = IQVIAConnector()
trials_connector = ClinicalTrialsConnector()
patents_connector = PatentsConnector()
exim_connector = EXIMConnector()
internal_connector = InternalDocsConnector()
web_connector = WebSearchConnector()


def get_research_topic(messages: list) -> str:
    """Extract research topic from messages."""
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage) or (hasattr(msg, 'type') and msg.type == 'human'):
            content = msg.content if hasattr(msg, 'content') else str(msg)
            return content
    return ""


def clarify_scope(state: PortfolioState, config: RunnableConfig) -> dict:
    """Extract context chips from user query.
    
    Uses structured output with fallback for robustness.
    """
    configurable = PortfolioConfiguration.from_runnable_config(config)
    
    llm = ChatGroq(
        model=configurable.orchestrator_model,
        temperature=0.3,
        max_retries=2,
        api_key=os.getenv("GROQ_API_KEY"),
    )
    
    query = get_research_topic(state.get("messages", []))
    
    prompt = clarification_prompt.format(
        current_date=get_current_date(),
        query=query
    )
    
    try:
        response = llm.invoke(prompt)
        content = response.content
        
        # Try to parse JSON from response
        import re
        json_match = re.search(r'\{[^}]+\}', content, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            return {
                "molecule": parsed.get("molecule", "Unknown"),
                "therapy_area": parsed.get("therapy_area", "General"),
                "region": parsed.get("region", "Global"),
                "population": parsed.get("population", "General"),
                "formulation": parsed.get("formulation", "Any"),
                "current_phase": "gathering",
            }
    except Exception as e:
        print(f"Clarification parsing failed: {e}")
    
    # Fallback: Dynamic extraction from query
    # Extract meaningful words from query (not stopwords) for molecule/therapy
    query_lower = query.lower()
    words = [w for w in query.split() if len(w) > 3 and w.lower() not in 
             {'what', 'find', 'explore', 'opportunities', 'market', 'product', 
              'differentiated', 'analysis', 'about', 'with', 'from', 'that',
              'this', 'these', 'those', 'where', 'which', 'could', 'would',
              'should', 'into', 'their', 'there', 'been', 'being', 'have', 'will'}]
    
    # Use first significant word as molecule hint
    molecule = words[0].capitalize() if words else "General"
    
    # Detect therapy area from common terms
    therapy_area = "General"
    therapy_keywords = {
        "aging": "Anti-aging", "anti-aging": "Anti-aging", "longevity": "Anti-aging",
        "copd": "Respiratory", "respiratory": "Respiratory", "pulmonary": "Respiratory",
        "asthma": "Respiratory", "inhaler": "Respiratory",
        "cancer": "Oncology", "oncology": "Oncology", "tumor": "Oncology",
        "diabetes": "Metabolic", "metabolic": "Metabolic", "obesity": "Metabolic",
        "cardio": "Cardiovascular", "heart": "Cardiovascular", "hypertension": "Cardiovascular",
        "neuro": "Neurology", "brain": "Neurology", "alzheimer": "Neurology",
        "infectious": "Infectious", "bacterial": "Infectious", "viral": "Infectious",
    }
    for keyword, area in therapy_keywords.items():
        if keyword in query_lower:
            therapy_area = area
            break
    
    # Detect region from common terms
    region = "Global"
    region_keywords = {
        "india": "India", "indian": "India",
        "us": "US", "usa": "US", "united states": "US", "american": "US",
        "europe": "Europe", "european": "Europe", "eu": "Europe",
        "china": "China", "chinese": "China",
        "japan": "Japan", "japanese": "Japan",
        "global": "Global", "worldwide": "Global",
    }
    for keyword, reg in region_keywords.items():
        if keyword in query_lower:
            region = reg
            break
    
    return {
        "molecule": molecule,
        "therapy_area": therapy_area,
        "region": region,
        "population": "General",
        "formulation": "Any",
        "current_phase": "gathering",
    }


def dispatch_workers(state: PortfolioState) -> list:
    """Fan-out to 6 specialized workers using Send API."""
    molecule = state.get("molecule", "Unknown")
    therapy_area = state.get("therapy_area", "General")
    region = state.get("region", "Global")
    
    base_query = f"{molecule} {therapy_area} {region}"
    
    workers = [
        ("iqvia_worker", f"Market analysis for {base_query}"),
        ("trials_worker", f"Clinical trials for {molecule} {therapy_area}"),
        ("patents_worker", f"Patent landscape for {molecule}"),
        ("exim_worker", f"Import export data for {molecule} in {region}"),
        ("internal_worker", f"Internal insights on {therapy_area} {region}"),
        ("web_worker", f"Latest research on {molecule} {therapy_area}"),
    ]
    
    return [
        Send(worker_name, {
            "query": query,
            "molecule": molecule,
            "therapy_area": therapy_area,
            "region": region,
            "worker_id": worker_name,
        })
        for worker_name, query in workers
    ]


# Worker nodes
def iqvia_worker(state: WorkerInputState) -> dict:
    """IQVIA market intelligence worker."""
    result = asyncio.run(iqvia_connector.query(
        state.get("query", ""),
        region=state.get("region"),
        therapy_area=state.get("therapy_area")
    ))
    return {"market_data": [result]}


def trials_worker(state: WorkerInputState) -> dict:
    """Clinical trials worker."""
    result = asyncio.run(trials_connector.query(
        state.get("query", ""),
        molecule=state.get("molecule")
    ))
    return {"trials_data": [result]}


def patents_worker(state: WorkerInputState) -> dict:
    """Patent landscape worker."""
    result = asyncio.run(patents_connector.query(
        state.get("query", ""),
        molecule=state.get("molecule")
    ))
    return {"patent_data": [result]}


def exim_worker(state: WorkerInputState) -> dict:
    """Import/export data worker."""
    result = asyncio.run(exim_connector.query(
        state.get("query", ""),
        region=state.get("region"),
        molecule=state.get("molecule")
    ))
    return {"exim_data": [result]}


def internal_worker(state: WorkerInputState) -> dict:
    """Internal documents worker."""
    result = asyncio.run(internal_connector.query(
        state.get("query", ""),
        therapy_area=state.get("therapy_area")
    ))
    return {"internal_data": [result]}


def web_worker(state: WorkerInputState) -> dict:
    """Web search worker."""
    result = asyncio.run(web_connector.query(
        state.get("query", ""),
        molecule=state.get("molecule")
    ))
    return {"web_data": [result]}


def synthesize_evidence(state: PortfolioState, config: RunnableConfig) -> dict:
    """Merge worker results and apply heuristics."""
    market_data = state.get("market_data", [])
    trials_data = state.get("trials_data", [])
    patent_data = state.get("patent_data", [])
    exim_data = state.get("exim_data", [])
    
    scores, signals = apply_all_heuristics(
        market_data=market_data,
        trials_data=trials_data,
        patent_data=patent_data,
        exim_data=exim_data
    )
    
    return {
        "opportunity_score": scores["opportunity"],
        "risk_score": scores["risk"],
        "innovation_score": scores["innovation"],
        "heuristic_signals": signals,
        "current_phase": "synthesis",
    }


def generate_story(state: PortfolioState, config: RunnableConfig) -> dict:
    """Generate innovation product story."""
    configurable = PortfolioConfiguration.from_runnable_config(config)
    
    llm = ChatGroq(
        model=configurable.orchestrator_model,
        temperature=0.7,
        max_retries=2,
        api_key=os.getenv("GROQ_API_KEY"),
    )
    
    # Prepare summaries
    market_data = state.get("market_data", [])
    trials_data = state.get("trials_data", [])
    patent_data = state.get("patent_data", [])
    
    market_summary = "No market data available"
    if market_data and market_data[0].get("data"):
        m = market_data[0]["data"]
        market_info = m.get("market_data", {})
        market_summary = f"Market size: ${market_info.get('market_size_usd_mn', 'N/A')}M, CAGR: {market_info.get('cagr_5yr', 'N/A')}%, Unmet need score: {market_info.get('unmet_need_score', 'N/A')}"
    
    trials_summary = "No trials data available"
    if trials_data and trials_data[0].get("studies"):
        count = len(trials_data[0]["studies"])
        trials_summary = f"{count} clinical trials identified"
    
    patent_summary = "No patent data available"
    if patent_data and patent_data[0].get("patents"):
        count = len(patent_data[0]["patents"])
        summary = patent_data[0].get("summary", {})
        patent_summary = f"{count} patents analyzed, {summary.get('expiring_within_3_years', 0)} expiring within 3 years"
    
    prompt = innovation_story_prompt.format(
        molecule=state.get("molecule", "Unknown"),
        therapy_area=state.get("therapy_area", "General"),
        region=state.get("region", "Global"),
        opportunity_score=state.get("opportunity_score", 50),
        heuristic_signals=", ".join(state.get("heuristic_signals", [])),
        market_insights=market_summary,
        trial_insights=trials_summary,
        patent_insights=patent_summary,
    )
    
    response = llm.invoke(prompt)
    
    return {
        "innovation_story": response.content,
        "current_phase": "complete",
        "report_ready": True,
    }


def finalize_response(state: PortfolioState, config: RunnableConfig) -> dict:
    """Create final response message."""
    molecule = state.get("molecule", "Unknown")
    therapy_area = state.get("therapy_area", "General")
    region = state.get("region", "Global")
    opportunity_score = state.get("opportunity_score", 50)
    risk_score = state.get("risk_score", 30)
    heuristic_signals = state.get("heuristic_signals", [])
    innovation_story = state.get("innovation_story", "")
    
    # Build comprehensive response
    response = f"""# Portfolio Intelligence Report

## Scope
- **Molecule/Therapy:** {molecule}
- **Therapy Area:** {therapy_area}
- **Region:** {region}

## Opportunity Assessment

### Scores
| Metric | Score |
|--------|-------|
| Opportunity | {opportunity_score}/100 |
| Risk | {risk_score}/100 |
| Innovation Potential | {state.get('innovation_score', 50)}/100 |

### Key Signals
{format_heuristic_summary(heuristic_signals)}

## Innovation Story
{innovation_story}

## Evidence Summary

### Market Data
"""
    
    # Add market data
    market_data = state.get("market_data", [])
    if market_data and market_data[0].get("data"):
        m = market_data[0]["data"]
        market_info = m.get("market_data", {})
        competition = m.get("competition", {})
        response += f"""
- **Market Size:** ${market_info.get('market_size_usd_mn', 'N/A')}M
- **5-Year CAGR:** {market_info.get('cagr_5yr', 'N/A')}%
- **Patient Population:** {market_info.get('patient_population_mn', 'N/A')}M
- **Diagnosis Rate:** {market_info.get('diagnosed_rate_pct', 'N/A')}%
- **Competition:** {competition.get('total_players', 'N/A')} players, {competition.get('fragmentation_index', 'N/A')} fragmentation
"""
    
    # Add trials data
    response += "\n### Clinical Trials\n"
    trials_data = state.get("trials_data", [])
    if trials_data and trials_data[0].get("studies"):
        studies = trials_data[0]["studies"]
        response += f"- **Total Trials:** {len(studies)}\n"
        for study in studies[:3]:  # Top 3
            ps = study.get("protocolSection", {})
            nct_id = ps.get("identificationModule", {}).get("nctId", "N/A")
            title = ps.get("identificationModule", {}).get("briefTitle", "N/A")
            status = ps.get("statusModule", {}).get("overallStatus", "N/A")
            response += f"- {nct_id}: {title[:50]}... ({status})\n"
    
    # Add patent data
    response += "\n### Patent Landscape\n"
    patent_data = state.get("patent_data", [])
    if patent_data and patent_data[0].get("patents"):
        patents = patent_data[0]["patents"]
        summary = patent_data[0].get("summary", {})
        response += f"- **Total Patents:** {len(patents)}\n"
        response += f"- **Expiring within 3 years:** {summary.get('expiring_within_3_years', 0)}\n"
        response += f"- **FTO Concerns:** {summary.get('fto_concerns', 0)}\n"
    
    response += "\n---\n*Report generated by Portfolio Intelligence Copilot*"
    
    return {
        "messages": [AIMessage(content=response)],
        "current_phase": "complete",
    }


# Build the graph
builder = StateGraph(PortfolioState, config_schema=PortfolioConfiguration)

# Add nodes
builder.add_node("clarify_scope", clarify_scope)
builder.add_node("iqvia_worker", iqvia_worker)
builder.add_node("trials_worker", trials_worker)
builder.add_node("patents_worker", patents_worker)
builder.add_node("exim_worker", exim_worker)
builder.add_node("internal_worker", internal_worker)
builder.add_node("web_worker", web_worker)
builder.add_node("synthesize_evidence", synthesize_evidence)
builder.add_node("generate_story", generate_story)
builder.add_node("finalize_response", finalize_response)

# Add edges
builder.add_edge(START, "clarify_scope")
builder.add_conditional_edges("clarify_scope", dispatch_workers, [
    "iqvia_worker", "trials_worker", "patents_worker",
    "exim_worker", "internal_worker", "web_worker"
])

# Workers merge to synthesis (parallel execution via superstep)
builder.add_edge("iqvia_worker", "synthesize_evidence")
builder.add_edge("trials_worker", "synthesize_evidence")
builder.add_edge("patents_worker", "synthesize_evidence")
builder.add_edge("exim_worker", "synthesize_evidence")
builder.add_edge("internal_worker", "synthesize_evidence")
builder.add_edge("web_worker", "synthesize_evidence")

builder.add_edge("synthesize_evidence", "generate_story")
builder.add_edge("generate_story", "finalize_response")
builder.add_edge("finalize_response", END)

# Compile the graph
portfolio_graph = builder.compile(name="portfolio-strategist")
