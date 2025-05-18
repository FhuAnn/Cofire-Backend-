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
  console.log(`Language: ${language}, Context:\n${context}`);

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
  console.log(prompt, language, context);
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
    console.log("code", code);

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

    res.json({ suggestion : code });
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
    console.log(result);
    if (result.candidates?.length > 0) {
      res.json({ status: "ready" });
    } else {
      res.status(500).json({ status: "not_ready" });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`Mock AI server running at http://localhost:${PORT}`);
});
