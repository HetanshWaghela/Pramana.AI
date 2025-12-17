import React, { useState, useEffect } from 'react';
import type { Message } from '@langchain/langgraph-sdk';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, CopyCheck, Download, BarChart3 } from 'lucide-react';
import { InputForm } from '@/components/InputForm';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ProcessedEvent } from '@/components/ActivityTimeline';
import { SequentialThinkingFlow } from '@/components/SequentialThinkingFlow';
import { AiBubbleWrapper } from '@/components/AiBubbleWrapper';
import { AVAILABLE_AGENTS } from '@/types/agents';
import { ToolMessageDisplay } from '@/components/ToolMessageDisplay';
import { motion } from 'framer-motion';
import {
  extractToolCallsFromMessage,
  findToolMessageForCall,
} from '@/types/messages';
import { ToolCall } from '@/types/tools';
import { AgentId } from '@/types/agents';
import {
  OpportunityRadar,
  MarketGrowth,
  PatentTimeline,
  CompetitionHeatmap,
  Signals
} from '@/components/insights';
import { FollowUpSuggestions } from '@/components/FollowUpSuggestions';
import { InlineChatGraph } from '@/components/InlineChatGraph';
import { ThinkingDropdown } from '@/components/ThinkingDropdown';

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
        id: `group-${groups.length}-human`,
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
          id: `group-${groups.length}-ai`,
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

// ProgressiveRevealMarkdown: Reveals content section by section with staggered animations
// Splits content by markdown headers/sections and reveals them progressively
interface ProgressiveRevealMarkdownProps {
  content: string;
  mdComponents: typeof mdComponents;
  isLastMessage: boolean;
  isLoading: boolean;
  onAnimationComplete?: () => void;
}

