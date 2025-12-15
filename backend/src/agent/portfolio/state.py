"""Portfolio Strategist state definitions."""

from __future__ import annotations
import operator
from typing import TypedDict, Optional, Literal
from langgraph.graph import add_messages
from typing_extensions import Annotated


class PortfolioState(TypedDict):
    """Master state for Portfolio Strategist with parallel merge support.
    
    Uses Annotated reducers for concurrent worker result merging.
    """
    
    # Core messages (compatible with useStream)
    messages: Annotated[list, add_messages]
    
    # Context chips (scope extracted during clarification)
    molecule: str
    therapy_area: str
    region: str
    population: str
    formulation: str
    
    # Worker Results (Annotated for parallel merge via Send API)
    market_data: Annotated[list, operator.add]
    trials_data: Annotated[list, operator.add]
    patent_data: Annotated[list, operator.add]
    exim_data: Annotated[list, operator.add]
    internal_data: Annotated[list, operator.add]
    web_data: Annotated[list, operator.add]
    
    # Synthesis Results
    opportunity_score: float
    risk_score: float
    innovation_score: float
    heuristic_signals: list
    
    # Story & Report
    innovation_story: str
    report_ready: bool
    
    # Control Flow
    current_phase: str


class WorkerInputState(TypedDict):
    """State passed to individual workers via Send."""
    query: str
    molecule: str
    therapy_area: str
    region: str
    worker_id: str
