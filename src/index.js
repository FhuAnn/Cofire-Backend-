const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
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

app.listen(PORT, () => {
  console.log(`Mock AI server running at http://localhost:${PORT}`);
});
