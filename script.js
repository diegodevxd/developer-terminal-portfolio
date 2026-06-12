// ============================================================
// NEON DIGITAL RAIN – canvas background animation
// ============================================================
(function () {
    const canvas = document.getElementById('bg-canvas');
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
    function loop(ts) {
        requestAnimationFrame(loop);
        if (ts - lastTs < 45) return;
        lastTs = ts;
        draw();
    }
    requestAnimationFrame(loop);
}());

// ============================================================
const translations = {
    es: {
        nav_about: "Acerca de",
        nav_projects: "Proyectos",
        nav_contact: "Contacto",
        hero_role: "Desarrollador & Estudiante de Ing. en Sistemas (5/12 Semestres)",
        hero_desc: "Construyendo el futuro digital. Experiencia en freelance, desarrollo web y creación de experiencias interactivas.",
        hero_cta: "INICIAR SECUENCIA_",
        about_text1: "Soy estudiante de 5to semestre (de 12) de Ingeniería en Sistemas. Apasionado por la tecnología, la estética cyberpunk y la creación de arquitecturas limpias y eficientes.",
        about_text2: "Trabajo freelance apoyando a pequeños negocios locales a digitalizarse. Creo portafolios únicos, páginas para empresas y he participado en el desarrollo algorítmico de videojuegos estilo novela visual.",
        proj_mevek_desc: "Sitio web comercial para tienda de electrónica local. Diseño adaptable y moderno para exhibición de productos tecnológicos.",
        proj_capi_desc: "Asistente de IA local en desarrollo para tesis universitaria. Arquitectura diseñada para ejecución eficiente en hardware local.",
        proj_telemetry_desc: "Herramienta de bajo nivel para telemetría y monitoreo de sistemas Linux, enfocada en la gestión pura de recursos.",
        proj_art_title: "Portafolio Artístico",
        proj_art_desc: "Portafolio estilo SO creado para un artista, simulando una interfaz de sistema operativo interactiva para visualizar sus obras.",
        proj_cherry_desc: "Sitio en desarrollo para una agencia constructora de páginas web en crecimiento, enfocada en la conversión y la estética limpia.",
        proj_game_title: "Juego Novela Visual",
        proj_game_desc: "Proyecto colaborativo para una clase de arte. Encargado de toda la programación y lógica. Arte diseñado por Demian.",
        nav_certifications: "Certificaciones",
        cert_lfd103_desc: "The Linux Foundation. Guía de fundamentos para el desarrollo y contribución en el Kernel de Linux.",
        cert_lfc102_desc: "The Linux Foundation. Orientación inclusiva y metodologías de colaboración en comunidades Open Source.",
        cert_cecati_desc: "Certificación en Mantenimiento Preventivo y Correctivo de Computadoras. Sólidos fundamentos en hardware y diagnóstico de sistemas.",
        cert_meta_desc: "Certificación en Programación en Java. Conocimientos en desarrollo estructurado, Programación Orientada a Objetos y lógica de software empresarial.",
    },
    en: {
        nav_about: "About",
        nav_projects: "Projects",
        nav_contact: "Contact",
        hero_role: "Developer & Systems Engineering Student (5/12 Semesters)",
        hero_desc: "Building the digital future. Experience in freelance, web development, and creating interactive experiences.",
        hero_cta: "INITIATE SEQUENCE_",
        about_text1: "I am a 5th-semester (out of 12) Systems Engineering student. Passionate about technology, cyberpunk aesthetics, and building clean, efficient architectures.",
        about_text2: "I work freelance helping local small businesses digitize. I create unique portfolios, company websites, and have participated in algorithmic development for visual novel games.",
        proj_mevek_desc: "Commercial website for a local electronics store. Responsive and modern design for showcasing tech products.",
        proj_capi_desc: "Local AI assistant in development for university thesis. Architecture designed for efficient execution on local hardware.",
        proj_telemetry_desc: "Low-level tool for Linux system telemetry and monitoring, focused on pure resource management.",
        proj_art_title: "Artistic Portfolio",
        proj_art_desc: "OS-style portfolio created for an artist, simulating an interactive operating system interface to display art pieces.",
        proj_cherry_desc: "Website in development for a growing web development agency, focused on conversion and clean aesthetics.",
        proj_game_title: "Visual Novel Game",
        proj_game_desc: "Collaborative project for an art class. In charge of all programming and logic. Art designed by Demian.",
        nav_certifications: "Certifications",
        cert_lfd103_desc: "The Linux Foundation. Fundamentals guide for developing and contributing to the Linux Kernel.",
        cert_lfc102_desc: "The Linux Foundation. Inclusive orientation and collaboration methodologies in Open Source communities.",
        cert_cecati_desc: "Certification in Preventive and Corrective Computer Maintenance. Solid fundamentals in hardware and system diagnostics.",
        cert_meta_desc: "Certification in Java Programming. Knowledge in structured development, Object-Oriented Programming, and enterprise software logic.",
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
    const glitchTitle = document.querySelector('h1.glitch');

    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'es' ? 'en' : 'es';

        // Update regular text
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[currentLang][key]) {
                element.textContent = translations[currentLang][key];
            }
        });

        // Update main glitch title manually since it uses data-text attribute for the pseudo-elements
        const newTitle = currentLang === 'es' ? "HOLA, MUNDO //" : "HELLO, WORLD //";
        glitchTitle.textContent = newTitle;
        glitchTitle.setAttribute('data-text', newTitle);

        const profileTitle = document.querySelector('#about h2.glitch');
        const projTitle = document.querySelector('#projects h2.glitch');
        const certTitle = document.querySelector('#certifications h2.glitch');
        const contactTitle = document.querySelector('#contact h2.glitch');

        if (currentLang === 'en') {
            profileTitle.textContent = ">PROFILE_";
            profileTitle.setAttribute('data-text', ">PROFILE_");
            projTitle.textContent = ">PROJECTS_DATABASE_";
            projTitle.setAttribute('data-text', ">PROJECTS_DATABASE_");
            if (certTitle) {
                certTitle.textContent = ">CERTIFICATIONS_";
                certTitle.setAttribute('data-text', ">CERTIFICATIONS_");
            }
            contactTitle.textContent = ">ESTABLISH_CONNECTION_";
            contactTitle.setAttribute('data-text', ">ESTABLISH_CONNECTION_");
        } else {
            profileTitle.textContent = ">PERFIL_";
            profileTitle.setAttribute('data-text', ">PERFIL_");
            projTitle.textContent = ">BASE_DE_DATOS_PROYECTOS_";
            projTitle.setAttribute('data-text', ">BASE_DE_DATOS_PROYECTOS_");
            if (certTitle) {
                certTitle.textContent = ">CERTIFICACIONES_";
                certTitle.setAttribute('data-text', ">CERTIFICACIONES_");
            }
            contactTitle.textContent = ">ESTABLECER_CONEXIÓN_";
            contactTitle.setAttribute('data-text', ">ESTABLECER_CONEXIÓN_");
        }
    });
});
