/**
 * Workflow Visualization Types
 * n8n-style node-based workflow visualization for multi-agent pharma portfolio planning
 */

// Agent identifiers matching backend workers
export type WorkflowAgentId = 
  | 'user_query'
  | 'master_orchestrator'
  | 'iqvia'
  | 'exim'
  | 'patent'
  | 'clinical'
  | 'internal'
  | 'web'
  | 'synthesizer'
  | 'response'
  | 'report_generator';

// Status of each workflow node
export type NodeStatus = 'idle' | 'pending' | 'running' | 'completed' | 'error' | 'inactive';

// Agent node configuration
export interface WorkflowAgent {
  id: WorkflowAgentId;
  name: string;
  shortName: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Background color
  borderColor: string;
  iconColor: string;
  category: 'entry' | 'orchestrator' | 'worker' | 'aggregator' | 'output' | 'report';
}

// Individual node in the workflow
export interface WorkflowNode {
  id: WorkflowAgentId;
  agent: WorkflowAgent;
  status: NodeStatus;
  currentTask?: string; // What this agent is doing for the current query
  progress?: number; // 0-100 for progress indication
  output?: string; // Preview of output
  startTime?: number;
  endTime?: number;
  position: { x: number; y: number };
}

// Connection between nodes
export interface WorkflowConnection {
  id: string;
  from: WorkflowAgentId;
  to: WorkflowAgentId;
  active: boolean;
  animated: boolean;
  dataFlow?: 'forward' | 'backward'; // Direction of data flow
}

// Complete workflow state
export interface WorkflowState {
  isWorkflowView: boolean;
  currentQuery: string;
  activeAgents: WorkflowAgentId[];
  nodes: Record<WorkflowAgentId, WorkflowNode>;
  connections: WorkflowConnection[];
  selectedNode: WorkflowAgentId | null;
  phase: 'idle' | 'parsing' | 'dispatching' | 'gathering' | 'synthesizing' | 'complete';
  zoomLevel: number;
  panOffset: { x: number; y: number };
}

// Demo query for showing workflow
export interface DemoQuery {
  query: string;
  description: string;
  activeAgents: WorkflowAgentId[];
  agentTasks: Record<WorkflowAgentId, string>;
}

// Agent definitions for the workflow
export const WORKFLOW_AGENTS: Record<WorkflowAgentId, WorkflowAgent> = {
  user_query: {
    id: 'user_query',
    name: 'User Query',
    shortName: 'Query',
    description: 'Entry point - the user\'s question or request',
    icon: 'MessageSquare',
    color: '#10B981', // Green
    borderColor: '#059669',
    iconColor: '#ffffff',
    category: 'entry',
  },
  master_orchestrator: {
    id: 'master_orchestrator',
    name: 'Master Orchestrator',
    shortName: 'Orchestrator',
    description: 'Routes queries to appropriate worker agents and coordinates responses',
    icon: 'Brain',
    color: '#3B82F6', // Blue
    borderColor: '#2563EB',
    iconColor: '#ffffff',
    category: 'orchestrator',
  },
  iqvia: {
    id: 'iqvia',
    name: 'IQVIA Market Agent',
    shortName: 'IQVIA',
    description: 'Fetches market intelligence, competitor analysis, and growth data',
    icon: 'TrendingUp',
    color: '#F59E0B', // Orange
    borderColor: '#D97706',
    iconColor: '#ffffff',
    category: 'worker',
  },
  exim: {
    id: 'exim',
    name: 'EXIM Trade Agent',
    shortName: 'EXIM',
    description: 'Analyzes import/export data and supply chain intelligence',
    icon: 'Ship',
    color: '#F59E0B',
    borderColor: '#D97706',
    iconColor: '#ffffff',
    category: 'worker',
  },
  patent: {
    id: 'patent',
    name: 'Patent Landscape Agent',
    shortName: 'Patent',
    description: 'Reviews patent filings, expiry dates, and FTO risks',
    icon: 'FileText',
    color: '#F59E0B',
    borderColor: '#D97706',
    iconColor: '#ffffff',
    category: 'worker',
  },
  clinical: {
    id: 'clinical',
    name: 'Clinical Trials Agent',
    shortName: 'Clinical',
    description: 'Searches clinical trial databases and pipeline data',
    icon: 'Stethoscope',
    color: '#F59E0B',
    borderColor: '#D97706',
    iconColor: '#ffffff',
    category: 'worker',
  },
  internal: {
    id: 'internal',
    name: 'Internal Insights Agent',
    shortName: 'Internal',
    description: 'Processes internal documents and company knowledge base',
    icon: 'FolderSearch',
    color: '#F59E0B',
    borderColor: '#D97706',
    iconColor: '#ffffff',
    category: 'worker',
  },
  web: {
    id: 'web',
    name: 'Web Intelligence Agent',
    shortName: 'Web',
    description: 'Searches web for news, RWE, and regulatory updates',
    icon: 'Globe',
    color: '#F59E0B',
    borderColor: '#D97706',
    iconColor: '#ffffff',
    category: 'worker',
  },
  synthesizer: {
    id: 'synthesizer',
    name: 'Evidence Synthesizer',
    shortName: 'Synthesizer',
    description: 'Aggregates worker results and applies decision heuristics',
    icon: 'Combine',
    color: '#3B82F6',
    borderColor: '#2563EB',
    iconColor: '#ffffff',
    category: 'aggregator',
  },
  response: {
    id: 'response',
    name: 'Final Response',
    shortName: 'Response',
    description: 'Compiled portfolio intelligence report',
    icon: 'CheckCircle2',
    color: '#10B981',
    borderColor: '#059669',
    iconColor: '#ffffff',
    category: 'output',
  },
  report_generator: {
    id: 'report_generator',
    name: 'Report Generator',
    shortName: 'Report',
    description: 'Generates downloadable PDF reports',
    icon: 'FileDown',
    color: '#8B5CF6', // Purple
    borderColor: '#7C3AED',
    iconColor: '#ffffff',
    category: 'output',
  },
};

