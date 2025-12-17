/**
 * ConnectionLine Component
 * Beautified SVG connection lines with smooth bezier curves
 * Subtle gradients and elegant flow animation
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { WorkflowConnection } from '@/types/workflow';
import { Colors, Transitions } from './designTokens';

interface Point {
  readonly x: number;
  readonly y: number;
}

interface ConnectionLineProps {
  connection: WorkflowConnection;
  fromPosition: Point;
  toPosition: Point;
  isActive: boolean;
}

export const ConnectionLine = memo<ConnectionLineProps>(({
  connection,
  fromPosition,
  toPosition,
  isActive,
}) => {
  // Calculate smooth bezier curve control points
  const dx = toPosition.x - fromPosition.x;
  const dy = toPosition.y - fromPosition.y;
  
  // Adaptive control point offset for natural curves
  const controlOffset = Math.abs(dx) * 0.4;
  const verticalOffset = Math.abs(dy) * 0.15;
  
  const path = `M ${fromPosition.x},${fromPosition.y} 
    C ${fromPosition.x + controlOffset},${fromPosition.y + verticalOffset} 
      ${toPosition.x - controlOffset},${toPosition.y - verticalOffset} 
      ${toPosition.x},${toPosition.y}`;

  // Unique IDs for markers and gradients
  const markerId = `arrow-${connection.id}`;
  const gradientId = `gradient-${connection.id}`;

  const strokeColor = isActive ? Colors.edge.active : Colors.edge.inactive;
  const strokeWidth = isActive ? 2.5 : 2;

  return (
    <g>
      {/* SVG definitions */}
      <defs>
        {/* Minimal arrowhead */}
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M 0,0 L 8,4 L 0,8 L 2,4 Z"
            fill={strokeColor}
            fillOpacity={isActive ? 0.9 : 0.6}
          />
        </marker>
        
        {/* Gradient for active lines */}
        {isActive && (
          <linearGradient 
            id={gradientId} 
            x1="0%" 
            y1="0%" 
            x2="100%" 
            y2="0%"
          >
            <stop offset="0%" stopColor={Colors.edge.gradient.from} stopOpacity="0.8" />
            <stop offset="50%" stopColor={Colors.edge.gradient.mid} stopOpacity="1" />
            <stop offset="100%" stopColor={Colors.edge.gradient.to} stopOpacity="0.8" />
          </linearGradient>
        )}
      </defs>

      {/* Subtle shadow stroke */}
      <motion.path
        d={path}
        fill="none"
        stroke="rgba(0, 0, 0, 0.06)"
        strokeWidth={strokeWidth + 1}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ 
          duration: Transitions.duration.slow,
          ease: Transitions.easing.easeOut as any
        }}
      />

      {/* Main connection path */}
      <motion.path
        d={path}
        fill="none"
        stroke={isActive ? `url(#${gradientId})` : strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={`url(#${markerId})`}
        opacity={isActive ? 0.95 : 0.5}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: isActive ? 0.95 : 0.5,
        }}
        transition={{
          pathLength: { 
            duration: Transitions.duration.slower, 
            ease: Transitions.easing.easeInOut as any 
          },
          opacity: { duration: Transitions.duration.base },
        }}
      />

      {/* Animated flow particles for active connections */}
      {isActive && connection.animated && (
        <>
          {[0, 0.4, 0.8].map((delay, i) => (
            <motion.circle
              key={`flow-${i}`}
              r={3.5}
              fill={Colors.edge.flow}
              opacity={0.9}
              filter="url(#glow)"
              initial={{ offsetDistance: '0%', opacity: 0 }}
              animate={{
                offsetDistance: ['0%', '100%'],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'linear',
                delay,
                times: [0, 0.1, 0.85, 1],
              }}
              style={{
                offsetPath: `path('${path}')`,
              }}
            />
          ))}
        </>
      )}

      {/* Glow filter for flow particles */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );
});

ConnectionLine.displayName = 'ConnectionLine';


/**
 * ConnectionLines Container
 * Renders all connections in the workflow
 */
interface ConnectionLinesProps {
  connections: readonly WorkflowConnection[];
  nodePositions: Readonly<Record<string, Point>>;
  activeConnections: ReadonlySet<string>;
}

export const ConnectionLines = memo<ConnectionLinesProps>(({
  connections,
  nodePositions,
  activeConnections,
}) => {
  return (
    <svg 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        width: '100%', 
        height: '100%',
        zIndex: 1,
      }}
    >
      {connections.map((connection) => {
        const fromPos = nodePositions[connection.from];
        const toPos = nodePositions[connection.to];
        
        if (!fromPos || !toPos) return null;

        const isActive = activeConnections.has(connection.id);

        return (
          <ConnectionLine
            key={connection.id}
            connection={connection}
            fromPosition={fromPos}
            toPosition={toPos}
            isActive={isActive}
          />
        );
      })}
    </svg>
  );
});

ConnectionLines.displayName = 'ConnectionLines';

export default ConnectionLine;
