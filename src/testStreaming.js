import { GoogleGenAI } from '@google/genai';

// Khởi tạo client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  const response = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: "Explain how AI works",
  });

  for await (const chunk of response) {
    console.log(chunk.text);
  }
}

await main();