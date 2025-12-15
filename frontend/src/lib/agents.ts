import { AVAILABLE_AGENTS, Agent, AgentId } from '@/types/agents';

// Utility functions for agent operations
export const getAgentById = (id: string): Agent | undefined => {
  return AVAILABLE_AGENTS.find((agent) => agent.id === id);
};

export const isValidAgentId = (id: string): id is AgentId => {
  return Object.values(AgentId).includes(id as AgentId);
};

export const getAgentByIdSafe = (id: string): Agent => {
  const agent = getAgentById(id);
  if (!agent) {
    throw new Error(`Agent with id '${id}' not found`);
  }
  return agent;
};
