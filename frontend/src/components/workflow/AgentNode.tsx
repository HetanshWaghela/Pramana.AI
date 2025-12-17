/**
 * AgentNode Component
 * Beautified workflow node with Pramana.ai aesthetic
 * Soft colors, smooth interactions, premium feel
 */

import React, { memo, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  MessageSquare, Brain, TrendingUp, Ship, FileText, Stethoscope, 
  FolderSearch, Globe, Combine, CheckCircle2, FileDown, type LucideIcon
} from 'lucide-react';
import { WorkflowNode, WorkflowAgentId, type NodeStatus } from '@/types/workflow';
import { 
  Colors, 
  Radii, 
  Shadows, 
  Transitions, 
  NodeDimensions, 
  Typography, 
  ZIndex,
  type ColorCategory,
  getNodeColors 
} from './designTokens';
import { cn } from '@/lib/utils';

// Typed icon mapping
const ICON_MAP: Readonly<Record<string, LucideIcon>> = {
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
} as const;

interface AgentNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  onClick: (id: WorkflowAgentId) => void;
  isActive: boolean;
}

export const AgentNode = memo<AgentNodeProps>(({
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

  // Get color scheme based on category
  const colorScheme = useMemo(() => {
    if (isInactive) {
      return Colors.node.inactive;
    }
    return getNodeColors(agent.category as ColorCategory, isActive);
  }, [agent.category, isActive, isInactive]);

  // Animation variants
  const nodeVariants: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { 
      scale: 1.05, 
      y: -3,
      transition: { 
        duration: Transitions.duration.fast,
        ease: Transitions.easing.easeOut as any
      }
    },
    tap: { scale: 0.98 },
  };

  // Pulsing glow animation for running state
  const glowAnimation = isRunning ? {
    boxShadow: [
      `0 0 0 0 ${colorScheme.borderActive}60, ${Shadows.md}`,
      `0 0 0 8px ${colorScheme.borderActive}30, ${Shadows.lg}`,
      `0 0 0 0 ${colorScheme.borderActive}60, ${Shadows.md}`,
    ],
  } : {};

  return (
    <motion.div
      className={cn(
        'absolute cursor-pointer select-none',
        isInactive && 'opacity-40'
      )}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? ZIndex.selectedNode : ZIndex.nodes,
      }}
      variants={nodeVariants}
      initial="initial"
      animate="animate"
      whileHover={!isInactive ? "hover" : undefined}
      whileTap={!isInactive ? "tap" : undefined}
      onClick={() => !isInactive && onClick(node.id)}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Main Icon Container */}
        <motion.div
          className={cn(
            'relative flex items-center justify-center group',
            'backdrop-blur-sm',
            isSelected && 'ring-4 ring-offset-2'
          )}
          style={{
            width: NodeDimensions.icon.wrapper,
            height: NodeDimensions.icon.wrapper,
            backgroundColor: colorScheme.background,
            border: `2.5px solid ${isRunning ? colorScheme.borderActive : colorScheme.border}`,
            borderRadius: Radii.xl,
            boxShadow: isRunning ? Shadows.lg : Shadows.base,
            ringColor: isSelected ? Colors.ui.selection.ring : undefined,
          }}
          animate={glowAnimation}
          transition={isRunning ? {
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          } : {}}
        >
          {/* Icon with gradient background */}
          <div
            className="flex items-center justify-center rounded-xl relative overflow-hidden"
            style={{
              width: NodeDimensions.icon.inner,
              height: NodeDimensions.icon.inner,
              background: isInactive 
                ? colorScheme.icon
                : `linear-gradient(135deg, ${(colorScheme as any).iconGradient?.from || colorScheme.icon} 0%, ${(colorScheme as any).iconGradient?.to || colorScheme.icon} 100%)`,
            }}
          >
            <IconComponent 
              className="relative z-10" 
              size={20}
              strokeWidth={2.5}
              style={{ color: Colors.ui.text.inverse }}
            />
            
            {/* Subtle shine effect on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100"
              transition={{ duration: Transitions.duration.base }}
            />
          </div>

          {/* Completion checkmark */}
          {isCompleted && (
            <motion.div
              className="absolute -top-2 -right-2 rounded-full flex items-center justify-center"
              style={{
                width: 22,
                height: 22,
                backgroundColor: Colors.status.completed,
                boxShadow: `0 2px 8px ${Colors.status.completed}40`,
                border: `3px solid ${Colors.canvas.background}`,
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring',
                stiffness: 500,
                damping: 25,
                delay: 0.1
              }}
            >
              <CheckCircle2 size={12} style={{ color: Colors.ui.text.inverse }} />
            </motion.div>
          )}

          {/* Running pulse indicator */}
          {isRunning && (
            <motion.div
              className="absolute -top-2 -right-2 rounded-full"
              style={{
                width: 18,
                height: 18,
                backgroundColor: Colors.status.running,
                border: `3px solid ${Colors.canvas.background}`,
                boxShadow: `0 0 12px ${Colors.status.running}`,
              }}
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [1, 0.7, 1] 
              }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
        </motion.div>

        {/* Label */}
        <div 
          className="text-center select-none"
          style={{ 
            maxWidth: NodeDimensions.labelMaxWidth,
            fontFamily: Typography.fontFamily.sans 
          }}
        >
          <p 
            className="truncate font-semibold leading-tight"
            style={{
              fontSize: Typography.fontSize.sm,
              fontWeight: Typography.fontWeight.semibold,
              color: Colors.ui.text.primary,
            }}
          >
            {agent.shortName}
          </p>
          {isRunning && (
            <motion.p 
              className="font-medium"
              style={{
                fontSize: Typography.fontSize.xs,
                color: Colors.status.running,
              }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              Processing...
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

AgentNode.displayName = 'AgentNode';

export default AgentNode;
