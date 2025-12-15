import os
from typing import Any, Dict, Optional

from pydantic import BaseModel


class MCPServerConfig(BaseModel):
    """Configuration for a single MCP server."""

    name: str
    transport: str  # "stdio" or "streamable_http"
    command: Optional[str] = None
    args: Optional[list[str]] = None
    url: Optional[str] = None
    enabled: bool = True
    env: Optional[Dict[str, str]] = None


class MCPConfiguration:
    """Central configuration for all MCP servers."""

    @classmethod
    def get_default_servers(cls) -> Dict[str, Dict[str, Any]]:
        """Get default MCP server configurations."""
        return {
            "filesystem": {
                "transport": "stdio",
                "command": "npx",
                "args": [
                    "-y",
                    "@modelcontextprotocol/server-filesystem",
                    os.getenv("MCP_FILESYSTEM_PATH", "/tmp"),
                ],
                "enabled": os.getenv("MCP_FILESYSTEM_ENABLED", "true").lower()
                == "true",
            },
            "brave_search": {
                "transport": "stdio",
                "command": "npx",
                "args": ["-y", "@modelcontextprotocol/server-brave-search"],
                "enabled": os.getenv("MCP_BRAVE_SEARCH_ENABLED", "false").lower()
                == "true",
                "env": {
                    "BRAVE_API_KEY": os.getenv("BRAVE_API_KEY"),
                },
            },
        }

    @classmethod
    def get_server_config(cls, name: str) -> Optional[MCPServerConfig]:
        """Get a specific server configuration."""
        servers = cls.get_default_servers()
        if name not in servers:
            return None

        config_dict = servers[name]
        return MCPServerConfig(name=name, **config_dict)

    @classmethod
    def get_enabled_servers(cls) -> Dict[str, Dict[str, Any]]:
        """Get only enabled server configurations."""
        servers = cls.get_default_servers()
        return {
            name: config
            for name, config in servers.items()
            if config.get("enabled", True)
        }
