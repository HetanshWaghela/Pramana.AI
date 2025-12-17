/**
 * WorkflowCanvas Component
 * Main canvas with node layout, connections, and controls
 * Implements workflow visualization with dot grid background and node positioning
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, ChevronDown } from 'lucide-react';
import { 
  WorkflowAgentId, 
  WorkflowNode, 
  WorkflowConnection, 
  NodeStatus,
  WORKFLOW_AGENTS,
  DEMO_QUERIES,
} from '@/types/workflow';
import { 
  getActiveAgentsForQuery, 
  generateAgentTasks,
  getWorkflowConnections,
} from '@/lib/workflowMapping';
import { AgentNode } from './AgentNode';
import { ConnectionLines } from './ConnectionLine';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkflowCanvasProps {
  currentQuery: string;
  initialDemoIndex?: number;
  autoplay?: boolean;
}

// Node layout positions - HORIZONTAL FLOW (left to right)
const getNodePositions = (): Record<WorkflowAgentId, { x: number; y: number }> => {
  // Horizontal layout with generous spacing
  const startX = 80;
  const colSpacing = 220; // Much more horizontal spacing
  const rowSpacing = 100; // Vertical spacing between worker rows
  
  // Column positions
  const col1 = startX;                    // User Query
  const col2 = startX + colSpacing;       // Orchestrator
  const col3 = startX + colSpacing * 2;   // Workers (3 columns)
  const col4 = startX + colSpacing * 3;   // Workers middle
  const col5 = startX + colSpacing * 4;   // Synthesizer
  const col6 = startX + colSpacing * 5;   // Response
  const col7 = startX + colSpacing * 6;   // Report Generator
  
  const centerY = 280;
  const workerTopY = centerY - rowSpacing * 1.5;
  const workerBottomY = centerY + rowSpacing * 1.5;

  return {
    user_query: { x: col1, y: centerY },
    master_orchestrator: { x: col2, y: centerY },
    // Workers spread across 2 columns, 3 rows
    iqvia: { x: col3, y: workerTopY },
    exim: { x: col3, y: centerY },
    patent: { x: col3, y: workerBottomY },
    clinical: { x: col4, y: workerTopY },
    internal: { x: col4, y: centerY },
    web: { x: col4, y: workerBottomY },
    synthesizer: { x: col5, y: centerY },
    response: { x: col6, y: centerY },
    report_generator: { x: col7, y: centerY },
  };
};

// Animation sequence timing (ms)
const ANIMATION_TIMING = {
  userQuery: 0,
  orchestrator: 500,
  workersStart: 1000,
  workersComplete: 3000,
  synthesizer: 3500,
  response: 4500,
  reportGenerator: 5500,
  complete: 6000,
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  currentQuery,
  initialDemoIndex = 0,
  autoplay = false,
}) => {
  // State
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [selectedNodeId, setSelectedNodeId] = useState<WorkflowAgentId | null>(null);
  const [isAnimating, setIsAnimating] = useState(autoplay); // Start animating if autoplay is true
  const [animationPhase, setAnimationPhase] = useState(autoplay ? 1 : 0); // Start at phase 1 if autoplay
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number | null>(initialDemoIndex);
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Light mode by default

  // Canvas dimensions - much wider for horizontal flow
  const canvasWidth = 1600;
  const canvasHeight = 560;

  // Determine active query (from props or demo)
  const activeQuery = useMemo(() => {
    if (selectedDemoIndex !== null) {
      return DEMO_QUERIES[selectedDemoIndex].query;
    }
    return currentQuery;
  }, [currentQuery, selectedDemoIndex]);

  // Get active agents based on query
  const activeAgentIds = useMemo(() => {
    if (selectedDemoIndex !== null) {
      return DEMO_QUERIES[selectedDemoIndex].activeAgents;
    }
    return getActiveAgentsForQuery(activeQuery);
  }, [activeQuery, selectedDemoIndex]);

  // Generate agent tasks
  const agentTasks = useMemo(() => {
    if (selectedDemoIndex !== null) {
      return DEMO_QUERIES[selectedDemoIndex].agentTasks;
    }
    return generateAgentTasks(activeQuery, activeAgentIds);
  }, [activeQuery, activeAgentIds, selectedDemoIndex]);

  // Node positions
  const nodePositions = useMemo(() => 
    getNodePositions(),
    []
  );

  // Calculate node statuses based on animation phase
  const getNodeStatus = useCallback((agentId: WorkflowAgentId): NodeStatus => {
    if (!isAnimating) return activeAgentIds.includes(agentId) ? 'idle' : 'inactive';
    
    const isActive = activeAgentIds.includes(agentId);
    if (!isActive) return 'inactive';

    // Animation phases
    if (agentId === 'user_query') {
      return animationPhase >= 1 ? 'completed' : 'running';
    }
    if (agentId === 'master_orchestrator') {
      if (animationPhase < 2) return 'pending';
      if (animationPhase === 2) return 'running';
      return 'completed';
    }
    if (['iqvia', 'exim', 'patent', 'clinical', 'internal', 'web'].includes(agentId)) {
      if (animationPhase < 3) return 'pending';
      if (animationPhase === 3 || animationPhase === 4) return 'running';
      return 'completed';
    }
    if (agentId === 'synthesizer') {
      if (animationPhase < 5) return 'pending';
      if (animationPhase === 5) return 'running';
      return 'completed';
    }
    if (agentId === 'response') {
      if (animationPhase < 6) return 'pending';
      if (animationPhase === 6) return 'running';
      return 'completed';
    }
    if (agentId === 'report_generator') {
      if (animationPhase < 7) return 'pending';
      if (animationPhase === 7) return 'running';
      return 'completed';
    }
    return 'idle';
  }, [isAnimating, animationPhase, activeAgentIds]);

  // Build workflow nodes
  const nodes = useMemo((): Record<WorkflowAgentId, WorkflowNode> => {
    const result: Partial<Record<WorkflowAgentId, WorkflowNode>> = {};
    
    Object.entries(WORKFLOW_AGENTS).forEach(([id, agent]) => {
      const agentId = id as WorkflowAgentId;
      result[agentId] = {
        id: agentId,
        agent,
        status: getNodeStatus(agentId),
        currentTask: agentTasks[agentId],
        position: nodePositions[agentId],
      };
    });
    
    return result as Record<WorkflowAgentId, WorkflowNode>;
  }, [nodePositions, getNodeStatus, agentTasks]);

  // Build connections
  const connections = useMemo((): WorkflowConnection[] => {
    const baseConnections = getWorkflowConnections(activeAgentIds);
    
    return baseConnections.map((conn, idx) => ({
      id: `conn-${conn.from}-${conn.to}-${idx}`,
      from: conn.from,
      to: conn.to,
      active: activeAgentIds.includes(conn.from) && activeAgentIds.includes(conn.to),
      animated: isAnimating,
    }));
  }, [activeAgentIds, isAnimating]);

  // Get active connection IDs for animation
  const activeConnectionIds = useMemo(() => {
    return new Set(
      connections
        .filter(c => c.active && isAnimating)
        .map(c => c.id)
    );
  }, [connections, isAnimating]);

  // Animation effect
  useEffect(() => {
    if (!isAnimating) {
      setAnimationPhase(0);
      return;
    }

    const phases = [
      { phase: 1, delay: ANIMATION_TIMING.userQuery },
      { phase: 2, delay: ANIMATION_TIMING.orchestrator },
      { phase: 3, delay: ANIMATION_TIMING.workersStart },
      { phase: 4, delay: ANIMATION_TIMING.workersStart + 1000 },
      { phase: 5, delay: ANIMATION_TIMING.workersComplete },
      { phase: 6, delay: ANIMATION_TIMING.synthesizer },
      { phase: 7, delay: ANIMATION_TIMING.response },
      { phase: 8, delay: ANIMATION_TIMING.complete },
    ];

    const timeouts: NodeJS.Timeout[] = [];

    phases.forEach(({ phase, delay }) => {
      const timeout = setTimeout(() => {
        setAnimationPhase(phase);
        if (phase === 8) {
          // Reset animation after completion
          setTimeout(() => {
            setIsAnimating(false);
            setAnimationPhase(0);
          }, 1500);
        }
      }, delay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isAnimating]);

  // Handlers
  const handleNodeClick = useCallback((id: WorkflowAgentId) => {
    setSelectedNodeId(id);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setZoomLevel(0.85);
    setIsAnimating(false);
    setAnimationPhase(0);
    setSelectedNodeId(null);
  }, []);

  const handleStartAnimation = useCallback(() => {
    setIsAnimating(true);
    setAnimationPhase(1);
  }, []);

  const handleSelectDemo = useCallback((index: number) => {
    setSelectedDemoIndex(index);
    setShowDemoDropdown(false);
    setIsAnimating(false);
    setAnimationPhase(0);
  }, []);

  // Selected node for panel
  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;

  return (
    <div className={cn(
      "relative w-full h-full overflow-hidden transition-colors duration-300",
      isDarkMode ? "bg-[#1a1a2e]" : "bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50"
    )}>
      {/* Dot Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: isDarkMode 
            ? `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`
            : `radial-gradient(circle, rgba(148,163,184,0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        {/* Demo Query Selector */}
        <div className="relative">
          <Button
            variant="outline"
            className={cn(
              "font-semibold transition-all rounded-lg",
              isDarkMode 
                ? "bg-[#2d2d44] border-[#3d3d5c] text-white hover:bg-[#3d3d5c]" 
                : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
            )}
            onClick={() => setShowDemoDropdown(!showDemoDropdown)}
          >
            {selectedDemoIndex !== null 
              ? `Demo ${selectedDemoIndex + 1}: ${DEMO_QUERIES[selectedDemoIndex].description.slice(0, 25)}...`
              : 'Select Demo Query'}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
          
          <AnimatePresence>
            {showDemoDropdown && (
              <motion.div
                className={cn(
                  "absolute top-full left-0 mt-2 w-[420px] rounded-xl overflow-hidden z-30 shadow-2xl",
                  isDarkMode 
                    ? "bg-[#2d2d44] border border-[#3d3d5c]" 
                    : "bg-white border border-gray-200"
                )}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {DEMO_QUERIES.map((demo, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "w-full p-4 text-left transition-colors border-b last:border-b-0",
                      isDarkMode 
                        ? "border-[#3d3d5c] hover:bg-[#3d3d5c]" 
                        : "border-gray-100 hover:bg-gray-50",
                      selectedDemoIndex === idx && (isDarkMode ? "bg-[#3d3d5c]" : "bg-blue-50")
                    )}
                    onClick={() => handleSelectDemo(idx)}
                  >
                    <p className={cn(
                      "font-semibold text-sm",
                      isDarkMode ? "text-white" : "text-gray-800"
                    )}>
                      Demo {idx + 1}: {demo.description}
                    </p>
                    <p className={cn(
                      "text-xs mt-1 line-clamp-1",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      {demo.query}
                    </p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Zoom, Theme and Animation Controls */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-lg transition-all",
              isDarkMode 
                ? "bg-[#2d2d44] border-[#3d3d5c] text-white hover:bg-[#3d3d5c]" 
                : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
            )}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </Button>
          
          <div className={cn("w-px h-6 mx-1", isDarkMode ? "bg-[#3d3d5c]" : "bg-gray-300")} />
          
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-lg",
              isDarkMode 
                ? "bg-[#2d2d44] border-[#3d3d5c] text-white hover:bg-[#3d3d5c]" 
                : "bg-white border-gray-300"
            )}
            onClick={handleZoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className={cn(
            "text-sm font-semibold px-3 py-1.5 rounded-lg",
            isDarkMode 
              ? "bg-[#2d2d44] border border-[#3d3d5c] text-white" 
              : "bg-white border border-gray-300 text-gray-800"
          )}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-lg",
              isDarkMode 
                ? "bg-[#2d2d44] border-[#3d3d5c] text-white hover:bg-[#3d3d5c]" 
                : "bg-white border-gray-300"
            )}
            onClick={handleZoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-lg",
              isDarkMode 
                ? "bg-[#2d2d44] border-[#3d3d5c] text-white hover:bg-[#3d3d5c]" 
                : "bg-white border-gray-300"
            )}
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <div className={cn("w-px h-6 mx-1", isDarkMode ? "bg-[#3d3d5c]" : "bg-gray-300")} />
          
          <Button
            className={cn(
              "font-semibold rounded-lg px-4",
              isAnimating 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            )}
            onClick={isAnimating ? handleReset : handleStartAnimation}
            disabled={!activeQuery && selectedDemoIndex === null}
          >
            {isAnimating ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Workflow
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Current Query Display */}
      {activeQuery && (
        <div className="absolute top-16 left-4 z-10">
          <motion.div 
            className={cn(
              "rounded-xl p-4 max-w-xl shadow-lg",
              isDarkMode 
                ? "bg-[#2d2d44] border border-[#3d3d5c]" 
                : "bg-white border border-gray-200"
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className={cn(
              "text-xs font-semibold uppercase tracking-wide mb-1",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Current Query
            </p>
            <p className={cn(
              "text-sm font-medium",
              isDarkMode ? "text-white" : "text-gray-800"
            )}>
              {activeQuery}
            </p>
          </motion.div>
        </div>
      )}

      {/* Workflow Canvas Area - Scrollable */}
      <div 
        className="absolute inset-0 overflow-auto pt-28 pb-20"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div 
          className="min-w-max flex items-center justify-center px-8"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            minHeight: '100%',
          }}
        >
          <div 
            className="relative"
            style={{ width: canvasWidth, height: canvasHeight }}
          >
            {/* Connection Lines */}
            <ConnectionLines
              connections={connections}
              nodePositions={nodePositions}
              activeConnections={activeConnectionIds}
              isDarkMode={isDarkMode}
            />

            {/* Agent Nodes */}
            {Object.values(nodes).map((node) => (
              <AgentNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onClick={handleNodeClick}
                isActive={activeAgentIds.includes(node.id)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Phase Indicator */}
      {isAnimating && (
        <motion.div 
          className={cn(
            "absolute bottom-4 left-4 rounded-xl p-4 shadow-lg",
            isDarkMode 
              ? "bg-[#2d2d44] border border-[#3d3d5c]" 
              : "bg-white border border-gray-200"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className={cn(
            "text-xs font-semibold uppercase tracking-wide mb-1",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}>
            Phase
          </p>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <p className={cn(
              "text-sm font-semibold",
              isDarkMode ? "text-emerald-400" : "text-emerald-600"
            )}>
              {animationPhase <= 1 && "Receiving Query"}
              {animationPhase === 2 && "Parsing & Routing"}
              {(animationPhase === 3 || animationPhase === 4) && "Gathering Evidence"}
              {animationPhase === 5 && "Synthesizing Data"}
              {animationPhase === 6 && "Generating Response"}
              {animationPhase === 7 && "Creating Report"}
              {animationPhase === 8 && "✓ Complete!"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className={cn(
        "absolute bottom-4 right-4 rounded-xl p-4 shadow-lg",
        isDarkMode 
          ? "bg-[#2d2d44] border border-[#3d3d5c]" 
          : "bg-white border border-gray-200"
      )}>
        <p className={cn(
          "text-xs font-semibold uppercase tracking-wide mb-3",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>
          Legend
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Entry/Output</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Orchestrator</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Worker</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Report</span>
          </div>
        </div>
      </div>

      {/* Node Details Panel */}
      <NodeDetailsPanel
        node={selectedNode}
        onClose={handleClosePanel}
        isOpen={!!selectedNodeId}
        isDarkMode={isDarkMode}
      />

      {/* Click outside to close dropdown */}
      {showDemoDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowDemoDropdown(false)}
        />
      )}
    </div>
  );
};

export default WorkflowCanvas;
