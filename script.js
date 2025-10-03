//  Benvenuto
window.onload = function () {
    console.log("Benvenuto nel mio sito");
};

// Caricamento PDF
document.getElementById("pdfInput").addEventListener("change", function (event) {
    const files = event.target.files;
    const list = document.getElementById("pdfList");
    list.innerHTML = "";

    for (let file of files) {
        if (file.type === "application/pdf") {
            const reader = new FileReader();
            reader.onload = function (e) {
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

//  Fade-in iniziale
document.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = 0;
    setTimeout(() => {
        document.body.style.transition = "opacity 1s ease";
        document.body.style.opacity = 1;
    }, 100);
});

//  Animazione playlist
document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".playlist-card");
    cards.forEach((card, i) => {
        card.style.setProperty("--delay", `${i * 0.2}s`);
    });
});

//  Chat AI con effetto typing
document.querySelector("#sendBtn").addEventListener("click", async () => {
    const input = document.querySelector("#userInput");
    const chatBox = document.querySelector("#chatBox");
    const message = input.value.trim();

    if (!message) return;

    // Messaggio utente
    const userDiv = document.createElement("div");
    userDiv.textContent = `🧑‍💻 ${message}`;
    chatBox.appendChild(userDiv);
    input.value = "";

    // Contenitore risposta AI
    const aiDiv = document.createElement("div");
    aiDiv.textContent = `🤖 `;
    chatBox.appendChild(aiDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        const reply = data.reply;

        // Effetto typing
        let i = 0;
        const typing = setInterval(() => {
            if (i < reply.length) {
                aiDiv.textContent += reply.charAt(i);
                i++;
                chatBox.scrollTop = chatBox.scrollHeight;
            } else {
                clearInterval(typing);
            }
        }, 30);
    } catch (error) {
        aiDiv.textContent += "⚠️ Errore nella risposta AI";
    }
});
