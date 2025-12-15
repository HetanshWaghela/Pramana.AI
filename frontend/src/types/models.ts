export enum ModelId {
  LLAMA_3_1_8B_INSTANT = 'llama-3.1-8b-instant',
  LLAMA_3_3_70B_VERSATILE = 'llama-3.3-70b-versatile',
  LLAMA_3_1_70B_VERSATILE = 'llama-3.1-70b-versatile',
}

export interface Model {
  id: ModelId;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
}

export const AVAILABLE_MODELS: Model[] = [
  {
    id: ModelId.LLAMA_3_1_8B_INSTANT,
    name: 'LLaMA 3.1 8B Instant',
    description: 'Fast and efficient for most tasks',
    icon: 'zap',
    iconColor: 'text-yellow-400',
  },
  {
    id: ModelId.LLAMA_3_3_70B_VERSATILE,
    name: 'LLaMA 3.3 70B',
    description: 'Most capable model for complex reasoning',
    icon: 'brain',
    iconColor: 'text-purple-400',
  },
  {
    id: ModelId.LLAMA_3_1_70B_VERSATILE,
    name: 'LLaMA 3.1 70B',
    description: 'Balanced performance and capability',
    icon: 'cpu',
    iconColor: 'text-blue-400',
  },
];

export const DEFAULT_MODEL = ModelId.LLAMA_3_3_70B_VERSATILE;
