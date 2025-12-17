import os
import time

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


# Minimum thinking time in seconds to ensure users see the thinking indicator
MINIMUM_THINKING_TIME = 3.0


def generate_thinking_content(user_message: str) -> str:
    """Generate contextual thinking content based on the user's message."""
    thinking_steps = []
    
    message_lower = user_message.lower() if user_message else ""
    
    # Add contextual thinking based on message content
    if any(keyword in message_lower for keyword in ['market', 'opportunity', 'growth']):
        thinking_steps.append("Analyzing market dynamics and identifying key opportunities...")
        thinking_steps.append("Cross-referencing with industry trends and competitive landscape...")
    elif any(keyword in message_lower for keyword in ['patent', 'ip', 'intellectual']):
        thinking_steps.append("Reviewing patent landscape and expiration timelines...")
        thinking_steps.append("Assessing freedom-to-operate considerations...")
    elif any(keyword in message_lower for keyword in ['clinical', 'trial', 'study']):
        thinking_steps.append("Searching clinical trial databases for relevant studies...")
        thinking_steps.append("Evaluating trial phases and endpoint data...")
    elif any(keyword in message_lower for keyword in ['drug', 'molecule', 'compound']):
        thinking_steps.append("Analyzing molecular properties and therapeutic potential...")
        thinking_steps.append("Reviewing existing literature and research data...")
    else:
        thinking_steps.append("Processing your request and gathering relevant information...")
        thinking_steps.append("Analyzing context and formulating comprehensive response...")
    
    thinking_steps.append("Synthesizing insights and preparing response...")
    
    return "\n\n".join(thinking_steps)


def chat_response(state: ChatbotState, config: RunnableConfig) -> ChatbotState:
    """LangGraph node that generates a conversational response to the user's message.

    Includes a minimum thinking delay at the start to show the thinking indicator,
    then uses Groq to generate natural, helpful responses while maintaining
    conversation context through the message history.

    Args:
        state: Current graph state containing the conversation messages
        config: Configuration for the runnable, including LLM provider settings

    Returns:
        Dictionary with state update, including the AI's response message
    """
    start_time = time.time()
    
    # Get the latest user message for thinking content generation
    user_message = ""
    if state["messages"]:
        for msg in reversed(state["messages"]):
            if isinstance(msg, HumanMessage) or (hasattr(msg, 'type') and msg.type == 'human'):
                user_message = msg.content if hasattr(msg, 'content') else str(msg)
                break
    
    # Generate thinking content (stored but primarily used by frontend during loading state)
    thinking_content = generate_thinking_content(user_message)
    
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
    
    # Ensure minimum thinking time has elapsed before returning
    elapsed = time.time() - start_time
    if elapsed < MINIMUM_THINKING_TIME:
        time.sleep(MINIMUM_THINKING_TIME - elapsed)

    return {
        "messages": [AIMessage(content=result.content)],
        "thinking_content": thinking_content,
        "thinking_title": "Analyzed your request"
    }


# Create the Chatbot Graph
builder = StateGraph(ChatbotState, config_schema=ChatbotConfiguration)

# Define single node that handles both thinking delay and response
builder.add_node("chat_response", chat_response)

# Set the entrypoint and flow: START -> chat_response -> END
builder.add_edge(START, "chat_response")
builder.add_edge("chat_response", END)

# Compile the graph
chatbot_graph = builder.compile(name="basic-chatbot")
