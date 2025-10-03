const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve i file statici dalla cartella "public"
app.use(express.static('public'));

// Route di fallback per la homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});
