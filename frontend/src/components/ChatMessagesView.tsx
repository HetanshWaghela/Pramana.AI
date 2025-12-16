import type React from 'react';
import type { Message } from '@langchain/langgraph-sdk';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, CopyCheck, Sparkles, Download, BarChart3 } from 'lucide-react';
import { InputForm } from '@/components/InputForm';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  ActivityTimeline,
  ProcessedEvent,
} from '@/components/ActivityTimeline'; // Assuming ActivityTimeline is in the same dir or adjust path
import { AVAILABLE_AGENTS } from '@/types/agents';
import { ToolMessageDisplay } from '@/components/ToolMessageDisplay';
import {
  extractToolCallsFromMessage,
  findToolMessageForCall,
} from '@/types/messages';
import { ToolCall } from '@/types/tools';
import { AgentId } from '@/types/agents';
import chatService from '@/lib/chatService';
import { 
  OpportunityRadar, 
  MarketGrowth, 
  PatentTimeline, 
  CompetitionHeatmap, 
  Signals 
} from '@/components/insights';

// Group messages to combine AI responses with their tool calls and results
interface MessageGroup {
  id: string;
  type: 'human' | 'ai_complete';
  messages: Message[];
  primaryMessage: Message;
  toolCalls: ToolCall[];
  toolResults: Message[];
}

const groupMessages = (messages: Message[]): MessageGroup[] => {
  const groups: MessageGroup[] = [];
  let currentGroup: MessageGroup | null = null;

  for (const message of messages) {
    if (message.type === 'human') {
      // Human messages are always standalone
      groups.push({
        id: message.id || `human-${Date.now()}`,
        type: 'human',
        messages: [message],
        primaryMessage: message,
        toolCalls: [],
        toolResults: [],
      });
      currentGroup = null;
    } else if (message.type === 'ai') {
      // Start a new AI group or continue existing one
      if (!currentGroup || currentGroup.type !== 'ai_complete') {
        // Create new AI group
        currentGroup = {
          id: message.id || `ai-${Date.now()}`,
          type: 'ai_complete',
          messages: [message],
          primaryMessage: message,
          toolCalls: [], // Don't accumulate tool calls at group level
          toolResults: [],
        };
        groups.push(currentGroup);
      } else {
        // Add to existing AI group (for cases with multiple AI messages)
        currentGroup.messages.push(message);
        // Don't accumulate tool calls to avoid duplication
        // Update primary message to the latest one with content
        if (
          message.content &&
          typeof message.content === 'string' &&
          message.content.trim()
        ) {
          currentGroup.primaryMessage = message;
        }
      }
    } else if (message.type === 'tool') {
      // Tool results belong to the current AI group
      if (currentGroup && currentGroup.type === 'ai_complete') {
        currentGroup.toolResults.push(message);
        currentGroup.messages.push(message);
      }
    }
  }

  return groups;
};

