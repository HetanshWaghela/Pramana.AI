"""Portfolio Strategist prompts."""

from datetime import datetime


def get_current_date():
    """Get current date in a readable format."""
    return datetime.now().strftime("%B %d, %Y")


clarification_prompt = """You are a pharmaceutical portfolio strategist. Extract key parameters from the user's query to understand the scope of their innovation discovery request.

Current date: {current_date}

User Query: {query}

Extract the following information. If not explicitly mentioned, use reasonable defaults:

1. **Molecule/Drug**: The specific drug, API, or compound (e.g., "Metformin", "Tiotropium")
2. **Therapy Area**: The therapeutic indication or disease area (e.g., "Anti-aging", "COPD", "Respiratory")
3. **Region**: Geographic market focus (e.g., "US", "India", "Global")
4. **Population**: Target patient population (e.g., "Geriatric 65+", "Adults 40+")
5. **Formulation**: Route or formulation preferences (e.g., "Oral Extended Release", "Inhalation DPI")

Return a JSON object with these fields. Use "General" or "Global" for unspecified values.

Example output:
{{
    "molecule": "Metformin",
    "therapy_area": "Anti-aging",
    "region": "US",
    "population": "Geriatric 65+",
    "formulation": "Oral Extended Release"
}}
"""


synthesis_prompt = """You are synthesizing evidence from multiple data sources to assess a pharmaceutical innovation opportunity.

**Context:**
- Molecule: {molecule}
- Therapy Area: {therapy_area}
- Region: {region}
- Population: {population}

**Evidence Summary:**

**Market Data (IQVIA):**
{market_summary}

**Clinical Trials:**
{trials_summary}

**Patent Landscape:**
{patent_summary}

**Import/Export (EXIM):**
{exim_summary}

**Internal Insights:**
{internal_summary}

**Web Intelligence:**
{web_summary}

**Heuristic Signals:** {heuristic_signals}

**Opportunity Score:** {opportunity_score}/100
**Risk Score:** {risk_score}/100

Based on this evidence, create a compelling innovation story that:
1. Identifies the key unmet need
2. Explains the whitespace opportunity
3. Proposes a differentiated product concept
4. Outlines the recommended pathway (e.g., 505(b)(2))
5. Highlights key risks and mitigations

Write in a strategic, executive-friendly tone suitable for a portfolio review meeting.
"""


innovation_story_prompt = """Create a compelling pharmaceutical innovation story based on the following analysis:

**Molecule:** {molecule}
**Therapy Area:** {therapy_area}  
**Region:** {region}

**Key Findings:**
- Opportunity Score: {opportunity_score}/100
- Heuristic Signals: {heuristic_signals}

**Market Insights:**
{market_insights}

**Clinical Landscape:**
{trial_insights}

**Patent Landscape:**
{patent_insights}

Write a 2-3 paragraph innovation case that:
1. Opens with the key opportunity (unmet need + market size)
2. Describes the proposed differentiated product
3. Concludes with the recommended pathway and timeline

Use confident, action-oriented language suitable for a board presentation. Include specific numbers and citations where available.
"""
