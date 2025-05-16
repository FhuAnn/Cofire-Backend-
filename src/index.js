const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/suggest', (req, res) => {
    const { language, context } = req.body;
    console.log(`Language: ${language}, Context:\n${context}`);

    // Trả về mock suggestion
    res.json({
        suggestions: [
            {
                label: "for loop ",
                insertText: "for (let i = 0; i < array.length; i++) {\n    // TODO\n}",
                detail: "Generate a basic for loop"
            }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Mock AI server running at http://localhost:${PORT}`);
});
