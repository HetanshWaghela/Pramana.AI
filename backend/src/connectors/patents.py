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
        
        for key, data in self.MOCK_DATA.items():
            if key in query_lower:
                patents.extend(data)
        
        # If no match, return synthetic placeholder patent
        if not patents:
            words = [w.capitalize() for w in query.split() if len(w) > 3]
            molecule_hint = words[0] if words else "Unknown"
            
            patents = [
                {
                    "patent_id": "US00000000",
                    "patent_number": "00000000",
                    "patent_title": f"{molecule_hint} Pharmaceutical Composition",
                    "patent_date": "2020-01-01",
                    "expiry_date": "2040-01-01",
                    "status": "ACTIVE",
                    "patent_type": "FORMULATION",
                    "assignees": [{"assignee_organization": "Various"}],
                    "claims_summary": f"Generic formulation claims for {molecule_hint}",
                    "fto_status": "REVIEW_REQUIRED",
                    "years_to_expiry": 15
                }
            ]
        
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

