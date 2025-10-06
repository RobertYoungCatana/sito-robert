const socket = io();
let username = "";
let messageCount = 0;

// Mostra connessione attiva
socket.on("connect", () => {
    console.log("✅ Connessione Socket.io attiva");
});

function setUsername() {
    username = document.getElementById("username").value.trim();
    if (username) {
        socket.emit("setUsername", username);

        // Mostra la chat e il profilo
        document.getElementById("login").style.display = "none";
        document.getElementById("chat").style.display = "block";
        document.getElementById("user-profile").style.display = "flex";
        document.getElementById("user-name").textContent = `👤 ${username}`;
    }
}

function sendMessage() {
    const msg = document.getElementById("message").value.trim();
    if (msg) {
        socket.emit("chatMessage", msg);
        document.getElementById("message").value = "";

        // Aggiorna profilo
        messageCount++;
        document.getElementById("user-messages").textContent = messageCount;
        document.getElementById("user-level").textContent = Math.floor(messageCount / 5) + 1;
    }
}

// Ricevi messaggi
socket.on("chatMessage", (data) => {
    const messages = document.getElementById("messages");
    const msgElement = document.createElement("p");
    msgElement.textContent = `${data.user}: ${data.text}`;
    messages.appendChild(msgElement);
});

// Ricevi notifiche
socket.on("userJoined", (name) => {
    const note = document.createElement("p");
    note.textContent = `🔔 Nuovo utente in chat: ${name}`;
    document.getElementById("notifications").appendChild(note);
});
