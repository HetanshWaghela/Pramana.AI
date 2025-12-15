"""Generate insightful graphs and visualizations for portfolio analysis."""

import io
import base64
from typing import Dict, List, Optional, Tuple
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from datetime import datetime
import numpy as np

# Set style for professional charts
plt.style.use('seaborn-v0_8-darkgrid')


def generate_opportunity_radar_chart(scores: Dict[str, float]) -> str:
    """Generate a radar chart showing opportunity, risk, and innovation scores.
    
    Args:
        scores: Dictionary with keys 'opportunity', 'risk', 'innovation'
        
    Returns:
        Base64 encoded PNG image
    """
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))
    
    # Categories
    categories = ['Opportunity\nScore', 'Innovation\nPotential', 'Risk\nLevel']
    values = [
        scores.get('opportunity', 50),
        scores.get('innovation', 50),
        100 - scores.get('risk', 50)  # Invert risk so lower is better
    ]
    
    # Number of variables
    N = len(categories)
    
    # Compute angle for each axis
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    values += values[:1]  # Complete the circle
    angles += angles[:1]
    
    # Plot
    ax.plot(angles, values, 'o-', linewidth=2, color='#3b82f6', label='Current Analysis')
    ax.fill(angles, values, alpha=0.25, color='#3b82f6')
    
    # Add reference circle at 50
    ax.plot(angles, [50] * (N + 1), '--', linewidth=1, color='gray', alpha=0.5, label='Baseline (50)')
    
    # Fix axis to go in the right order
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, size=11)
    
    # Set y-axis limits
    ax.set_ylim(0, 100)
    ax.set_yticks([25, 50, 75, 100])
    ax.set_yticklabels(['25', '50', '75', '100'], size=9)
    
    # Add title
    plt.title('Portfolio Opportunity Assessment', size=16, weight='bold', pad=20)
    plt.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
    
    # Convert to base64
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    plt.close()
    
    return base64.b64encode(buf.read()).decode('utf-8')


def generate_market_growth_chart(market_data: Dict) -> str:
    """Generate a bar chart showing market size and growth projections.
    
    Args:
        market_data: Dictionary containing market information
        
    Returns:
        Base64 encoded PNG image
    """
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Extract or simulate market data
    current_year = datetime.now().year
    years = [current_year + i for i in range(5)]
    
    market_size = market_data.get('market_size_usd', 1000000000)
    cagr = market_data.get('cagr_5yr', 5.0) / 100
    
    # Project market size
    sizes = [market_size * ((1 + cagr) ** i) for i in range(5)]
    sizes_millions = [s / 1000000 for s in sizes]
    
    # Create bars
    bars = ax.bar(years, sizes_millions, color='#10b981', alpha=0.7, edgecolor='#059669', linewidth=2)
    
    # Add value labels on bars
    for bar, value in zip(bars, sizes_millions):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'${value:.0f}M',
                ha='center', va='bottom', fontsize=10, weight='bold')
    
    # Labels and title
    ax.set_xlabel('Year', fontsize=12, weight='bold')
    ax.set_ylabel('Market Size (USD Millions)', fontsize=12, weight='bold')
    ax.set_title(f'Projected Market Growth (CAGR: {cagr*100:.1f}%)', fontsize=14, weight='bold', pad=15)
    
    # Grid
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)
    
    # Convert to base64
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    plt.close()
    
    return base64.b64encode(buf.read()).decode('utf-8')


