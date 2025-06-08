import { GeminiClient } from "./GeminiClient.js";
import { MODEL_REGISTRY } from "./modelRegistry.js";

export class ModelRouter {
  constructor(modelName, customConfig = {}) {
    this.modelName = modelName || "gemini-2.0-flash";
    this.apiKeys = {
      gemini: process.env.GEMINI_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      claude: process.env.CLAUDE_API_KEY,
      ...customConfig.apiKeys, // Override với custom API keys nếu có
    };
    this.defaultOptions = {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.8,
      topK: 40,
      ...customConfig.defaultOptions, // Override với custom options
    };

    this.client = null;
    this.initializeClient();
  }

  // Lấy thông tin provider từ model name
  getProviderInfo(modelName) {
    const info = MODEL_REGISTRY[modelName];
    if (!info) {
      // Fallback: guess provider từ model name
      if (modelName.includes("gemini"))
        return { provider: "gemini", model: modelName };
      if (modelName.includes("gpt"))
        return { provider: "openai", model: modelName };
      if (modelName.includes("claude"))
        return { provider: "claude", model: modelName };

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
        case "gemini":
          this.client = new GeminiClient(apiKey, model);
          break;
        // case 'openai':
        //   this.client = new OpenAIClient(apiKey, model);
        //   break;
        // case 'claude':
        //   this.client = new ClaudeClient(apiKey, model);
        //   break;
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
      return {
        success: false,
        error: error.message,
        model: this.modelName,
        provider: this.provider,
      };
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
