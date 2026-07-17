// ============================================================
// NEON DIGITAL RAIN – canvas background animation
// Fallback background: bg3d.js starts it on mobile / no-WebGL,
// and the safety timer at the bottom of this file starts it if
// the 3D module never takes over (CDN down, no import maps…).
// ============================================================
window.__rainStarted = false;
window.__startMatrixRain = function () {
    if (window.__rainStarted) return;

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Respect users who prefer reduced motion: skip the animation entirely.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    window.__rainStarted = true;

    const ctx = canvas.getContext('2d');

    const CHARS = '01アイウエオカキクケコ0123456789ABCDEF<>/\\{}[]!@#$%?';
    const FS = 13;
    let drops = [], cols = 0, W = 0, H = 0;

    function setup() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        cols = Math.floor(W / FS);
        // Preserve existing drops, only extend array
        while (drops.length < cols) drops.push(-Math.floor(Math.random() * 80));
        drops.length = cols;
        // Fill solid dark on first setup
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);
    }

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setup, 250);
    });
    setup();

    function draw() {
        ctx.fillStyle = 'rgba(5,5,5,0.055)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = FS + 'px "Fira Code", monospace';

        for (let i = 0; i < cols; i++) {
            if (drops[i] < 0) { drops[i] += 0.4; continue; }
            const char = CHARS[Math.floor(Math.random() * CHARS.length)];
            const x = i * FS;
            const y = Math.floor(drops[i]) * FS;
            // Most columns cyan, every 7th column magenta for variety
            ctx.fillStyle = (i % 7 === 0) ? 'rgba(255,0,255,0.75)' : 'rgba(0,255,255,0.65)';
            ctx.fillText(char, x, y);
            drops[i]++;
            if (y > H && Math.random() > 0.975) {
                drops[i] = -Math.floor(Math.random() * 60);
            }
        }
    }

    // ~22 fps – light on CPU, smooth enough for the effect
    let lastTs = 0;
    let rafId = null;

    function loop(ts) {
        rafId = requestAnimationFrame(loop);
        if (ts - lastTs < 45) return;
        lastTs = ts;
        draw();
    }

    function start() {
        if (rafId === null) rafId = requestAnimationFrame(loop);
    }

    function stop() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    // Pause the render loop when the tab is hidden to save CPU/battery.
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
        else start();
    });

    start();
};

// Safety net: if after 2s neither the 3D background nor the rain is
// running, fall back to the rain so the page never loses its backdrop.
setTimeout(function () {
    if (!window.__bg3dActive && !window.__rainStarted) {
        window.__startMatrixRain();
    }
}, 2000);

