"""Portfolio Strategist configuration."""

from pydantic import BaseModel, Field
from langchain_core.runnables import RunnableConfig


class PortfolioConfiguration(BaseModel):
    """Configuration for Portfolio Strategist agent."""
    
    orchestrator_model: str = Field(
        default="llama-3.1-8b-instant",
        description="Model for orchestrator reasoning and story generation"
    )
    worker_model: str = Field(
        default="llama-3.1-8b-instant",
        description="Model for worker agent queries"
    )
    max_workers: int = Field(
        default=6,
        description="Maximum number of parallel workers"
    )
    worker_timeout_seconds: int = Field(
        default=30,
        description="Timeout for individual worker queries"
    )
    
    @classmethod
    def from_runnable_config(cls, config: RunnableConfig) -> "PortfolioConfiguration":
        """Extract configuration from RunnableConfig.
        
        Args:
            config: LangGraph runtime configuration
            
        Returns:
            PortfolioConfiguration instance
        """
        configurable = config.get("configurable", {})
        return cls(**{
            k: v for k, v in configurable.items() 
            if k in cls.model_fields
        })
