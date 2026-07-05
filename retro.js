// ============================================================
// RETRO 2010 MODE – toggle, Winamp widget & cursor sparkles
// Classic script (defer). The theme itself lives in retro.css
// under .retro-mode; bg3d.js listens for the "retromode" event
// to recolor the 3D scene.
// ============================================================
(function () {
    'use strict';

    const btn = document.getElementById('retro-toggle');
    if (!btn) return;

    const html = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

    // ---------------- Cursor sparkles ----------------
    let sparkleLayer = null;
    let lastSparkleTs = 0;
    let aliveSparkles = 0;
    const MAX_SPARKLES = 25;

    function onSparkleMove(e) {
        const now = performance.now();
        if (now - lastSparkleTs < 40 || aliveSparkles >= MAX_SPARKLES) return;
        lastSparkleTs = now;

        const s = document.createElement('span');
        s.className = 'sparkle';
        s.textContent = '✦';
        s.style.left = (e.clientX + 6) + 'px';
        s.style.top = (e.clientY + 6) + 'px';
        aliveSparkles++;
        s.addEventListener('animationend', function () {
            s.remove();
            aliveSparkles--;
        });
        sparkleLayer.appendChild(s);
    }

    function enableSparkles() {
        if (reducedMotion || coarsePointer) return;
        if (!sparkleLayer) {
            sparkleLayer = document.createElement('div');
            sparkleLayer.className = 'sparkle-layer';
            sparkleLayer.setAttribute('aria-hidden', 'true');
            document.body.appendChild(sparkleLayer);
        }
        window.addEventListener('pointermove', onSparkleMove, { passive: true });
    }

    function disableSparkles() {
        window.removeEventListener('pointermove', onSparkleMove);
        if (sparkleLayer) sparkleLayer.textContent = '';
        aliveSparkles = 0;
    }

    // ---------------- Winamp widget ----------------
    let winamp = null;
    let visCtx = null;
    let visRaf = null;
    let visLastTs = 0;
    let visT = 0;
    const BAR_COUNT = 18;
    let barPhases = [];

    function buildWinamp() {
        winamp = document.createElement('div');
        winamp.className = 'winamp';
        winamp.setAttribute('role', 'presentation');
        winamp.innerHTML =
            '<div class="winamp-titlebar"><span>Winamp</span>' +
            '<button class="winamp-close" aria-label="Cerrar / Close">✕</button></div>' +
            '<div class="winamp-lcd"><div class="winamp-marquee">' +
            '<span>DJ CAPI — HOUSE SET 2010 ★★★ it really whips the llama&#39;s ass ★★★&nbsp;</span>' +
            '</div></div>' +
            '<canvas class="winamp-vis" width="240" height="44" aria-hidden="true"></canvas>' +
            '<div class="winamp-controls">' +
            '<button aria-hidden="true" tabindex="-1">⏮</button>' +
            '<button aria-hidden="true" tabindex="-1">▶</button>' +
            '<button aria-hidden="true" tabindex="-1">⏹</button>' +
            '<button aria-hidden="true" tabindex="-1">⏭</button>' +
            '</div>';
        document.body.appendChild(winamp);

        visCtx = winamp.querySelector('.winamp-vis').getContext('2d');
        barPhases = [];
        for (let i = 0; i < BAR_COUNT; i++) {
            barPhases.push([Math.random() * Math.PI * 2, Math.random() * Math.PI * 2]);
        }

        winamp.querySelector('.winamp-close').addEventListener('click', function () {
            winamp.hidden = true;
            stopVis();
        });
    }

    function drawVisFrame() {
        const canvas = visCtx.canvas;
        const w = canvas.width;
        const h = canvas.height;
        const barW = w / BAR_COUNT;

        visCtx.clearRect(0, 0, w, h);
        for (let i = 0; i < BAR_COUNT; i++) {
            // Fake spectrum: two sines per bar + a touch of jitter
            const v = 0.35 +
                0.28 * Math.sin(visT * 2.1 + barPhases[i][0]) +
                0.22 * Math.sin(visT * 3.7 + barPhases[i][1]) +
                0.1 * Math.random();
            const bh = Math.max(2, Math.min(1, Math.abs(v)) * (h - 4));
            const grad = visCtx.createLinearGradient(0, h, 0, h - bh);
            grad.addColorStop(0, '#00e000');
            grad.addColorStop(0.7, '#fffb00');
            grad.addColorStop(1, '#ff2f2f');
            visCtx.fillStyle = grad;
            visCtx.fillRect(i * barW + 1, h - bh, barW - 2, bh);
        }
    }

    function visLoop(ts) {
        visRaf = requestAnimationFrame(visLoop);
        if (ts - visLastTs < 50) return; // ~20 fps
        visLastTs = ts;
        visT += 0.05;
        drawVisFrame();
    }

    function startVis() {
        if (!visCtx) return;
        if (reducedMotion) {
            drawVisFrame(); // single static frame
            return;
        }
        if (visRaf === null) visRaf = requestAnimationFrame(visLoop);
    }

    function stopVis() {
        if (visRaf !== null) {
            cancelAnimationFrame(visRaf);
            visRaf = null;
        }
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            stopVis();
        } else if (html.classList.contains('retro-mode') && winamp && !winamp.hidden) {
            startVis();
        }
    });

    // ---------------- Toggle ----------------
    function setRetro(on) {
        html.classList.toggle('retro-mode', on);
        btn.setAttribute('aria-pressed', String(on));
        try {
            localStorage.setItem('retro2010', on ? '1' : '0');
        } catch (e) { /* storage unavailable – ignore */ }

        document.dispatchEvent(new CustomEvent('retromode', { detail: { on: on } }));

        if (on) {
            if (!winamp) buildWinamp();
            winamp.hidden = false;
            startVis();
            enableSparkles();
        } else {
            stopVis();
            disableSparkles();
        }
    }

    btn.addEventListener('click', function () {
        setRetro(!html.classList.contains('retro-mode'));
    });

    // The inline head script may have restored the class before paint;
    // finish wiring the widgets for that persisted state here.
    if (html.classList.contains('retro-mode')) {
        setRetro(true);
    }
}());
