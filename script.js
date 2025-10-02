window.onload = function() {
    console.log("Benvenuto nel sito di Robert!");
};

document.getElementById("pdfInput").addEventListener("change", function(event) {
    const files = event.target.files;
    const list = document.getElementById("pdfList");
    list.innerHTML = "";

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.type === "application/pdf") {
            const reader = new FileReader();

            reader.onload = function(e) {
                const link = document.createElement("a");
                link.href = e.target.result;
                link.textContent = file.name;
                link.target = "_blank";

                const li = document.createElement("li");
                li.appendChild(link);
                list.appendChild(li);
            };

            reader.readAsDataURL(file);
        }
    }
});

window.onload = function() {
    console.log("Benvenuto nel sito di Robert!");
};

document.getElementById("pdfInput").addEventListener("change", function(event) {
    const files = event.target.files;
    const list = document.getElementById("pdfList");
    list.innerHTML = "";

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.type === "application/pdf") {
            const reader = new FileReader();

            reader.onload = function(e) {
                const link = document.createElement("a");
                link.href = e.target.result;
                link.textContent = file.name;
                link.target = "_blank";

                const li = document.createElement("li");
                li.appendChild(link);
                list.appendChild(li);
            };

            reader.readAsDataURL(file);
        }
    }
});

async function sendMessage() {
    const input = document.getElementById("userInput");
    const log = document.getElementById("chat-log");
    const userText = input.value.trim();

    if (!userText) return;

    log.innerHTML += `<div>👤 Tu: ${userText}</div>`;

    const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
    });

    const data = await response.json();
    log.innerHTML += `<div>🤖 ChatGPT: ${data.reply}</div>`;
    input.value = "";
    log.scrollTop = log.scrollHeight;
}
const response = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText })
});

document.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = 0;
    setTimeout(() => {
        document.body.style.transition = "opacity 1s ease";
        document.body.style.opacity = 1;
    }, 100);
});

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".playlist-card");
    cards.forEach((card, i) => {
        card.style.setProperty("--delay", `${i * 0.2}s`);
    });
});

