import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from '@langchain/langgraph-sdk';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProcessedEvent } from '@/components/ActivityTimeline';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { ChatMessagesView } from '@/components/ChatMessagesView';
import { ChatSidebar } from '@/components/ChatSidebar';
import { AgentId, DEFAULT_AGENT } from '@/types/agents';
import { getAgentById, isValidAgentId } from '@/lib/agents';
import { v4 as uuidv4 } from 'uuid';
import { authService } from '@/lib/auth';
import { chatService, ChatListItem } from '@/lib/chatService';

interface ChatHistory {
    id: string;
    title: string;
    timestamp: Date;
    preview: string;
    messages: Message[];
}

export const ChatAppWithSidebar: React.FC = () => {
    const navigate = useNavigate();
    const [processedEventsTimeline, setProcessedEventsTimeline] = useState<
        ProcessedEvent[]
    >([]);
    const [historicalActivities, setHistoricalActivities] = useState<
        Record<string, ProcessedEvent[]>
    >({});
    const [selectedAgentId, setSelectedAgentId] = useState(DEFAULT_AGENT);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const hasFinalizeEventOccurredRef = useRef(false);

    // Sidebar state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

    // Historical messages loaded from backend (for viewing old chats)
    const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
    const [isViewingHistory, setIsViewingHistory] = useState(false);

    // User info from auth
    const [userInfo, setUserInfo] = useState({
        name: 'User',
        email: 'user@example.com'
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication and load user info
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        console.log('Auth check - Token:', token ? 'exists' : 'missing');
        console.log('Auth check - User:', userStr ? 'exists' : 'missing');

        if (!token || !userStr) {
            console.log('Not authenticated, redirecting to login');
            navigate('/login');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            setUserInfo({
                name: user.name,
                email: user.email
            });
            setIsAuthenticated(true);
            console.log('Authenticated as:', user.email);
        } catch (e) {
            console.error('Failed to parse user:', e);
            navigate('/login');
        }
    }, [navigate]);

    // Load user's chats from backend
    useEffect(() => {
        const loadChats = async () => {
            if (!isAuthenticated) {
                console.log('Not authenticated yet, skipping chat load');
                return;
            }

            const token = localStorage.getItem('access_token');
            console.log('Loading chats with token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

            try {
                const chats = await chatService.getUserChats();
                console.log('Loaded chats:', chats);
                const formattedChats: ChatHistory[] = chats.map((chat: ChatListItem) => ({
                    id: chat.id,
                    title: chat.title,
                    timestamp: new Date(chat.updated_at),
                    preview: chat.preview || '',
                    messages: []
                }));
                setChatHistory(formattedChats);
            } catch (error) {
                console.error('Failed to load chats:', error);
                if ((error as Error).message === 'Unauthorized') {
                    localStorage.clear();
                    navigate('/login');
                }
            }
        };

        loadChats();
    }, [navigate, isAuthenticated]);

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
                // Portfolio Strategist event handling
                if ('clarify_scope' in event) {
                    processedEvent = {
                        title: 'Analyzing Request',
                        data: 'Extracting molecule, therapy area, and market scope...',
                    };
                } else if ('iqvia_worker' in event) {
                    processedEvent = {
                        title: 'Market Intelligence',
                        data: 'Querying IQVIA for market data and competitive landscape...',
                    };
                } else if ('trials_worker' in event) {
                    processedEvent = {
                        title: 'Clinical Trials',
                        data: 'Searching ClinicalTrials.gov for relevant studies...',
                    };
                } else if ('patents_worker' in event) {
                    processedEvent = {
                        title: 'Patent Landscape',
                        data: 'Analyzing USPTO and Orange Book patent data...',
                    };
                } else if ('exim_worker' in event) {
                    processedEvent = {
                        title: 'Trade Analysis',
                        data: 'Evaluating import/export and supply chain data...',
                    };
                } else if ('internal_worker' in event) {
                    processedEvent = {
                        title: 'Internal Documents',
                        data: 'Searching internal knowledge base...',
                    };
                } else if ('web_worker' in event) {
                    processedEvent = {
                        title: 'Web Research',
                        data: 'Gathering competitive and regulatory intelligence...',
                    };
                } else if ('synthesize_evidence' in event) {
                    processedEvent = {
                        title: 'Synthesizing Evidence',
                        data: 'Applying decision heuristics and calculating opportunity scores...',
                    };
                } else if ('generate_story' in event) {
                    processedEvent = {
                        title: 'Generating Innovation Story',
                        data: 'Creating executive-ready narrative...',
                    };
                } else if ('finalize_response' in event) {
                    processedEvent = {
                        title: 'Finalizing Report',
                        data: 'Composing comprehensive portfolio analysis...',
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
    }, [thread.messages, loadedMessages]);

    // Track previous loading state to detect transitions
    const prevIsLoadingRef = useRef(thread.isLoading);

    useEffect(() => {
        // Detect loading just finished (true -> false transition)
        const loadingJustFinished = prevIsLoadingRef.current && !thread.isLoading;
        prevIsLoadingRef.current = thread.isLoading;

        // Save activity timeline when loading finishes and we have events
        if (
            loadingJustFinished &&
            thread.messages.length > 0 &&
            processedEventsTimeline.length > 0
        ) {
            const lastMessage = thread.messages[thread.messages.length - 1];
            if (lastMessage && lastMessage.type === 'ai' && lastMessage.id) {
                console.log('Saving activity timeline for message:', lastMessage.id, 'Events:', processedEventsTimeline.length);
                setHistoricalActivities((prev) => ({
                    ...prev,
                    [lastMessage.id!]: [...processedEventsTimeline],
                }));
            }
            hasFinalizeEventOccurredRef.current = false;
        }
    }, [thread.messages, thread.isLoading, processedEventsTimeline]);

    // Update chat history when messages change and save to backend
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

            // Save messages to backend
            const saveMessages = async () => {
                try {
                    const messagesToSave = thread.messages.map(m => ({
                        message_type: m.type as 'human' | 'ai',
                        content: String(m.content),
                        message_id: m.id
                    }));
                    await chatService.addMessages(currentChatId, messagesToSave);
                } catch (error) {
                    console.error('Failed to save messages:', error);
                }
            };

            // Debounce saving to avoid too many API calls
            const timeoutId = setTimeout(saveMessages, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [thread.messages, currentChatId]);

    const handleSubmit = useCallback(
        async (
            submittedInputValue: string,
            effort: string,
            model: string,
            agentId: string
        ) => {
            const validAgentId = validateAgentId(agentId);
            if (!submittedInputValue.trim()) return;

            // Create new chat if none selected
            let chatId = currentChatId;
            if (!chatId) {
                const newChatId = uuidv4();
                chatId = newChatId;
                setCurrentChatId(newChatId);

                // Create chat in backend
                try {
                    await chatService.createChat(newChatId, submittedInputValue.slice(0, 50));
                } catch (error) {
                    console.error('Failed to create chat:', error);
                }

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

            // Include loaded messages if viewing history (continuing a previous chat)
            const existingMessages = isViewingHistory && loadedMessages.length > 0
                ? loadedMessages
                : (thread.messages || []);

            const newMessages: Message[] = [
                ...existingMessages,
                {
                    type: 'human',
                    content: submittedInputValue,
                    id: Date.now().toString(),
                },
            ];

            // Clear viewing history flag since we're now actively chatting
            setIsViewingHistory(false);

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
        [validateAgentId, handleAgentSwitch, thread, currentChatId, isViewingHistory, loadedMessages]
    );

    const handleCancel = useCallback(() => {
        thread.stop();
        window.location.reload();
    }, [thread]);

    const handleNewChat = useCallback(() => {
        setCurrentChatId(undefined);
        setProcessedEventsTimeline([]);
        setHistoricalActivities({});
        setLoadedMessages([]);
        setIsViewingHistory(false);
        hasFinalizeEventOccurredRef.current = false;
        window.location.reload();
    }, []);

    const handleSelectChat = useCallback(async (chatId: string) => {
        try {
            // Load chat with messages from backend
            const chat = await chatService.getChat(chatId);

            setCurrentChatId(chatId);
            setProcessedEventsTimeline([]);
            setHistoricalActivities({});
            hasFinalizeEventOccurredRef.current = false;

            // Load messages from chat history
            if (chat.messages && chat.messages.length > 0) {
                const formattedMessages: Message[] = chat.messages.map(m => ({
                    type: m.message_type as 'human' | 'ai',
                    content: m.content,
                    id: m.message_id || String(m.id)
                }));

                // Set loaded messages to display them
                setLoadedMessages(formattedMessages);
                setIsViewingHistory(true);

                // Update chat history state
                setChatHistory(prev => prev.map(c =>
                    c.id === chatId
                        ? { ...c, messages: formattedMessages }
                        : c
                ));
            } else {
                // No messages in this chat
                setLoadedMessages([]);
                setIsViewingHistory(false);
            }
        } catch (error) {
            console.error('Failed to load chat:', error);
        }
    }, []);

    const handleDeleteChat = useCallback(async (chatId: string) => {
        try {
            await chatService.deleteChat(chatId);
            setChatHistory(prev => prev.filter(c => c.id !== chatId));
            if (currentChatId === chatId) {
                setCurrentChatId(undefined);
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to delete chat:', error);
        }
    }, [currentChatId]);

    const handleLogout = useCallback(() => {
        authService.logout();
        navigate('/login');
    }, [navigate]);

    const handleExportPdf = useCallback(async () => {
        if (!currentChatId) {
            console.error('No chat selected for export');
            return;
        }

        try {
            const blob = await chatService.exportChatToPdf(currentChatId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Get chat title for filename
            const chat = chatHistory.find(c => c.id === currentChatId);
            const title = chat?.title || 'Chat';
            const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${safeTitle}_${currentChatId.slice(0, 8)}.pdf`;

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export chat to PDF:', error);
        }
    }, [currentChatId, chatHistory]);

    // Combine loaded historical messages with new thread messages
    const displayMessages = useMemo(() => {
        if (isViewingHistory && loadedMessages.length > 0) {
            // When viewing history, show loaded messages + any new messages from thread
            if (thread.messages.length > 0) {
                // If thread has messages, it means user continued the conversation
                return thread.messages;
            }
            return loadedMessages;
        }
        return thread.messages;
    }, [isViewingHistory, loadedMessages, thread.messages]);

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
                onLogout={handleLogout}
                currentChatId={currentChatId}
                chatHistory={chatHistory}
                userName={userInfo.name}
                userEmail={userInfo.email}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Main Content */}
                <main className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                        <div
                            className={`flex-1 flex flex-col min-h-0 h-full overflow-hidden ${displayMessages.length === 0 ? 'items-center justify-center' : ''
                                }`}
                        >
                            {displayMessages.length === 0 ? (
                                <WelcomeScreen
                                    handleSubmit={handleSubmit}
                                    isLoading={thread.isLoading}
                                    onCancel={handleCancel}
                                    selectedAgent={selectedAgentId}
                                    onAgentChange={handleAgentChange}
                                />
                            ) : (
                                <ChatMessagesView
                                    messages={displayMessages}
                                    isLoading={thread.isLoading}
                                    scrollAreaRef={scrollAreaRef}
                                    onSubmit={handleSubmit}
                                    onCancel={handleCancel}
                                    liveActivityEvents={processedEventsTimeline}
                                    historicalActivities={historicalActivities}
                                    selectedAgentId={selectedAgentId}
                                    onAgentChange={handleAgentChange}
                                    currentChatId={currentChatId}
                                    onExportPdf={handleExportPdf}
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