// Pre-defined demo queries
export const DEMO_QUERIES: DemoQuery[] = [
  {
    query: "What is the market opportunity for Metformin in anti-aging therapy?",
    description: "Market Analysis - IQVIA, EXIM, Web agents active",
    activeAgents: ['user_query', 'master_orchestrator', 'iqvia', 'exim', 'web', 'synthesizer', 'response'],
    agentTasks: {
      user_query: 'User submitted query',
      master_orchestrator: 'Parsing query, identifying Metformin + anti-aging + market analysis',
      iqvia: 'Fetching market size, CAGR, and competitor data for longevity market',
      exim: 'Analyzing import/export trends for Metformin API',
      patent: '',
      clinical: '',
      internal: '',
      web: 'Searching for TAME trial updates, FDA geroscience guidance',
      synthesizer: 'Applying opportunity scoring heuristics',
      response: 'Generating portfolio intelligence report',
      report_generator: '',
    },
  },
  {
    query: "Find patent expiry opportunities for Tiotropium in respiratory",
    description: "Patent Search - Patent, Clinical, Web agents active",
    activeAgents: ['user_query', 'master_orchestrator', 'patent', 'clinical', 'web', 'synthesizer', 'response'],
    agentTasks: {
      user_query: 'User submitted query',
      master_orchestrator: 'Parsing query, identifying Tiotropium + patent + respiratory',
      iqvia: '',
      exim: '',
      patent: 'Searching USPTO for Tiotropium patents, analyzing expiry timeline',
      clinical: 'Finding clinical trials for generic Tiotropium formulations',
      internal: '',
      web: 'Searching for regulatory updates on COPD treatments',
      synthesizer: 'Calculating patent cliff opportunity score',
      response: 'Generating IP landscape report',
      report_generator: '',
    },
  },
  {
    query: "Generate a full report on COPD market opportunity in India including all data sources",
    description: "Full Analysis - All agents active + Report Generator",
    activeAgents: ['user_query', 'master_orchestrator', 'iqvia', 'exim', 'patent', 'clinical', 'internal', 'web', 'synthesizer', 'response', 'report_generator'],
    agentTasks: {
      user_query: 'User submitted query',
      master_orchestrator: 'Parsing query, full analysis mode for COPD in India',
      iqvia: 'Fetching India respiratory market data, competitor landscape',
      exim: 'Analyzing inhaler import dependency and local manufacturing',
      patent: 'Reviewing respiratory drug patents and device IP',
      clinical: 'Searching trials in Indian population, Phase 3 studies',
      internal: 'Retrieving internal strategy documents on India respiratory',
      web: 'Searching GOLD guidelines, Ayushman Bharat coverage updates',
      synthesizer: 'Comprehensive evidence synthesis with all heuristics',
      response: 'Generating detailed portfolio intelligence report',
      report_generator: 'Creating downloadable PDF report',
    },
  },
];
