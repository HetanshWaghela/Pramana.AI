"""Internal documents mock connector with vector store simulation."""

from datetime import datetime
from typing import Any
from connectors.base import BaseConnector


class InternalDocsConnector(BaseConnector):
    """Mock connector for internal company documents and knowledge base."""
    
    MOCK_DATA = {
        "metformin": [
            {
                "document_id": "INT-2024-001",
                "title": "Anti-Aging Pipeline Strategy 2024",
                "document_type": "STRATEGY_DECK",
                "created_date": "2024-06-15",
                "author": "Strategy Team",
                "relevance_score": 0.95,
                "key_excerpts": [
                    "Metformin represents a low-risk, high-potential repurposing opportunity with established safety profile.",
                    "TAME trial results expected by 2029 could open FDA pathway for aging indications.",
                    "Recommend 505(b)(2) approach for extended-release formulation with anti-aging claims."
                ],
                "recommendations": [
                    "Partner with academic institutions for clinical evidence",
                    "Develop XR formulation with enhanced bioavailability",
                    "Target geriatric population 65+ with comorbidities"
                ]
            },
            {
                "document_id": "INT-2024-015",
                "title": "Competitive Landscape: Longevity Market",
                "document_type": "COMPETITIVE_INTEL",
                "created_date": "2024-08-20",
                "author": "Business Intelligence",
                "relevance_score": 0.88,
                "key_excerpts": [
                    "Unity Biotechnology and Calico are leading senolytics development.",
                    "Metformin's generic status provides cost advantage for market entry.",
                    "Consumer longevity market growing at 15% CAGR."
                ],
                "recommendations": [
                    "Differentiate through formulation innovation",
                    "Consider nutraceutical positioning for faster market access"
                ]
            }
        ],
        "copd": [
            {
                "document_id": "INT-2024-008",
                "title": "India Respiratory Market Entry Analysis",
                "document_type": "STRATEGY_DECK",
                "created_date": "2024-07-10",
                "author": "India Business Unit",
                "relevance_score": 0.92,
                "key_excerpts": [
                    "COPD affects 55M+ Indians with only 30% diagnosis rate - massive unmet need.",
                    "Rural penetration limited by device complexity and cost.",
                    "Opportunity for affordable, easy-to-use DPI targeting Tier 2/3 cities."
                ],
                "recommendations": [
                    "Develop low-cost DPI device with local manufacturing",
                    "Partner with Ayushman Bharat for government formulary inclusion",
                    "Focus on LAMA/LABA fixed-dose combinations"
                ]
            },
            {
                "document_id": "INT-2024-022",
                "title": "Mumbai COPD Field Report",
                "document_type": "FIELD_REPORT",
                "created_date": "2024-09-05",
                "author": "Medical Affairs",
                "relevance_score": 0.85,
                "key_excerpts": [
                    "Physicians report high demand for affordable combination inhalers.",
                    "Patient adherence drops due to complex device handling.",
                    "Air pollution driving COPD cases in urban areas."
                ],
                "recommendations": [
                    "Simplify device design for elderly patients",
                    "Include patient education materials in local languages",
                    "Consider prefilled disposable options"
                ]
            },
            {
                "document_id": "INT-2024-030",
                "title": "Cipla Inhaler Portfolio Deep Dive",
                "document_type": "COMPETITIVE_INTEL",
                "created_date": "2024-10-01",
                "author": "Competitive Intelligence",
                "relevance_score": 0.82,
                "key_excerpts": [
                    "Cipla dominates Indian inhaler market with 18.5% share.",
                    "Their DPI devices are priced 40% below MNC alternatives.",
                    "Gaps identified in triple therapy segment."
                ],
                "recommendations": [
                    "Avoid direct competition in established segments",
                    "Focus on underserved severe COPD population",
                    "Consider biosimilar biologics for severe cases"
                ]
            }
        ],
        "respiratory": [
            {
                "document_id": "INT-2024-008",
                "title": "India Respiratory Market Entry Analysis",
                "document_type": "STRATEGY_DECK",
                "created_date": "2024-07-10",
                "author": "India Business Unit",
                "relevance_score": 0.92,
                "key_excerpts": [
                    "COPD affects 55M+ Indians with only 30% diagnosis rate.",
                    "Opportunity for affordable, easy-to-use DPI."
                ],
                "recommendations": [
                    "Develop low-cost DPI device"
                ]
            }
        ]
    }
    
    async def query(self, query: str, **kwargs) -> dict[str, Any]:
        """Query mock internal documents.
        
        Args:
            query: Search query
            **kwargs: Optional filters (document_type, date_range)
            
        Returns:
            Internal document insights with excerpts
        """
        self.last_query_time = datetime.utcnow()
        
        query_lower = query.lower()
        documents = []
        
        for key, data in self.MOCK_DATA.items():
            if key in query_lower:
                documents.extend(data)
        
        # If no match, return synthetic placeholder document
        if not documents:
            words = [w.capitalize() for w in query.split() if len(w) > 3]
            topic_hint = " ".join(words[:2]) if words else "General Topic"
            
            documents = [
                {
                    "document_id": "INT-SYNTH-001",
                    "title": f"General Market Analysis: {topic_hint}",
                    "document_type": "STRATEGY_DECK",
                    "created_date": "2024-01-01",
                    "author": "Strategy Team",
                    "relevance_score": 0.50,
                    "key_excerpts": [
                        f"This is a placeholder analysis for {topic_hint}.",
                        "Further research recommended to understand market dynamics.",
                        "Consider engaging specialized consultants for detailed insights."
                    ],
                    "recommendations": [
                        "Conduct detailed market research",
                        "Engage with key opinion leaders",
                        "Review competitive landscape"
                    ]
                }
            ]
        
        # Sort by relevance score
        documents.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
        
        return {
            "success": True,
            "query": query,
            "total_documents": len(documents),
            "documents": documents,
            "internal_score": max([d.get("relevance_score", 0) for d in documents]) if documents else 0,
            "provenance": self.get_provenance()
        }

