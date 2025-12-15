"""IQVIA Market Intelligence mock connector."""

from datetime import datetime
from typing import Any
from connectors.base import BaseConnector


class IQVIAConnector(BaseConnector):
    """Mock connector for IQVIA market data.
    
    Simulates MIDAS-style market intelligence queries.
    
    **IMPORTANT: This data is NOT real-time. It represents historical/simulated
    market intelligence for demonstration purposes only.**
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
        "tiotropium": {
            "therapy_area": {
                "id": 42,
                "label": "Respiratory - COPD",
                "sub_areas": ["COPD Maintenance", "Bronchodilation", "Respiratory Therapeutics"]
            },
            "market_data": {
                "region": "Global",
                "year": 2024,
                "market_size_usd_mn": 6800,
                "cagr_5yr": 4.2,
                "patient_population_mn": 384.0,
                "diagnosed_rate_pct": 35,
                "unmet_need_score": 0.78
            },
            "competition": {
                "total_players": 28,
                "top_5_share_pct": 68,
                "fragmentation_index": "MODERATE",
                "top_competitors": [
                    {"name": "Boehringer Ingelheim (Spiriva)", "share_pct": 32.5, "type": "Innovator"},
                    {"name": "GSK (Anoro Ellipta)", "share_pct": 15.8, "type": "Innovator"},
                    {"name": "AstraZeneca (Bevespi)", "share_pct": 10.2, "type": "Innovator"},
                    {"name": "Cipla (Generic Tiotropium)", "share_pct": 5.5, "type": "Generic"},
                    {"name": "Mylan (Generic Tiotropium)", "share_pct": 4.0, "type": "Generic"}
                ]
            },
            "growth_drivers": [
                "Patent expiry of Spiriva creating generic opportunities",
                "Rising COPD prevalence due to aging and pollution",
                "Shift to combination therapies (LAMA/LABA)",
                "Expansion in emerging markets with high disease burden",
                "Device innovation improving patient adherence"
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
            **kwargs: Optional filters (region, therapy_area, molecule)
            
        Returns:
            Market intelligence data
        """
        self.last_query_time = datetime.utcnow()
        
        query_lower = query.lower()
        molecule = kwargs.get("molecule", "").lower()
        therapy_area = kwargs.get("therapy_area", "").lower()
        
        # Priority 1: Direct molecule match in any field
        for key, data in self.MOCK_DATA.items():
            if key in molecule or key in query_lower:
                return {
                    "success": True,
                    "query": query,
                    "data": data,
                    "provenance": self.get_provenance()
                }
        
        # Priority 2: Therapy area mapping to available data
        therapy_map = {
            "aging": "metformin",
            "anti-aging": "metformin",
            "longevity": "metformin",
            "geroscience": "metformin",
            "respiratory": "copd",
            "copd": "copd",
            "pulmonary": "copd",
            "tiotropium": "copd",
        }
        
        for therapy_keyword, fallback_key in therapy_map.items():
            if therapy_keyword in therapy_area or therapy_keyword in query_lower:
                if fallback_key in self.MOCK_DATA:
                    return {
                        "success": True,
                        "query": query,
                        "data": self.MOCK_DATA[fallback_key],
                        "provenance": self.get_provenance()
                    }
        
        # Try matching on therapy_area parameter
        if kwargs.get("therapy_area"):
            therapy_lower = kwargs.get("therapy_area", "").lower()
            for key, data in self.MOCK_DATA.items():
                if key in therapy_lower:
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

    def get_provenance(self) -> dict:
        """Return data source metadata with non-real-time disclaimer."""
        base_prov = super().get_provenance()
        base_prov.update({
            "source_type": "IQVIA Market Intelligence (SIMULATED)",
            "data_currency": "NOT REAL-TIME",
            "disclaimer": "Historical/simulated data for demonstration. Not suitable for actual business decisions.",
            "last_updated": "2024-12-01",
        })
        return base_prov
