"""India EXIM (Import/Export) mock connector."""

from datetime import datetime
from typing import Any
from connectors.base import BaseConnector


class EXIMConnector(BaseConnector):
    """Mock connector for India import/export trade data using HS codes."""
    
    MOCK_DATA = {
        "metformin": {
            "product": "Metformin Hydrochloride API",
            "hs_code": "29239000",
            "period": "2024",
            "import_data": {
                "total_volume_mt": 12500,
                "total_value_usd_mn": 185,
                "top_origins": [
                    {"country": "China", "share_pct": 78, "volume_mt": 9750},
                    {"country": "Italy", "share_pct": 8, "volume_mt": 1000},
                    {"country": "Germany", "share_pct": 5, "volume_mt": 625},
                    {"country": "USA", "share_pct": 4, "volume_mt": 500}
                ],
                "dependency_score": 0.78,
                "trend": "STABLE",
                "avg_price_usd_kg": 14.80
            },
            "export_data": {
                "total_volume_mt": 8200,
                "total_value_usd_mn": 145,
                "top_destinations": [
                    {"country": "USA", "share_pct": 35},
                    {"country": "EU", "share_pct": 28},
                    {"country": "Brazil", "share_pct": 12},
                    {"country": "Russia", "share_pct": 8}
                ]
            },
            "insight_flags": [
                "MODERATE_IMPORT_DEPENDENCY",
                "STRONG_EXPORT_POSITION"
            ],
            "local_manufacturing": {
                "capacity_mt": 15000,
                "utilization_pct": 82,
                "key_manufacturers": ["Sun Pharma", "Lupin", "Dr. Reddy's"]
            }
        },
        "copd": {
            "product": "COPD Inhalation Devices and APIs",
            "hs_code": "90192000",
            "period": "2024",
            "import_data": {
                "total_volume_mt": 850,
                "total_value_usd_mn": 420,
                "top_origins": [
                    {"country": "Germany", "share_pct": 35, "volume_mt": 298},
                    {"country": "USA", "share_pct": 25, "volume_mt": 213},
                    {"country": "China", "share_pct": 20, "volume_mt": 170},
                    {"country": "UK", "share_pct": 12, "volume_mt": 102}
                ],
                "dependency_score": 0.72,
                "trend": "INCREASING",
                "avg_price_usd_kg": 494.12
            },
            "export_data": {
                "total_volume_mt": 320,
                "total_value_usd_mn": 85,
                "top_destinations": [
                    {"country": "Africa", "share_pct": 45},
                    {"country": "Southeast Asia", "share_pct": 30},
                    {"country": "Middle East", "share_pct": 15}
                ]
            },
            "insight_flags": [
                "HIGH_IMPORT_DEPENDENCY",
                "LOCAL_MANUFACTURING_OPPORTUNITY",
                "HIGH_VALUE_SEGMENT"
            ],
            "local_manufacturing": {
                "capacity_mt": 200,
                "utilization_pct": 95,
                "key_manufacturers": ["Cipla", "Sun Pharma"]
            }
        },
        "respiratory": {
            "product": "Respiratory APIs and Devices",
            "hs_code": "90192000",
            "period": "2024",
            "import_data": {
                "total_volume_mt": 850,
                "total_value_usd_mn": 420,
                "top_origins": [
                    {"country": "Germany", "share_pct": 35, "volume_mt": 298},
                    {"country": "USA", "share_pct": 25, "volume_mt": 213}
                ],
                "dependency_score": 0.72,
                "trend": "INCREASING",
                "avg_price_usd_kg": 494.12
            },
            "export_data": {
                "total_volume_mt": 320,
                "total_value_usd_mn": 85,
                "top_destinations": [
                    {"country": "Africa", "share_pct": 45}
                ]
            },
            "insight_flags": [
                "HIGH_IMPORT_DEPENDENCY",
                "LOCAL_MANUFACTURING_OPPORTUNITY"
            ],
            "local_manufacturing": {
                "capacity_mt": 200,
                "utilization_pct": 95,
                "key_manufacturers": ["Cipla", "Sun Pharma"]
            }
        }
    }
    
    async def query(self, query: str, **kwargs) -> dict[str, Any]:
        """Query mock EXIM data.
        
        Args:
            query: Search query (e.g., "metformin API India")
            **kwargs: Optional filters (period, hs_code)
            
        Returns:
            Import/export trade data with dependency analysis
        """
        self.last_query_time = datetime.utcnow()
        
        query_lower = query.lower()
        
        for key, data in self.MOCK_DATA.items():
            if key in query_lower:
                return {
                    "success": True,
                    "query": query,
                    "data": data,
                    "provenance": self.get_provenance()
                }
        
        # Default response
        return {
            "success": True,
            "query": query,
            "data": {
                "product": "Unknown Product",
                "hs_code": "Unknown",
                "import_data": {
                    "dependency_score": 0.5,
                    "trend": "UNKNOWN"
                },
                "insight_flags": ["DATA_NOT_AVAILABLE"]
            },
            "provenance": self.get_provenance()
        }
