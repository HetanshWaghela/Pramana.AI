/**
 * WorkflowCanvas Component
 * Main canvas with beautified Pramana.ai aesthetic
 * Subtle dotted grid, glass toolbar, smooth interactions
 */

import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, ChevronDown } from 'lucide-react';
import { 
  WorkflowAgentId, 
  WorkflowNode, 
  WorkflowConnection, 
  type NodeStatus,
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
import { 
  Colors, 
  Radii, 
  Shadows, 
  Transitions, 
  CanvasLayout, 
  ZIndex 
} from './designTokens';

type AnimationPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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
  const [zoomLevel, setZoomLevel] = useState<number>(CanvasLayout.defaultZoom);
  const [selectedNodeId, setSelectedNodeId] = useState<WorkflowAgentId | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(autoplay);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>(autoplay ? 1 : 0);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number | null>(initialDemoIndex);
  const [showDemoDropdown, setShowDemoDropdown] = useState<boolean>(false);

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
    setZoomLevel(prev => Math.min(prev + 0.1, CanvasLayout.maxZoom));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, CanvasLayout.minZoom));
  }, []);

  const handleReset = useCallback(() => {
    setZoomLevel(CanvasLayout.defaultZoom);
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
    <div 
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundColor: Colors.canvas.background,
      }}
    >
      {/* Subtle Dot Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${Colors.canvas.grid} ${CanvasLayout.grid.dotRadius}px, transparent ${CanvasLayout.grid.dotRadius}px)`,
          backgroundSize: `${CanvasLayout.grid.size}px ${CanvasLayout.grid.size}px`,
          opacity: Colors.canvas.gridOpacity,
        }}
      />

      {/* Glass Floating Toolbar */}
      <div 
        className="absolute top-4 right-4 flex flex-col gap-2"
        style={{ zIndex: ZIndex.toolbar }}
      >
        {/* Zoom Controls */}
        <motion.div 
          className="flex flex-col gap-1 rounded-xl p-2 backdrop-blur-md"
          style={{
            backgroundColor: Colors.ui.glass.background,
            border: `1px solid ${Colors.ui.glass.border}`,
            boxShadow: Shadows.lg,
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-white/80 transition-all"
            onClick={handleZoomIn}
            title="Zoom In"
            style={{ borderRadius: Radii.md }}
          >
            <ZoomIn size={18} style={{ color: Colors.ui.text.primary }} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-white/80 transition-all"
            onClick={handleZoomOut}
            title="Zoom Out"
            style={{ borderRadius: Radii.md }}
          >
            <ZoomOut size={18} style={{ color: Colors.ui.text.primary }} />
          </Button>
          
          <div className="h-px w-full my-1" style={{ backgroundColor: Colors.ui.glass.border }} />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-white/80 transition-all"
            onClick={handleReset}
            title="Reset View"
            style={{ borderRadius: Radii.md }}
          >
            <RotateCcw size={18} style={{ color: Colors.ui.text.primary }} />
          </Button>
        </motion.div>

        {/* Animation Control */}
        <motion.div
          className="rounded-xl p-2 backdrop-blur-md"
          style={{
            backgroundColor: Colors.ui.glass.background,
            border: `1px solid ${Colors.ui.glass.border}`,
            boxShadow: Shadows.lg,
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 hover:bg-white/80 transition-all font-medium"
            onClick={isAnimating ? () => setIsAnimating(false) : handleStartAnimation}
            style={{ 
              borderRadius: Radii.md,
              color: isAnimating ? Colors.status.running : Colors.ui.text.primary,
            }}
          >
            {isAnimating ? (
              <>
                <Pause size={16} className="mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                Run Workflow
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Demo Query Selector - Top Left */}
      <div 
        className="absolute top-4 left-4"
        style={{ zIndex: ZIndex.toolbar }}
      >
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="outline"
            className="font-medium transition-all backdrop-blur-md shadow-lg"
            style={{
              backgroundColor: Colors.ui.glass.background,
              border: `1px solid ${Colors.ui.glass.border}`,
              borderRadius: Radii.lg,
              color: Colors.ui.text.primary,
            }}
            onClick={() => setShowDemoDropdown(!showDemoDropdown)}
          >
            {selectedDemoIndex !== null 
              ? `Demo ${selectedDemoIndex + 1}: ${DEMO_QUERIES[selectedDemoIndex].description.slice(0, 30)}...`
              : 'Select Demo Query'}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
          
          <AnimatePresence>
            {showDemoDropdown && (
              <motion.div
                className="absolute top-full left-0 mt-2 w-[450px] overflow-hidden backdrop-blur-md"
                style={{
                  backgroundColor: Colors.ui.glass.background,
                  border: `1px solid ${Colors.ui.glass.border}`,
                  borderRadius: Radii.xl,
                  boxShadow: Shadows.xl,
                  zIndex: ZIndex.tooltip,
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {DEMO_QUERIES.map((demo, idx) => (
                  <button
                    key={idx}
                    className="w-full p-4 text-left transition-all border-b last:border-b-0 hover:bg-white/60"
                    style={{
                      borderColor: Colors.ui.glass.border,
                      backgroundColor: selectedDemoIndex === idx ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    }}
                    onClick={() => handleSelectDemo(idx)}
                  >
                    <p 
                      className="font-semibold text-sm"
                      style={{ color: Colors.ui.text.primary }}
                    >
                      Demo {idx + 1}: {demo.description}
                    </p>
                    <p 
                      className="text-xs mt-1 line-clamp-1"
                      style={{ color: Colors.ui.text.secondary }}
                    >
                      {demo.query}
                    </p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Current Query Display */}
      {activeQuery && (
        <div 
          className="absolute top-20 left-4"
          style={{ zIndex: ZIndex.toolbar - 1, maxWidth: '500px' }}
        >
          <motion.div 
            className="rounded-xl p-4 backdrop-blur-md"
            style={{
              backgroundColor: Colors.ui.glass.background,
              border: `1px solid ${Colors.ui.glass.border}`,
              boxShadow: Shadows.md,
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p 
              className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: Colors.ui.text.muted }}
            >
              Current Query
            </p>
            <p 
              className="text-sm font-medium"
              style={{ color: Colors.ui.text.primary }}
            >
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
            />

            {/* Agent Nodes */}
            {Object.values(nodes).map((node) => (
              <AgentNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onClick={handleNodeClick}
                isActive={activeAgentIds.includes(node.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Phase Indicator - Bottom Left */}
      {isAnimating && (
        <motion.div 
          className="absolute bottom-4 left-4 rounded-xl p-4 backdrop-blur-md"
          style={{
            backgroundColor: Colors.ui.glass.background,
            border: `1px solid ${Colors.ui.glass.border}`,
            boxShadow: Shadows.md,
            zIndex: ZIndex.toolbar,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p 
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: Colors.ui.text.muted }}
          >
            Phase
          </p>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: Colors.status.running }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <p 
              className="text-sm font-semibold"
              style={{ color: Colors.status.running }}
            >
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

      {/* Legend - Bottom Right */}
      <motion.div 
        className="absolute bottom-4 right-4 rounded-xl p-4 backdrop-blur-md"
        style={{
          backgroundColor: Colors.ui.glass.background,
          border: `1px solid ${Colors.ui.glass.border}`,
          boxShadow: Shadows.md,
          zIndex: ZIndex.toolbar,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p 
          className="text-xs font-semibold uppercase tracking-wide mb-3"
          style={{ color: Colors.ui.text.muted }}
        >
          Legend
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: Colors.node.entry.icon,
                boxShadow: `0 0 8px ${Colors.node.entry.icon}60`,
              }}
            />
            <span style={{ color: Colors.ui.text.secondary }}>Entry/Output</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: Colors.node.orchestrator.icon,
                boxShadow: `0 0 8px ${Colors.node.orchestrator.icon}60`,
              }}
            />
            <span style={{ color: Colors.ui.text.secondary }}>Orchestrator</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: Colors.node.worker.icon,
                boxShadow: `0 0 8px ${Colors.node.worker.icon}60`,
              }}
            />
            <span style={{ color: Colors.ui.text.secondary }}>Worker</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: Colors.node.report.icon,
                boxShadow: `0 0 8px ${Colors.node.report.icon}60`,
              }}
            />
            <span style={{ color: Colors.ui.text.secondary }}>Report</span>
          </div>
        </div>
      </motion.div>

      {/* Node Details Panel */}
      <NodeDetailsPanel
        node={selectedNode}
        onClose={handleClosePanel}
        isOpen={!!selectedNodeId}
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
