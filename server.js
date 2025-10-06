const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

dotenv.config();
console.log("🔑 Chiave API:", process.env.OPENAI_API_KEY ? "Trovata ✅" : "Mancante ❌");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve index.html, style.css, script.js

// ✅ Serve i PDF staticamente
app.use("/pdf", express.static(path.join(__dirname, "public/pdf")));

// ✅ Endpoint per ottenere lista dei PDF in formato JSON
app.get("/api/pdf/:materia", (req, res) => {
    const materia = req.params.materia;
    const dirPath = path.join(__dirname, "public", "pdf", materia);

    fs.readdir(dirPath, (err, files) => {
        if (err) {
            return res.status(404).json({ error: "Materia non trovata" });
        }

        const pdfFiles = files.filter(file => file.endsWith(".pdf"));
        const links = pdfFiles.map(file => `/pdf/${materia}/${encodeURIComponent(file)}`);
        res.json(links);
    });
});

// ✅ ChatGPT API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage || userMessage.length > 500) {
        return res.status(400).json({ reply: "⚠️ Messaggio non valido." });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }],
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error("❌ Errore OpenAI:", error.response?.data || error.message || error);
        res.status(500).json({ reply: "⚠️ Errore nella risposta AI." });
    }
});

// ✅ Socket.io per chat tra utenti
io.on("connection", (socket) => {
    console.log("🟢 Nuovo utente connesso");

    socket.on("setUsername", (username) => {
        socket.username = username;
        socket.broadcast.emit("userJoined", username); // ✅ Notifica agli altri
    });

    socket.on("chatMessage", (msg) => {
        io.emit("chatMessage", { user: socket.username, text: msg });
    });
});

// ✅ Avvia il server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
