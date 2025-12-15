import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from '@langchain/langgraph-sdk';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ProcessedEvent } from '@/components/ActivityTimeline';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { ChatMessagesView } from '@/components/ChatMessagesView';
import { ChatSidebar } from '@/components/ChatSidebar';
import { AgentId, DEFAULT_AGENT } from '@/types/agents';
import { getAgentById, isValidAgentId } from '@/lib/agents';
import { v4 as uuidv4 } from 'uuid';
import { Home } from 'lucide-react';

interface ChatHistory {
    id: string;
    title: string;
    timestamp: Date;
    preview: string;
    messages: Message[];
}

export const ChatAppWithSidebar: React.FC = () => {
    const [processedEventsTimeline, setProcessedEventsTimeline] = useState<
        ProcessedEvent[]
    >([]);
    const [historicalActivities, setHistoricalActivities] = useState<
        Record<string, ProcessedEvent[]>
    >({});
    const [selectedAgentId, setSelectedAgentId] = useState(() => {
        const saved = localStorage.getItem('selectedAgentId');
        if (saved && isValidAgentId(saved)) {
            return saved as AgentId;
        }
        return DEFAULT_AGENT;
    });
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const hasFinalizeEventOccurredRef = useRef(false);

    // Sidebar state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([
        // Demo chat history - in production this would come from backend/localStorage
        {
            id: '1',
            title: 'Research the latest clinical t...',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            preview: 'Research the latest clinical trials for...',
            messages: [
                { type: 'human', content: 'Research the latest clinical trials for Alzheimer\'s disease', id: 'demo-1-human' },
                { type: 'ai', content: 'Alzheimer\'s disease is such a devastating condition, and it\'s great that you\'re interested in the latest developments. I\'ve got some info on recent clinical trials that might be helpful.\n\nCurrently, there are over 100 ongoing clinical trials for Alzheimer\'s disease, focusing on various aspects like disease modification, symptom management, and prevention.', id: 'demo-1-ai' }
            ] as Message[]
        },
        {
            id: '2',
            title: 'Cancer Biomarkers Research',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            preview: 'What are the latest cancer biomarkers...',
            messages: [
                { type: 'human', content: 'What are the latest cancer biomarkers being researched?', id: 'demo-2-human' },
                { type: 'ai', content: 'Cancer biomarkers are crucial for early detection and personalized treatment. Here are some of the latest developments:\n\n**Liquid Biopsy Biomarkers:**\n- Circulating tumor DNA (ctDNA)\n- Circulating tumor cells (CTCs)\n- Exosomes and microRNAs', id: 'demo-2-ai' }
            ] as Message[]
        },
        {
            id: '3',
            title: 'Gene Therapy Analysis',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            preview: 'Explain CRISPR-Cas9 applications...',
            messages: []
        },
    ]);

    // User info - in production this would come from auth context
    const [userInfo] = useState({
        name: 'Researcher',
        email: 'researcher@pramana.ai'
    });

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
                localStorage.setItem('selectedAgentId', validAgentId);
                setSelectedAgentId(validAgentId as AgentId);
                setProcessedEventsTimeline([]);
                setHistoricalActivities({});
                hasFinalizeEventOccurredRef.current = false;
                window.location.reload();
            }
        },
        [selectedAgentId, validateAgentId]
    );

    const handleAgentChange = useCallback(
        (agentId: string) => {
            const validAgentId = validateAgentId(agentId);
            localStorage.setItem('selectedAgentId', validAgentId);
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
            const currentAgent = getAgentById(selectedAgentId);

            if (!currentAgent?.showActivityTimeline) {
                return;
            }

            let processedEvent: ProcessedEvent | null = null;

            if (selectedAgentId === AgentId.DEEP_RESEARCHER) {
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
            } else if (selectedAgentId === AgentId.PORTFOLIO_STRATEGIST) {
                // Portfolio Strategist agent events - CRITICAL: Ported from ChatApp.tsx
                if ('clarify_scope' in event) {
                    const scope = event.clarify_scope as { molecule?: string; therapy_area?: string; region?: string };
                    processedEvent = {
                        title: 'Scope Clarification',
                        data: `Analyzing: ${scope.molecule || 'Unknown'} / ${scope.therapy_area || 'General'} / ${scope.region || 'Global'}`,
                    };
                } else if ('iqvia_worker' in event) {
                    processedEvent = {
                        title: 'IQVIA Market Analysis',
                        data: 'Gathering market intelligence data...',
                    };
                } else if ('trials_worker' in event) {
                    processedEvent = {
                        title: 'Clinical Trials Search',
                        data: 'Searching clinical trials database...',
                    };
                } else if ('patents_worker' in event) {
                    processedEvent = {
                        title: 'Patent Landscape',
                        data: 'Analyzing patent landscape...',
                    };
                } else if ('exim_worker' in event) {
                    processedEvent = {
                        title: 'EXIM Analysis',
                        data: 'Analyzing import/export data...',
                    };
                } else if ('internal_worker' in event) {
                    processedEvent = {
                        title: 'Internal Knowledge',
                        data: 'Searching internal documents...',
                    };
                } else if ('web_worker' in event) {
                    processedEvent = {
                        title: 'Web Intelligence',
                        data: 'Gathering web references...',
                    };
                } else if ('synthesize_evidence' in event) {
                    const synthesis = event.synthesize_evidence as { opportunity_score?: number };
                    processedEvent = {
                        title: 'Evidence Synthesis',
                        data: synthesis.opportunity_score
                            ? `Opportunity score: ${synthesis.opportunity_score}/100`
                            : 'Applying decision heuristics...',
                    };
                } else if ('generate_story' in event) {
                    processedEvent = {
                        title: 'Innovation Story',
                        data: 'Generating differentiated product concept...',
                    };
                } else if ('finalize_response' in event) {
                    processedEvent = {
                        title: 'Report Generation',
                        data: 'Creating portfolio intelligence report...',
                    };
                    hasFinalizeEventOccurredRef.current = true;
                }
            }

            if (
                'tool_call_chunks' in event &&
                Array.isArray(event.tool_call_chunks)
            ) {
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

    // Update chat history when messages change
    useEffect(() => {
        if (thread.messages.length > 0 && currentChatId) {
            const firstHumanMessage = thread.messages.find(m => m.type === 'human');
            const title = firstHumanMessage
                ? String(firstHumanMessage.content).slice(0, 30) + (String(firstHumanMessage.content).length > 30 ? '...' : '')
                : 'New Chat';

            setChatHistory(prev => {
                const existingIndex = prev.findIndex(c => c.id === currentChatId);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        title,
                        preview: String(firstHumanMessage?.content || '').slice(0, 50),
                        messages: thread.messages,
                        timestamp: new Date()
                    };
                    return updated;
                }
                return prev;
            });
        }
    }, [thread.messages, currentChatId]);

    const handleSubmit = useCallback(
        (
            submittedInputValue: string,
            effort: string,
            model: string,
            agentId: string
        ) => {
            const validAgentId = validateAgentId(agentId);
            if (!submittedInputValue.trim()) return;

            // Create new chat if none selected
            if (!currentChatId) {
                const newChatId = uuidv4();
                setCurrentChatId(newChatId);
                setChatHistory(prev => [{
                    id: newChatId,
                    title: submittedInputValue.slice(0, 30) + (submittedInputValue.length > 30 ? '...' : ''),
                    timestamp: new Date(),
                    preview: submittedInputValue.slice(0, 50),
                    messages: []
                }, ...prev]);
            }

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

            if (validAgentId === AgentId.DEEP_RESEARCHER) {
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
                thread.submit({
                    messages: newMessages,
                });
            }
        },
        [validateAgentId, handleAgentSwitch, thread, currentChatId]
    );

    const handleCancel = useCallback(() => {
        thread.stop();
        window.location.reload();
    }, [thread]);

    const handleNewChat = useCallback(() => {
        setCurrentChatId(undefined);
        setProcessedEventsTimeline([]);
        setHistoricalActivities({});
        hasFinalizeEventOccurredRef.current = false;
        window.location.reload();
    }, []);

    const handleSelectChat = useCallback((chatId: string) => {
        const chat = chatHistory.find(c => c.id === chatId);
        if (chat) {
            setCurrentChatId(chatId);
            setProcessedEventsTimeline([]);
            setHistoricalActivities({});
            hasFinalizeEventOccurredRef.current = false;

            // Load the chat messages if they exist
            if (chat.messages && chat.messages.length > 0) {
                localStorage.setItem('selectedChatId', chatId);
                localStorage.setItem('selectedChatMessages', JSON.stringify(chat.messages));
                window.location.reload();
            }
        }
    }, [chatHistory]);

    const handleDeleteChat = useCallback((chatId: string) => {
        setChatHistory(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
            setCurrentChatId(undefined);
        }
    }, [currentChatId]);

    return (
        <div className="flex h-screen bg-amber-50 font-sans antialiased overflow-hidden" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
        }}>
            {/* Sidebar */}
            <ChatSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
                currentChatId={currentChatId}
                chatHistory={chatHistory}
                userName={userInfo.name}
                userEmail={userInfo.email}
            />

            {/* Main Content Area - using grid for guaranteed height */}
            <div className="flex-1 min-w-0 h-full grid grid-rows-[auto_1fr]">
                {/* Navigation Header */}
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

                {/* Main Content - row takes remaining height */}
                <main className="min-h-0 overflow-hidden">
                    <div className="h-full max-w-4xl mx-auto w-full px-4">
                        <div className={`h-full ${thread.messages.length === 0 ? 'flex items-center justify-center' : ''}`}>
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
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ChatAppWithSidebar;
