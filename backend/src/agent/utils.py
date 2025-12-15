from typing import List

from langchain_core.messages import AIMessage, AnyMessage, HumanMessage


def get_research_topic(messages: List[AnyMessage]) -> str:
    """Get the research topic from the messages."""
    # check if request has a history and combine the messages into a single string
    if len(messages) == 1:
        research_topic = messages[-1].content
    else:
        research_topic = ""
        for message in messages:
            if isinstance(message, HumanMessage):
                research_topic += f"User: {message.content}\n"
            elif isinstance(message, AIMessage):
                research_topic += f"Assistant: {message.content}\n"
    return research_topic


# NOTE: The following functions were removed during Gemini → Groq migration:
# - resolve_urls(): Used Vertex AI Search URL prefix (Gemini-specific)
# - insert_citation_markers(): Depended on Gemini grounding metadata
# - get_citations(): Expected Gemini-specific grounding_metadata structure
#
# Groq LLaMA models do not have built-in grounding/citation features.
# If citation functionality is needed, consider implementing a custom
# solution using retrieved sources from SerpAPI search results.
