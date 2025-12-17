/**
 * AgentNode Component
 * n8n-style node in the workflow visualization
 * Clean, minimal design with icon on left
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Brain, TrendingUp, Ship, FileText, Stethoscope, 
  FolderSearch, Globe, Combine, CheckCircle2, FileDown, Plus
} from 'lucide-react';
import { WorkflowNode, WorkflowAgentId } from '@/types/workflow';
import { cn } from '@/lib/utils';

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

interface AgentNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  onClick: (id: WorkflowAgentId) => void;
  isActive: boolean;
  isDarkMode?: boolean;
}

export const AgentNode: React.FC<AgentNodeProps> = ({
  node,
  isSelected,
  onClick,
  isActive,
}) => {
  const { agent, status, position } = node;
  const IconComponent = ICON_MAP[agent.icon] || MessageSquare;

  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const isInactive = !isActive && status === 'inactive';

  // n8n-style node colors - clean and minimal
  const getNodeStyle = () => {
    if (isInactive) {
      return {
        bg: '#f8fafc',
        border: '#e2e8f0',
        iconBg: '#e2e8f0',
        iconColor: '#94a3b8',
      };
    }
    
    switch (agent.category) {
      case 'entry':
        return {
          bg: '#ffffff',
          border: isRunning ? '#22c55e' : '#d1fae5',
          iconBg: '#22c55e',
          iconColor: '#ffffff',
        };
      case 'orchestrator':
        return {
          bg: '#ffffff',
          border: isRunning ? '#6366f1' : '#e0e7ff',
          iconBg: '#6366f1',
          iconColor: '#ffffff',
        };
      case 'worker':
        return {
          bg: '#ffffff',
          border: isRunning ? '#f97316' : '#fed7aa',
          iconBg: '#f97316',
          iconColor: '#ffffff',
        };
      case 'aggregator':
        return {
          bg: '#ffffff',
          border: isRunning ? '#a855f7' : '#e9d5ff',
          iconBg: '#a855f7',
          iconColor: '#ffffff',
        };
      case 'output':
        return {
          bg: '#ffffff',
          border: isRunning ? '#14b8a6' : '#ccfbf1',
          iconBg: '#14b8a6',
          iconColor: '#ffffff',
        };
      case 'report':
        return {
          bg: '#ffffff',
          border: isRunning ? '#ec4899' : '#fce7f3',
          iconBg: '#ec4899',
          iconColor: '#ffffff',
        };
      default:
        return {
          bg: '#ffffff',
          border: '#e2e8f0',
          iconBg: '#64748b',
          iconColor: '#ffffff',
        };
    }
  };

  const style = getNodeStyle();

  return (
    <motion.div
      className={cn(
        'absolute cursor-pointer select-none',
        isInactive && 'opacity-50'
      )}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(node.id)}
    >
      {/* n8n-style Node - Icon box with label */}
      <div className="flex flex-col items-center gap-2">
        {/* Icon Container - Main clickable area */}
        <motion.div
          className={cn(
            'relative rounded-2xl flex items-center justify-center',
            'w-[52px] h-[52px]',
            isSelected && 'ring-2 ring-blue-400 ring-offset-2'
          )}
          style={{
            backgroundColor: style.bg,
            border: `2px solid ${style.border}`,
            boxShadow: isRunning 
              ? `0 0 0 3px ${style.border}40, 0 8px 20px -4px rgba(0,0,0,0.15)` 
              : '0 4px 12px -2px rgba(0,0,0,0.08)',
          }}
          animate={isRunning ? {
            boxShadow: [
              `0 0 0 3px ${style.border}40, 0 8px 20px -4px rgba(0,0,0,0.15)`,
              `0 0 0 6px ${style.border}30, 0 8px 20px -4px rgba(0,0,0,0.15)`,
              `0 0 0 3px ${style.border}40, 0 8px 20px -4px rgba(0,0,0,0.15)`,
            ],
          } : {}}
          transition={isRunning ? {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          } : {}}
        >
          {/* Colored Icon Circle */}
          <div
            className="rounded-xl flex items-center justify-center w-9 h-9"
            style={{ backgroundColor: style.iconBg }}
          >
            <IconComponent className="w-5 h-5 text-white" />
          </div>

          {/* Status indicator - top right */}
          {isCompleted && (
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
            </motion.div>
          )}

          {/* Running pulse indicator */}
          {isRunning && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}

          {/* Plus button (n8n style) - shown on hover */}
          <motion.div
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ opacity: 0, x: -5 }}
            whileHover={{ opacity: 1, x: 0 }}
          >
            <Plus className="w-3 h-3 text-gray-500" />
          </motion.div>
        </motion.div>

        {/* Label below icon */}
        <div className="text-center max-w-[120px]">
          <p className="text-xs font-semibold text-gray-800 truncate leading-tight">
            {agent.shortName}
          </p>
          {isRunning && (
            <motion.p 
              className="text-[10px] text-blue-500 font-medium"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Processing...
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AgentNode;
