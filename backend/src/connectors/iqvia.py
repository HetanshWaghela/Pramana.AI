"""IQVIA Market Intelligence mock connector."""

from datetime import datetime
from typing import Any
from connectors.base import BaseConnector


class IQVIAConnector(BaseConnector):
    """Mock connector for IQVIA market data.
    
    Simulates MIDAS-style market intelligence queries.
    """
    
    # Mock data for demo scenarios
    MOCK_DATA = {
        "metformin": {
            "therapy_area": {
                "id": 101,
                "label": "Anti-aging/Longevity",
                "sub_areas": ["Geroscience", "Metabolic Health", "Cellular Aging"]
            },
            "market_data": {
                "region": "US",
                "year": 2024,
                "market_size_usd_mn": 52000,
                "cagr_5yr": 8.2,
                "patient_population_mn": 54.3,
                "diagnosed_rate_pct": 85,
                "unmet_need_score": 0.72
            },
            "competition": {
                "total_players": 12,
                "top_5_share_pct": 45,
                "fragmentation_index": "MODERATE",
                "top_competitors": [
                    {"name": "AFAR Institute", "share_pct": 15.0, "type": "Research"},
                    {"name": "Unity Biotechnology", "share_pct": 12.0, "type": "Biotech"},
                    {"name": "Calico Labs", "share_pct": 10.5, "type": "Biotech"},
                    {"name": "Elysium Health", "share_pct": 8.0, "type": "Consumer"},
                    {"name": "Life Biosciences", "share_pct": 7.5, "type": "Biotech"}
                ]
            },
            "growth_drivers": [
                "Aging global population",
                "Growing longevity research funding",
                "TAME trial anticipated results",
                "FDA geroscience guidance evolution"
            ]
        },
        "copd": {
            "therapy_area": {
                "id": 42,
                "label": "Respiratory",
                "sub_areas": ["COPD", "Asthma", "Bronchitis"]
            },
            "market_data": {
                "region": "India",
                "year": 2024,
                "market_size_usd_mn": 4200,
                "cagr_5yr": 9.7,
                "patient_population_mn": 55.3,
                "diagnosed_rate_pct": 30,
                "unmet_need_score": 0.85
            },
            "competition": {
                "total_players": 45,
                "top_5_share_pct": 52,
                "fragmentation_index": "HIGH",
                "top_competitors": [
                    {"name": "Cipla", "share_pct": 18.5, "type": "Generic"},
                    {"name": "Sun Pharma", "share_pct": 14.2, "type": "Generic"},
                    {"name": "Lupin", "share_pct": 9.8, "type": "Generic"},
                    {"name": "GSK", "share_pct": 5.5, "type": "Innovator"},
                    {"name": "AstraZeneca", "share_pct": 4.0, "type": "Innovator"}
                ]
            },
            "growth_drivers": [
                "Rising air pollution levels",
                "Urbanization and lifestyle changes",
                "Increased tobacco consumption",
                "Aging population",
                "Improved healthcare access under Ayushman Bharat"
            ]
        },
        "respiratory": {
            "therapy_area": {
                "id": 42,
                "label": "Respiratory",
                "sub_areas": ["COPD", "Asthma", "IPF", "Bronchitis"]
            },
            "market_data": {
                "region": "India",
                "year": 2024,
                "market_size_usd_mn": 4200,
                "cagr_5yr": 9.7,
                "patient_population_mn": 55.3,
                "diagnosed_rate_pct": 30,
                "unmet_need_score": 0.85
            },
            "competition": {
                "total_players": 45,
                "top_5_share_pct": 52,
                "fragmentation_index": "HIGH",
                "top_competitors": [
                    {"name": "Cipla", "share_pct": 18.5, "type": "Generic"},
                    {"name": "Sun Pharma", "share_pct": 14.2, "type": "Generic"}
                ]
            },
            "growth_drivers": [
                "Rising air pollution levels",
                "Urbanization",
                "Aging population"
            ]
        }
    }
    
    async def query(self, query: str, **kwargs) -> dict[str, Any]:
        """Query mock IQVIA market data.
        
        Args:
            query: Market query (e.g., "metformin anti-aging")
            **kwargs: Optional filters (region, therapy_area)
            
        Returns:
            Market intelligence data
        """
        self.last_query_time = datetime.utcnow()
        
        query_lower = query.lower()
        
        # Match against mock data
        for key, data in self.MOCK_DATA.items():
            if key in query_lower:
                return {
                    "success": True,
                    "query": query,
                    "data": data,
                    "provenance": self.get_provenance()
                }
        
        # Default response for unknown queries
        return {
            "success": True,
            "query": query,
            "data": {
                "therapy_area": {"id": 0, "label": "Unknown", "sub_areas": []},
                "market_data": {
                    "region": kwargs.get("region", "Global"),
                    "year": 2024,
                    "market_size_usd_mn": 1000,
                    "cagr_5yr": 5.0,
                    "patient_population_mn": 10.0,
                    "diagnosed_rate_pct": 50,
                    "unmet_need_score": 0.5
                },
                "competition": {
                    "total_players": 20,
                    "top_5_share_pct": 40,
                    "fragmentation_index": "MODERATE",
                    "top_competitors": []
                },
                "growth_drivers": ["Market data not available for specific query"]
            },
            "provenance": self.get_provenance()
        }
