export const MODEL_REGISTRY = {
  // Gemini models
  'gemini-2.0-flash': { provider: 'Gemini', model: 'gemini-2.0-flash-exp' },
  'gemini-1.5-flash': { provider: 'Gemini', model: 'gemini-1.5-flash-latest' },
  
  // OpenAI models
  'gpt-4o': { provider: 'OpenAI', model: 'gpt-4o' },
  'gpt-4.1': { provider: 'OpenAI', model: 'gpt-4-turbo' }, 
  'o3-mini': { provider: 'OpenAI', model: 'o3-mini' },
  
  // Claude models
  'claude-3.5-sonnet': { provider: 'Anthropic', model: 'claude-3-5-sonnet-20241022' },
};

export function getModelByProvider(provider) {
  for (const { provider: p, model } of Object.values(MODEL_REGISTRY)) {
    if (p === provider) {
      return model; // trả về model đầu tiên tìm thấy
    }
  }
  return undefined; // không tìm thấy
}

// Test
export function getProviderFromModel(modelName) {
  if (modelName.startsWith("gpt")) return "OpenAI";
  if (modelName.startsWith("gemini")) return "Gemini";
  // add more if needed
  return "Unknown";
}