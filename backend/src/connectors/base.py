"""Base connector interface for mock data services."""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Optional
import json
import os


class BaseConnector(ABC):
    """Abstract base class for all mock data connectors.
    
    Enables swapping mock connectors with real APIs without changing agent logic.
    """
    
    def __init__(self, fixture_path: Optional[str] = None):
        """Initialize connector with optional fixture path.
        
        Args:
            fixture_path: Path to JSON fixture file for mock data
        """
        self.fixture_path = fixture_path
        self.last_query_time: Optional[datetime] = None
        self._cache: dict[str, Any] = {}
    
    @abstractmethod
    async def query(self, query: str, **kwargs) -> dict[str, Any]:
        """Execute query and return structured results.
        
        Args:
            query: Search query string
            **kwargs: Additional parameters (molecule, region, etc.)
            
        Returns:
            Dictionary with query results and metadata
        """
        pass
    
    def get_provenance(self) -> dict[str, Any]:
        """Return data source metadata for citations.
        
        Returns:
            Dictionary with source info, timestamp, and mock indicator
        """
        return {
            "source": self.__class__.__name__,
            "timestamp": self.last_query_time.isoformat() if self.last_query_time else None,
            "is_mock": True,
            "note": "Mock data - replace with real API in production"
        }
    
    def _load_fixture(self, fixture_name: str) -> dict[str, Any]:
        """Load JSON fixture file.
        
        Args:
            fixture_name: Name of fixture file (without .json extension)
            
        Returns:
            Parsed JSON data
        """
        fixtures_dir = os.path.join(os.path.dirname(__file__), "fixtures")
        filepath = os.path.join(fixtures_dir, f"{fixture_name}.json")
        
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}
    
    def _match_query(self, query: str, data: dict[str, Any]) -> dict[str, Any]:
        """Simple keyword matching for mock data lookup.
        
        Args:
            query: Search query
            data: Fixture data to search
            
        Returns:
            Matched data or empty dict
        """
        query_lower = query.lower()
        
        # Try exact match on keys
        for key in data.keys():
            if key.lower() in query_lower or query_lower in key.lower():
                return data[key]
        
        # Try keyword match
        keywords = query_lower.split()
        best_match = None
        best_score = 0
        
        for key, value in data.items():
            score = sum(1 for kw in keywords if kw in key.lower())
            if score > best_score:
                best_score = score
                best_match = value
        
        return best_match or {}
