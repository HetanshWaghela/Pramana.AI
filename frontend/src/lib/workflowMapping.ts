/**
 * Query to Agent Mapping Utility
 * Maps user queries to relevant agents based on keyword analysis
 */

import { WorkflowAgentId, WORKFLOW_AGENTS } from '@/types/workflow';

// Keyword to agent mapping configuration
const KEYWORD_AGENT_MAP: Record<string, WorkflowAgentId[]> = {
  // Market-related keywords -> IQVIA
  'market': ['iqvia', 'exim'],
  'market size': ['iqvia'],
  'market opportunity': ['iqvia', 'exim'],
  'growth': ['iqvia'],
  'cagr': ['iqvia'],
  'competitor': ['iqvia', 'web'],
  'competition': ['iqvia', 'web'],
  'share': ['iqvia'],
  'player': ['iqvia'],
  'landscape': ['iqvia', 'patent'],
  
  // Trade-related keywords -> EXIM
  'import': ['exim'],
  'export': ['exim'],
  'trade': ['exim'],
  'supply chain': ['exim'],
  'api supply': ['exim'],
  'dependency': ['exim'],
  'manufacturing': ['exim', 'internal'],
  
  // Patent-related keywords -> Patent
  'patent': ['patent'],
  'ip': ['patent'],
  'intellectual property': ['patent'],
  'expiry': ['patent'],
  'expiration': ['patent'],
  'fto': ['patent'],
  'freedom to operate': ['patent'],
  'generic': ['patent', 'exim'],
  'patent cliff': ['patent'],
  
  // Clinical-related keywords -> Clinical
  'trial': ['clinical'],
  'clinical': ['clinical'],
  'study': ['clinical'],
  'phase': ['clinical'],
  'pipeline': ['clinical'],
  'efficacy': ['clinical'],
  'safety': ['clinical'],
  'fda': ['clinical', 'web'],
  'approval': ['clinical', 'web'],
  
  // Internal-related keywords -> Internal
  'internal': ['internal'],
  'document': ['internal'],
  'strategy': ['internal'],
  'uploaded': ['internal'],
  'our data': ['internal'],
  'company': ['internal'],
  
  // Web-related keywords -> Web
  'news': ['web'],
  'latest': ['web'],
  'recent': ['web'],
  'guideline': ['web'],
  'rwe': ['web'],
  'real world': ['web'],
  'regulation': ['web'],
  'policy': ['web'],
  
  // Report-related keywords -> Report Generator
  'report': ['report_generator'],
  'pdf': ['report_generator'],
  'download': ['report_generator'],
  'generate report': ['report_generator'],
  'full report': ['report_generator'],
  'comprehensive': ['iqvia', 'exim', 'patent', 'clinical', 'internal', 'web'],
  'all': ['iqvia', 'exim', 'patent', 'clinical', 'internal', 'web'],
  
  // Molecule-specific (demo data molecules)
  'metformin': ['iqvia', 'exim', 'patent', 'clinical', 'web'],
  'tiotropium': ['iqvia', 'exim', 'patent', 'clinical', 'web'],
  'copd': ['iqvia', 'exim', 'patent', 'clinical', 'internal', 'web'],
  'respiratory': ['iqvia', 'exim', 'patent', 'clinical', 'internal', 'web'],
  'aging': ['iqvia', 'clinical', 'web'],
  'anti-aging': ['iqvia', 'clinical', 'web'],
  'longevity': ['iqvia', 'clinical', 'web'],
};

// Default agents for generic queries
const DEFAULT_AGENTS: WorkflowAgentId[] = ['iqvia', 'web'];

// Core agents always present in workflow
const CORE_AGENTS: WorkflowAgentId[] = ['user_query', 'master_orchestrator', 'synthesizer', 'response'];

/**
 * Analyzes a query and returns the relevant worker agents
 */
export function getActiveAgentsForQuery(query: string): WorkflowAgentId[] {
  const queryLower = query.toLowerCase();
  const matchedAgents = new Set<WorkflowAgentId>();
  
  // Check each keyword pattern
  for (const [keyword, agents] of Object.entries(KEYWORD_AGENT_MAP)) {
    if (queryLower.includes(keyword)) {
      agents.forEach(agent => matchedAgents.add(agent));
    }
  }
  
  // If no matches, use defaults
  if (matchedAgents.size === 0) {
    DEFAULT_AGENTS.forEach(agent => matchedAgents.add(agent));
  }
  
  // Add core agents
  CORE_AGENTS.forEach(agent => matchedAgents.add(agent));
  
  // Check if report generator should be added
  if (queryLower.includes('report') || queryLower.includes('pdf') || queryLower.includes('download')) {
    matchedAgents.add('report_generator');
  }
  
  return Array.from(matchedAgents);
}

