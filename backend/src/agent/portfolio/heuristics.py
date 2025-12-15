"""Decision heuristics engine for Portfolio Strategist."""

from typing import Any


def apply_all_heuristics(
    market_data: list[dict],
    trials_data: list[dict],
    patent_data: list[dict],
    exim_data: list[dict]
) -> tuple[dict[str, float], list[str]]:
    """Apply all decision heuristics and calculate scores.
    
    Args:
        market_data: IQVIA market intelligence
        trials_data: Clinical trials data
        patent_data: Patent landscape
        exim_data: Import/export data
        
    Returns:
        Tuple of (scores dict, signals list)
    """
    # Base scores
    opportunity = 50.0
    risk = 30.0
    innovation = 40.0
    signals = []
    
    # Extract key metrics
    m = market_data[0].get("data", {}) if market_data else {}
    market_info = m.get("market_data", {})
    competition = m.get("competition", {})
    
    t = trials_data[0].get("studies", []) if trials_data else []
    p = patent_data[0].get("patents", []) if patent_data else []
    e = exim_data[0].get("data", {}) if exim_data else {}
    import_info = e.get("import_data", {})
    
    # HEURISTIC 1: Whitespace
    unmet_need = market_info.get("unmet_need_score", 0)
    if unmet_need > 0.7 and len(t) < 5:
        signals.append("HIGH_WHITESPACE")
        opportunity += 20
    elif unmet_need > 0.5 and len(t) < 10:
        signals.append("MODERATE_WHITESPACE")
        opportunity += 10
    
    # HEURISTIC 2: Patent Window
    expiring_soon = [pat for pat in p if pat.get("years_to_expiry", 99) <= 3]
    if expiring_soon:
        signals.append("PATENT_WINDOW_OPEN")
        opportunity += 15
        innovation += 10
    
    # HEURISTIC 3: Crowded Market
    total_players = competition.get("total_players", 0)
    top_5_share = competition.get("top_5_share_pct", 0)
    if total_players > 20 and top_5_share > 70:
        signals.append("CROWDED_MARKET")
        opportunity -= 15
        risk += 10
    elif competition.get("fragmentation_index") == "HIGH":
        signals.append("FRAGMENTED_MARKET")
        opportunity += 10
    
    # HEURISTIC 4: Import Dependency
    dependency = import_info.get("dependency_score", 0)
    if dependency > 0.7:
        signals.append("HIGH_IMPORT_DEPENDENCY")
        risk += 10
        if "LOCAL_MANUFACTURING_OPPORTUNITY" in e.get("insight_flags", []):
            signals.append("LOCAL_MFG_OPPORTUNITY")
            opportunity += 8
    
    # HEURISTIC 5: Big Pharma Activity
    big_pharma_late_stage = [
        trial for trial in t 
        if trial.get("protocolSection", {}).get("sponsorCollaboratorsModule", {}).get("leadSponsor", {}).get("class") == "INDUSTRY"
        and any(phase in trial.get("protocolSection", {}).get("designModule", {}).get("phases", []) for phase in ["PHASE3", "PHASE4"])
    ]
    if big_pharma_late_stage:
        signals.append("BIG_PHARMA_ACTIVE")
        opportunity -= 10
        risk += 5
    
    # HEURISTIC 6: Market Growth
    cagr = market_info.get("cagr_5yr", 0)
    if cagr > 8:
        signals.append("HIGH_GROWTH_MARKET")
        opportunity += 12
    elif cagr > 5:
        signals.append("MODERATE_GROWTH")
        opportunity += 5
    
    # HEURISTIC 7: FTO Concerns
    fto_blocked = [pat for pat in p if pat.get("fto_status") == "BLOCKED"]
    fto_warnings = [pat for pat in p if pat.get("fto_status") == "WARNING"]
    if fto_blocked:
        signals.append("FTO_BLOCKED")
        risk += 20
        opportunity -= 15
    elif fto_warnings:
        signals.append("FTO_WARNING")
        risk += 10
    
    # Normalize scores
    scores = {
        "opportunity": max(0, min(100, opportunity)),
        "risk": max(0, min(100, risk)),
        "innovation": max(0, min(100, innovation))
    }
    
    return scores, signals


def format_heuristic_summary(signals: list[str]) -> str:
    """Format heuristic signals into human-readable summary.
    
    Args:
        signals: List of heuristic signal codes
        
    Returns:
        Formatted summary string
    """
    descriptions = {
        "HIGH_WHITESPACE": "Strong whitespace: High unmet need with few active trials",
        "MODERATE_WHITESPACE": "Moderate whitespace opportunity identified",
        "PATENT_WINDOW_OPEN": "Patent expiry window for reformulation/generics",
        "CROWDED_MARKET": "Crowded market - differentiation critical",
        "FRAGMENTED_MARKET": "Fragmented competition - market entry opportunity",
        "HIGH_IMPORT_DEPENDENCY": "High import dependency - sourcing risk",
        "LOCAL_MFG_OPPORTUNITY": "Local manufacturing could provide advantage",
        "BIG_PHARMA_ACTIVE": "Big pharma in late-stage development - niche angle needed",
        "HIGH_GROWTH_MARKET": "High growth market (CAGR >8%)",
        "MODERATE_GROWTH": "Moderate growth market",
        "FTO_BLOCKED": "Freedom to operate blocked - IP workaround needed",
        "FTO_WARNING": "Freedom to operate concerns - further analysis needed"
    }
    
    return "\n".join([
        f"• {descriptions.get(s, s)}" 
        for s in signals
    ])