// ============================================================
const translations = {
    es: {
        meta_desc: "Portafolio personal cyberpunk de un estudiante de Ingeniería en Sistemas.",
        hero_title: "HOLA, MUNDO //",
        title_profile: ">PERFIL_",
        title_projects: ">BASE_DE_DATOS_PROYECTOS_",
        title_certifications: ">CERTIFICACIONES_",
        title_contact: ">ESTABLECER_CONEXIÓN_",
        nav_about: "Acerca de",
        nav_projects: "Proyectos",
        nav_services: "Servicios",
        nav_contact: "Contacto",
        hero_role: "Desarrollador & Estudiante de Ing. en Sistemas (6/12 Semestres)",
        hero_desc: "Construyendo el futuro digital. Experiencia en freelance, desarrollo web y creación de experiencias interactivas.",
        hero_cta: "INICIAR SECUENCIA_",
        hero_cv: "DESCARGAR CV_",
        about_text1: "Soy estudiante de 6to semestre (de 12) de Ingeniería en Sistemas. Apasionado por la tecnología, la estética cyberpunk y la creación de arquitecturas limpias y eficientes.",
        about_text2: "Trabajo freelance apoyando a pequeños negocios locales a digitalizarse. Creo portafolios únicos, páginas para empresas y he participado en el desarrollo algorítmico de videojuegos estilo novela visual.",
        proj_cherrycode_desc: "Sitio de mi negocio de desarrollo de páginas web para clientes: paquetes de landing pages, sitios corporativos y tiendas en línea a la medida.",
        proj_kernel_desc: "[PATCH] en C aceptado y mergeado en el árbol usb-linus del Kernel de Linux (driver ueagle-atm): corrige una vulnerabilidad de out-of-bounds read explotable por un dispositivo USB malicioso, detectada mediante fuzzing automatizado (KASAN/syzbot) durante la desconexión.",
        proj_bettermancera_desc: "Tienda en línea de distribuidores independientes Betterware. Catálogo de productos para el hogar con pagos seguros vía Stripe y backend en Supabase.",
        proj_mevek_desc: "Sitio web comercial para tienda de electrónica local. Diseño adaptable y moderno para exhibición de productos tecnológicos.",
        proj_capi_desc: "Asistente de IA local en desarrollo para tesis universitaria. Arquitectura diseñada para ejecución eficiente en hardware local.",
        proj_telemetry_desc: "Herramienta de bajo nivel para telemetría y monitoreo de sistemas Linux, enfocada en la gestión pura de recursos.",
        proj_art_title: "Portafolio Artístico",
        proj_art_desc: "Portafolio estilo SO creado para un artista, simulando una interfaz de sistema operativo interactiva para visualizar sus obras.",
        nav_certifications: "Certificaciones",
        cert_lfd103_desc: "The Linux Foundation. Guía de fundamentos para el desarrollo y contribución en el Kernel de Linux.",
        cert_lfc102_desc: "The Linux Foundation. Orientación inclusiva y metodologías de colaboración en comunidades Open Source.",
        cert_cecati_desc: "Certificación en Mantenimiento Preventivo y Correctivo de Computadoras. Sólidos fundamentos en hardware y diagnóstico de sistemas.",
        cert_meta_desc: "Certificación en Programación en Java. Conocimientos en desarrollo estructurado, Programación Orientada a Objetos y lógica de software empresarial.",
        retro_title: "Modo retro 2010",
        carousel_prev: "Anterior",
        carousel_next: "Siguiente",
    },
    en: {
        meta_desc: "Cyberpunk personal portfolio of a systems engineering student.",
        hero_title: "HELLO, WORLD //",
        title_profile: ">PROFILE_",
        title_projects: ">PROJECTS_DATABASE_",
        title_certifications: ">CERTIFICATIONS_",
        title_contact: ">ESTABLISH_CONNECTION_",
        nav_about: "About",
        nav_projects: "Projects",
        nav_services: "Services",
        nav_contact: "Contact",
        hero_role: "Developer & Systems Engineering Student (6/12 Semesters)",
        hero_desc: "Building the digital future. Experience in freelance, web development, and creating interactive experiences.",
        hero_cta: "INITIATE SEQUENCE_",
        hero_cv: "DOWNLOAD CV_",
        about_text1: "I am a 6th-semester (out of 12) Systems Engineering student. Passionate about technology, cyberpunk aesthetics, and building clean, efficient architectures.",
        about_text2: "I work freelance helping local small businesses digitize. I create unique portfolios, company websites, and have participated in algorithmic development for visual novel games.",
        proj_cherrycode_desc: "Site for my web page development business for clients: landing page packages, corporate sites, and custom online stores.",
        proj_kernel_desc: "[PATCH] in C accepted and merged into the usb-linus tree of the Linux Kernel (ueagle-atm driver): fixes an out-of-bounds read vulnerability exploitable by a malicious USB device, found via automated fuzzing (KASAN/syzbot) during disconnection.",
        proj_bettermancera_desc: "Online store for independent Betterware distributors. Home goods catalog with secure payments via Stripe and a Supabase backend.",
        proj_mevek_desc: "Commercial website for a local electronics store. Responsive and modern design for showcasing tech products.",
        proj_capi_desc: "Local AI assistant in development for university thesis. Architecture designed for efficient execution on local hardware.",
        proj_telemetry_desc: "Low-level tool for Linux system telemetry and monitoring, focused on pure resource management.",
        proj_art_title: "Artistic Portfolio",
        proj_art_desc: "OS-style portfolio created for an artist, simulating an interactive operating system interface to display art pieces.",
        nav_certifications: "Certifications",
        cert_lfd103_desc: "The Linux Foundation. Fundamentals guide for developing and contributing to the Linux Kernel.",
        cert_lfc102_desc: "The Linux Foundation. Inclusive orientation and collaboration methodologies in Open Source communities.",
        cert_cecati_desc: "Certification in Preventive and Corrective Computer Maintenance. Solid fundamentals in hardware and system diagnostics.",
        cert_meta_desc: "Certification in Java Programming. Knowledge in structured development, Object-Oriented Programming, and enterprise software logic.",
        retro_title: "2010 retro mode",
        carousel_prev: "Previous",
        carousel_next: "Next",
    }
};

let currentLang = 'es';

