const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve i file statici dalla cartella "public"
app.use(express.static(path.join(__dirname, 'public')));

// Route esplicita per la homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server attivo su http://localhost:${PORT}`);
});

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const axios = require('axios');
require('dotenv').config();

app.use(express.json());
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: userMessage }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Errore nella richiesta a OpenAI:', error.message);
        res.status(500).json({ error: 'Errore nella chat AI' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
