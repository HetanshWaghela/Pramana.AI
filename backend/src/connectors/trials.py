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
        "tiotropium": [
            {
                "protocolSection": {
                    "identificationModule": {
                        "nctId": "NCT03759535",
                        "briefTitle": "Tiotropium Respimat in COPD Patients: Real-World Evidence",
                        "officialTitle": "Observational Study of Tiotropium Bromide Efficacy in Indian COPD Population"
                    },
                    "statusModule": {
                        "overallStatus": "COMPLETED",
                        "startDateStruct": {"date": "2019-03-15", "type": "ACTUAL"},
                        "primaryCompletionDateStruct": {"date": "2022-09-30", "type": "ACTUAL"}
                    },
                    "sponsorCollaboratorsModule": {
                        "leadSponsor": {"name": "All India Institute of Medical Sciences", "class": "OTHER"}
                    },
                    "designModule": {
                        "studyType": "OBSERVATIONAL",
                        "phases": ["NA"],
                        "enrollmentInfo": {"count": 1500, "type": "ACTUAL"}
                    },
                    "conditionsModule": {
                        "conditions": ["COPD", "Chronic Obstructive Pulmonary Disease"]
                    }
                }
            },
            {
                "protocolSection": {
                    "identificationModule": {
                        "nctId": "NCT04987234",
                        "briefTitle": "Tiotropium/Olodaterol Fixed Combination vs Monotherapy in Severe COPD",
                        "officialTitle": "A Phase 3 Randomized Trial Comparing Tiotropium/Olodaterol FDC with Tiotropium Alone"
                    },
                    "statusModule": {
                        "overallStatus": "RECRUITING",
                        "startDateStruct": {"date": "2024-06-01", "type": "ACTUAL"},
                        "primaryCompletionDateStruct": {"date": "2027-06-30", "type": "ESTIMATED"}
                    },
                    "sponsorCollaboratorsModule": {
                        "leadSponsor": {"name": "Boehringer Ingelheim", "class": "INDUSTRY"}
                    },
                    "designModule": {
                        "studyType": "INTERVENTIONAL",
                        "phases": ["PHASE3"],
                        "enrollmentInfo": {"count": 2400, "type": "ESTIMATED"}
                    },
                    "conditionsModule": {
                        "conditions": ["COPD", "Respiratory Insufficiency"]
                    }
                }
            },
            {
                "protocolSection": {
                    "identificationModule": {
                        "nctId": "NCT05234567",
                        "briefTitle": "Tiotropium Dry Powder Inhaler Generic Bioequivalence Study",
                        "officialTitle": "Phase 1 Bioequivalence Study of Generic Tiotropium DPI vs Spiriva Handihaler"
                    },
                    "statusModule": {
                        "overallStatus": "COMPLETED",
                        "startDateStruct": {"date": "2023-01-10", "type": "ACTUAL"},
                        "primaryCompletionDateStruct": {"date": "2023-08-30", "type": "ACTUAL"}
                    },
                    "sponsorCollaboratorsModule": {
                        "leadSponsor": {"name": "Cipla Limited", "class": "INDUSTRY"}
                    },
                    "designModule": {
                        "studyType": "INTERVENTIONAL",
                        "phases": ["PHASE1"],
                        "enrollmentInfo": {"count": 72, "type": "ACTUAL"}
                    },
                    "conditionsModule": {
                        "conditions": ["Healthy Volunteers", "COPD Bioequivalence"]
                    }
                }
            }
        ],
        "respiratory": [
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
        
        # Improved matching logic - check for molecule AND therapy area
        matched_keys = []
        for key in self.MOCK_DATA.keys():
            if key in query_lower:
                matched_keys.append(key)
        
        # If we have matches, combine them (e.g., "tiotropium" + "respiratory")
        if matched_keys:
            for key in matched_keys:
                trials.extend(self.MOCK_DATA[key])
            # Remove duplicates based on NCT ID
            seen_ids = set()
            unique_trials = []
            for trial in trials:
                nct_id = trial.get("protocolSection", {}).get("identificationModule", {}).get("nctId")
                if nct_id and nct_id not in seen_ids:
                    seen_ids.add(nct_id)
                    unique_trials.append(trial)
            trials = unique_trials
        
        # Match against mock data with better logic
        for key, data in self.MOCK_DATA.items():
            if key in query_lower or key in kwargs.get("molecule", "").lower() or key in kwargs.get("therapy_area", "").lower():
                trials.extend(data)
                break
        
        # Therapy area fallback mapping
        if not trials:
            therapy_map = {
                "aging": "metformin",
                "anti-aging": "metformin",
                "longevity": "metformin",
                "respiratory": "tiotropium",
                "copd": "tiotropium",
            }
            
            therapy_area = kwargs.get("therapy_area", "").lower()
            for therapy_keyword, fallback_key in therapy_map.items():
                if therapy_keyword in therapy_area or therapy_keyword in query_lower:
                    if fallback_key in self.MOCK_DATA:
                        trials.extend(self.MOCK_DATA[fallback_key])
                        break
        
        # If still no match, return NO PLACEHOLDER - return empty with clear message
        if not trials:
            return {
                "success": True,
                "query": query,
                "totalCount": 0,
                "studies": [],
                "message": "No specific clinical trials data available for this query in mock database. In production, this would query ClinicalTrials.gov API.",
                "provenance": self.get_provenance()
            }
        
        return {
            "success": True,
            "query": query,
            "totalCount": len(trials),
            "studies": trials,
            "provenance": self.get_provenance()
        }