def generate_patent_timeline_chart(patent_data: List[Dict]) -> str:
    """Generate a timeline chart showing patent expiration dates.
    
    Args:
        patent_data: List of patent dictionaries
        
    Returns:
        Base64 encoded PNG image
    """
    fig, ax = plt.subplots(figsize=(12, 6))
    
    current_year = datetime.now().year
    
    if not patent_data:
        # Create sample data
        patent_data = [
            {'title': 'Core Formulation Patent', 'years_to_expiry': 2},
            {'title': 'Extended Release Patent', 'years_to_expiry': 5},
            {'title': 'Combination Therapy', 'years_to_expiry': 8},
            {'title': 'Novel Indication', 'years_to_expiry': 12},
        ]
    
    # Sort by expiry
    patents = sorted(patent_data[:10], key=lambda x: x.get('years_to_expiry', 10))
    
    # Create horizontal bars
    y_positions = range(len(patents))
    years_to_expiry = [p.get('years_to_expiry', 10) for p in patents]
    
    # Color based on urgency
    colors = []
    for years in years_to_expiry:
        if years <= 3:
            colors.append('#ef4444')  # Red - urgent
        elif years <= 7:
            colors.append('#f59e0b')  # Orange - moderate
        else:
            colors.append('#10b981')  # Green - long term
    
    bars = ax.barh(y_positions, years_to_expiry, color=colors, alpha=0.7, edgecolor='black', linewidth=1)
    
    # Add patent titles
    patent_titles = [p.get('title', f"Patent {i+1}")[:40] for i, p in enumerate(patents)]
    ax.set_yticks(y_positions)
    ax.set_yticklabels(patent_titles, fontsize=9)
    
    # Add value labels
    for i, (bar, years) in enumerate(zip(bars, years_to_expiry)):
        width = bar.get_width()
        ax.text(width + 0.3, bar.get_y() + bar.get_height()/2,
                f'{years} years',
                ha='left', va='center', fontsize=9, weight='bold')
    
    # Add vertical line for 3-year mark (patent window opportunity)
    ax.axvline(x=3, color='red', linestyle='--', linewidth=2, alpha=0.5, label='Patent Window (≤3 years)')
    
    ax.set_xlabel('Years to Expiration', fontsize=12, weight='bold')
    ax.set_title('Patent Landscape Timeline', fontsize=14, weight='bold', pad=15)
    ax.legend(loc='lower right')
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    
    # Convert to base64
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    plt.close()
    
    return base64.b64encode(buf.read()).decode('utf-8')


def generate_competition_heatmap(competition_data: Dict) -> str:
    """Generate a heatmap showing competitive intensity.
    
    Args:
        competition_data: Dictionary with competition metrics
        
    Returns:
        Base64 encoded PNG image
    """
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Metrics
    metrics = ['Market\nConcentration', 'Entry\nBarriers', 'R&D\nActivity', 
               'Price\nCompetition', 'Patent\nProtection']
    
    # Extract or simulate values (0-100 scale)
    values = [
        competition_data.get('top_5_share_pct', 60),
        competition_data.get('entry_barrier_score', 70) if 'entry_barrier_score' in competition_data else 70,
        competition_data.get('rd_intensity', 50) if 'rd_intensity' in competition_data else 50,
        competition_data.get('price_pressure', 65) if 'price_pressure' in competition_data else 65,
        competition_data.get('patent_strength', 55) if 'patent_strength' in competition_data else 55,
    ]
    
    # Create horizontal bar chart
    y_pos = np.arange(len(metrics))
    bars = ax.barh(y_pos, values, color='#6366f1', alpha=0.8, edgecolor='#4f46e5', linewidth=2)
    
    # Color bars based on intensity
    for bar, value in zip(bars, values):
        if value >= 70:
            bar.set_color('#ef4444')  # High - Red
        elif value >= 50:
            bar.set_color('#f59e0b')  # Medium - Orange
        else:
            bar.set_color('#10b981')  # Low - Green
    
    # Add value labels
    for i, (bar, value) in enumerate(zip(bars, values)):
        ax.text(value + 2, bar.get_y() + bar.get_height()/2,
                f'{value:.0f}',
                ha='left', va='center', fontsize=11, weight='bold')
    
    ax.set_yticks(y_pos)
    ax.set_yticklabels(metrics, fontsize=11)
    ax.set_xlabel('Intensity Score (0-100)', fontsize=12, weight='bold')
    ax.set_title('Competitive Landscape Analysis', fontsize=14, weight='bold', pad=15)
    ax.set_xlim(0, 110)
    
    # Add legend
    red_patch = mpatches.Patch(color='#ef4444', label='High (≥70)')
    orange_patch = mpatches.Patch(color='#f59e0b', label='Medium (50-69)')
    green_patch = mpatches.Patch(color='#10b981', label='Low (<50)')
    ax.legend(handles=[red_patch, orange_patch, green_patch], loc='lower right')
    
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)
    
    # Convert to base64
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    plt.close()
    
    return base64.b64encode(buf.read()).decode('utf-8')


