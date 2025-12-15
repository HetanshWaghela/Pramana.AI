import os

from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langchain_groq import ChatGroq
from langgraph.graph import END, START, StateGraph

from agent.configuration import ChatbotConfiguration
from agent.prompts import chatbot_instructions
from agent.state import ChatbotState

load_dotenv()

if os.getenv("GROQ_API_KEY") is None:
    raise ValueError("GROQ_API_KEY is not set")


def chat_response(state: ChatbotState, config: RunnableConfig) -> ChatbotState:
    """LangGraph node that generates a conversational response to the user's message.

    Uses Groq to generate natural, helpful responses while maintaining
    conversation context through the message history.

    Args:
        state: Current graph state containing the conversation messages
        config: Configuration for the runnable, including LLM provider settings

    Returns:
        Dictionary with state update, including the AI's response message
    """
    configurable = ChatbotConfiguration.from_runnable_config(config)

    # Initialize Groq model
    llm = ChatGroq(
        model=configurable.chat_model,
        temperature=configurable.temperature,
        max_retries=2,
        api_key=os.getenv("GROQ_API_KEY"),
    )

    # Get the latest user message
    if not state["messages"]:
        return {"messages": [AIMessage(content="Hello! How can I help you today?")]}

    # Prepare the conversation context
    conversation_context = "\n".join(
        [
            f"{'Human' if isinstance(msg, HumanMessage) else 'Assistant'}: {msg.content}"
            for msg in state["messages"][-10:]  # Keep last 10 messages for context
        ]
    )

    # Format the prompt with conversation context
    formatted_prompt = chatbot_instructions.format(
        conversation_context=conversation_context,
        current_message=state["messages"][-1].content if state["messages"] else "",
    )

    # Generate response
    result = llm.invoke(formatted_prompt)

    return {"messages": [AIMessage(content=result.content)]}


# Create the Chatbot Graph
builder = StateGraph(ChatbotState, config_schema=ChatbotConfiguration)

# Define the single chat node
builder.add_node("chat_response", chat_response)

# Set the entrypoint and flow
builder.add_edge(START, "chat_response")
builder.add_edge("chat_response", END)

# Compile the graph
chatbot_graph = builder.compile(name="basic-chatbot")
