"""Mock data connectors for Portfolio Intelligence Copilot.

All connectors simulate external APIs and can be replaced with real implementations.
"""

from connectors.base import BaseConnector
from connectors.iqvia import IQVIAConnector
from connectors.trials import ClinicalTrialsConnector
from connectors.patents import PatentsConnector
from connectors.exim import EXIMConnector
from connectors.internal import InternalDocsConnector
from connectors.web import WebSearchConnector

__all__ = [
    "BaseConnector",
    "IQVIAConnector",
    "ClinicalTrialsConnector",
    "PatentsConnector",
    "EXIMConnector",
    "InternalDocsConnector",
    "WebSearchConnector",
]
