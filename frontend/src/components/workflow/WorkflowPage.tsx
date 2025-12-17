/**
 * WorkflowPage Component
 * Standalone page for workflow visualization demo
 * Can be accessed directly at /workflow route
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageSquare, ArrowLeft } from 'lucide-react';
import { WorkflowCanvas } from './WorkflowCanvas';
import './workflow.css';

export const WorkflowPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-amber-50">
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b-2 border-black bg-white">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-700 hover:text-green-500 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-bold">Home</span>
          </Link>
          
          <span className="text-gray-300">|</span>
          
          <Link
            to="/chat"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-500 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-bold">Back to Chat</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-base font-black text-gray-900">Pramana.ai</span>
        </div>
        
        <div className="w-48" /> {/* Spacer for centering */}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-hidden">
        <WorkflowCanvas currentQuery="" />
      </div>

      {/* Info Footer */}
      <div className="px-6 py-3 border-t-2 border-black bg-white">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>
            <span className="font-bold">Workflow Visualization</span>
            {' — '}
            Select a demo query or run the animation to see the multi-agent orchestration flow
          </p>
          <p className="text-xs text-gray-400">
            Portfolio Strategist • 6 Worker Agents • Decision Heuristics
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
