"""Web search mock connector with citations."""

from datetime import datetime
from typing import Any
from connectors.base import BaseConnector


class WebSearchConnector(BaseConnector):
    """Mock connector for web search with credibility scoring."""
    
    MOCK_DATA = {
        "metformin": [
            {
                "title": "TAME Trial: Targeting Aging with Metformin - AFAR",
                "url": "https://www.afar.org/tame-trial",
                "snippet": "The TAME trial is the first clinical trial aimed at targeting the underlying biology of aging. Led by Dr. Nir Barzilai, it will test whether metformin can delay age-related diseases.",
                "source": "American Federation for Aging Research",
                "credibility_score": 0.95,
                "published_date": "2024-03-15",
                "source_type": "ACADEMIC"
            },
            {
                "title": "Metformin and Aging: Mechanisms and Clinical Implications",
                "url": "https://www.nature.com/articles/aging-metformin-2024",
                "snippet": "Recent studies demonstrate metformin's effects on AMPK activation, mitochondrial function, and cellular senescence. The drug shows promise for extending healthspan in human populations.",
                "source": "Nature Aging",
                "credibility_score": 0.98,
                "published_date": "2024-02-20",
                "source_type": "JOURNAL"
            },
            {
                "title": "FDA Geroscience Guidance: Implications for Drug Development",
                "url": "https://www.fda.gov/geroscience-guidance",
                "snippet": "FDA releases draft guidance on drug development for aging-related conditions, opening pathways for therapies targeting biological aging processes.",
                "source": "FDA",
                "credibility_score": 0.99,
                "published_date": "2024-01-10",
                "source_type": "REGULATORY"
            },
            {
                "title": "Longevity Market to Reach $600B by 2030",
                "url": "https://www.grandviewresearch.com/longevity-market",
                "snippet": "Global longevity and anti-aging market projected to reach $600 billion by 2030, driven by aging demographics and increased focus on healthspan extension.",
                "source": "Grand View Research",
                "credibility_score": 0.82,
                "published_date": "2024-04-05",
                "source_type": "MARKET_RESEARCH"
            }
        ],
        "copd": [
            {
                "title": "GOLD 2024: Global Strategy for COPD Management",
                "url": "https://goldcopd.org/2024-gold-report",
                "snippet": "Updated GOLD guidelines emphasize early intervention, LAMA/LABA combinations as first-line therapy, and personalized treatment approaches based on exacerbation risk.",
                "source": "Global Initiative for COPD",
                "credibility_score": 0.97,
                "published_date": "2024-01-01",
                "source_type": "GUIDELINE"
            },
            {
                "title": "India's Air Pollution Crisis Fuels COPD Epidemic",
                "url": "https://www.thelancet.com/india-copd-2024",
                "snippet": "Study links rising air pollution levels in Indian cities to 40% increase in COPD hospitalizations. Urban populations show higher prevalence than global averages.",
                "source": "The Lancet Respiratory Medicine",
                "credibility_score": 0.96,
                "published_date": "2024-05-12",
                "source_type": "JOURNAL"
            },
            {
                "title": "Ayushman Bharat Expands Respiratory Disease Coverage",
                "url": "https://www.mohfw.gov.in/ayushman-respiratory",
                "snippet": "Government of India announces expanded coverage for COPD treatments under Ayushman Bharat, including inhalers and pulmonary rehabilitation.",
                "source": "Ministry of Health and Family Welfare",
                "credibility_score": 0.94,
                "published_date": "2024-08-20",
                "source_type": "GOVERNMENT"
            },
            {
                "title": "Low-Cost Inhalers: A Game Changer for Developing Nations",
                "url": "https://www.who.int/publications/low-cost-inhalers",
                "snippet": "WHO initiative promotes affordable inhaler devices for low and middle-income countries, with India identified as key manufacturing hub.",
                "source": "World Health Organization",
                "credibility_score": 0.95,
                "published_date": "2024-06-30",
                "source_type": "INTERNATIONAL_ORG"
            }
        ],
        "respiratory": [
            {
                "title": "GOLD 2024: Global Strategy for COPD Management",
                "url": "https://goldcopd.org/2024-gold-report",
                "snippet": "Updated GOLD guidelines emphasize LAMA/LABA combinations as first-line therapy.",
                "source": "Global Initiative for COPD",
                "credibility_score": 0.97,
                "published_date": "2024-01-01",
                "source_type": "GUIDELINE"
            }
        ]
    }
    
    async def query(self, query: str, **kwargs) -> dict[str, Any]:
        """Query mock web search results.
        
        Args:
            query: Search query
            **kwargs: Optional filters (source_type, min_credibility, molecule, therapy_area)
            
        Returns:
            Web search results with credibility scoring
        """
        self.last_query_time = datetime.utcnow()
        
        query_lower = query.lower()
        molecule = kwargs.get("molecule", "").lower()
        therapy_area = kwargs.get("therapy_area", "").lower()
        results = []
        
        # Try direct matches
        for key, data in self.MOCK_DATA.items():
            if key in query_lower or key in molecule or key in therapy_area:
                results.extend(data)
                break
        
        # Therapy area fallback mapping
        if not results:
            therapy_map = {
                "aging": "metformin",
                "anti-aging": "metformin",
                "longevity": "metformin",
                "respiratory": "respiratory",
                "copd": "copd",
            }
            
            for therapy_keyword, fallback_key in therapy_map.items():
                if therapy_keyword in therapy_area or therapy_keyword in query_lower:
                    if fallback_key in self.MOCK_DATA:
                        results.extend(self.MOCK_DATA[fallback_key])
                        break
        
        # If still no match, return EMPTY with message
        if not results:
            return {
                "success": True,
                "query": query,
                "total_results": 0,
                "results": [],
                "avg_credibility": 0,
                "message": "No web search results available for this query in mock database. In production, this would use SerpAPI or similar.",
                "provenance": self.get_provenance()
            }
        
        # Sort by credibility
        results.sort(key=lambda x: x.get("credibility_score", 0), reverse=True)
        
        return {
            "success": True,
            "query": query,
            "total_results": len(results),
            "results": results,
            "avg_credibility": sum(r.get("credibility_score", 0) for r in results) / len(results) if results else 0,
            "provenance": self.get_provenance()
        }

