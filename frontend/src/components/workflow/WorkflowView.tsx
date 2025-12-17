/**
 * WorkflowView Component
 * Main wrapper component that integrates workflow visualization
 * Provides toggle between chat and workflow view
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, MessageSquare, X, Maximize2, Minimize2 } from 'lucide-react';
import { WorkflowCanvas } from './WorkflowCanvas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkflowViewProps {
  currentQuery: string;
  isVisible: boolean;
  onClose: () => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const WorkflowView: React.FC<WorkflowViewProps> = ({
  currentQuery,
  isVisible,
  onClose,
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "bg-amber-50 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden",
            isFullScreen 
              ? "fixed inset-4 z-50" 
              : "relative w-full h-[600px]"
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b-2 border-black">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-lg p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <GitBranch className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-bold text-gray-800">Agent Workflow Visualization</h2>
            </div>
            
            <div className="flex items-center gap-2">
              {onToggleFullScreen && (
                <Button
                  variant="outline"
                  size="icon"
                  className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  onClick={onToggleFullScreen}
                >
                  {isFullScreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="h-[calc(100%-52px)]">
            <WorkflowCanvas currentQuery={currentQuery} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * WorkflowToggleButton Component
 * Button to toggle workflow view on/off
 */
interface WorkflowToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const WorkflowToggleButton: React.FC<WorkflowToggleButtonProps> = ({
  isActive,
  onClick,
  disabled = false,
}) => {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      className={cn(
        "border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-bold gap-2",
        isActive && "bg-blue-500 hover:bg-blue-600"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {isActive ? (
        <>
          <MessageSquare className="w-4 h-4" />
          Chat View
        </>
      ) : (
        <>
          <GitBranch className="w-4 h-4" />
          Workflow View
        </>
      )}
    </Button>
  );
};

/**
 * WorkflowModal Component
 * Full-screen modal version of workflow view
 */
interface WorkflowModalProps {
  currentQuery: string;
  isOpen: boolean;
  onClose: () => void;
  initialDemoIndex?: number;
  autoplay?: boolean;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({
  currentQuery,
  isOpen,
  onClose,
  initialDemoIndex,
  autoplay = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-6 z-50 bg-amber-50 border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-black">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 rounded-xl p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-gray-800">Agent Workflow Visualization</h2>
                  <p className="text-sm text-gray-500">Multi-agent orchestration workflow visualization</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-bold"
                onClick={onClose}
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>

            {/* Canvas */}
            <div className="h-[calc(100%-72px)]">
              <WorkflowCanvas currentQuery={currentQuery} initialDemoIndex={initialDemoIndex} autoplay={autoplay} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WorkflowView;
