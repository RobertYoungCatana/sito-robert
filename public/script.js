/* script.js — versione completa per il sito
   - Usa DOMContentLoaded per inizializzare tutto in ordine
   - Tiene funzioni modulari: initPDFs, initPlaylists, initBets, initTimerAndSecret, initSecretGames, initChatIntegration
*/

document.addEventListener('DOMContentLoaded', () => {
    /* ----------------------------- PDF Viewer ----------------------------- */
    (function initPDFs() {
        const viewer = document.getElementById("pdf-viewer");
        const titolo = document.getElementById("titolo-materia");
        const list = document.getElementById("pdf-list");
        if (!viewer || !titolo || !list) {
            // optional: missing elements, skip PDF init
        } else {
            const materie = ["Informatica","Matematica","SistemiEReti","Telecomunicazioni","TPS"];
            materie.forEach(materia => {
                const btn = document.querySelector(`.materia[data-materia="${materia}"]`);
                if (btn) {
                    btn.addEventListener("click", async () => {
                        titolo.textContent = `Appunti di ${materia}`;
                        list.innerHTML = "";
                        try {
                            const res = await fetch(`/api/pdf/${materia}`);
                            const pdfLinks = await res.json();
                            if (!Array.isArray(pdfLinks) || pdfLinks.length === 0) {
                                list.innerHTML = "<li>Nessun PDF trovato</li>";
                            } else {
                                pdfLinks.forEach(link => {
                                    const li = document.createElement("li");
                                    const a = document.createElement("a");
                                    a.href = link;
                                    a.textContent = decodeURIComponent(link.split("/").pop());
                                    a.target = "_blank";
                                    a.rel = "noopener";
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
                }
            });

            // Dashboard PDF count
            const pdfCountEl = document.getElementById("pdf-count");
            if (pdfCountEl) {
                fetch("/api/pdf/SistemiEReti")
                    .then(res => res.json())
                    .then(data => { if (Array.isArray(data)) pdfCountEl.textContent = data.length; })
                    .catch(()=>{/* ignore */});
            }
        }
    })();

    /* --------------------------- Playlist section ------------------------- */
    (function initPlaylists() {
        const cards = document.querySelectorAll(".playlist-card");
        if (!cards || cards.length === 0) return;
        const clicksEl = document.getElementById("playlist-clicks");
        let totalClicks = Number(localStorage.getItem('playlistClicks') || 0);
        if (clicksEl) clicksEl.textContent = totalClicks;

        function loadIframe(wrapper, src) {
            if (!wrapper || wrapper.dataset.loaded === "1") return;
            wrapper.innerHTML = "";
            try {
                const iframe = document.createElement("iframe");
                iframe.src = src;
                iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
                iframe.loading = "lazy";
                iframe.referrerPolicy = "no-referrer";
                iframe.title = "Spotify playlist embed";
                iframe.addEventListener("load", () => { wrapper.dataset.loaded = "1"; });
                wrapper.appendChild(iframe);
            } catch (e) {
                wrapper.innerHTML = '<div class="embed-fallback">Impossibile caricare l\\'embed</div>';
            }
        }

        cards.forEach(card => {
            const wrap = card.querySelector('.playlist-frame-wrap');
            const src = wrap?.dataset?.src;
            const btnOpen = card.querySelector('.playlist-open');
            // enable small link if present
            const linkBtn = card.querySelector('.playlist-link');

            ['mouseenter','focusin','touchstart'].forEach(ev => {
                card.addEventListener(ev, () => { if (src) loadIframe(wrap, src); }, { passive:true });
            });

            btnOpen?.addEventListener('click', (e) => {
                e.preventDefault();
                if (!src) return;
                const webUrl = src.replace('/embed','');
                window.open(webUrl, '_blank', 'noopener');
                totalClicks++;
                localStorage.setItem('playlistClicks', totalClicks);
                if (clicksEl) clicksEl.textContent = totalClicks;
            });

            linkBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                if (!src) return;
                window.open(src.replace('/embed',''), '_blank', 'noopener');
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btnOpen?.click();
                }
            });
        });

        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries, observer) => {
                entries.forEach(en => {
                    if (en.isIntersecting) {
                        const w = en.target.querySelector('.playlist-frame-wrap');
                        const s = w?.dataset?.src;
                        if (s) loadIframe(w, s);
                        observer.unobserve(en.target);
                    }
                });
            }, { rootMargin: "200px 0px" });
            cards.forEach(c => io.observe(c));
        } else {
            cards.forEach(c => {
                const w = c.querySelector('.playlist-frame-wrap');
                const s = w?.dataset?.src;
                if (s) loadIframe(w, s);
            });
        }
    })();

    /* ----------------------------- Scommesse ----------------------------- */
    (function initBets() {
        const betSection = document.getElementById('scommesse');
        if (!betSection) return;
        // ensure only logo-link remains clickable and attributes correct
        betSection.querySelectorAll('.bet-card').forEach(card => {
            // remove other anchors
            card.querySelectorAll('a').forEach(a => {
                if (!a.classList.contains('bet-logo-link')) a.remove();
            });
            const logoLink = card.querySelector('.bet-logo-link');
            if (logoLink) {
                if (!logoLink.hasAttribute('target')) logoLink.setAttribute('target','_blank');
                if (!logoLink.hasAttribute('rel')) logoLink.setAttribute('rel','noopener');
                // Ensure link covers only the logo
                logoLink.style.pointerEvents = 'auto';
            }
            // ensure images lazy load and visible
            const img = card.querySelector('.bet-logo img');
            if (img) {
                img.loading = 'lazy';
                img.style.display = 'block';
                img.style.objectFit = 'contain';
                img.addEventListener('error', () => {
                    img.style.display = 'none';
                    const container = card.querySelector('.bet-logo');
                    if (container && !container.querySelector('.logo-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'logo-fallback';
                        fallback.textContent = card.querySelector('.bet-title')?.textContent || 'Provider';
                        fallback.style.color = 'var(--muted-text)';
                        fallback.style.fontWeight = '700';
                        container.appendChild(fallback);
                    }
                });
            }
        });
    })();

    /* ------------------------ Timer / Zona Segreta ------------------------ */
    (function initTimerAndSecret() {
        const TOTAL_SECONDS = 5 * 60; // customize duration
        const LS_KEY_UNLOCK = 'segretoSbloccato_v1';
        const LS_KEY_END = 'segreto_end_ts_v1';

        const segretoEl = document.getElementById('segreto');
        const unlockEl = document.getElementById('unlock-timer');
        const timeLeftEl = document.getElementById('time-left');
        const progressFill = document.getElementById('progress-fill');
        const skipBtn = document.getElementById('skip-wait');

        function revealSecret() {
            if (unlockEl) unlockEl.style.display = 'none';
            if (segretoEl) segretoEl.style.display = 'block';
            // initialize secret games after reveal
            if (window.initSecretGames) window.initSecretGames();
        }

        if (!segretoEl || !unlockEl || !timeLeftEl || !progressFill) {
            // missing required elements: skip timer init
            return;
        }

        if (localStorage.getItem(LS_KEY_UNLOCK) === 'true') {
            progressFill.style.width = '100%';
            timeLeftEl.textContent = '0:00';
            revealSecret();
            return;
        }

        let endTs = Number(localStorage.getItem(LS_KEY_END) || 0);
        const now = Date.now();
        if (!endTs || endTs <= now) {
            endTs = now + TOTAL_SECONDS * 1000;
            localStorage.setItem(LS_KEY_END, String(endTs));
        }

        const tick = () => {
            const remainingMs = Math.max(0, endTs - Date.now());
            const remainingSec = Math.ceil(remainingMs / 1000);
            const minutes = Math.floor(remainingSec / 60);
            const seconds = remainingSec % 60;
            timeLeftEl.textContent = `${minutes}:${String(seconds).padStart(2,'0')}`;

            const elapsed = TOTAL_SECONDS - remainingSec;
            const pct = Math.min(100, Math.max(0, (elapsed / TOTAL_SECONDS) * 100));
            progressFill.style.width = `${pct}%`;
            progressFill.setAttribute('aria-valuenow', Math.round(pct));

            if (remainingSec <= 0) {
                clearInterval(intervalId);
                localStorage.setItem(LS_KEY_UNLOCK, 'true');
                localStorage.removeItem(LS_KEY_END);
                revealSecret();
                setTimeout(()=> alert('🎉 Hai sbloccato la Sala Giochi Segreta!'), 200);
            }
        };

        tick();
        const intervalId = setInterval(tick, 1000);

        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                clearInterval(intervalId);
                localStorage.setItem(LS_KEY_UNLOCK, 'true');
                localStorage.removeItem(LS_KEY_END);
                progressFill.style.width = '100%';
                timeLeftEl.textContent = '0:00';
                revealSecret();
            });
        }

        // dev helper
        window.__resetSegretoState = function() {
            localStorage.removeItem(LS_KEY_UNLOCK);
            localStorage.removeItem(LS_KEY_END);
            location.reload();
        };
    })();

    /* -------------------------- Secret Games ----------------------------- */
    (function defineSecretGames() {
        function initSecretGames() {
            if (initSecretGames._done) return;
            initSecretGames._done = true;

            /* ----- RPS ----- */
            (function(){
                const youEl = document.getElementById('rps-you');
                const cpuEl = document.getElementById('rps-cpu');
                const status = document.querySelector('#game-rps .rps-status');
                if (!youEl || !cpuEl || !status) return;
                let you = 0, cpu = 0;
                function cpuMove(){ return ['rock','paper','scissors'][Math.floor(Math.random()*3)]; }
                function result(u,c){
                    if(u===c) return 'Pareggio';
                    if((u==='rock'&&c==='scissors')||(u==='paper'&&c==='rock')||(u==='scissors'&&c==='paper')) return 'Hai vinto';
                    return 'CPU vince';
                }
                document.querySelectorAll('.rps-btn').forEach(btn=>{
                    btn.addEventListener('click', ()=>{
                        const u = btn.dataset.move;
                        const c = cpuMove();
                        const res = result(u,c);
                        if(res==='Hai vinto') you++;
                        else if(res==='CPU vince') cpu++;
                        youEl.textContent = you;
                        cpuEl.textContent = cpu;
                        status.textContent = `${res} — Tu: ${u.toUpperCase()} · CPU: ${c.toUpperCase()}`;
                    });
                });
                const rpsReset = document.querySelector('.game-reset[data-game="rps"]');
                if (rpsReset) rpsReset.addEventListener('click', ()=>{ you=0; cpu=0; youEl.textContent=0; cpuEl.textContent=0; status.textContent='Scegli una mossa'; });
            })();

            /* ----- Tic Tac Toe ----- */
            (function(){
                const boardEls = Array.from(document.querySelectorAll('.ttt-cell'));
                const turnEl = document.getElementById('ttt-turn');
                const statusEl = document.getElementById('ttt-status');
                if (!boardEls.length || !turnEl || !statusEl) return;
                let board = Array(9).fill(null);
                let turn = 'X';
                let over = false;
                function checkWinner(b){
                    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
                    for(const [a,b1,c] of lines){
                        if(b[a] && b[a]===b[b1]&&b[a]===b[c]) return b[a];
                    }
                    return b.includes(null)? null : 'draw';
                }
                function render(){
                    boardEls.forEach((el,i)=> el.textContent = board[i] || '');
                    turnEl.textContent = turn;
                }
                function cpuPlay(){
                    if(over) return;
                    const free = board.map((v,i)=> v===null? i : null).filter(v=>v!==null);
                    if(!free.length) return;
                    const idx = free[Math.floor(Math.random()*free.length)];
                    board[idx] = 'O';
                    const w = checkWinner(board);
                    if(w){ over = true; statusEl.textContent = w==='draw' ? 'Pareggio' : `${w} ha vinto`; render(); return; }
                    turn = 'X';
                    render();
                }
                boardEls.forEach((el, i)=>{
                    el.addEventListener('click', ()=> {
                        if(over || board[i]) return;
                        board[i] = 'X';
                        const w = checkWinner(board);
                        if(w){ over = true; statusEl.textContent = w==='draw' ? 'Pareggio' : `${w} ha vinto`; render(); return; }
                        turn = 'O';
                        render();
                        setTimeout(cpuPlay, 350);
                    });
                });
                const tttReset = document.querySelector('.game-reset[data-game="ttt"]');
                if (tttReset) tttReset.addEventListener('click', ()=>{ board = Array(9).fill(null); turn='X'; over=false; statusEl.textContent='Inizia tu'; render(); });
                render();
            })();

            /* ----- Memory ----- */
            (function(){
                const EMOJIS = ['🍕','🎧','⚽️','🎮','☕️','🌊'];
                const grid = document.getElementById('memory-grid');
                const movesEl = document.getElementById('mem-moves');
                const pairsEl = document.getElementById('mem-pairs');
                if (!grid || !movesEl || !pairsEl) return;
                let deck = [];
                let revealed = [];
                let matched = 0;
                let moves = 0;
                let lock = false;
                function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }
                function build(){
                    deck = shuffle([...EMOJIS, ...EMOJIS]);
                    grid.innerHTML = '';
                    deck.forEach((val,idx)=>{
                        const btn = document.createElement('button');
                        btn.className = 'memory-tile';
                        btn.dataset.index = idx;
                        btn.dataset.val = val;
                        btn.innerHTML = '';
                        btn.addEventListener('click', onTileClick);
                        grid.appendChild(btn);
                    });
                    revealed = []; matched = 0; moves = 0;
                    movesEl.textContent = moves; pairsEl.textContent = matched;
                }
                function onTileClick(e){
                    if(lock) return;
                    const b = e.currentTarget;
                    if(b.classList.contains('revealed')) return;
                    b.classList.add('revealed');
                    b.textContent = b.dataset.val;
                    revealed.push({ el: b, val: b.dataset.val });
                    if(revealed.length === 2){
                        moves++;
                        movesEl.textContent = moves;
                        const [a,bf] = revealed;
                        if(a.val === bf.val){
                            matched++;
                            pairsEl.textContent = matched;
                            revealed = [];
                            if(matched === EMOJIS.length){
                                setTimeout(()=> alert(`Hai trovato tutte le coppie in ${moves} mosse!`), 200);
                            }
                        } else {
                            lock = true;
                            setTimeout(()=>{
                                a.el.classList.remove('revealed'); a.el.textContent = '';
                                bf.el.classList.remove('revealed'); bf.el.textContent = '';
                                revealed = []; lock = false;
                            }, 700);
                        }
                    }
                }
                const memReset = document.querySelector('.game-reset[data-game="memory"]');
                if (memReset) memReset.addEventListener('click', build);
                build();
            })();

            // focus primo gioco per accessibilità
            const firstGame = document.querySelector('#secret-games .game-card');
            if (firstGame) firstGame.focus?.();
        } // end initSecretGames

        // expose globally
        window.initSecretGames = initSecretGames;

        // auto-init if #segreto already visible at load
        const segEl = document.getElementById('segreto');
        if (segEl && getComputedStyle(segEl).display !== 'none') {
            initSecretGames();
        }
    })();

    /* --------------------------- Chat integration ------------------------- */
    (function initChatIntegration() {
        // If your chat code is in separate file that auto-inits, skip.
        // Here we expose a safe init hook that other chat script can call.
        window.initChatIntegration = function() {
            // placeholder: if chat.js exposes initChat, call it
            if (typeof window.initChat === 'function') {
                try { window.initChat(); } catch(e){ console.warn('initChat error', e); }
            }
            // else, nothing to do; chat scripts should self-init or call this hook
        };
        // try to auto-invoke if possible
        setTimeout(()=>{ if (typeof window.initChat === 'function') window.initChat(); }, 500);
    })();

    /* ------------------------- Event delegation --------------------------- */
    // Delegation fallback: if individual game listeners weren't attached, forward clicks
    (function setupDelegationFallback() {
        const secret = document.getElementById('segreto');
        if (!secret) return;
        secret.addEventListener('click', (e) => {
            const rpsBtn = e.target.closest('.rps-btn');
            if (rpsBtn) rpsBtn.dispatchEvent(new Event('click', { bubbles: true }));

            const tttCell = e.target.closest('.ttt-cell');
            if (tttCell) tttCell.dispatchEvent(new Event('click', { bubbles: true }));

            const memTile = e.target.closest('.memory-tile');
            if (memTile) memTile.dispatchEvent(new Event('click', { bubbles: true }));

            const playBtn = e.target.closest('.play-btn');
            if (playBtn) playBtn.dispatchEvent(new Event('click', { bubbles: true }));
        }, { passive: true });
    })();

    /* ------------------------------ Cleanup ------------------------------- */
    // Ensure no global overlay blocks clicks on secret area
    (function ensurePointerEvents() {
        const secret = document.getElementById('segreto');
        if (!secret) return;
        // Best-effort: clear pointer-events blockers for secret area
        secret.style.pointerEvents = 'auto';
        secret.querySelectorAll('*').forEach(el => { el.style.pointerEvents = 'auto'; });
        // Also ensure body overlays do not intercept
        try {
            const before = getComputedStyle(document.body, '::before');
            // can't directly modify pseudo-element; we rely on global CSS earlier setting pointer-events:none
        } catch(e){}
    })();

    /* ------------------------------ End ---------------------------------- */
}); // DOMContentLoaded end
```