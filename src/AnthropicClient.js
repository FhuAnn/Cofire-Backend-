import Anthropic from '@anthropic-ai/sdk';
import { BaseAIClient } from "./BaseAIClient.js";

export class AnthropicClient extends BaseAIClient {
  constructor(apiKey, modelName = "claude-3.5-sonnet") {
    super(apiKey, modelName);
    this.ai = new Anthropic({ apiKey: this.apiKey });
  }

  async generate(prompt, options = {}) {
    const {
      temperature = 0.7,
      max_tokens = 512,
      model = this.modelName
    } = options;

    try {
      const response = await this.ai.messages.create({
        model,
        temperature,
        max_tokens,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return response?.content?.[0]?.text || null;
    } catch (error) {
      console.error("Anthropic generate error:", error);
      throw error;
    }
  }

  async checkStatus() {
    try {
      // Không có endpoint check model cụ thể → gọi thử generate với dummy prompt
      await this.generate("ping", { max_tokens: 1 });
      return { status: "ok", model: this.modelName };
    } catch (error) {
      return { status: "error", error: error.message };
    }
  }
}
