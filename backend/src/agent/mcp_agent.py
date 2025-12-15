import os

from dotenv import load_dotenv
from langchain_core.runnables import RunnableConfig
from langchain_groq import ChatGroq
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode

from agent.configuration import MathAgentConfiguration
from agent.state import MathAgentState
from tools.calculator import calculator_tool
from tools.mcp_loader import get_mcp_tools_sync

load_dotenv()

if os.getenv("GROQ_API_KEY") is None:
    raise ValueError("GROQ_API_KEY is not set")

# Load all tools at module level (graph build time)
local_tools = [calculator_tool]
mcp_tools = get_mcp_tools_sync()

print("mcp_tools", mcp_tools)

all_tools = local_tools + mcp_tools


def should_continue(state: MathAgentState):
    """Determine whether to continue to tools or end."""
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END


def call_model(state: MathAgentState, config: RunnableConfig) -> MathAgentState:
    """Generate responses and decide whether to use tools."""
    configurable = MathAgentConfiguration.from_runnable_config(config)

    llm = ChatGroq(
        model=configurable.math_model,
        temperature=configurable.temperature,
        max_retries=2,
        api_key=os.getenv("GROQ_API_KEY"),
    )

    model_with_tools = llm.bind_tools(all_tools)

    system_message = """You are a helpful assistant with access to various tools     
    Use the appropriate tools to help users with their requests."""

    messages = [{"role": "system", "content": system_message}] + state["messages"]
    response = model_with_tools.invoke(messages)

    return {"messages": [response]}


# Create tool node with all available tools
tool_node = ToolNode(all_tools)

# Build the graph
builder = StateGraph(MathAgentState, config_schema=MathAgentConfiguration)
builder.add_node("call_model", call_model)
builder.add_node("tools", tool_node)
builder.add_edge(START, "call_model")
builder.add_conditional_edges(
    "call_model", should_continue, {"tools": "tools", END: END}
)
builder.add_edge("tools", "call_model")

mcp_agent_graph = builder.compile(name="mcp-agent")
