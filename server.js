const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }]
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error("Errore OpenAI:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log("✅ Server avviato su http://localhost:3000"));