/**
 * Generate contextual task descriptions for each agent based on the query
 */
export function generateAgentTasks(query: string, activeAgents: WorkflowAgentId[]): Record<WorkflowAgentId, string> {
  const queryLower = query.toLowerCase();
  const tasks: Partial<Record<WorkflowAgentId, string>> = {};
  
  // Extract potential molecule/therapy from query
  const molecules = ['metformin', 'tiotropium', 'semaglutide'];
  const therapies = ['copd', 'respiratory', 'aging', 'anti-aging', 'diabetes', 'oncology'];
  const regions = ['india', 'us', 'usa', 'europe', 'global', 'china'];
  
  let molecule = molecules.find(m => queryLower.includes(m)) || 'the molecule';
  let therapy = therapies.find(t => queryLower.includes(t)) || 'the therapy area';
  let region = regions.find(r => queryLower.includes(r)) || 'global';
  
  // Capitalize for display
  molecule = molecule.charAt(0).toUpperCase() + molecule.slice(1);
  therapy = therapy.charAt(0).toUpperCase() + therapy.slice(1);
  region = region.charAt(0).toUpperCase() + region.slice(1);
  
  // Core agents
  tasks.user_query = 'User submitted query';
  tasks.master_orchestrator = `Parsing query, extracting ${molecule} / ${therapy} / ${region}`;
  tasks.synthesizer = 'Applying opportunity scoring and risk heuristics';
  tasks.response = 'Generating portfolio intelligence report';
  
  // Worker agents - only add if active
  if (activeAgents.includes('iqvia')) {
    tasks.iqvia = `Fetching market data, CAGR, and competition for ${therapy} in ${region}`;
  }
  
  if (activeAgents.includes('exim')) {
    tasks.exim = `Analyzing import/export data for ${molecule} API in ${region}`;
  }
  
  if (activeAgents.includes('patent')) {
    tasks.patent = `Searching patent landscape for ${molecule}, checking FTO status`;
  }
  
  if (activeAgents.includes('clinical')) {
    tasks.clinical = `Querying clinical trials database for ${molecule} in ${therapy}`;
  }
  
  if (activeAgents.includes('internal')) {
    tasks.internal = `Searching internal documents for ${therapy} strategy insights`;
  }
  
  if (activeAgents.includes('web')) {
    tasks.web = `Searching web for latest ${therapy} guidelines and news`;
  }
  
  if (activeAgents.includes('report_generator')) {
    tasks.report_generator = 'Generating downloadable PDF report';
  }
  
  // Fill in empty strings for inactive agents
  const allAgentIds = Object.keys(WORKFLOW_AGENTS) as WorkflowAgentId[];
  allAgentIds.forEach(id => {
    if (!tasks[id]) {
      tasks[id] = '';
    }
  });
  
  return tasks as Record<WorkflowAgentId, string>;
}

/**
 * Determine the workflow connections based on active agents
 */
export function getWorkflowConnections(activeAgents: WorkflowAgentId[]): Array<{ from: WorkflowAgentId; to: WorkflowAgentId }> {
  const connections: Array<{ from: WorkflowAgentId; to: WorkflowAgentId }> = [];
  
  // User Query -> Master Orchestrator (always)
  connections.push({ from: 'user_query', to: 'master_orchestrator' });
  
  // Master Orchestrator -> Workers (only active ones)
  const workers: WorkflowAgentId[] = ['iqvia', 'exim', 'patent', 'clinical', 'internal', 'web'];
  workers.forEach(worker => {
    if (activeAgents.includes(worker)) {
      connections.push({ from: 'master_orchestrator', to: worker });
      connections.push({ from: worker, to: 'synthesizer' });
    }
  });
  
  // Synthesizer -> Response (always)
  connections.push({ from: 'synthesizer', to: 'response' });
  
  // Response -> Report Generator (if active)
  if (activeAgents.includes('report_generator')) {
    connections.push({ from: 'response', to: 'report_generator' });
  }
  
  return connections;
}

/**
 * Get the phase of workflow based on current status
 */
export function getCurrentPhase(
  statuses: Record<WorkflowAgentId, string>
): 'idle' | 'parsing' | 'dispatching' | 'gathering' | 'synthesizing' | 'complete' {
  if (statuses.response === 'completed') return 'complete';
  if (statuses.synthesizer === 'running') return 'synthesizing';
  
  const workers: WorkflowAgentId[] = ['iqvia', 'exim', 'patent', 'clinical', 'internal', 'web'];
  const anyWorkerRunning = workers.some(w => statuses[w] === 'running');
  if (anyWorkerRunning) return 'gathering';
  
  if (statuses.master_orchestrator === 'running') return 'parsing';
  if (statuses.master_orchestrator === 'completed') return 'dispatching';
  
  return 'idle';
}
