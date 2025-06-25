export class BaseAIClient {
    constructor(apiKey, modelName) {
        if (!apiKey) {
            throw new Error("API key is required");
        }
        this.apiKey = apiKey;
        this.modelName = modelName || "gemini-2.0-flash";
    }

    async generate(prompt, options = {}) {
        throw new Error("Method 'generate' must be implemented in subclass");
    }

    async generateStream(prompt, options = {}) {
    throw new Error("Method 'generateStream' must be implemented in subclass");
  }

    async checkStatus() {
        throw new Error("Method 'checkStatus' must be implemented in subclass");
    }
}
