document.addEventListener("DOMContentLoaded", () => {
    // 📚 Appunti
    const viewer = document.getElementById("pdf-viewer");
    const titolo = document.getElementById("titolo-materia");
    const list = document.getElementById("pdf-list");

    document.querySelectorAll(".materia").forEach(btn => {
        btn.addEventListener("click", async () => {
            const materia = btn.dataset.materia;
            titolo.textContent = `Appunti di ${materia}`;
            list.innerHTML = "";

            try {
                const res = await fetch(`/api/pdf/${materia}`);
                const pdfLinks = await res.json();

                if (pdfLinks.length === 0) {
                    list.innerHTML = "<li>Nessun PDF trovato</li>";
                } else {
                    pdfLinks.forEach(link => {
                        const li = document.createElement("li");
                        const a = document.createElement("a");
                        a.href = link;
                        a.textContent = decodeURIComponent(link.split("/").pop());
                        a.target = "_blank";
                        li.appendChild(a);
                        list.appendChild(li);
                    });
                }

                viewer.style.display = "block";
                viewer.scrollIntoView({ behavior: "smooth" });
            } catch (err) {
                list.innerHTML = "<li>⚠️ Errore nel caricamento dei PDF</li>";
                viewer.style.display = "block";
            }
        });
    });

    // 📊 Dashboard
    fetch("/api/pdf/SistemiEReti")
        .then(res => res.json())
        .then(data => {
            document.getElementById("pdf-count").textContent = data.length;
        });

    document.getElementById("chat-users").textContent = Math.floor(Math.random() * 5) + 1;

    let clicks = 0;
    document.querySelectorAll("#playlist iframe").forEach(frame => {
        frame.addEventListener("click", () => {
            clicks++;
            document.getElementById("playlist-clicks").textContent = clicks;
        });
    });

    // ⏱️ Timer + barra + sblocco
    const totalSeconds = 5 * 60;
    let secondsLeft = totalSeconds;

    const timeDisplay = document.getElementById("time-left");
    const progressFill = document.getElementById("progress-fill");

    if (localStorage.getItem("segretoSbloccato")) {
        document.getElementById("segreto").style.display = "block";
        document.getElementById("unlock-timer").style.display = "none";
        progressFill.style.width = "100%";
        timeDisplay.textContent = "0:00";
    } else {
        const timer = setInterval(() => {
            secondsLeft--;

            const minutes = Math.floor(secondsLeft / 60);
            const seconds = secondsLeft % 60;
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

            const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
            progressFill.style.width = `${progress}%`;

            if (secondsLeft <= 0) {
                clearInterval(timer);
                document.getElementById("segreto").style.display = "block";
                document.getElementById("unlock-timer").style.display = "none";
                localStorage.setItem("segretoSbloccato", "true");
                alert("🎉 Hai sbloccato la Sala Giochi Segreta!");
            }
        }, 1000);
    }
});