// Helper to split markdown content into logical sections
const splitIntoSections = (content: string): string[] => {
  // Split by headers (##, ###) or horizontal rules (---) while keeping the delimiter
  const sections: string[] = [];
  const lines = content.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    // Check if this line starts a new section (header or horizontal rule)
    const isNewSection = /^#{1,3}\s/.test(line) || /^---+\s*$/.test(line);
    
    if (isNewSection && currentSection.trim()) {
      sections.push(currentSection.trim());
      currentSection = line + '\n';
    } else {
      currentSection += line + '\n';
    }
  }
  
  // Push the last section
  if (currentSection.trim()) {
    sections.push(currentSection.trim());
  }
  
  // If we only got one section, try to split by double newlines for paragraphs
  if (sections.length <= 1 && content.length > 500) {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    // Group into chunks of reasonable size
    const chunks: string[] = [];
    let currentChunk = '';
    for (const para of paragraphs) {
      if (currentChunk.length + para.length > 800 && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = para;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + para;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    return chunks.length > 1 ? chunks : sections;
  }
  
  return sections;
};

const ProgressiveRevealMarkdown: React.FC<ProgressiveRevealMarkdownProps> = ({
  content,
  mdComponents: mdComponentsProp,
  isLastMessage,
  isLoading: _isLoading,
  onAnimationComplete,
}) => {
  const [visibleSections, setVisibleSections] = useState<number>(0);
  const sections = React.useMemo(() => splitIntoSections(content), [content]);
  const totalSections = sections.length;
  const prevContentRef = React.useRef<string>('');
  
  // Reset visible sections when content changes significantly (new message)
  useEffect(() => {
    const contentChanged = content !== prevContentRef.current;
    const isNewContent = contentChanged && prevContentRef.current.length === 0;
    const isCompletelyDifferent = contentChanged && !content.startsWith(prevContentRef.current.slice(0, 50));
    
    if (isNewContent || isCompletelyDifferent) {
      setVisibleSections(0);
    }
    prevContentRef.current = content;
  }, [content]);

  // Progressively reveal sections
  useEffect(() => {
    if (visibleSections < totalSections) {
      // Stagger delay: first section faster, subsequent sections slower
      const delay = visibleSections === 0 ? 50 : 150 + (visibleSections * 30);
      const timer = setTimeout(() => {
        setVisibleSections(prev => Math.min(prev + 1, totalSections));
      }, delay);
      return () => clearTimeout(timer);
    } else if (visibleSections >= totalSections && onAnimationComplete) {
      // All sections visible, animation complete
      const timer = setTimeout(onAnimationComplete, 100);
      return () => clearTimeout(timer);
    }
  }, [visibleSections, totalSections, onAnimationComplete]);

  // For non-last messages or short content, just show everything
  if (!isLastMessage || totalSections <= 1) {
    return (
      <div className="relative">
        <ReactMarkdown components={mdComponentsProp}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {sections.map((section, index) => {
        const isVisible = index < visibleSections;
        const isRevealing = index === visibleSections - 1;
        
        return (
          <motion.div
            key={`section-${index}`}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              y: isVisible ? 0 : 6,
            }}
            transition={{
              duration: 0.35,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{ 
              display: isVisible ? 'block' : 'none',
            }}
            className={isRevealing ? 'relative' : ''}
          >
            <ReactMarkdown components={mdComponentsProp}>
              {section}
            </ReactMarkdown>
          </motion.div>
        );
      })}
    </div>
  );
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
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={`text-gray-900 rounded-2xl break-words min-h-7 bg-yellow-300 border-2 border-black max-w-[100%] sm:max-w-[90%] px-4 pt-3 rounded-br-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium`}
    >
      <ReactMarkdown components={mdComponents}>
        {typeof message.content === 'string'
          ? message.content
          : JSON.stringify(message.content)}
      </ReactMarkdown>
    </motion.div>
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
  userQuery: string;
  onSuggestionClick: (text: string) => void;
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
  userQuery,
  onSuggestionClick,
}) => {
  // Tool message state
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  // Inline graph visibility state
  const [showInlineGraph, setShowInlineGraph] = useState(false);
  // Track if typewriter animation is complete
  const [typewriterComplete, setTypewriterComplete] = useState(false);

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

  // Determine which activity events to show
  // Use historical activity if available, otherwise fallback to live activity
  const activityForThisBubble = historicalActivity ?? (isLastGroup ? liveActivity : undefined);

  const isActivityLoading = isOverallLoading && isLastGroup && !historicalActivity;

  // Get current agent configuration
  const currentAgent = AVAILABLE_AGENTS.find(
    (agent) => agent.id === selectedAgentId
  );

  const shouldShowActivity =
    currentAgent?.showActivityTimeline &&
    (
      isActivityLoading ||
      (activityForThisBubble && activityForThisBubble.length > 0)
    );

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

  const isPortfolioStrategist = selectedAgentId === AgentId.PORTFOLIO_STRATEGIST;

  // IMPORTANT: group.messages can include interleaved tool messages.
  // We must compute the last AI message index among AI messages only.
  const aiMessages = group.messages.filter((m) => m.type === 'ai');

  return (
    <AiBubbleWrapper
      isPortfolioStrategist={isPortfolioStrategist}
      agentName="Pramana AI"
    >
      {shouldShowActivity && (
        <SequentialThinkingFlow
          events={activityForThisBubble || []}
          isLoading={isActivityLoading}
          className="mb-3"
        />
      )}

      {/* Render messages in chronological order */}
      {group.messages.map((message, index) => {
        if (message.type === 'ai') {
          const toolCalls = extractToolCallsFromMessage(message);
          const hasContent =
            message.content &&
            typeof message.content === 'string' &&
            message.content.trim();

          const aiIndex = aiMessages.findIndex((m) => m.id === message.id);
          let lastAiIndexInGroup = -1;
          for (let i = group.messages.length - 1; i >= 0; i--) {
            if (group.messages[i].type === 'ai') {
              lastAiIndexInGroup = i;
              break;
            }
          }
          const isLastAiMessageInGroup =
            aiIndex !== -1
              ? aiIndex === aiMessages.length - 1
              : index === lastAiIndexInGroup;

          return (
            <div key={message.id || `ai-${index}`} className="space-y-3">
              {/* Render AI content with progressive reveal animation */}
              {hasContent && (
                <ProgressiveRevealMarkdown
                  content={typeof message.content === 'string'
                    ? message.content
                    : JSON.stringify(message.content)}
                  mdComponents={mdComponents}
                  isLastMessage={isLastGroup && isLastAiMessageInGroup}
                  isLoading={isOverallLoading}
                  onAnimationComplete={() => setTypewriterComplete(true)}
                />
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

      {/* Inline Graph Display */}
      <InlineChatGraph
        isVisible={showInlineGraph}
        onClose={() => setShowInlineGraph(false)}
        topic={userQuery ? userQuery.split(' ').slice(0, 4).join(' ') : 'Portfolio'}
      />

      {/* Follow-up Suggestions - only show after typewriter animation completes */}
      {!shouldHideCopyButton && combinedTextContent && typewriterComplete && (
        <FollowUpSuggestions
          aiResponse={combinedTextContent}
          userQuery={userQuery}
          onSuggestionClick={onSuggestionClick}
          onGraphClick={() => setShowInlineGraph(true)}
          isLoading={isOverallLoading}
        />
      )}
    </AiBubbleWrapper>
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
  // Graph state - used for future backend integration
  const [, setGraphs] = useState<Record<string, string> | null>(null);
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

  // Graph download handler - used when implementing server-side graph generation
  const handleDownloadGraph = (graphName: string, base64Data: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = `${graphName}_${currentChatId?.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Export for potential use
  void handleDownloadGraph;
  void setGraphs;
  void setLoadingGraphs;

  // Group messages to combine related AI responses and tool calls
  const messageGroups = groupMessages(messages);

  // Helper: Find the user query that preceded a given AI message group
  const findUserQueryForGroup = (groupIndex: number): string => {
    // Look backwards from the current group to find the last human message
    for (let i = groupIndex - 1; i >= 0; i--) {
      if (messageGroups[i].type === 'human') {
        const content = messageGroups[i].primaryMessage.content;
        return typeof content === 'string' ? content : '';
      }
    }
    // If no previous human message found, check the first human message
    const firstHuman = messageGroups.find(g => g.type === 'human');
    if (firstHuman) {
      const content = firstHuman.primaryMessage.content;
      return typeof content === 'string' ? content : '';
    }
    return '';
  };

  // Handler for when user clicks a follow-up suggestion
  const handleSuggestionClick = (text: string) => {
    // Submit the suggestion as a new user message
    // Using default model/effort settings
    onSubmit(text, 'medium', 'llama-3.3-70b-versatile', selectedAgentId);
  };

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
                  className={`flex items-start gap-3 ${group.type === 'human' ? 'justify-end' : ''
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
                      userQuery={findUserQueryForGroup(index)}
                      onSuggestionClick={handleSuggestionClick}
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
                {/* Refactored loading block logic */}
                {selectedAgentId === AgentId.PORTFOLIO_STRATEGIST ? (
                  <AiBubbleWrapper
                    isPortfolioStrategist={true}
                    agentName="Pramana AI"
                  >
                    <SequentialThinkingFlow
                      events={liveActivityEvents}
                      isLoading={true}
                    />
                  </AiBubbleWrapper>
                ) : (
                  // Use ThinkingDropdown for Chat Assistant and other non-activity agents
                  <AiBubbleWrapper
                    isPortfolioStrategist={false}
                    agentName="Pramana AI"
                  >
                    <ThinkingDropdown
                      isThinking={true}
                      thinkingTitle="Analyzing your request"
                    />
                  </AiBubbleWrapper>
                )}
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
