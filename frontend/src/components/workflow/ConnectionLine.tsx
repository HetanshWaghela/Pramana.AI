/**
 * ConnectionLine Component
 * SVG connection lines between workflow nodes with animation
 * Supports animated flow dots and directional arrows
 */

import React from 'react';
import { motion } from 'framer-motion';
import { WorkflowConnection } from '@/types/workflow';

interface Point {
  x: number;
  y: number;
}

interface ConnectionLineProps {
  connection: WorkflowConnection;
  fromPosition: Point;
  toPosition: Point;
  isActive: boolean;
  isDarkMode?: boolean;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  fromPosition,
  toPosition,
  isActive,
  isDarkMode = false,
}) => {
  // Calculate control points for a curved bezier path - horizontal curves
  const dx = toPosition.x - fromPosition.x;
  
  // Use horizontal bezier curves with control points at 50% of horizontal distance
  const controlOffset = Math.abs(dx) * 0.5;
  
  const path = `M ${fromPosition.x} ${fromPosition.y} 
          C ${fromPosition.x + controlOffset} ${fromPosition.y}, 
            ${toPosition.x - controlOffset} ${toPosition.y}, 
            ${toPosition.x} ${toPosition.y}`;

  // Arrow marker ID unique to this connection
  const markerId = `arrow-${connection.id}`;

  // Cleaner colors for light mode
  const inactiveColor = isDarkMode ? '#4a4a6a' : '#cbd5e1';
  const activeColor = '#3B82F6';
  
  const strokeColor = isActive ? activeColor : inactiveColor;
  const strokeWidth = isActive ? 2.5 : 2;
  const dotColor = activeColor;

  return (
    <g>
      {/* Arrow marker definition */}
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill={strokeColor}
          />
        </marker>
        
        {/* Gradient for active lines */}
        {isActive && (
          <linearGradient id={`gradient-${connection.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        )}
      </defs>

      {/* Background stroke (shadow effect) */}
      <path
        d={path}
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={strokeWidth + 2}
        strokeLinecap="round"
      />

      {/* Main connection line - dashed style */}
      <motion.path
        d={path}
        fill="none"
        stroke={isActive ? activeColor : strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="8 8"
        markerEnd={`url(#${markerId})`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: 1,
          strokeDashoffset: isActive && connection.animated ? [0, -32] : 0,
        }}
        transition={{
          pathLength: { duration: 0.5, ease: 'easeInOut' },
          opacity: { duration: 0.3 },
          strokeDashoffset: {
            duration: 0.8,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      />

      {/* Animated flow dots for active connections */}
      {isActive && connection.animated && (
        <>
          <motion.circle
            r={4}
            fill={dotColor}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              offsetDistance: ['0%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.1, 0.9, 1],
            }}
            style={{
              offsetPath: `path("${path}")`,
            }}
          />
          <motion.circle
            r={4}
            fill={dotColor}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              offsetDistance: ['0%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.1, 0.9, 1],
              delay: 0.6,
            }}
            style={{
              offsetPath: `path("${path}")`,
            }}
          />
          <motion.circle
            r={4}
            fill={dotColor}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              offsetDistance: ['0%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.1, 0.9, 1],
              delay: 1.2,
            }}
            style={{
              offsetPath: `path("${path}")`,
            }}
          />
        </>
      )}
    </g>
  );
};

/**
 * ConnectionLines - Container for all connection lines
 */
interface ConnectionLinesProps {
  connections: WorkflowConnection[];
  nodePositions: Record<string, Point>;
  activeConnections: Set<string>;
  isDarkMode?: boolean;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  connections,
  nodePositions,
  activeConnections,
  isDarkMode = true,
}) => {
  return (
    <svg 
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
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
            isDarkMode={isDarkMode}
          />
        );
      })}
    </svg>
  );
};

export default ConnectionLine;
