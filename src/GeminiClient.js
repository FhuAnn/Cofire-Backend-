import { GoogleGenAI } from "@google/genai";
import { BaseAIClient } from "./BaseAIClient.js";

export class GeminiClient extends BaseAIClient {
  constructor(apiKey, modelName = "gemini-2.0-flash") {
    super(apiKey, modelName);
    this.ai = new GoogleGenAI(apiKey);
  }

  async generate(prompt, options = {}) {
    try {
      const {
        temperature = 0.2,
        maxTokens = 512,
        topP = 0.8,
        topK = 40,
      } = options;

      const generationConfig = {
        temperature,
        topP,
        topK,
        maxOutputTokens: maxTokens,
      };

      const response = await this.ai.models.generateContent({
        contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
        model: this.modelName,
        generationConfig,
      });

      return {
        success: true,
        text: response.text,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
        model: this.modelName,
        provider: "gemini",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: "gemini",
      };
    }
  }

   async generateStream(prompt, options = {}) {
    try {
      const {
        temperature = 0.2,
        maxTokens = 512,
        topP = 0.8,
        topK = 40,
      } = options;

      const generationConfig = {
        temperature,
        topP,
        topK,
        maxOutputTokens: maxTokens,
      };

       const streamResponse = await this.ai.models.generateContentStream({
        contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
        model: this.modelName,
        generationConfig,
      });

      return streamResponse; // Trả về AsyncIterable<StreamChunk>
    } catch (error) {
      throw new Error(`[generateStream] ${error.message}`);
    }
  }

  async checkStatus() {
    try {
      const testResult = await this.ai.models.generateContent({
        contents: [{ role: "user", parts: [{ text: "test" }] }],
        generationConfig: { maxOutputTokens: 5 },
        model: this.modelName,
      });

      if (!testResult || !testResult.text) {
        throw new Error("No response from Gemini API");
      }

      return {
        success: true,
        status: "online",
        model: this.modelName,
        provider: "gemini",
      };
    } catch (error) {
      return {
        success: false,
        status: "offline",
        error: error.message,
        provider: "gemini",
      };
    }
  }
}

