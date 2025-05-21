const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

→ Respond with appropriate code only.
`.trim();
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(fullPrompt);

    const response = await result.response;
    const code = response.text().trim();
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

Only return a single line of code as the next suggestion.
`.trim();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(fullPrompt);

    const response = await result.response;
    const code = response.text().trim();

    res.json({ suggestion: code });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

app.get("/status", async (req, res) => {
  try {
    const geminiRes = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "ping" }] }],
      }),
    });

    const result = await geminiRes.json();
    //console.log(result);
    if (result.candidates?.length > 0) {
      res.json({ status: "ready" });
    } else {
      res.status(500).json({ status: "not_ready" });
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro" });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    res.json({ code: text.trim() });
  } catch (error) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ message: "Failed to get suggestion from Gemini" });
  }
});

app.listen(PORT, () => {
  console.log(`Mock AI server running at http://localhost:${PORT}`);
});
app.post("/explain-code", async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language)
    return res.status(400).json({ message: "Missing code or language" });

  const fullPrompt = `
Bạn là một lập trình viên AI thông minh.
Hãy giải thích đoạn mã sau bằng ngôn ngữ tự nhiên, rõ ràng, chi tiết, và dễ hiểu cho người học.

Ngôn ngữ: ${language}
Đoạn mã:
${code}

Giải thích:
`.trim();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const explanation = response.text().trim();
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const code = response.text().trim();

    res.json({ data: code });
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const code = response.text().trim();

    res.json({ data: code });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ message: "Failed to generate code" });
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
You are a senior developer assistant.

Continue writing the following code, without any explanation or extra text. Only return the code content that should come next, based on the context:
\`\`\`
Language:
\`\`\`${language}

\`\`\`
Full file text:
\`\`\`
${full}
\` Code until cursor:
${codeUntilCursor}
\`\`\`
Just retun only code
`;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 100,
      },
    });
    const response = await result.response;
    const code = response.text().trim();

    res.json({ data: code });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ message: "Failed to generate code" });
  }
});
