"""Internal documents mock connector with vector store simulation."""

from datetime import datetime
from typing import Any
from connectors.base import BaseConnector


class InternalDocsConnector(BaseConnector):
    """Mock connector for internal company documents and knowledge base.
    
    **IMPORTANT: This data is NOT real-time. It represents simulated internal
    documents and historical research for demonstration purposes only.**
    """
    
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
        "tiotropium": [
            {
                "document_id": "INT-2024-042",
                "title": "Tiotropium Generic Strategy: Post-Patent Opportunity Analysis",
                "document_type": "STRATEGY_DECK",
                "created_date": "2024-11-10",
                "author": "Generic Products Division",
                "relevance_score": 0.96,
                "key_excerpts": [
                    "Spiriva patent expiry in 2023 opened $6.8B global market to generics.",
                    "Indian manufacturers well-positioned with established DPI capabilities.",
                    "Global opportunity with 384M COPD patients worldwide, only 35% diagnosed.",
                    "Key differentiator: Device design and patient-friendly features."
                ],
                "recommendations": [
                    "Develop improved DPI device with dose counter and ease-of-use features",
                    "Target emerging markets with affordable pricing strategy",
                    "Pursue 505(j) ANDA for US market entry",
                    "Consider Tiotropium/Olodaterol combination for differentiation"
                ]
            },
            {
                "document_id": "INT-2024-055",
                "title": "COPD Device Innovation Gaps",
                "document_type": "R&D_INSIGHT",
                "created_date": "2024-12-01",
                "author": "R&D Innovation Lab",
                "relevance_score": 0.89,
                "key_excerpts": [
                    "Current DPIs require high inspiratory flow - problematic for severe COPD patients.",
                    "Patient adherence drops 45% with complex multi-step devices.",
                    "Opportunity: Breath-activated, single-step inhaler design.",
                    "Regulatory pathway: 505(b)(2) with device superiority claims."
                ],
                "recommendations": [
                    "Invest in breath-actuated DPI technology development",
                    "Conduct human factors studies for regulatory submission",
                    "Partner with device engineering firms for rapid prototyping",
                    "Target premium segment willing to pay for better experience"
                ]
            },
            {
                "document_id": "INT-2024-067",
                "title": "Global COPD Market Segmentation Study",
                "document_type": "MARKET_RESEARCH",
                "created_date": "2024-10-20",
                "author": "Market Intelligence",
                "relevance_score": 0.84,
                "key_excerpts": [
                    "LAMA monotherapy declining as LAMA/LABA combinations gain preference.",
                    "Tiotropium remains gold standard for COPD maintenance therapy.",
                    "Generic price erosion creates volume opportunities in price-sensitive markets.",
                    "Respimat vs Handihaler: SMI technology commands 25% price premium."
                ],
                "recommendations": [
                    "Position generic tiotropium as cost-effective maintenance option",
                    "Develop combination products for treatment-naive severe COPD",
                    "Emphasize clinical equivalence and quality in marketing",
                    "Explore telehealth integration for patient monitoring"
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
            **kwargs: Optional filters (document_type, date_range, molecule, therapy_area)
            
        Returns:
            Internal document insights with excerpts
        """
        self.last_query_time = datetime.utcnow()
        
        query_lower = query.lower()
        molecule = kwargs.get("molecule", "").lower()
        therapy_area = kwargs.get("therapy_area", "").lower()
        documents = []
        
        # Try direct matches
        for key, data in self.MOCK_DATA.items():
            if key in query_lower or key in molecule or key in therapy_area:
                documents.extend(data)
                break
        
        # Therapy area fallback mapping
        if not documents:
            therapy_map = {
                "aging": "metformin",
                "anti-aging": "metformin",
                "longevity": "metformin",
                "respiratory": "tiotropium",
                "copd": "tiotropium",
            }
            
            for therapy_keyword, fallback_key in therapy_map.items():
                if therapy_keyword in therapy_area or therapy_keyword in query_lower:
                    if fallback_key in self.MOCK_DATA:
                        documents.extend(self.MOCK_DATA[fallback_key])
                        break
        
        # If no match, return EMPTY with message
        if not documents:
            return {
                "success": True,
                "query": query,
                "total_documents": 0,
                "documents": [],
                "internal_score": 0,
                "message": "No internal documents available for this query in mock database. In production, this would query your internal knowledge base.",
                "provenance": self.get_provenance()
            }
        
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

    def get_provenance(self) -> dict:
        """Return data source metadata with non-real-time disclaimer."""
        base_prov = super().get_provenance()
        base_prov.update({
            "source_type": "Internal Documents (SIMULATED)",
            "data_currency": "NOT REAL-TIME",
            "disclaimer": "Simulated internal documents for demonstration. Not actual company data.",
            "document_date_range": "2024-01-01 to 2024-12-01",
        })
        return base_prov

