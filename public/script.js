document.addEventListener("DOMContentLoaded", () => {
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
});
