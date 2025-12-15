import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from '@langchain/langgraph-sdk';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ProcessedEvent } from '@/components/ActivityTimeline';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { ChatMessagesView } from '@/components/ChatMessagesView';
import { AgentId, DEFAULT_AGENT } from '@/types/agents';
import { getAgentById, isValidAgentId } from '@/lib/agents';
import { Home } from 'lucide-react';

export const ChatApp: React.FC = () => {
    const [processedEventsTimeline, setProcessedEventsTimeline] = useState<
        ProcessedEvent[]
    >([]);
    const [historicalActivities, setHistoricalActivities] = useState<
        Record<string, ProcessedEvent[]>
    >({});
    const [selectedAgentId, setSelectedAgentId] = useState(DEFAULT_AGENT);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const hasFinalizeEventOccurredRef = useRef(false);

    const validateAgentId = useCallback((agentId: string): string => {
        if (isValidAgentId(agentId)) {
            return agentId;
        }
        console.warn(`Invalid agent ID: ${agentId}, falling back to default`);
        return DEFAULT_AGENT;
    }, []);

    const handleAgentSwitch = useCallback(
        (newAgentId: string) => {
            const validAgentId = validateAgentId(newAgentId);
            if (validAgentId !== selectedAgentId) {
                setSelectedAgentId(validAgentId as AgentId);
                setProcessedEventsTimeline([]);
                setHistoricalActivities({});
                hasFinalizeEventOccurredRef.current = false;
                // For now, just reload the page when switching agents
                // This ensures clean state reset without complex thread management
                window.location.reload();
            }
        },
        [selectedAgentId, validateAgentId]
    );

    const handleAgentChange = useCallback(
        (agentId: string) => {
            const validAgentId = validateAgentId(agentId);
            setSelectedAgentId(validAgentId as AgentId);
        },
        [validateAgentId]
    );

    const thread = useStream<{
        messages: Message[];
        initial_search_query_count: number;
        max_research_loops: number;
        reasoning_model: string;
    }>({
        apiUrl: import.meta.env.DEV
            ? 'http://localhost:2024'
            : 'http://localhost:8123',
        assistantId: selectedAgentId,
        messagesKey: 'messages',
        onFinish: (event: unknown) => {
            console.log(event);
        },
        onUpdateEvent: (event: Record<string, unknown>) => {
            // Only process events for agents that have showActivityTimeline enabled
            const currentAgent = getAgentById(selectedAgentId);

            if (!currentAgent?.showActivityTimeline) {
                return;
            }

            let processedEvent: ProcessedEvent | null = null;

            if (selectedAgentId === AgentId.DEEP_RESEARCHER) {
                // Deep researcher agent events
                if (
                    'generate_query' in event &&
                    event.generate_query &&
                    typeof event.generate_query === 'object'
                ) {
                    const generateQuery = event.generate_query as {
                        query_list?: Array<{ query: string } | string>;
                    };
                    const queryList = generateQuery.query_list || [];
                    const queryStrings = queryList.map((q) =>
                        typeof q === 'string' ? q : q.query
                    );
                    processedEvent = {
                        title: 'Generating Search Queries',
                        data: queryStrings.length > 0 ? queryStrings.join(', ') : 'Generating queries...',
                    };
                } else if (
                    'web_research' in event &&
                    event.web_research &&
                    typeof event.web_research === 'object'
                ) {
                    const webResearch = event.web_research as {
                        sources_gathered?: { label?: string }[];
                    };
                    const sources = webResearch.sources_gathered || [];
                    const numSources = sources.length;
                    const uniqueLabels = [
                        ...new Set(sources.map((s) => s.label).filter(Boolean)),
                    ];
                    const exampleLabels = uniqueLabels.slice(0, 3).join(', ');
                    processedEvent = {
                        title: 'Web Research',
                        data: `Gathered ${numSources} sources. Related to: ${exampleLabels || 'N/A'
                            }.`,
                    };
                } else if (
                    'reflection' in event &&
                    event.reflection &&
                    typeof event.reflection === 'object'
                ) {
                    const reflection = event.reflection as {
                        is_sufficient?: boolean;
                        follow_up_queries?: string[];
                    };
                    const followUpQueries = reflection.follow_up_queries || [];
                    processedEvent = {
                        title: 'Reflection',
                        data: reflection.is_sufficient
                            ? 'Search successful, generating final answer.'
                            : followUpQueries.length > 0
                                ? `Need more information, searching for ${followUpQueries.join(', ')}`
                                : 'Analyzing gathered information...',
                    };
                } else if ('finalize_answer' in event) {
                    processedEvent = {
                        title: 'Finalizing Answer',
                        data: 'Composing and presenting the final answer.',
                    };
                    hasFinalizeEventOccurredRef.current = true;
                }
            }

            // Handle tool call chunks for all agents
            if (
                'tool_call_chunks' in event &&
                Array.isArray(event.tool_call_chunks)
            ) {
                // Process tool call chunks for real-time tool execution display
                const toolChunks = event.tool_call_chunks as Array<{ name?: string }>;
                setProcessedEventsTimeline((prevEvents) => [
                    ...prevEvents,
                    {
                        title: 'Tool Execution',
                        data: `Executing ${toolChunks
                            .map((chunk) => chunk.name || 'tool')
                            .join(', ')}`,
                    },
                ]);
            }

            if (processedEvent) {
                setProcessedEventsTimeline((prevEvents) => [
                    ...prevEvents,
                    processedEvent!,
                ]);
            }
        },
    });

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollViewport = scrollAreaRef.current.querySelector(
                '[data-radix-scroll-area-viewport]'
            );
            if (scrollViewport) {
                scrollViewport.scrollTop = scrollViewport.scrollHeight;
            }
        }
    }, [thread.messages]);

    useEffect(() => {
        if (
            hasFinalizeEventOccurredRef.current &&
            !thread.isLoading &&
            thread.messages.length > 0
        ) {
            const lastMessage = thread.messages[thread.messages.length - 1];
            if (lastMessage && lastMessage.type === 'ai' && lastMessage.id) {
                setHistoricalActivities((prev) => ({
                    ...prev,
                    [lastMessage.id!]: [...processedEventsTimeline],
                }));
            }
            hasFinalizeEventOccurredRef.current = false;
        }
    }, [thread.messages, thread.isLoading, processedEventsTimeline]);

    const handleSubmit = useCallback(
        (
            submittedInputValue: string,
            effort: string,
            model: string,
            agentId: string
        ) => {
            const validAgentId = validateAgentId(agentId);
            if (!submittedInputValue.trim()) return;

            handleAgentSwitch(validAgentId);
            setProcessedEventsTimeline([]);
            hasFinalizeEventOccurredRef.current = false;

            const newMessages: Message[] = [
                ...(thread.messages || []),
                {
                    type: 'human',
                    content: submittedInputValue,
                    id: Date.now().toString(),
                },
            ];

            // Only pass research-specific parameters for deep researcher
            if (validAgentId === AgentId.DEEP_RESEARCHER) {
                // convert effort to, initial_search_query_count and max_research_loops
                // low means max 1 loop and 1 query
                // medium means max 3 loops and 3 queries
                // high means max 10 loops and 5 queries
                let initial_search_query_count = 0;
                let max_research_loops = 0;
                switch (effort) {
                    case 'low':
                        initial_search_query_count = 1;
                        max_research_loops = 1;
                        break;
                    case 'medium':
                        initial_search_query_count = 3;
                        max_research_loops = 3;
                        break;
                    case 'high':
                        initial_search_query_count = 5;
                        max_research_loops = 10;
                        break;
                }

                thread.submit({
                    messages: newMessages,
                    initial_search_query_count: initial_search_query_count,
                    max_research_loops: max_research_loops,
                    reasoning_model: model,
                });
            } else {
                // For chatbot, only send messages
                thread.submit({
                    messages: newMessages,
                });
            }
        },
        [validateAgentId, handleAgentSwitch, thread]
    );

    const handleCancel = useCallback(() => {
        thread.stop();
        window.location.reload();
    }, [thread]);

    return (
        <div className="flex flex-col h-screen bg-amber-50 text-gray-900 font-sans antialiased" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
        }}>
            {/* Mini Navigation Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b-2 border-black bg-white">
                <Link
                    to="/"
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-500 transition-colors font-medium"
                >
                    <Home className="w-5 h-5" />
                    <span className="text-sm font-bold">Home</span>
                </Link>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-400 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <span className="text-base font-black text-gray-900">Pramana.ai</span>
                </div>
                <div className="w-20" /> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full min-h-0">
                <div
                    className={`flex-1 min-h-0 ${thread.messages.length === 0 ? 'flex' : ''
                        }`}
                >
                    {thread.messages.length === 0 ? (
                        <WelcomeScreen
                            handleSubmit={handleSubmit}
                            isLoading={thread.isLoading}
                            onCancel={handleCancel}
                            selectedAgent={selectedAgentId}
                            onAgentChange={handleAgentChange}
                        />
                    ) : (
                        <ChatMessagesView
                            messages={thread.messages}
                            isLoading={thread.isLoading}
                            scrollAreaRef={scrollAreaRef}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            liveActivityEvents={processedEventsTimeline}
                            historicalActivities={historicalActivities}
                            selectedAgentId={selectedAgentId}
                            onAgentChange={handleAgentChange}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default ChatApp;
