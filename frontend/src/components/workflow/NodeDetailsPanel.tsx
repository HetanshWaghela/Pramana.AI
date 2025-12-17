/**
 * NodeDetailsPanel Component
 * Side panel showing detailed agent information when a node is selected
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Clock, CheckCircle2, AlertCircle, Loader2, 
  TrendingUp, Ship, FileText, Stethoscope, FolderSearch, 
  Globe, Brain, Combine, MessageSquare, FileDown
} from 'lucide-react';
import { WorkflowNode, NodeStatus, WorkflowAgentId } from '@/types/workflow';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Brain,
  TrendingUp,
  Ship,
  FileText,
  Stethoscope,
  FolderSearch,
  Globe,
  Combine,
  CheckCircle2,
  FileDown,
};

interface NodeDetailsPanelProps {
  node: WorkflowNode | null;
  onClose: () => void;
  isOpen: boolean;
}

// Status badge component
const StatusBadge: React.FC<{ status: NodeStatus }> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return { 
          label: 'Processing', 
          className: 'bg-blue-100 text-blue-700 border-blue-300',
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
        };
      case 'completed':
        return { 
          label: 'Completed', 
          className: 'bg-green-100 text-green-700 border-green-300',
          icon: <CheckCircle2 className="w-3 h-3" />,
        };
      case 'pending':
        return { 
          label: 'Pending', 
          className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
          icon: <Clock className="w-3 h-3" />,
        };
      case 'error':
        return { 
          label: 'Error', 
          className: 'bg-red-100 text-red-700 border-red-300',
          icon: <AlertCircle className="w-3 h-3" />,
        };
      case 'inactive':
        return { 
          label: 'Inactive', 
          className: 'bg-gray-100 text-gray-500 border-gray-300',
          icon: null,
        };
      default:
        return { 
          label: 'Idle', 
          className: 'bg-gray-100 text-gray-600 border-gray-300',
          icon: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant="outline" 
      className={cn('flex items-center gap-1 font-medium', config.className)}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
};

// Data source badges per agent
const getDataSources = (agentId: WorkflowAgentId): string[] => {
  const sources: Record<string, string[]> = {
    iqvia: ['IQVIA MIDAS', 'Market Reports', 'Competitor DB'],
    exim: ['India EXIM Data', 'HS Codes', 'Trade Statistics'],
    patent: ['USPTO PatentsView', 'FDA Orange Book', 'EPO'],
    clinical: ['ClinicalTrials.gov', 'WHO ICTRP', 'CTRI India'],
    internal: ['Knowledge Base', 'Strategy Docs', 'Field Reports'],
    web: ['Regulatory Sites', 'PubMed', 'News Sources'],
    master_orchestrator: ['Query Parser', 'Task Router', 'Priority Engine'],
    synthesizer: ['Decision Heuristics', 'Scoring Engine', 'Risk Model'],
    report_generator: ['PDF Engine', 'Chart Generator', 'Template System'],
    user_query: ['User Input'],
    response: ['Compiled Report'],
  };
  return sources[agentId] || [];
};

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  node,
  onClose,
  isOpen,
}) => {
  if (!node) return null;

  const { agent, status, currentTask, output, startTime, endTime } = node;
  const IconComponent = ICON_MAP[agent.icon] || MessageSquare;
  const dataSources = getDataSources(node.id);

  // Calculate duration if times are available
  const getDuration = () => {
    if (startTime && endTime) {
      const duration = endTime - startTime;
      if (duration < 1000) return `${duration}ms`;
      return `${(duration / 1000).toFixed(1)}s`;
    }
    if (startTime && status === 'running') {
      const duration = Date.now() - startTime;
      return `${(duration / 1000).toFixed(1)}s (running)`;
    }
    return null;
  };

  const duration = getDuration();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "absolute right-0 top-0 h-full w-80 z-50 overflow-hidden",
            isDarkMode 
              ? "bg-[#1a1a2e] border-l border-[#3d3d5c]" 
              : "bg-white border-l border-gray-200"
          )}
          style={{ boxShadow: '-4px 0 20px rgba(0,0,0,0.2)' }}
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{ 
              backgroundColor: agent.color,
              borderColor: isDarkMode ? '#3d3d5c' : '#e5e7eb',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">{agent.name}</h3>
                <p className="text-xs text-white/80 capitalize">{agent.category}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
            {/* Status */}
            <div>
              <p className={cn(
                "text-xs font-semibold uppercase mb-2",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>Status</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={status} />
                {duration && (
                  <span className={cn(
                    "text-xs",
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  )}>• {duration}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className={cn(
                "text-xs font-semibold uppercase mb-2",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>Description</p>
              <p className={cn(
                "text-sm",
                isDarkMode ? "text-gray-300" : "text-gray-700"
              )}>{agent.description}</p>
            </div>

            {/* Current Task */}
            {currentTask && (
              <div>
                <p className={cn(
                  "text-xs font-semibold uppercase mb-2",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>Current Task</p>
                <div className={cn(
                  "rounded-lg p-3",
                  isDarkMode 
                    ? "bg-blue-900/30 border border-blue-700/50" 
                    : "bg-blue-50 border border-blue-200"
                )}>
                  <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-blue-300" : "text-blue-800"
                  )}>{currentTask}</p>
                </div>
              </div>
            )}

            {/* Data Sources */}
            {dataSources.length > 0 && (
              <div>
                <p className={cn(
                  "text-xs font-semibold uppercase mb-2",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>Data Sources</p>
                <div className="flex flex-wrap gap-1">
                  {dataSources.map((source, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        isDarkMode 
                          ? "bg-[#2d2d44] border-[#3d3d5c] text-gray-300" 
                          : "bg-gray-50"
                      )}
                    >
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Output Preview (if completed) */}
            {output && status === 'completed' && (
              <div>
                <p className={cn(
                  "text-xs font-semibold uppercase mb-2",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>Output Preview</p>
                <div className={cn(
                  "rounded-lg p-3",
                  isDarkMode 
                    ? "bg-green-900/30 border border-green-700/50" 
                    : "bg-green-50 border border-green-200"
                )}>
                  <p className={cn(
                    "text-sm line-clamp-4",
                    isDarkMode ? "text-green-300" : "text-green-800"
                  )}>{output}</p>
                </div>
              </div>
            )}

            {/* Inactive Message */}
            {status === 'inactive' && (
              <div className={cn(
                "rounded-lg p-4 text-center",
                isDarkMode 
                  ? "bg-[#2d2d44] border border-[#3d3d5c]" 
                  : "bg-gray-50 border border-gray-200"
              )}>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  This agent is not active for the current query.
                </p>
                <p className={cn(
                  "text-xs mt-1",
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  It will activate when relevant keywords are detected.
                </p>
              </div>
            )}

            {/* Agent-specific info */}
            {node.id === 'master_orchestrator' && (
              <div className={cn(
                "rounded-lg p-4",
                isDarkMode 
                  ? "bg-blue-900/30 border border-blue-700/50" 
                  : "bg-blue-50 border border-blue-200"
              )}>
                <p className={cn(
                  "text-sm font-medium mb-2",
                  isDarkMode ? "text-blue-300" : "text-blue-800"
                )}>Orchestrator Functions</p>
                <ul className={cn(
                  "text-xs space-y-1",
                  isDarkMode ? "text-blue-400" : "text-blue-700"
                )}>
                  <li>• Parse user query for context chips</li>
                  <li>• Identify molecule, therapy area, region</li>
                  <li>• Dispatch relevant worker agents</li>
                  <li>• Coordinate parallel data gathering</li>
                </ul>
              </div>
            )}

            {node.id === 'synthesizer' && (
              <div className={cn(
                "rounded-lg p-4",
                isDarkMode 
                  ? "bg-purple-900/30 border border-purple-700/50" 
                  : "bg-purple-50 border border-purple-200"
              )}>
                <p className={cn(
                  "text-sm font-medium mb-2",
                  isDarkMode ? "text-purple-300" : "text-purple-800"
                )}>Decision Heuristics</p>
                <ul className={cn(
                  "text-xs space-y-1",
                  isDarkMode ? "text-purple-400" : "text-purple-700"
                )}>
                  <li>• Patent Cliff Detection</li>
                  <li>• Market Attractiveness Score</li>
                  <li>• Supply Chain Risk Assessment</li>
                  <li>• Innovation Opportunity Index</li>
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NodeDetailsPanel;
