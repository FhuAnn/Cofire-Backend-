import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import api from "./apis/index.js";
//import  { GoogleGenerativeAI } from "@google/generative-ai";
import { ModelRouter } from "./modelRouter.js";
import { MODEL_REGISTRY, getModelByProvider } from "./modelRegistry.js";
import "./auth/github.js";
import dotenv from "dotenv";
dotenv.config();
import connectToDb from "./config/db.js";

const app = express();
const PORT = 5000;

connectToDb();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      name: "connect.sid",
      path: "/",
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// API routes
api(app);

let modelRouter = new ModelRouter();

//AndreNguyen: get list models from provider
app.post("/list-models", async (req, res) => {
  const { provider, APIKey } = req.body;
  console.log(provider, APIKey);
  if (!provider || !APIKey)
    return res
      .status(404)
      .json({ success: false, message: "provider and APIKey is required" });
  try {
    let models = [];

    if (provider === "OpenAI") {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${APIKey}` },
      });
      const data = await response.json();
      models = data.data.map((m) => ({ value: m.id, label: m.id }));
    }

    if (provider === "Gemini") {
      models = [
        { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
        { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
        { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
        {
          value: "gemini-2.5-flash-preview-05-20",
          label: "Gemini 2.5 Flash Preview 05 20",
        },
      ];
    }

    if (provider === "Anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/models", {
        headers: {
          "x-api-key": APIKey,
          "anthropic-version": "2023-06-01",
        },
      });
      const data = await response.json();

      models = data.models.map((m) => ({
        value: m.name,
        label: m.name,
      }));
    }

    res.json({ success: true, models });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AndreNguyen: check api key provider valid
app.post("/check-api-key", async (req, res) => {
  try {
    const { provider, APIKey } = req.body;
    if (!provider || !APIKey)
      return res
        .status(404)
        .json({ success: false, message: "provider and APIKey is required" });

    //console.log("Checking API key for provider:", provider, "APIKey:", APIKey);

    const testProviderModel = getModelByProvider(provider);

    const customConfig = APIKey ? { apiKeys: { [provider]: APIKey } } : {}; // Nếu không có APIKey, dùng mặc định
    console.log("Custom config for modelRouter:", customConfig);
    const test = new ModelRouter(testProviderModel, customConfig);

    const status = await test.checkStatus();

    console.log("Model status:", status);

    if (!status.success) {
      return res.status(400).json({ error: status.error });
    }

    return res.json({
      status: "ready",
      provider,
    });
  } catch (err) {
    console.error("Error in /check-api-key:", err);
    return res.status(500).json({ error: err.message, status: "error" });
  }
});

// AndreNguyen: update model selected
app.post("/update-model-system", async (req, res) => {
  const { selectedModel, provider } = req.body;
  if (!selectedModel || !provider)
    return res.status(404).json({
      success: false,
      message: "selectedModel and provider is required",
    });
  try {
    // Lấy APIKey từ biến môi trường tương ứng
    const APIKey = process.env[`${provider}_API_KEY`];

    if (!APIKey) {
      return res
        .status(400)
        .json({ error: `Missing API key for provider: ${provider}` });
    }

    const newCustomConfig = {
      defaultOptions: {
        provider: provider,
      },
      apiKeys: {
        [provider]: APIKey,
      },
    };

    modelRouter.updateModel(selectedModel, newCustomConfig);
    console.log(`Backend ::: Model system updated to: ${selectedModel}`);

    const status = await modelRouter.checkStatus();
    console.log("Backend ::: Model system status:", status);

    res.json({ message: `Model system updated to: ${selectedModel}`, status });
  } catch (err) {
    console.error("Update model system failed:", err);
    res
      .status(500)
      .json({ message: "Failed to update model system", error: err.message });
  }
});

app.post("/update-model-user", async (req, res) => {
  const { selectedModel, provider, APIKey } = req.body;
  if (!selectedModel || !provider || !APIKey)
    return res.status(404).json({
      success: false,
      message: "selectedModel and provider, APIKey is required",
    });
  const newCustomConfig = {
    defaultOptions: {
      provider: provider,
    },
    apiKeys: {
      [provider]: APIKey,
    },
  };

  try {
    modelRouter.updateModel(selectedModel, newCustomConfig);
    console.log(`Backend ::: Model user updated to: ${selectedModel}`);

    const status = await modelRouter.checkStatus();
    console.log("Backend ::: Model user status:", status);

    res.json({ message: `Model user updated to: ${selectedModel}`, status });
  } catch (err) {
    console.error("Update model failed:", err);
    res
      .status(500)
      .json({ message: "Failed to update model", error: err.message });
  }
});

app.post("/suggest", (req, res) => {
  const { language, context } = req.body;
  //console.log(`Language: ${language}, Context:\n${context}`);
  if (!language || !context)
    return res.status(404).json({
      success: false,
      message: "language and context is required",
    });
  // Trả về mock suggestion
  res.json({
    suggestions: [
      {
        label: "for loop ",
        insertText:
          "for (let i = 0; i < array.lenpngth; i++) {\n    // TODO\n}",
        detail: "Generate a basic for loop",
      },
    ],
  });
});

app.post("/manual-prompt", async (req, res) => {
  const { prompt, language, context } = req.body;
  if (!prompt || !language || !context)
    return res.status(404).json({
      success: false,
      message: "prompt, language and context is required",
    });
  //console.log(prompt, language, context);
  const fullPrompt = `
You're an AI code assistant.

Language: ${language}
Context near the cursor:
${context}

User's request:
${prompt}

Only return raw code. Do not use markdown. Do not use triple backticks ('''). Just return plain text.
`.trim();
  try {
    const response = await modelRouter.generate(fullPrompt);

    const code = response.text.trim();
    //g("code", code);

    res.json({ data: code });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

app.post("/suggest-typing", async (req, res) => {
  const { language, context } = req.body;
  if (!language || !context)
    return res
      .status(404)
      .json({ success: false, message: "language and context is required" });
  const fullPrompt = `
You are an intelligent AI coding assistant. 
Based on the programming language and the given code context, suggest the next logical line of code that a developer might write. 
Focus on completing or continuing functions, expressions, or logic in a natural and syntactically correct way.

Language: ${language}
Code Context (before cursor):
${context}

Only return raw single line of code as the next suggestion. Do not use markdown. Do not use triple backticks ('''). Just return plain text.
`.trim();

  try {
    const response = await modelRouter.generate(fullPrompt);

    const code = response.text.trim();

    res.json({ suggestion: code });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

app.get("/status", async (req, res) => {
  try {
    const result = await modelRouter.checkStatus();

    console.log("Status check result:", result);

    if (result.success) {
      res.json({ status: "ready", model: result.selectedModel });
    } else {
      res.status(500).json({ status: "not_ready", error: result.error });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/suggest-block", async (req, res) => {
  const { language, context } = req.body;
  if (!language || !context)
    return res
      .status(400)
      .json({ success: false, message: "language and context is required" });

  const prompt = `
You are an expert coding assistant.
Given the following programming language and a partial description or code block, generate a complete, syntactically correct, and logically meaningful code block (function, method, or class).

Language: ${language}
Input:
${context}

→ Completed Code Block:
`.trim();

  try {
    const response = await modelRouter.generate(prompt);
    const result = response.text.trim();

    res.json({ code: result });
  } catch (error) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ message: "Failed to get suggestion from Gemini" });
  }
});

app.post("/explain-code", async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language)
    return res
      .status(400)
      .json({ success: false, message: "code and language is required" });

  const fullPrompt = `
Giải thích đoạn mã sau bằng ngôn ngữ tự nhiên, mạch lạc và chi tiết. Không sử dụng định dạng markdown như tiêu đề, danh sách đánh số hay in đậm. Tuy nhiên, hãy làm nổi bật các thành phần mã (tên hàm, thẻ HTML, biến, thuộc tính, v.v.) bằng cách đặt chúng trong dấu \` \`. Tránh các cụm từ như "tôi sẽ giải thích", "chúng ta cùng xem", hoặc những nhận xét mang tính cảm thán. Chỉ tập trung giải thích chức năng và cách hoạt động của đoạn mã.

Ngôn ngữ: ${language}
Đoạn mã:
${code}

Giải thích:
`.trim();

  try {
    const response = await modelRouter.generate(fullPrompt);
    const explanation = response.text.trim();
    res.json({ data: explanation });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ error: "Gemini failed to explain code." });
  }
});
app.post("/generate-file-from-prompt", async (req, res) => {
  const { prompt, language } = req.body;
  if (!prompt || !language)
    return res
      .status(400)
      .json({ success: false, message: "prompt and language is required" });

  const fullPrompt = `
You are an expert software engineer AI assistant.
Given the following prompt, generate a full working code block.
Prompt: ${prompt}
Language: ${language || "auto-detect"}

Respond with code only, properly formatted.
`.trim();

  try {
    const response = await modelRouter.generate(fullPrompt);
    console.log("Backend :::: response", response);
    const result = response.text.trim();

    res.json({ data: result });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ message: "Failed to generate code" });
  }
});

