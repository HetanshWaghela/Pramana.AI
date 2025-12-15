"""ClinicalTrials.gov mock connector."""

from datetime import datetime
from typing import Any
from connectors.base import BaseConnector


class ClinicalTrialsConnector(BaseConnector):
    """Mock connector for ClinicalTrials.gov API v2.0 format."""
    
    MOCK_DATA = {
        "metformin": [
            {
                "protocolSection": {
                    "identificationModule": {
                        "nctId": "NCT02432287",
                        "briefTitle": "Targeting Aging with Metformin (TAME)",
                        "officialTitle": "A Double-Blind, Placebo-Controlled, Multi-Center Trial to Evaluate if Metformin Can Delay Age-Related Conditions"
                    },
                    "statusModule": {
                        "overallStatus": "RECRUITING",
                        "startDateStruct": {"date": "2024-01-15", "type": "ACTUAL"},
                        "primaryCompletionDateStruct": {"date": "2029-12-31", "type": "ESTIMATED"}
                    },
                    "sponsorCollaboratorsModule": {
                        "leadSponsor": {"name": "Albert Einstein College of Medicine", "class": "OTHER"}
                    },
                    "designModule": {
                        "studyType": "INTERVENTIONAL",
                        "phases": ["PHASE3"],
                        "enrollmentInfo": {"count": 3000, "type": "ESTIMATED"}
                    },
                    "conditionsModule": {
                        "conditions": ["Aging", "Cardiovascular Disease", "Cancer", "Dementia"]
                    }
                }
            },
            {
                "protocolSection": {
                    "identificationModule": {
                        "nctId": "NCT05678901",
                        "briefTitle": "Metformin for Longevity in Pre-Diabetic Adults",
                        "officialTitle": "A Phase 2 Study of Metformin Extended Release in Pre-Diabetic Adults"
                    },
                    "statusModule": {
                        "overallStatus": "ACTIVE_NOT_RECRUITING",
                        "startDateStruct": {"date": "2023-06-01", "type": "ACTUAL"},
                        "primaryCompletionDateStruct": {"date": "2026-06-30", "type": "ESTIMATED"}
                    },
                    "sponsorCollaboratorsModule": {
                        "leadSponsor": {"name": "Mayo Clinic", "class": "OTHER"}
                    },
                    "designModule": {
                        "studyType": "INTERVENTIONAL",
                        "phases": ["PHASE2"],
                        "enrollmentInfo": {"count": 500, "type": "ACTUAL"}
                    },
                    "conditionsModule": {
                        "conditions": ["Prediabetes", "Aging"]
                    }
                }
            },
            {
                "protocolSection": {
                    "identificationModule": {
                        "nctId": "NCT04567890",
                        "briefTitle": "Metformin and Cellular Senescence",
                        "officialTitle": "Effects of Metformin on Senescent Cell Burden in Older Adults"
                    },
                    "statusModule": {
                        "overallStatus": "COMPLETED",
                        "startDateStruct": {"date": "2021-01-01", "type": "ACTUAL"},
                        "primaryCompletionDateStruct": {"date": "2023-12-31", "type": "ACTUAL"}
                    },
                    "sponsorCollaboratorsModule": {
                        "leadSponsor": {"name": "Buck Institute", "class": "OTHER"}
                    },
                    "designModule": {
                        "studyType": "INTERVENTIONAL",
                        "phases": ["PHASE2"],
                        "enrollmentInfo": {"count": 120, "type": "ACTUAL"}
                    },
                    "conditionsModule": {
                        "conditions": ["Cellular Senescence", "Aging"]
                    }
                }
            }
        ],
        "copd": [
            {
                "protocolSection": {
                    "identificationModule": {
                        "nctId": "NCT05123456",
                        "briefTitle": "LAMA/LABA Fixed-Dose Combination in Indian COPD Patients",
                        "officialTitle": "A Randomized Controlled Trial of Tiotropium/Olodaterol in Moderate-to-Severe COPD"
                    },
                    "statusModule": {
                        "overallStatus": "RECRUITING",
                        "startDateStruct": {"date": "2024-03-01", "type": "ACTUAL"},
                        "primaryCompletionDateStruct": {"date": "2026-03-31", "type": "ESTIMATED"}
                    },
                    "sponsorCollaboratorsModule": {
                        "leadSponsor": {"name": "Cipla Ltd", "class": "INDUSTRY"}
                    },
                    "designModule": {
                        "studyType": "INTERVENTIONAL",
                        "phases": ["PHASE3"],
                        "enrollmentInfo": {"count": 800, "type": "ESTIMATED"}
                    },
                    "conditionsModule": {
                        "conditions": ["COPD", "Chronic Obstructive Pulmonary Disease"]
                    }
                }
            },
            {
                "protocolSection": {
                    "identificationModule": {
                        "nctId": "NCT05234567",
                        "briefTitle": "Affordable DPI for COPD in Rural India",
                        "officialTitle": "Evaluation of a Low-Cost Dry Powder Inhaler for COPD Management"
                    },
                    "statusModule": {
                        "overallStatus": "RECRUITING",
                        "startDateStruct": {"date": "2024-01-15", "type": "ACTUAL"},
                        "primaryCompletionDateStruct": {"date": "2025-12-31", "type": "ESTIMATED"}
                    },
                    "sponsorCollaboratorsModule": {
                        "leadSponsor": {"name": "Sun Pharmaceutical", "class": "INDUSTRY"}
                    },
                    "designModule": {
                        "studyType": "INTERVENTIONAL",
                        "phases": ["PHASE3"],
                        "enrollmentInfo": {"count": 600, "type": "ESTIMATED"}
                    },
                    "conditionsModule": {
                        "conditions": ["COPD"]
                    }
                }
            },
            {
                "protocolSection": {
                    "identificationModule": {
                        "nctId": "NCT05345678",
                        "briefTitle": "Triple Therapy in Severe COPD",
                        "officialTitle": "ICS/LAMA/LABA Triple Therapy vs Dual Bronchodilator in Severe COPD"
                    },
                    "statusModule": {
                        "overallStatus": "ACTIVE_NOT_RECRUITING",
                        "startDateStruct": {"date": "2023-06-01", "type": "ACTUAL"},
                        "primaryCompletionDateStruct": {"date": "2025-06-30", "type": "ESTIMATED"}
                    },
                    "sponsorCollaboratorsModule": {
                        "leadSponsor": {"name": "Lupin Ltd", "class": "INDUSTRY"}
                    },
                    "designModule": {
                        "studyType": "INTERVENTIONAL",
                        "phases": ["PHASE3"],
                        "enrollmentInfo": {"count": 450, "type": "ACTUAL"}
                    },
                    "conditionsModule": {
                        "conditions": ["Severe COPD", "COPD Exacerbation"]
                    }
                }
            }
        ]
    }
    
    async def query(self, query: str, **kwargs) -> dict[str, Any]:
        """Query mock clinical trials data.
        
        Args:
            query: Search query (e.g., "metformin aging")
            **kwargs: Optional filters (phase, status, sponsor_class)
            
        Returns:
            Clinical trials data in ClinicalTrials.gov v2.0 format
        """
        self.last_query_time = datetime.utcnow()
        
        query_lower = query.lower()
        trials = []
        
        # Match against mock data
        for key, data in self.MOCK_DATA.items():
            if key in query_lower:
                trials.extend(data)
        
        # If no match, return synthetic placeholder trials
        if not trials:
            # Extract potential molecule name from query
            words = [w.capitalize() for w in query.split() if len(w) > 3]
            molecule_hint = words[0] if words else "Unknown"
            
            trials = [
                {
                    "protocolSection": {
                        "identificationModule": {
                            "nctId": "NCT00000001",
                            "briefTitle": f"Exploratory Study of {molecule_hint}",
                            "officialTitle": f"Phase 2 Investigation of {molecule_hint} Efficacy"
                        },
                        "statusModule": {
                            "overallStatus": "RECRUITING",
                            "startDateStruct": {"date": "2024-01-01", "type": "ESTIMATED"},
                            "primaryCompletionDateStruct": {"date": "2027-12-31", "type": "ESTIMATED"}
                        },
                        "sponsorCollaboratorsModule": {
                            "leadSponsor": {"name": "Academic Institution", "class": "OTHER"}
                        },
                        "designModule": {
                            "studyType": "INTERVENTIONAL",
                            "phases": ["PHASE2"],
                            "enrollmentInfo": {"count": 200, "type": "ESTIMATED"}
                        },
                        "conditionsModule": {
                            "conditions": ["General Condition"]
                        }
                    }
                }
            ]
        
        return {
            "success": True,
            "query": query,
            "totalCount": len(trials),
            "studies": trials,
            "provenance": self.get_provenance()
        }

