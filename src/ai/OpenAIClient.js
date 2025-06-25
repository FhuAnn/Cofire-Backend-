import { OpenAI } from "openai";
import { BaseAIClient } from "../ai/BaseAIClient.js";

export class OpenAIClient extends BaseAIClient {
  constructor(apiKey, modelName = "gpt-4o") {
    super(apiKey, modelName);
    this.ai = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  async generate(prompt, options = {}) {
    const {
      temperature = 0.7,
      max_tokens = 512,
      model = this.modelName,
    } = options;

    try {
      const response = await this.ai.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens,
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error("OpenAI generate error:", error);
      throw error;
    }
  }

  async checkStatus() {
    try {
      // Gọi một request đơn giản để kiểm tra API key hoạt động
      await this.ai.models.retrieve(this.modelName);
      return { status: "ok", model: this.modelName, success: true };
    } catch (error) {
      return { status: "error", error: error.message, success: false };
    }
  }
}