app.post("/api/chat", async (req, res) => {
  const { fullPrompt } = req.body;

  if (!fullPrompt) {
    return res
      .status(400)
      .json({ success: false, message: " fullPrompt is required" });
  }

  try {
    const response = await modelRouter.generate(fullPrompt);
    console.log("Backend :::: response", response);
    const result = response.text.trim();
    //console.log("Backend api chat:::: result", result);
    res.json({ data: result });
  } catch (error) {
    console.error(
      `AI Error in ${error.file || "index.js"}:`,
      error.message,
      error.stack
    );
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
      file: error.file || "index.js",
      stack: error.stack, // Trả stack trace cho frontend (chỉ trong môi trường dev)
    });
  }
});

// chat sreaming
// Streaming chat - dòng văn bản từng chunk cho client
app.post("/api/streaming-chat", async (req, res) => {
  const { fullPrompt } = req.body;
  if (!fullPrompt) {
    return res.status(400).json({ message: "fullPrompt is required" });
  }

  try {
    // Thiết lập header để hỗ trợ stream trong VSCode hoặc trình duyệt
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Gọi stream từ modelRouter
    const result = await modelRouter.generateStream(fullPrompt);

    if (!result.success || !result.stream) {
      res.write("Streaming failed to start.");
      return res.end();
    }

    const stream = result.stream;

    for await (const chunk of stream) {
      const text = chunk.text || chunk.candidates?.[0]?.content || "";
      if (text) {
        res.write(text); // hoặc thêm `+ '\n'` nếu client cần newline để phân biệt
      }
    }

    res.end(); // Kết thúc stream
  } catch (error) {
    console.error("Streaming error:", error.message);
    res.status(500).end("Streaming failed");
  }
});

app.post("/api/inline-completion", async (req, res) => {
  const { full, language, codeUntilCursor } = req.body;
  console.log("api/inline-completiont", full, codeUntilCursor, language);
  if (!full || !codeUntilCursor || !language) {
    return res
      .status(400)
      .json({ message: " full and codeUntilCursor and language is required" });
  }
  const fullPrompt = `
  You are an expert developer assistant.

Given the following context, continue writing the code at the cursor position.
- Only return the next lines of code that should come after the cursor.
- Do NOT include any explanations, comments, or markdown formatting (such as triple backticks or language tags).
- Output ONLY valid code for the language: ${language}.

Full file content:
${full}

Code until cursor:
${codeUntilCursor}

Continue from here:
`;
  try {
    const response = await modelRouter.generate(fullPrompt, {
      temperature: 0.5,
      maxTokens: 100,
    });
    const code = response.text.trim();
    res.json({ data: code });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ message: "Failed to generate code" });
  }
});
app.listen(PORT, () => {
  console.log(`Mock AI server running at http://localhost:${PORT}`);
});
