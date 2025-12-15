"""USPTO Patents and FDA Orange Book mock connector."""

from datetime import datetime
from typing import Any
from connectors.base import BaseConnector


class PatentsConnector(BaseConnector):
    """Mock connector for USPTO PatentsView API and FDA Orange Book."""
    
    MOCK_DATA = {
        "metformin": [
            {
                "patent_id": "US6099862",
                "patent_number": "6099862",
                "patent_title": "Metformin Hydrochloride Sustained Release Formulation",
                "patent_date": "2000-08-08",
                "expiry_date": "2017-08-08",
                "status": "EXPIRED",
                "patent_type": "FORMULATION",
                "assignees": [{"assignee_organization": "Bristol-Myers Squibb"}],
                "claims_summary": "Extended release metformin formulation with specific dissolution profile",
                "fto_status": "CLEAR",
                "orange_book": {
                    "application_number": "NDA 021202",
                    "te_code": "AB",
                    "exclusivity": []
                }
            },
            {
                "patent_id": "US10234567",
                "patent_number": "10234567",
                "patent_title": "Anti-Aging Metformin Composition with Enhanced Bioavailability",
                "patent_date": "2019-03-15",
                "expiry_date": "2039-03-15",
                "status": "ACTIVE",
                "patent_type": "FORMULATION",
                "assignees": [{"assignee_organization": "Unity Biotechnology"}],
                "claims_summary": "Novel metformin formulation for anti-aging indications with specific excipients",
                "fto_status": "REVIEW_REQUIRED",
                "years_to_expiry": 14
            },
            {
                "patent_id": "US9876543",
                "patent_number": "9876543",
                "patent_title": "Method of Treating Age-Related Diseases with Metformin",
                "patent_date": "2018-01-20",
                "expiry_date": "2025-06-30",
                "status": "ACTIVE",
                "patent_type": "METHOD_OF_USE",
                "assignees": [{"assignee_organization": "Albert Einstein College of Medicine"}],
                "claims_summary": "Method claims for treating aging-related conditions",
                "fto_status": "WARNING",
                "years_to_expiry": 1
            },
            {
                "patent_id": "US11223344",
                "patent_number": "11223344",
                "patent_title": "Metformin Extended Release Tablet with pH-Dependent Coating",
                "patent_date": "2022-05-10",
                "expiry_date": "2042-05-10",
                "status": "ACTIVE",
                "patent_type": "FORMULATION",
                "assignees": [{"assignee_organization": "Teva Pharmaceuticals"}],
                "claims_summary": "pH-dependent coating technology for improved GI tolerability",
                "fto_status": "REVIEW_REQUIRED",
                "years_to_expiry": 17
            }
        ],
        "tiotropium": [
            {
                "patent_id": "US8354549",
                "patent_number": "8354549",
                "patent_title": "Tiotropium Bromide Inhalation Powder",
                "patent_date": "2013-01-15",
                "expiry_date": "2023-01-15",
                "status": "EXPIRED",
                "patent_type": "DRUG_PRODUCT",
                "assignees": [{"assignee_organization": "Boehringer Ingelheim"}],
                "claims_summary": "Original Spiriva formulation - now expired creating generic opportunity",
                "fto_status": "CLEAR",
                "years_to_expiry": -1
            },
            {
                "patent_id": "US9737482",
                "patent_number": "9737482",
                "patent_title": "Tiotropium/Olodaterol Fixed-Dose Combination Inhaler",
                "patent_date": "2017-08-22",
                "expiry_date": "2035-08-22",
                "status": "ACTIVE",
                "patent_type": "DRUG_PRODUCT",
                "assignees": [{"assignee_organization": "Boehringer Ingelheim"}],
                "claims_summary": "Dual bronchodilator combination formulation",
                "fto_status": "WARNING",
                "years_to_expiry": 10
            },
            {
                "patent_id": "US10456789",
                "patent_number": "10456789",
                "patent_title": "Tiotropium Respimat Inhaler Device",
                "patent_date": "2019-10-29",
                "expiry_date": "2026-12-31",
                "status": "ACTIVE",
                "patent_type": "DEVICE",
                "assignees": [{"assignee_organization": "Boehringer Ingelheim"}],
                "claims_summary": "Soft mist inhaler delivery technology",
                "fto_status": "REVIEW_REQUIRED",
                "years_to_expiry": 2
            },
            {
                "patent_id": "US11123456",
                "patent_number": "11123456",
                "patent_title": "Generic Tiotropium Dry Powder Inhaler Formulation",
                "patent_date": "2021-06-15",
                "expiry_date": "2041-06-15",
                "status": "ACTIVE",
                "patent_type": "FORMULATION",
                "assignees": [{"assignee_organization": "Cipla Limited"}],
                "claims_summary": "Novel excipient blend for improved stability and dispersibility",
                "fto_status": "CLEAR",
                "years_to_expiry": 16
            }
        ],
        "respiratory": [
            {
                "patent_id": "US8765432",
                "patent_number": "8765432",
                "patent_title": "LAMA/LABA Fixed-Dose Combination for Inhalation",
                "patent_date": "2014-07-01",
                "expiry_date": "2026-07-01",
                "status": "ACTIVE",
                "patent_type": "DRUG_PRODUCT",
                "assignees": [{"assignee_organization": "Boehringer Ingelheim"}],
                "claims_summary": "Tiotropium/olodaterol combination inhaler formulation",
                "fto_status": "WARNING",
                "years_to_expiry": 2
            }
        ],
        "copd": [
            {
                "patent_id": "US8765432",
                "patent_number": "8765432",
                "patent_title": "LAMA/LABA Fixed-Dose Combination for Inhalation",
                "patent_date": "2014-07-01",
                "expiry_date": "2026-07-01",
                "status": "ACTIVE",
                "patent_type": "DRUG_PRODUCT",
                "assignees": [{"assignee_organization": "Boehringer Ingelheim"}],
                "claims_summary": "Tiotropium/olodaterol combination inhaler formulation",
                "fto_status": "WARNING",
                "years_to_expiry": 2
            },
            {
                "patent_id": "US9123456",
                "patent_number": "9123456",
                "patent_title": "Dry Powder Inhaler Device for Respiratory Drugs",
                "patent_date": "2016-02-15",
                "expiry_date": "2025-08-15",
                "status": "ACTIVE",
                "patent_type": "DEVICE",
                "assignees": [{"assignee_organization": "GSK"}],
                "claims_summary": "Multi-dose dry powder inhaler with dose counter",
                "fto_status": "WARNING",
                "years_to_expiry": 1
            },
            {
                "patent_id": "US10567890",
                "patent_number": "10567890",
                "patent_title": "Triple Therapy Formulation for COPD",
                "patent_date": "2020-11-20",
                "expiry_date": "2040-11-20",
                "status": "ACTIVE",
                "patent_type": "FORMULATION",
                "assignees": [{"assignee_organization": "AstraZeneca"}],
                "claims_summary": "ICS/LAMA/LABA triple combination in single actuator",
                "fto_status": "BLOCKED",
                "years_to_expiry": 16
            }
        ],
        "respiratory": [
            {
                "patent_id": "US8765432",
                "patent_number": "8765432",
                "patent_title": "LAMA/LABA Fixed-Dose Combination for Inhalation",
                "patent_date": "2014-07-01",
                "expiry_date": "2026-07-01",
                "status": "ACTIVE",
                "patent_type": "DRUG_PRODUCT",
                "assignees": [{"assignee_organization": "Boehringer Ingelheim"}],
                "claims_summary": "Tiotropium/olodaterol combination inhaler formulation",
                "fto_status": "WARNING",
                "years_to_expiry": 2
            }
        ]
    }
    
    async def query(self, query: str, **kwargs) -> dict[str, Any]:
        """Query mock patent data.
        
        Args:
            query: Search query (e.g., "metformin formulation")
            **kwargs: Optional filters (patent_type, status)
            
        Returns:
            Patent landscape data in PatentsView format
        """
        self.last_query_time = datetime.utcnow()
        
        query_lower = query.lower()
        patents = []
        
        # Improved matching - check for molecule AND therapy area
        matched_keys = []
        for key in self.MOCK_DATA.keys():
            if key in query_lower:
                matched_keys.append(key)
        
        # Combine matches and remove duplicates
        if matched_keys:
            for key in matched_keys:
                patents.extend(self.MOCK_DATA[key])
            # Remove duplicates based on patent number
            seen_numbers = set()
            unique_patents = []
            for patent in patents:
                patent_num = patent.get("patent_number")
                if patent_num and patent_num not in seen_numbers:
                    seen_numbers.add(patent_num)
                    unique_patents.append(patent)
            patents = unique_patents
        
        # If no match, try molecule parameter and therapy area
        if not patents:
            molecule_lower = kwargs.get("molecule", "").lower()
            therapy_area = kwargs.get("therapy_area", "").lower()
            
            for key, data in self.MOCK_DATA.items():
                if key in molecule_lower or key in query_lower:
                    patents.extend(data)
                    break
        
        # Therapy area fallback mapping
        if not patents:
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
                        patents.extend(self.MOCK_DATA[fallback_key])
                        break
        
        # If no match, return EMPTY with message
        if not patents:
            return {
                "success": True,
                "query": query,
                "total_patents": 0,
                "patents": [],
                "summary": {
                    "expiring_within_3_years": 0,
                    "fto_concerns": 0,
                    "patent_types": []
                },
                "message": "No patent data available for this query in mock database. In production, this would query USPTO PatentsView API.",
                "provenance": self.get_provenance()
            }
        
        # Calculate summary stats
        expiring_soon = [p for p in patents if p.get("years_to_expiry", 99) <= 3]
        fto_warnings = [p for p in patents if p.get("fto_status") in ["WARNING", "BLOCKED"]]
        
        return {
            "success": True,
            "query": query,
            "total_patents": len(patents),
            "patents": patents,
            "summary": {
                "expiring_within_3_years": len(expiring_soon),
                "fto_concerns": len(fto_warnings),
                "patent_types": list(set(p.get("patent_type") for p in patents))
            },
            "provenance": self.get_provenance()
        }

