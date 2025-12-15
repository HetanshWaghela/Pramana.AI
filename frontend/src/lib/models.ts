import { AVAILABLE_MODELS, Model, ModelId } from '@/types/models';

// Utility functions for model operations
export const getModelById = (id: string): Model | undefined => {
  return AVAILABLE_MODELS.find((model) => model.id === id);
};

export const isValidModelId = (id: string): id is ModelId => {
  return Object.values(ModelId).includes(id as ModelId);
};

export const getModelByIdSafe = (id: string): Model => {
  const model = getModelById(id);
  if (!model) {
    throw new Error(`Model with id '${id}' not found`);
  }
  return model;
};