def generate_trial_phases_chart(trials_data: List[Dict]) -> str:
    """Generate a pie chart showing distribution of clinical trial phases.
    
    Args:
        trials_data: List of clinical trial dictionaries
        
    Returns:
        Base64 encoded PNG image
    """
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Count trials by phase
    phase_counts = {'Phase 1': 0, 'Phase 2': 0, 'Phase 3': 0, 'Phase 4': 0, 'Other': 0}
    
    if trials_data:
        for trial in trials_data:
            phases = trial.get('protocolSection', {}).get('designModule', {}).get('phases', [])
            if 'PHASE1' in phases or 'PHASE 1' in str(phases).upper():
                phase_counts['Phase 1'] += 1
            elif 'PHASE2' in phases or 'PHASE 2' in str(phases).upper():
                phase_counts['Phase 2'] += 1
            elif 'PHASE3' in phases or 'PHASE 3' in str(phases).upper():
                phase_counts['Phase 3'] += 1
            elif 'PHASE4' in phases or 'PHASE 4' in str(phases).upper():
                phase_counts['Phase 4'] += 1
            else:
                phase_counts['Other'] += 1
    else:
        # Sample data
        phase_counts = {'Phase 1': 5, 'Phase 2': 12, 'Phase 3': 8, 'Phase 4': 3, 'Other': 2}
    
    # Filter out zeros
    phase_counts = {k: v for k, v in phase_counts.items() if v > 0}
    
    if not phase_counts:
        phase_counts = {'No Data': 1}
    
    # Colors
    colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    
    # Create pie chart
    wedges, texts, autotexts = ax.pie(
        phase_counts.values(),
        labels=phase_counts.keys(),
        colors=colors[:len(phase_counts)],
        autopct='%1.1f%%',
        startangle=90,
        textprops={'fontsize': 11, 'weight': 'bold'}
    )
    
    # Make percentage text white
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontsize(12)
    
    ax.set_title('Clinical Trials Distribution by Phase', fontsize=14, weight='bold', pad=20)
    
    # Equal aspect ratio ensures circular pie
    ax.axis('equal')
    
    # Convert to base64
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    plt.close()
    
    return base64.b64encode(buf.read()).decode('utf-8')


def generate_signals_chart(signals: List[str]) -> str:
    """Generate a visual representation of decision signals.
    
    Args:
        signals: List of signal identifiers
        
    Returns:
        Base64 encoded PNG image
    """
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Categorize signals
    positive_signals = [s for s in signals if any(
        keyword in s for keyword in ['WHITESPACE', 'OPPORTUNITY', 'GROWTH', 'WINDOW']
    )]
    negative_signals = [s for s in signals if any(
        keyword in s for keyword in ['CROWDED', 'BLOCKED', 'RISK', 'DEPENDENCY', 'ACTIVE']
    )]
    neutral_signals = [s for s in signals if s not in positive_signals and s not in negative_signals]
    
    # Create stacked data
    categories = ['Positive\nSignals', 'Neutral\nSignals', 'Negative\nSignals']
    values = [len(positive_signals), len(neutral_signals), len(negative_signals)]
    colors_list = ['#10b981', '#6b7280', '#ef4444']
    
    # Create bar chart
    bars = ax.bar(categories, values, color=colors_list, alpha=0.8, edgecolor='black', linewidth=2)
    
    # Add value labels
    for bar, value in zip(bars, values):
        height = bar.get_height()
        if value > 0:
            ax.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(value)}',
                    ha='center', va='bottom', fontsize=14, weight='bold')
    
    ax.set_ylabel('Number of Signals', fontsize=12, weight='bold')
    ax.set_title('Decision Signal Distribution', fontsize=14, weight='bold', pad=15)
    ax.set_ylim(0, max(values) * 1.2 if max(values) > 0 else 5)
    
    # Grid
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)
    
    # Convert to base64
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    plt.close()
    
    return base64.b64encode(buf.read()).decode('utf-8')


def generate_all_insights_graphs(
    scores: Optional[Dict[str, float]] = None,
    market_data: Optional[Dict] = None,
    patent_data: Optional[List[Dict]] = None,
    competition_data: Optional[Dict] = None,
    trials_data: Optional[List[Dict]] = None,
    signals: Optional[List[str]] = None
) -> Dict[str, str]:
    """Generate all available insight graphs.
    
    Args:
        scores: Opportunity/risk/innovation scores
        market_data: Market size and growth data
        patent_data: Patent landscape data
        competition_data: Competition metrics
        trials_data: Clinical trials data
        signals: Decision signals
        
    Returns:
        Dictionary mapping graph names to base64 encoded images
    """
    graphs = {}
    
    if scores:
        graphs['opportunity_radar'] = generate_opportunity_radar_chart(scores)
    
    if market_data:
        graphs['market_growth'] = generate_market_growth_chart(market_data)
    
    if patent_data:
        graphs['patent_timeline'] = generate_patent_timeline_chart(patent_data)
    
    if competition_data:
        graphs['competition_heatmap'] = generate_competition_heatmap(competition_data)
    
    if trials_data:
        graphs['trial_phases'] = generate_trial_phases_chart(trials_data)
    
    if signals:
        graphs['signals'] = generate_signals_chart(signals)
    
    return graphs