document.addEventListener('DOMContentLoaded', () => {
    // ---- Hamburger menu ----
    const hamburger = document.getElementById('hamburger');
    const navLinksEl = document.getElementById('nav-links');
    const navOverlayEl = document.getElementById('nav-overlay');

    function closeMenu() {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        navLinksEl.classList.remove('active');
        navOverlayEl.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    hamburger.addEventListener('click', function () {
        const open = hamburger.classList.contains('active');
        if (open) {
            closeMenu();
        } else {
            hamburger.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
            navLinksEl.classList.add('active');
            navOverlayEl.classList.add('active');
            document.body.classList.add('no-scroll');
        }
    });

    navOverlayEl.addEventListener('click', closeMenu);

    document.querySelectorAll('#nav-links a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    // ---- Language toggle ----
    const langToggleBtn = document.getElementById('lang-toggle');
    const metaDescription = document.querySelector('meta[name="description"]');

    function applyLanguage(lang) {
        const dict = translations[lang];
        if (!dict) return;

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const value = dict[key];
            if (value === undefined) return;
            element.textContent = value;
            // Glitch headings mirror their text in data-text for the pseudo-elements
            if (element.classList.contains('glitch')) {
                element.setAttribute('data-text', value);
            }
        });

        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            const value = dict[key];
            if (value !== undefined) element.setAttribute('aria-label', value);
        });

        document.documentElement.lang = lang;
        if (metaDescription && dict.meta_desc) {
            metaDescription.setAttribute('content', dict.meta_desc);
        }

        // Retro toggle keeps its visible "★2010" label; only the
        // tooltip / accessible name is localized.
        const retroBtn = document.getElementById('retro-toggle');
        if (retroBtn && dict.retro_title) {
            retroBtn.title = dict.retro_title;
            retroBtn.setAttribute('aria-label', dict.retro_title);
        }
    }

    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        applyLanguage(currentLang);
        try {
            localStorage.setItem('lang', currentLang);
        } catch (e) { /* storage unavailable – ignore */ }
    });

    // Restore previously chosen language on load.
    try {
        const savedLang = localStorage.getItem('lang');
        if (savedLang && translations[savedLang] && savedLang !== currentLang) {
            currentLang = savedLang;
        }
    } catch (e) { /* storage unavailable – ignore */ }
    applyLanguage(currentLang);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Scroll reveal animations ----
    const revealTargets = document.querySelectorAll(
        '.cyber-card, .terminal-window, .skills-strip, .section-title, .footer h2, .social-links'
    );

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach(el => el.classList.add('visible'));
    } else {
        revealTargets.forEach(el => el.classList.add('reveal'));
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        revealTargets.forEach(el => revealObserver.observe(el));
    }

    // ---- Active nav link based on visible section ----
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navAnchors = document.querySelectorAll('#nav-links a');

    if ('IntersectionObserver' in window && sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navAnchors.forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => navObserver.observe(section));
    }

    // ---- Scroll-linked 3D tilt (terminal window in #about) ----
    // Vanilla recreation of a scroll-driven card reveal: as the stage
    // passes through the viewport, the card rotates from tilted-back to
    // flat and scales up, like a screen powering into view.
    const tiltStage = document.querySelector('.scroll-tilt-stage');
    const tiltCard = document.querySelector('.scroll-tilt-card');

    if (tiltStage && tiltCard && !prefersReducedMotion) {
        const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
        let ticking = false;

        function updateTilt() {
            ticking = false;
            const rect = tiltStage.getBoundingClientRect();
            const vh = window.innerHeight;
            const total = rect.height + vh;
            const progress = clamp((vh - rect.top) / total, 0, 1);

            const rotate = 14 - progress * 14;    // 14deg -> 0deg
            const scale = 0.94 + progress * 0.06; // 0.94 -> 1

            tiltCard.style.setProperty('--tilt-rotate', rotate + 'deg');
            tiltCard.style.setProperty('--tilt-scale', scale);
        }

        function onTiltScroll() {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(updateTilt);
            }
        }

        window.addEventListener('scroll', onTiltScroll, { passive: true });
        window.addEventListener('resize', onTiltScroll, { passive: true });
        updateTilt();
    }

    // ---- Mobile carousel (Proyectos / Certificaciones) ----
    // On desktop this markup renders as the normal grid (CSS-only); below
    // the 768px breakpoint .projects-grid becomes a scroll-snap row and
    // this wires the arrows + dots to it.
    document.querySelectorAll('.carousel').forEach(carousel => {
        const track = carousel.querySelector('[data-carousel-track]');
        const prevBtn = carousel.querySelector('[data-carousel-prev]');
        const nextBtn = carousel.querySelector('[data-carousel-next]');
        const dotsWrap = carousel.parentElement.querySelector('[data-carousel-dots]');
        if (!track || !dotsWrap) return;

        const cards = Array.from(track.children);
        if (!cards.length) return;

        dotsWrap.innerHTML = '';
        const dots = cards.map((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', (i + 1) + ' / ' + cards.length);
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
            return dot;
        });

        function cardStep() {
            const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') || 0;
            return cards[0].getBoundingClientRect().width + gap;
        }

        function currentIndex() {
            return Math.round(track.scrollLeft / cardStep());
        }

        function goTo(index) {
            const clamped = Math.max(0, Math.min(cards.length - 1, index));
            cards[clamped].scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                inline: 'center',
                block: 'nearest',
            });
        }

        function refreshUI() {
            const idx = Math.max(0, Math.min(cards.length - 1, currentIndex()));
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            if (prevBtn) prevBtn.disabled = idx === 0;
            if (nextBtn) nextBtn.disabled = idx === cards.length - 1;
        }

        prevBtn && prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
        nextBtn && nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));

        track.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex() + 1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentIndex() - 1); }
        });

        let ticking = false;
        track.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => { refreshUI(); ticking = false; });
        });

        window.addEventListener('resize', refreshUI);
        refreshUI();
    });
});
