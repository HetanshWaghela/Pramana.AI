/**
 * Pramana.ai - Agent Definitions
 * Master biomedical evidence. Without the silos.
 */

export enum AgentId {
  PORTFOLIO_STRATEGIST = 'portfolio_strategist',
  DEEP_RESEARCHER = 'deep_researcher',
  CHATBOT = 'chatbot',
  MATH_AGENT = 'math_agent',
  MCP_AGENT = 'mcp_agent',
}

export interface Agent {
  id: AgentId;
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
  showActivityTimeline: boolean;
}

export const AVAILABLE_AGENTS: Agent[] = [
  {
    id: AgentId.PORTFOLIO_STRATEGIST,
    name: 'Portfolio Strategist',
    description: 'AI-powered pharma innovation discovery with multi-source evidence synthesis',
    icon: 'briefcase',
    capabilities: [
      'Market Intelligence (IQVIA)',
      'Clinical Trials Analysis',
      'Patent Landscape',
      'Import/Export Feasibility',
      'Innovation Story Generation',
      'Decision Heuristics',
    ],
    showActivityTimeline: true,
  },
  {
    id: AgentId.DEEP_RESEARCHER,
    name: 'Deep Researcher',
    description: 'Advanced biomedical research with iterative web search and analysis',
    icon: 'search',
    capabilities: [
      'Multi-source Web Research',
      'Citation Tracking',
      'Knowledge Gap Analysis',
      'Research Synthesis',
    ],
    showActivityTimeline: true,
  },
  {
    id: AgentId.CHATBOT,
    name: 'Chat Assistant',
    description: 'General-purpose conversational AI for quick questions and assistance',
    icon: 'message-circle',
    capabilities: [
      'Natural Conversation',
      'Quick Responses',
      'Context Awareness',
    ],
    showActivityTimeline: false,
  },
  {
    id: AgentId.MATH_AGENT,
    name: 'Math Solver',
    description: 'Advanced mathematical calculations and scientific computations',
    icon: 'calculator',
    capabilities: [
      'Arithmetic & Algebra',
      'Trigonometry',
      'Scientific Functions',
      'Statistical Calculations',
    ],
    showActivityTimeline: false,
  },
  {
    id: AgentId.MCP_AGENT,
    name: 'MCP Agent',
    description: 'External tool integration via Model Context Protocol',
    icon: 'wrench',
    capabilities: [
      'File System Operations',
      'Brave Search',
      'External Tool Access',
    ],
    showActivityTimeline: false,
  },
];

export const DEFAULT_AGENT = AgentId.PORTFOLIO_STRATEGIST;

