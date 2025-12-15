import asyncio
import logging
from typing import Any, Dict, List

from langchain_core.tools import BaseTool
from langchain_mcp_adapters.client import MultiServerMCPClient

from config.mcp_config import MCPConfiguration

logger = logging.getLogger(__name__)


async def load_single_server_tools(
    name: str, config: Dict[str, Any], timeout: int = 15, max_retries: int = 2
) -> List[BaseTool]:
    """Load tools from a single MCP server with timeout and retry logic.

    Args:
        name: Name of the MCP server
        config: Server configuration dictionary
        timeout: Timeout in seconds for server connection
        max_retries: Maximum number of retry attempts

    Returns:
        List of tools from the server, empty list if failed
    """
    for attempt in range(max_retries + 1):
        try:
            logger.debug(
                f"Loading tools from {name} server (attempt {attempt + 1}/{max_retries + 1})"
            )

            async with asyncio.timeout(timeout):
                # Create client with single server config
                client = MultiServerMCPClient({name: config})
                tools = await client.get_tools()

                logger.info(
                    f"✅ Successfully loaded {len(tools)} tools from {name} server"
                )
                return tools

        except TimeoutError:
            logger.warning(
                f"⏱️  Timeout loading {name} server after {timeout}s (attempt {attempt + 1})"
            )
            if attempt < max_retries:
                # Exponential backoff: 1s, 2s, 4s
                await asyncio.sleep(2**attempt)

        except Exception as e:
            logger.warning(
                f"❌ Failed to load {name} server (attempt {attempt + 1}): {e}"
            )
            if attempt < max_retries:
                await asyncio.sleep(2**attempt)

    logger.error(f"❌ Failed to load {name} server after {max_retries + 1} attempts")
    return []


async def load_mcp_tools_parallel(
    timeout: int = 15, max_retries: int = 2
) -> List[BaseTool]:
    """Load tools from multiple MCP servers in parallel.

    Args:
        timeout: Timeout in seconds for each server connection
        max_retries: Maximum number of retry attempts per server

    Returns:
        List of LangChain tools from all available MCP servers
    """
    enabled_configs = MCPConfiguration.get_enabled_servers()

    if not enabled_configs:
        logger.info("No MCP servers enabled, returning empty tool list")
        return []

    logger.info(
        f"Loading tools from {len(enabled_configs)} MCP servers in parallel: {list(enabled_configs.keys())}"
    )

    # Create tasks for parallel loading
    tasks = []
    for name, config in enabled_configs.items():
        task = asyncio.create_task(
            load_single_server_tools(name, config, timeout, max_retries),
            name=f"mcp_loader_{name}",
        )
        tasks.append((name, task))

    # Wait for all tasks to complete
    all_tools = []
    completed_servers = []
    failed_servers = []

    for name, task in tasks:
        try:
            tools = await task
            if tools:
                all_tools.extend(tools)
                completed_servers.append(name)
            else:
                failed_servers.append(name)
        except Exception as e:
            logger.error(f"Unexpected error loading {name} server: {e}")
            failed_servers.append(name)

    # Log summary
    total_tools = len(all_tools)
    total_servers = len(enabled_configs)
    successful_servers = len(completed_servers)

    if successful_servers > 0:
        logger.info(
            f"🎉 Successfully loaded {total_tools} tools from {successful_servers}/{total_servers} servers"
        )
        logger.info(f"✅ Working servers: {completed_servers}")

    if failed_servers:
        logger.warning(f"⚠️  Failed servers: {failed_servers}")

    return all_tools


def get_mcp_tools_sync(timeout: int = 15, max_retries: int = 2) -> List[BaseTool]:
    """Synchronous wrapper for loading MCP tools with parallel loading.

    Args:
        timeout: Timeout in seconds for each server connection
        max_retries: Maximum number of retry attempts per server

    Returns:
        List of LangChain tools from all available MCP servers
    """
    try:
        return asyncio.run(load_mcp_tools_parallel(timeout, max_retries))
    except Exception as e:
        logger.error(f"Failed to load MCP tools synchronously: {e}")
        return []
