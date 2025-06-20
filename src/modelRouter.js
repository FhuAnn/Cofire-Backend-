import { AnthropicClient } from "./AnthropicClient.js";
import { GeminiClient } from "./GeminiClient.js";
import { MODEL_REGISTRY } from "./modelRegistry.js";
import { OpenAIClient } from "./OpenAIClient.js";

export class ModelRouter {
  constructor(modelName, customConfig = {}) {
    this.modelName = modelName || "gemini-2.0-flash";
    this.apiKeys = {
      Gemini: process.env.GEMINI_API_KEY,
      OpenAI: process.env.OPENAI_API_KEY,
      Anthropic: process.env.ANTHROPIC_API_KEY,
      ...customConfig.apiKeys, // Override với custom API keys nếu có
    };
    this.defaultOptions = {
      temperature: 0.7,
      maxTokens: 512,
      topP: 0.8,
      topK: 40,
      ...customConfig.defaultOptions, // Override với custom options
    };

    this.client = null;
    this.initializeClient();
  }

  getProviderInfo(modelName) {
    const info = MODEL_REGISTRY[modelName];
    if (!info) {
      if (modelName.includes("gemini"))
        return { provider: "Gemini", model: modelName };
      if (modelName.includes("gpt"))
        return { provider: "OpenAI", model: modelName };
      if (modelName.includes("claude"))
        return { provider: "Anthropic", model: modelName };

      throw new Error(`Unknown model: ${modelName}`);
    }
    return info;
  }

  // Khởi tạo client dựa trên model name
  initializeClient() {
    try {
      const { provider, model } = this.getProviderInfo(this.modelName);
      const apiKey = this.apiKeys[provider];

      if (!apiKey) {
        throw new Error(
          `API key not found for provider: ${provider}. Please set ${provider.toUpperCase()}_API_KEY environment variable.`
        );
      }

      switch (provider) {
        case "Gemini":
          this.client = new GeminiClient(apiKey, model);
          break;
        case "OpenAI":
          this.client = new OpenAIClient(apiKey, model);
          break;
        case "Anthropic":
          this.client = new AnthropicClient(apiKey, model);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      this.provider = provider;
      this.actualModel = model;
    } catch (error) {
      console.error(
        `Failed to initialize ModelRouter for ${this.modelName}:`,
        error.message
      );
      throw error;
    }
  }

  // Cập nhật model mới
  updateModel(newModelName, newCustomConfig = {}) {
    this.modelName = newModelName;

    // Cập nhật lại config nếu truyền vào mới
    this.defaultOptions = {
      ...this.defaultOptions,
      ...newCustomConfig.defaultOptions,
    };

    if (newCustomConfig.apiKeys) {
      this.apiKeys = {
        ...this.apiKeys,
        ...newCustomConfig.apiKeys,
      };
    }

    // Re-initialize client
    this.initializeClient();
  }

  // Generate text - chỉ cần prompt!
  async generate(prompt, options = {}) {
    if (!this.client) {
      return {
        success: false,
        error: "Client not initialized",
        model: this.modelName,
      };
    }

    try {
      console.log(`Model Router ::: options truyền vào :::`, options);
      const finalOptions = { ...this.defaultOptions, ...options };
      const result = await this.client.generate(prompt, finalOptions);
      console.log(
        `Model Router :::: Generated text using ${this.modelName} (${this.provider}):`,
        result
      );
      return {
        ...result,
        selectedModel: this.modelName,
        provider: this.provider,
      };
    } catch (error) {
      const customError = new Error(`${error.message}`);
      customError.status = error.status || 500;
      customError.selectedModel = this.modelName;
      customError.provider = this.provider;
      customError.file = error.file || "modelRouter.js";
      customError.stack = error.stack;
      throw customError;
    }
  }

  // Generate stream
  async generateStream(prompt, options = {}) {
    if (!this.client || typeof this.client.generateStream !== "function") {
      return {
        success: false,
        error:
          "Streaming not supported by this model or client not initialized",
        model: this.modelName,
        provider: this.provider,
      };
    }

    try {
      const finalOptions = { ...this.defaultOptions, ...options };
      const stream = await this.client.generateStream(prompt, finalOptions);
      return {
        success: true,
        stream,
        selectedModel: this.modelName,
        provider: this.provider,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: this.modelName,
        provider: this.provider,
      };
    }
  }

  // Check status
  async checkStatus() {
    if (!this.client) {
      return {
        success: false,
        error: "Client not initialized",
        model: this.modelName,
      };
    }
    try {
      const result = await this.client.checkStatus();
      return {
        ...result,
        selectedModel: this.modelName,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: this.modelName,
        provider: this.provider,
      };
    }
  }
}