// Markdown components (from former ReportView.tsx)
const mdComponents = {
  h1: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn('text-2xl font-bold mt-4 mb-2', className)} {...props}>
      {children}
    </h1>
  ),
  h2: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn('text-xl font-bold mt-3 mb-2', className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('text-lg font-bold mt-3 mb-1', className)} {...props}>
      {children}
    </h3>
  ),
  p: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('mb-3 leading-7', className)} {...props}>
      {children}
    </p>
  ),
  a: ({
    className,
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Badge className="text-xs mx-0.5">
      <a
        className={cn('text-blue-400 hover:text-blue-300 text-xs', className)}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    </Badge>
  ),
  ul: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn('list-disc pl-6 mb-3', className)} {...props}>
      {children}
    </ul>
  ),
  ol: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn('list-decimal pl-6 mb-3', className)} {...props}>
      {children}
    </ol>
  ),
  li: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn('mb-1', className)} {...props}>
      {children}
    </li>
  ),
  blockquote: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        'border-l-4 border-gray-300 pl-4 italic my-3 text-sm',
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        'bg-gray-100 rounded px-1 py-0.5 font-mono text-xs text-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        'bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto font-mono text-xs my-3 border-2 border-black',
        className
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  hr: ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className={cn('border-gray-300 my-4', className)} {...props} />
  ),
  table: ({
    className,
    children,
    ...props
  }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-3 overflow-x-auto">
      <table className={cn('border-collapse w-full', className)} {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({
    className,
    children,
    ...props
  }: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
    <th
      className={cn(
        'border-2 border-black px-3 py-2 text-left font-bold bg-yellow-100',
        className
      )}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({
    className,
    children,
    ...props
  }: React.TdHTMLAttributes<HTMLTableDataCellElement>) => (
    <td
      className={cn('border-2 border-black px-3 py-2 bg-white', className)}
      {...props}
    >
      {children}
    </td>
  ),
};

// Props for HumanMessageBubble
interface HumanMessageBubbleProps {
  group: MessageGroup;
  mdComponents: typeof mdComponents;
}

// HumanMessageBubble Component
const HumanMessageBubble: React.FC<HumanMessageBubbleProps> = ({
  group,
  mdComponents,
}) => {
  const message = group.primaryMessage;
  return (
    <div
      className={`text-gray-900 rounded-2xl break-words min-h-7 bg-yellow-300 border-2 border-black max-w-[100%] sm:max-w-[90%] px-4 pt-3 rounded-br-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium`}
    >
      <ReactMarkdown components={mdComponents}>
        {typeof message.content === 'string'
          ? message.content
          : JSON.stringify(message.content)}
      </ReactMarkdown>
    </div>
  );
};

// Props for AiMessageBubble
interface AiMessageBubbleProps {
  group: MessageGroup;
  historicalActivity: ProcessedEvent[] | undefined;
  liveActivity: ProcessedEvent[] | undefined;
  isLastGroup: boolean;
  isOverallLoading: boolean;
  mdComponents: typeof mdComponents;
  handleCopy: (text: string, messageId: string) => void;
  copiedMessageId: string | null;
  selectedAgentId: string;
  allMessages: Message[];
}

// AiMessageBubble Component
const AiMessageBubble: React.FC<AiMessageBubbleProps> = ({
  group,
  historicalActivity,
  liveActivity,
  isLastGroup,
  isOverallLoading,
  mdComponents,
  handleCopy,
  copiedMessageId,
  selectedAgentId,
  allMessages,
}) => {
  // Tool message state
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const toggleTool = (toolId: string) => {
    setExpandedTools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
  };

  // Determine which activity events to show and if it's for a live loading message
  const activityForThisBubble =
    isLastGroup && isOverallLoading ? liveActivity : historicalActivity;
  const isLiveActivityForThisBubble = isLastGroup && isOverallLoading;

  // Get current agent configuration
  const currentAgent = AVAILABLE_AGENTS.find(
    (agent) => agent.id === selectedAgentId
  );
  const shouldShowActivity =
    currentAgent?.showActivityTimeline &&
    (isLiveActivityForThisBubble ||
      (activityForThisBubble && activityForThisBubble.length > 0));

  // Check if we should hide tool messages for DeepResearcher
  const shouldHideToolMessages = selectedAgentId === AgentId.DEEP_RESEARCHER;

  // Check if we should hide copy button (when still loading for this message group)
  const shouldHideCopyButton = isLastGroup && isOverallLoading;

  // Combine all text content for copy functionality
  const combinedTextContent = group.messages
    .filter((msg) => msg.type === 'ai' && msg.content)
    .map((msg) =>
      typeof msg.content === 'string'
        ? msg.content
        : JSON.stringify(msg.content)
    )
    .filter((content) => content.trim())
    .join('\n\n');

  return (
    <div
      className={`relative break-words flex flex-col group max-w-[85%] md:max-w-[80%] w-full rounded-2xl p-5 bg-green-50 border-2 border-black text-gray-900 rounded-bl-md min-h-[56px] shadow-[4px_4px_0px_0px_rgba(74,222,128,0.6)]`}
    >
      {/* AI Response Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-200">
        <div className="w-6 h-6 bg-green-400 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Sparkles className="w-3 h-3 text-black" />
        </div>
        <span className="text-sm font-bold text-gray-700">Pramana AI</span>
      </div>

      {shouldShowActivity && (
        <div className="mb-3 border-b-2 border-green-200 pb-3 text-xs">
          <ActivityTimeline
            processedEvents={activityForThisBubble || []}
            isLoading={isLiveActivityForThisBubble}
          />
        </div>
      )}

      {/* Render messages in chronological order */}
      {group.messages.map((message, index) => {
        if (message.type === 'ai') {
          const toolCalls = extractToolCallsFromMessage(message);
          const hasContent =
            message.content &&
            typeof message.content === 'string' &&
            message.content.trim();

          return (
            <div key={message.id || `ai-${index}`} className="space-y-3">
              {/* Render AI content if present */}
              {hasContent && (
                <ReactMarkdown components={mdComponents}>
                  {typeof message.content === 'string'
                    ? message.content
                    : JSON.stringify(message.content)}
                </ReactMarkdown>
              )}

              {/* Render tool calls immediately after the AI message that triggered them */}
              {!shouldHideToolMessages && toolCalls.length > 0 && (
                <div className="space-y-2">
                  {toolCalls.map((toolCall) => (
                    <ToolMessageDisplay
                      key={toolCall.id}
                      toolCall={toolCall}
                      toolMessage={findToolMessageForCall(
                        allMessages,
                        toolCall.id
                      )}
                      isExpanded={expandedTools.has(toolCall.id)}
                      onToggle={() => toggleTool(toolCall.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        }
        // Skip tool messages as they're handled by ToolMessageDisplay above
        return null;
      })}

      {!shouldHideCopyButton && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 self-start mt-2 hover:bg-gray-200 text-gray-500 hover:text-gray-900"
          onClick={() =>
            handleCopy(combinedTextContent, group.primaryMessage.id!)
          }
        >
          {copiedMessageId === group.primaryMessage.id ? (
            <CopyCheck className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
};

interface ChatMessagesViewProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (
    inputValue: string,
    effort: string,
    model: string,
    agentId: string
  ) => void;
  onCancel: () => void;
  liveActivityEvents: ProcessedEvent[];
  historicalActivities: Record<string, ProcessedEvent[]>;
  selectedAgentId: string;
  onAgentChange: (agentId: string) => void;
  currentChatId?: string;
  onExportPdf?: () => void;
}

export function ChatMessagesView({
  messages,
  isLoading,
  scrollAreaRef,
  onSubmit,
  onCancel,
  liveActivityEvents,
  historicalActivities,
  selectedAgentId,
  onAgentChange,
  currentChatId,
  onExportPdf,
}: ChatMessagesViewProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showGraphs, setShowGraphs] = useState(false);
  const [graphs, setGraphs] = useState<Record<string, string> | null>(null);
  const [loadingGraphs, setLoadingGraphs] = useState(false);

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleViewGraphs = async () => {
    if (!currentChatId) return;
    
    // Simply show the graphs modal with interactive charts
    setShowGraphs(true);
    
    // Optional: fetch data from backend if available
    // Uncomment this if backend provides data for charts
    /*
    setLoadingGraphs(true);
    try {
      const result = await chatService.getChatInsightGraphs(currentChatId);
      // Process result and pass to chart components as props
      setGraphs(result.graphs);
    } catch (error) {
      console.error('Failed to load graph data:', error);
    } finally {
      setLoadingGraphs(false);
    }
    */
  };

  const downloadGraph = (graphName: string, base64Data: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = `${graphName}_${currentChatId?.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group messages to combine related AI responses and tool calls
  const messageGroups = groupMessages(messages);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden relative">
      {/* Action buttons - only show if we have messages and chatId */}
      {messages.length > 0 && currentChatId && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            onClick={handleViewGraphs}
            variant="outline"
            size="sm"
            disabled={loadingGraphs}
            className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            title="View insight graphs"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {loadingGraphs ? 'Loading...' : 'View Graphs'}
          </Button>
          {onExportPdf && (
            <Button
              onClick={onExportPdf}
              variant="outline"
              size="sm"
              className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              title="Export chat to PDF"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          )}
        </div>
      )}

      {/* Graphs Modal/Display */}
      {showGraphs && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGraphs(false)}>
          <div className="bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-6xl max-h-[90vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Insight Graphs</h2>
              <Button
                onClick={() => setShowGraphs(false)}
                variant="outline"
                size="sm"
                className="border-2 border-black"
              >
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opportunity Radar Chart */}
              <OpportunityRadar 
                onDownload={() => {
                  // Optional: implement download as PNG
                  console.log('Download Opportunity Radar');
                }} 
              />

              {/* Market Growth Chart */}
              <MarketGrowth 
                onDownload={() => {
                  console.log('Download Market Growth');
                }} 
              />

              {/* Patent Timeline Chart */}
              <PatentTimeline 
                onDownload={() => {
                  console.log('Download Patent Timeline');
                }} 
              />

              {/* Competition Heatmap Chart */}
              <CompetitionHeatmap 
                onDownload={() => {
                  console.log('Download Competition Heatmap');
                }} 
              />

              {/* Signals Chart */}
              <Signals 
                onDownload={() => {
                  console.log('Download Signals');
                }} 
              />
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0 overflow-auto" ref={scrollAreaRef}>
        <div className="p-4 md:p-6 space-y-2 max-w-4xl mx-auto pt-8 pb-24">
          {messageGroups.map((group, index) => {
            const isLast = index === messageGroups.length - 1;
            return (
              <div key={group.id} className="space-y-3">
                <div
                  className={`flex items-start gap-3 ${
                    group.type === 'human' ? 'justify-end' : ''
                  }`}
                >
                  {group.type === 'human' ? (
                    <HumanMessageBubble
                      group={group}
                      mdComponents={mdComponents}
                    />
                  ) : (
                    <AiMessageBubble
                      group={group}
                      historicalActivity={
                        historicalActivities[group.primaryMessage.id!]
                      }
                      liveActivity={liveActivityEvents}
                      isLastGroup={isLast}
                      isOverallLoading={isLoading}
                      mdComponents={mdComponents}
                      handleCopy={handleCopy}
                      copiedMessageId={copiedMessageId}
                      selectedAgentId={selectedAgentId}
                      allMessages={messages}
                    />
                  )}
                </div>
              </div>
            );
          })}
          {isLoading &&
            (messageGroups.length === 0 ||
              messageGroups[messageGroups.length - 1].type === 'human') && (
              <div className="flex items-start gap-3 mt-3">
                {(() => {
                  const currentAgent = AVAILABLE_AGENTS.find(
                    (agent) => agent.id === selectedAgentId
                  );
                  const shouldShowActivity = currentAgent?.showActivityTimeline;

                  if (shouldShowActivity) {
                    return (
                      <div className="relative group max-w-[85%] md:max-w-[80%] rounded-2xl p-4 shadow-brutal-sm break-words bg-white text-gray-900 border-2 border-black w-full min-h-[56px]">
                        <div className="text-xs">
                          <ActivityTimeline
                            processedEvents={liveActivityEvents}
                            isLoading={true}
                          />
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center justify-start h-full min-h-[56px]">
                        <div className="flex justify-center items-center gap-1.5 bg-white border-2 border-black rounded-xl px-4 py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <div className="w-2.5 h-2.5 bg-[#4ADE80] rounded-full animate-bounce [animation-delay:-0.32s]"></div>
                          <div className="w-2.5 h-2.5 bg-[#FDE047] rounded-full animate-bounce [animation-delay:-0.16s]"></div>
                          <div className="w-2.5 h-2.5 bg-[#F9A8D4] rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
        </div>
      </ScrollArea>
      <div className="flex-shrink-0 border-t border-gray-200 bg-amber-50/95 backdrop-blur-sm">
        <InputForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          onCancel={onCancel}
          hasHistory={messages.length > 0}
          selectedAgent={selectedAgentId}
          onAgentChange={onAgentChange}
        />
      </div>
    </div>
  );
}
