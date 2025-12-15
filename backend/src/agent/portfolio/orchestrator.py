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


def is_greeting_or_casual(query: str) -> bool:
    """Check if the message is just a greeting or casual remark."""
    query_lower = query.lower().strip()
    
    # List of greetings and casual remarks
    greetings = [
        'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon',
        'good evening', 'howdy', 'hiya', 'sup', 'yo', 'hola', 'bonjour'
    ]
    
    # Check if message is just a greeting (with or without punctuation)
    cleaned = query_lower.strip('.,!?')
    
    # Exact match greetings
    if cleaned in greetings:
        return True
    
    # Short greetings with extra words like "hi there" or "hello!"
    words = cleaned.split()
    if len(words) <= 3 and any(g in cleaned for g in greetings):
        return True
    
    return False


def clarify_scope(state: PortfolioState, config: RunnableConfig) -> dict:
    """Extract context chips from user query.
    
    Uses structured output with fallback for robustness.
    Handles greetings by asking for topic.
    """
    configurable = PortfolioConfiguration.from_runnable_config(config)
    
    query = get_research_topic(state.get("messages", []))
    
    # Check if it's just a greeting
    if is_greeting_or_casual(query):
        greeting_response = """Hello! I'm the Portfolio Intelligence Copilot, here to help you discover pharmaceutical innovation opportunities.

To generate a comprehensive portfolio analysis, please provide:

1. **A molecule/drug name** (e.g., "Metformin", "Tiotropium")
2. **Therapy area** (e.g., "Anti-aging", "COPD", "Diabetes")
3. **Target region** (optional - e.g., "US", "India", "Global")

For example:
- "Analyze Metformin for anti-aging in the US market"
- "Find opportunities for Tiotropium in respiratory therapy"
- "Explore diabetes innovations in India"

What would you like to explore?"""
        
        return {
            "messages": [AIMessage(content=greeting_response)],
            "current_phase": "awaiting_topic",
            "molecule": "Unknown",
            "therapy_area": "General",
            "region": "Global",
            "population": "General",
            "formulation": "Any",
        }
    
    llm = ChatGroq(
        model=configurable.orchestrator_model,
        temperature=0.3,
        max_retries=2,
        api_key=os.getenv("GROQ_API_KEY"),
    )
    
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
    """Fan-out to 6 specialized workers using Send API.
    
    Returns END if we're just awaiting topic, otherwise dispatches workers.
    """
    # Check if we're still awaiting a proper topic
    current_phase = state.get("current_phase", "")
    if current_phase == "awaiting_topic":
        return []  # Don't dispatch workers, just end
    
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
    query = state.get("query", "")
    region = state.get("region")
    therapy_area = state.get("therapy_area")
    
    print(f"[IQVIA Worker] Query: {query}, Region: {region}, Therapy: {therapy_area}")
    
    result = asyncio.run(iqvia_connector.query(
        query,
        region=region,
        therapy_area=therapy_area
    ))
    
    print(f"[IQVIA Worker] Result keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
    return {"market_data": [result]}


def trials_worker(state: WorkerInputState) -> dict:
    """Clinical trials worker."""
    query = state.get("query", "")
    molecule = state.get("molecule")
    
    print(f"[Trials Worker] Query: {query}, Molecule: {molecule}")
    
    result = asyncio.run(trials_connector.query(
        query,
        molecule=molecule
    ))
    
    print(f"[Trials Worker] Result keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
    return {"trials_data": [result]}


def patents_worker(state: WorkerInputState) -> dict:
    """Patent landscape worker."""
    query = state.get("query", "")
    molecule = state.get("molecule")
    
    print(f"[Patents Worker] Query: {query}, Molecule: {molecule}")
    
    result = asyncio.run(patents_connector.query(
        query,
        molecule=molecule
    ))
    
    print(f"[Patents Worker] Result keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
    return {"patent_data": [result]}


def exim_worker(state: WorkerInputState) -> dict:
    """Import/export data worker."""
    query = state.get("query", "")
    region = state.get("region")
    molecule = state.get("molecule")
    
    print(f"[EXIM Worker] Query: {query}, Region: {region}, Molecule: {molecule}")
    
    result = asyncio.run(exim_connector.query(
        query,
        region=region,
        molecule=molecule
    ))
    
    print(f"[EXIM Worker] Result keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
    return {"exim_data": [result]}


def internal_worker(state: WorkerInputState) -> dict:
    """Internal documents worker."""
    query = state.get("query", "")
    therapy_area = state.get("therapy_area")
    
    print(f"[Internal Worker] Query: {query}, Therapy: {therapy_area}")
    
    result = asyncio.run(internal_connector.query(
        query,
        therapy_area=therapy_area
    ))
    
    print(f"[Internal Worker] Result keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
    return {"internal_data": [result]}


def web_worker(state: WorkerInputState) -> dict:
    """Web search worker."""
    query = state.get("query", "")
    molecule = state.get("molecule")
    
    print(f"[Web Worker] Query: {query}, Molecule: {molecule}")
    
    result = asyncio.run(web_connector.query(
        query,
        molecule=molecule
    ))
    
    print(f"[Web Worker] Result keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
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

### Market Intelligence (IQVIA)
"""
    
    # Add market data with better fallback
    market_data = state.get("market_data", [])
    if market_data and len(market_data) > 0:
        market_result = market_data[0]
        if isinstance(market_result, dict) and market_result.get("data"):
            m = market_result["data"]
            market_info = m.get("market_data", {})
            competition = m.get("competition", {})
            response += f"""
- **Market Size:** ${market_info.get('market_size_usd_mn', 'N/A')}M
- **5-Year CAGR:** {market_info.get('cagr_5yr', 'N/A')}%
- **Patient Population:** {market_info.get('patient_population_mn', 'N/A')}M
- **Diagnosis Rate:** {market_info.get('diagnosed_rate_pct', 'N/A')}%
- **Unmet Need Score:** {market_info.get('unmet_need_score', 'N/A')}/10
- **Competition:** {competition.get('total_players', 'N/A')} players
- **Market Fragmentation:** {competition.get('fragmentation_index', 'N/A')}
"""
        elif isinstance(market_result, dict) and market_result.get("summary"):
            response += f"\n{market_result['summary']}\n"
        else:
            response += f"\n*Market data retrieved but in unexpected format. Raw data available for {molecule} in {region}.*\n"
    else:
        response += "\n*No market data available for this query. Consider broader search parameters.*\n"
    
    # Add trials data with better fallback
    response += "\n### Clinical Development Landscape\n"
    trials_data = state.get("trials_data", [])
    if trials_data and len(trials_data) > 0:
        trials_result = trials_data[0]
        if isinstance(trials_result, dict) and trials_result.get("studies"):
            studies = trials_result["studies"]
            response += f"- **Total Clinical Trials:** {len(studies)}\n\n"
            if len(studies) > 0:
                response += "**Key Trials:**\n"
                for study in studies[:5]:  # Top 5 trials
                    ps = study.get("protocolSection", {})
                    id_module = ps.get("identificationModule", {})
                    status_module = ps.get("statusModule", {})
                    
                    nct_id = id_module.get("nctId", "N/A")
                    title = id_module.get("briefTitle", "No title")
                    status = status_module.get("overallStatus", "Unknown")
                    phase = ps.get("designModule", {}).get("phases", ["N/A"])[0] if ps.get("designModule", {}).get("phases") else "N/A"
                    
                    response += f"- **{nct_id}** ({phase}): {title[:80]}{'...' if len(title) > 80 else ''}\n"
                    response += f"  Status: {status}\n"
            else:
                response += "*No active trials found for this indication.*\n"
        elif isinstance(trials_result, dict) and trials_result.get("summary"):
            response += f"\n{trials_result['summary']}\n"
        else:
            response += f"\n*Clinical trials data retrieved. {trials_result.get('count', 'Multiple')} trials identified.*\n"
    else:
        response += "\n*No clinical trials data available. This may indicate a novel indication or limited research activity.*\n"
    
    # Add patent data with better fallback
    response += "\n### Intellectual Property Landscape\n"
    patent_data = state.get("patent_data", [])
    if patent_data and len(patent_data) > 0:
        patent_result = patent_data[0]
        if isinstance(patent_result, dict) and patent_result.get("patents"):
            patents = patent_result["patents"]
            summary = patent_result.get("summary", {})
            response += f"- **Total Patents Analyzed:** {len(patents)}\n"
            response += f"- **Expiring within 3 years:** {summary.get('expiring_within_3_years', 0)}\n"
            response += f"- **Potential FTO Concerns:** {summary.get('fto_concerns', 0)}\n"
            response += f"- **Patent Cliff Opportunity:** {'High' if summary.get('expiring_within_3_years', 0) > 3 else 'Moderate' if summary.get('expiring_within_3_years', 0) > 0 else 'Low'}\n"
            
            if len(patents) > 0:
                response += "\n**Key Patents:**\n"
                for patent in patents[:3]:
                    patent_num = patent.get("patent_number", "N/A")
                    title = patent.get("patent_title", patent.get("title", "No title available"))
                    expiry = patent.get("expiry_date", "N/A")
                    status = patent.get("status", "Unknown")
                    fto = patent.get("fto_status", "N/A")
                    response += f"- **{patent_num}**: {title}\n"
                    response += f"  - Expires: {expiry} | Status: {status} | FTO: {fto}\n"
        elif isinstance(patent_result, dict) and patent_result.get("summary"):
            response += f"\n{patent_result['summary']}\n"
        else:
            response += f"\n*Patent landscape data retrieved. Analysis available for {molecule}.*\n"
    else:
        response += "\n*No patent data available. This may indicate a novel molecule or open IP landscape.*\n"
    
    # Add EXIM data
    response += "\n### Supply Chain & Trade Intelligence\n"
    exim_data = state.get("exim_data", [])
    if exim_data and len(exim_data) > 0:
        exim_result = exim_data[0]
        # Handle 'data' wrapper if present
        if isinstance(exim_result, dict) and exim_result.get("data") and isinstance(exim_result["data"], dict):
            exim_result = exim_result["data"]
        
        if isinstance(exim_result, dict) and exim_result.get("import_data"):
            import_info = exim_result.get("import_data", {})
            export_info = exim_result.get("export_data", {})
            product = exim_result.get("product", molecule)
            
            response += f"**Product:** {product}\n"
            response += f"**HS Code:** {exim_result.get('hs_code', 'N/A')}\n\n"
            
            response += "**Import Analysis:**\n"
            response += f"- Total Import Volume: {import_info.get('total_volume_mt', 'N/A')} MT\n"
            response += f"- Total Import Value: ${import_info.get('total_value_usd_mn', 'N/A')}M\n"
            response += f"- Import Dependency Score: {import_info.get('dependency_score', 'N/A')}\n"
            response += f"- Price Trend: {import_info.get('trend', 'N/A')}\n"
            
            top_origins = import_info.get('top_origins', [])
            if top_origins:
                response += f"\n**Top Import Origins:**\n"
                for origin in top_origins[:3]:
                    country = origin.get('country', 'Unknown')
                    share = origin.get('share_pct', 0)
                    response += f"- {country}: {share}% market share\n"
            
            if export_info:
                response += f"\n**Export Performance:**\n"
                response += f"- Total Export Volume: {export_info.get('total_volume_mt', 'N/A')} MT\n"
                response += f"- Total Export Value: ${export_info.get('total_value_usd_mn', 'N/A')}M\n"
            
            local_mfg = exim_result.get('local_manufacturing', {})
            if local_mfg:
                response += f"\n**Local Manufacturing:**\n"
                response += f"- Capacity: {local_mfg.get('capacity_mt', 'N/A')} MT\n"
                response += f"- Utilization: {local_mfg.get('utilization_pct', 'N/A')}%\n"
                manufacturers = local_mfg.get('key_manufacturers', [])
                if manufacturers:
                    response += f"- Key Players: {', '.join(manufacturers)}\n"
                recent_investments = local_mfg.get('recent_investments')
                if recent_investments:
                    response += f"- Recent Activity: {recent_investments}\n"
            
            flags = exim_result.get('insight_flags', [])
            if flags:
                response += f"\n**Strategic Insights:** {', '.join(flags)}\n"
                
        elif isinstance(exim_result, dict) and exim_result.get("summary"):
            response += f"{exim_result['summary']}\n"
        else:
            response += f"*Trade data available for {molecule} in {region} market.*\n"
    else:
        response += "*No import/export data available for analysis.*\n"
    
    # Add internal insights
    response += "\n### Internal Strategic Insights\n"
    internal_data = state.get("internal_data", [])
    if internal_data and len(internal_data) > 0:
        internal_result = internal_data[0]
        # Handle 'data' wrapper if present
        if isinstance(internal_result, dict) and internal_result.get("data") and isinstance(internal_result["data"], dict):
            internal_result = internal_result["data"]
        
        if isinstance(internal_result, dict) and internal_result.get("documents"):
            documents = internal_result["documents"]
            response += f"*Reviewed {len(documents)} internal strategic documents*\n\n"
            for doc in documents[:3]:
                doc_title = doc.get("title", "Internal Document")
                doc_type = doc.get("document_type", "ANALYSIS")
                relevance = doc.get("relevance_score", 0)
                
                response += f"**{doc_title}** ({doc_type} | Relevance: {relevance:.0%})\n"
                
                excerpts = doc.get("key_excerpts", [])
                if excerpts:
                    for excerpt in excerpts[:2]:
                        response += f"- {excerpt}\n"
                
                recommendations = doc.get("recommendations", [])
                if recommendations:
                    response += f"*Key Recommendation:* {recommendations[0]}\n"
                response += "\n"
        elif isinstance(internal_result, dict) and internal_result.get("insights"):
            for insight in internal_result["insights"][:3]:
                response += f"- {insight}\n"
        elif isinstance(internal_result, dict) and internal_result.get("summary"):
            response += f"{internal_result['summary']}\n"
        else:
            response += f"*Internal documentation reviewed for {therapy_area} opportunities.*\n"
    else:
        response += "*No internal strategic insights available.*\n"
    
    # Add web intelligence
    response += "\n### Latest Market & Research Intelligence\n"
    web_data = state.get("web_data", [])
    if web_data and len(web_data) > 0:
        web_result = web_data[0]
        if isinstance(web_result, dict) and web_result.get("results"):
            results = web_result["results"]
            response += f"*Analyzed {len(results)} recent sources*\n\n"
            for result in results[:3]:
                title = result.get("title", "No title")
                snippet = result.get("snippet", "")
                response += f"- **{title}**\n  {snippet[:150]}{'...' if len(snippet) > 150 else ''}\n"
        elif isinstance(web_result, dict) and web_result.get("summary"):
            response += f"{web_result['summary']}\n"
        else:
            response += f"*Web research completed for {molecule} {therapy_area}.*\n"
    else:
        response += "*No web intelligence data available.*\n"
    
    response += "\n---\n*Report generated by Portfolio Intelligence Copilot*"
    
    return {
        "messages": [AIMessage(content=response)],
        "current_phase": "complete",
    }


def route_after_clarification(state: PortfolioState):
    """Route based on whether we have a valid topic or just greeted."""
    current_phase = state.get("current_phase", "")
    if current_phase == "awaiting_topic":
        return END
    return "dispatch"


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

# Route after clarification: either end (if greeting) or dispatch workers
builder.add_conditional_edges(
    "clarify_scope",
    route_after_clarification,
    {
        END: END,
        "dispatch": "dispatch_workers_node"
    }
)

# Dummy node for dispatch (using conditional_edges with dispatch_workers)
def dispatch_workers_node(state: PortfolioState):
    """Dummy node that triggers worker dispatch."""
    return state

builder.add_node("dispatch_workers_node", dispatch_workers_node)
builder.add_conditional_edges("dispatch_workers_node", dispatch_workers, [
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
