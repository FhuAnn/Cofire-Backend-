const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ModelRouter } = require("./modelRouter.js");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

let modelRouter = new ModelRouter();

// AndreNguyen: update model selected
app.post("/update-model", async (req, res) => {
  const { selectedModel } = req.body;
  modelRouter.updateModel(selectedModel);
  console.log(`Backend :::  Model updated to: ${selectedModel}`);
  const status = await modelRouter.checkStatus();
  console.log("Backend ::: Model status:", status);
  res.json({ message: `Model updated to: ${selectedModel}` });
});

app.post("/suggest", (req, res) => {
  const { language, context } = req.body;
  //console.log(`Language: ${language}, Context:\n${context}`);

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
    return res.status(404).json({ message: "khong du bien" });
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
    return res.status(400).json({ message: "Missing input" });

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
    return res.status(400).json({ message: "Missing code or language" });

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
  if (!prompt) return res.status(400).json({ message: "Missing prompt" });

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
  console.log("api/chat", fullPrompt);
  if (!fullPrompt) {
    return res.status(400).json({ message: " fullPrompt is required" });
  }

  try {
    const response = await modelRouter.generate(fullPrompt);
    console.log("Backend :::: response", response);
    const result = response.text.trim();
    //console.log("Backend api chat:::: result", result);
    res.json({ data: result });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ message: "Failed to generate code" });
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

let timeoutId = null;

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
    console.log(`codeeeeeee: ${code}`);
    res.json({ data: code });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ message: "Failed to generate code" });
  }
});
app.listen(PORT, () => {
  console.log(`Mock AI server running at http://localhost:${PORT}`);
});
