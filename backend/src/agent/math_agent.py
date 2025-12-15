import os

from dotenv import load_dotenv
from langchain_core.runnables import RunnableConfig
from langchain_groq import ChatGroq
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode

from agent.configuration import MathAgentConfiguration
from agent.state import MathAgentState
from tools.calculator import calculator_tool

load_dotenv()

if os.getenv("GROQ_API_KEY") is None:
    raise ValueError("GROQ_API_KEY is not set")


def should_continue(state: MathAgentState):
    """Determine whether to continue to tools or end the conversation."""
    messages = state["messages"]
    last_message = messages[-1]
    # If the LLM makes a tool call, then we route to the "tools" node
    if last_message.tool_calls:
        return "tools"
    # Otherwise, we stop (respond to the user)
    return END


def call_model(state: MathAgentState, config: RunnableConfig) -> MathAgentState:
    """LangGraph node that generates responses and decides whether to use tools.

    Uses Groq to analyze math problems and determine whether to use
    the calculator tool or provide direct responses for non-computational questions.

    Args:
        state: Current graph state containing the conversation messages
        config: Configuration for the runnable, including LLM provider settings

    Returns:
        Dictionary with state update, including the AI's response message
    """
    configurable = MathAgentConfiguration.from_runnable_config(config)

    # Initialize Groq model with tools
    llm = ChatGroq(
        model=configurable.math_model,
        temperature=configurable.temperature,
        max_retries=2,
        api_key=os.getenv("GROQ_API_KEY"),
    )

    # Bind the calculator tool to the model
    model_with_tools = llm.bind_tools([calculator_tool])

    # Create a system message for the math agent
    system_message = """You are a helpful math assistant. You can solve mathematical problems and calculations.

For mathematical expressions and calculations, use the calculator_tool to ensure accuracy. The calculator can handle:
- Basic arithmetic (+, -, *, /, **)
- Mathematical functions (sqrt, sin, cos, tan, log, etc.)
- Constants like pi and e
- Complex expressions with parentheses

For non-computational math questions (like explaining concepts), you can respond directly without using tools.

Always explain your approach when solving problems, and show the calculation steps clearly."""

    # Prepare messages with system message
    messages = [{"role": "system", "content": system_message}] + state["messages"]

    # Generate response
    response = model_with_tools.invoke(messages)

    return {"messages": [response]}


# Create the tool node with our calculator tool
tool_node = ToolNode([calculator_tool])

# Create the Math Agent Graph
builder = StateGraph(MathAgentState, config_schema=MathAgentConfiguration)

# Define the nodes we will cycle between
builder.add_node("call_model", call_model)
builder.add_node("tools", tool_node)

# Set the entrypoint as `call_model`
builder.add_edge(START, "call_model")

# Add conditional edges from call_model
builder.add_conditional_edges(
    "call_model",
    should_continue,
    # Map the outputs of the conditional function to nodes
    {
        "tools": "tools",
        END: END,
    },
)

# Add an edge from tools back to call_model after tool execution
builder.add_edge("tools", "call_model")

# Compile the graph
math_agent_graph = builder.compile(name="math-agent")
