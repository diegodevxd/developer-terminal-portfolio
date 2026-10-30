import type { SiteContent } from './types'

const CVE_ORG = 'https://www.cve.org/CVERecord?id='
const KERNEL_COMMIT = 'https://git.kernel.org/torvalds/c/'
const HAMI_PR = 'https://github.com/Project-HAMi/HAMi/pull/'

export const es = {
  meta: {
    title: 'Diego Mancera · Desarrollador Full-Stack y contribuidor del kernel de Linux',
    description:
      'Desarrollador Full-Stack de León, México, con 2 CVE corregidos en el kernel de Linux, 2 PRs en HAMi (CNCF) y más de 10 sitios web en producción.',
  },
  nav: [
    { id: 'inicio', label: 'Inicio' },
    { id: 'open-source', label: 'Open Source' },
    { id: 'experiencia', label: 'Experiencia' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'contacto', label: 'Contacto' },
  ],
  hero: {
    eyebrow: 'León, MX · Disponible',
    line1: 'Full-Stack',
    line2: '& Kernel Linux',
    summary:
      'Estudiante de Ingeniería en Sistemas con 3 años de experiencia freelance. Corrijo vulnerabilidades en el kernel de Linux y construyo aplicaciones web con Next.js y Supabase.',
    primaryCta: 'Ver mi trabajo',
    secondaryCta: 'Descargar CV',
    portraitAlt: 'Retrato de Diego Mancera',
    terminal: {
      title: 'Terminal — zsh',
      command: 'whoami',
      lines: [
        '2 CVE corregidos en el kernel de Linux (7.2, 7.3)',
        '2 PRs en HAMi · CNCF',
        '10+ sitios web en producción',
      ],
    },
  },
  about: {
    heading: { eyebrow: 'Perfil', line1: 'Sobre', line2: 'mí' },
    paragraphs: [
      'Soy Desarrollador Web Full-Stack y estudiante de Ingeniería en Sistemas Computacionales con 3 años de experiencia freelance desarrollando aplicaciones web con Next.js y Supabase (PostgreSQL).',
      'Soy contribuidor del kernel de Linux, con dos correcciones de vulnerabilidades de seguridad (CVE), y de HAMi, un scheduler de GPUs para Kubernetes (CNCF).',
    ],
    lookingFor: {
      title: 'Qué busco',
      items: [
        'Prácticas o puesto junior de ingeniería de software.',
        'Sistemas y kernel, o full-stack.',
        'Remoto, o presencial en León.',
      ],
    },
    facts: [
      { label: 'Ubicación', value: 'León, Guanajuato, México' },
      { label: 'Educación', value: 'Universidad EPCA · egreso 2028' },
      { label: 'Idiomas', value: 'Español (nativo) · Inglés (B2, intermedio alto)' },
    ],
  },
  openSource: {
    heading: { eyebrow: 'Contribuciones', line1: 'Open', line2: 'Source' },
    intro: 'Correcciones reales en proyectos que usa mucha gente.',
    plainLabel: 'En simple',
    technicalLabel: 'Detalle técnico',
    contributions: [
      {
        project: 'Kernel de Linux',
        driver: 'ueagle-atm',
        language: 'C',
        title: 'Lectura de memoria fuera de límites en un driver USB',
        plain:
          'Un dispositivo USB malicioso podía hacer que el driver leyera memoria que no le pertenecía.',
        technical:
          'Slab out-of-bounds read detectado con KASAN y syzbot: descriptores manipulados hacían que probe y disconnect discreparan sobre el estado del dispositivo.',
        status: 'Linux 7.2 · estables 5.10–7.1',
        links: [
          { label: 'CVE-2026-68344', href: `${CVE_ORG}CVE-2026-68344` },
          {
            label: 'Commit',
            href: `${KERNEL_COMMIT}71132cedd1ecbc4032d76e9928c18a10f7e39b80`,
          },
        ],
      },
      {
        project: 'Kernel de Linux',
        driver: 'em28xx',
        language: 'C',
        title: 'Uso de memoria liberada en un driver de video',
        plain: 'El driver podía seguir usando memoria que ya había liberado.',
        technical:
          'Use-after-free reportado por syzbot en dispositivos dual-TS; la solución difiere el registro de la extensión de solo audio.',
        status: 'Linux 7.3 · estables 5.10–7.2',
        links: [
          { label: 'CVE-2026-89892', href: `${CVE_ORG}CVE-2026-89892` },
          {
            label: 'Commit',
            href: `${KERNEL_COMMIT}95f76f51937fdfb0fc1e14cae606b1ef574a56f3`,
          },
        ],
      },
      {
        project: 'HAMi · CNCF',
        driver: 'Scheduler',
        language: 'Go',
        title: 'Puntuación de GPUs con la memoria equivocada',
        plain:
          'El scheduler calculaba la memoria de los pods un 59 % por debajo de lo reservado y ordenaba mal las GPUs.',
        technical:
          'El scoring usaba un valor de memoria distinto al reservado en pods con gpumem y gpumem-percentage; agregué pruebas de regresión en Go.',
        status: 'PR #3106',
        links: [{ label: 'PR #3106', href: `${HAMI_PR}3106` }],
      },
      {
        project: 'HAMi · CNCF',
        driver: 'Backend Enflame',
        language: 'Go',
        title: 'Un código de modo leído como porcentaje',
        plain: 'Un número que indicaba un modo se interpretaba como un porcentaje de memoria.',
        technical:
          'El backend de Enflame leía el código de modo (-1) como porcentaje de memoria y producía memoria negativa en el scoring.',
        status: 'PR #3313',
        links: [{ label: 'PR #3313', href: `${HAMI_PR}3313` }],
      },
    ],
  },
  experience: {
    heading: { eyebrow: 'Trayectoria', line1: 'Mi', line2: 'Experiencia' },
    entries: [
      {
        period: '2023 – Hoy',
        role: 'Desarrollador Web Full-Stack',
        org: 'CapiHw Labs (Freelance)',
        place: 'León, Gto.',
        bullets: [
          'Entregué más de 10 sitios web en producción para clientes de marketing, diseño, tecnología y construcción, 5 de ellos con backend en Supabase (PostgreSQL).',
          'Desarrollé un sitio web de catálogo de productos Betterware con Next.js y Supabase.',
          'Desarrollé un sistema de administración de ventas con Supabase para registrar pedidos, pagos y ventas a crédito (fiado), con saldos por cliente que se actualizan automáticamente.',
          'Automaticé los despliegues con GitHub Actions y Vercel: reduje el tiempo de despliegue de 10 a 4–5 minutos.',
          'Depuré, probé y corregí cada versión en ramas de Git para no romper la rama principal; usé agentes de IA (Claude Code, Codex) para acelerar el desarrollo.',
        ],
      },
      {
        period: 'Ago 2025 – Hoy',
        role: 'Contribuidor del Kernel de Linux (C)',
        org: 'Open source',
        place: 'Remoto',
        bullets: [
          'Corregí una lectura de memoria fuera de límites (CVE-2026-68344) en el driver USB ueagle-atm. Integrada en Linux 7.2 y llevada a las versiones estables 5.10 a 7.1.',
          'Corregí un uso de memoria liberada (CVE-2026-89892) en el driver de video em28xx. Integrada en Linux 7.3 y llevada a las versiones estables 5.10 a 7.2.',
        ],
      },
      {
        period: 'Sep 2026 – Hoy',
        role: 'Contribuidor de HAMi (Go)',
        org: 'Scheduler de GPUs para Kubernetes · CNCF',
        place: 'Remoto',
        bullets: [
          'Corregí un error de puntuación del scheduler (PR #3106) que calculaba la memoria de los pods un 59 % por debajo de lo reservado; agregué pruebas de regresión en Go.',
          'Corregí un error en el backend de Enflame (PR #3313) que leía un valor de modo como porcentaje de memoria.',
        ],
      },
      {
        period: '2024 – 2028',
        role: 'Ingeniería en Sistemas Computacionales',
        org: 'Universidad EPCA',
        place: 'León, Gto.',
        bullets: ['Egreso previsto en 2028.'],
      },
    ],
  },
  projects: {
    heading: { eyebrow: 'Trabajo', line1: 'Mis', line2: 'Proyectos' },
    viewProject: 'Ver proyecto',
    labels: {
      stack: 'Stack',
      summary: 'Resumen',
      viewRepository: 'Ver repositorio',
      indexLabel: 'Índice',
      hint: 'Arrastra para explorar',
      carouselAria: 'Carrusel de proyectos',
      navAria: 'Proyectos',
      prev: 'Proyecto anterior',
      next: 'Proyecto siguiente',
      slideOf: '{i} de {n}: {title}',
      live: 'Proyecto {i} de {n}: {title}',
    },
    projects: [
      {
        title: 'Cuentivo',
        tagline: 'App Android de ventas a crédito',
        stack: ['Flutter', 'Dart', 'Firebase', 'Gemini API'],
        bullets: [
          'Permite a pequeños comercios registrar ventas, abonos y saldos vencidos por cliente.',
          'Probada por 20 usuarios, con más de 10 instalaciones confirmadas.',
          'La versión Pro usa Firebase Auth y Gemini API a través de un gateway seguro en el backend.',
          'Hice pruebas de seguridad asistidas por IA y corregí las vulnerabilidades en la arquitectura.',
        ],
        pattern: 'rings',
        palette: { from: '#07081c', to: '#0e1030', accent: '#2b2bff' },
      },
      {
        title: 'PDF Crop Studio',
        tagline: 'Extractor de imágenes de PDF',
        stack: ['Python', 'Open source'],
        bullets: [
          'Recorta imágenes de PDF con precisión de píxel.',
          'Las etiqueta con el texto del PDF y usa OCR como respaldo.',
        ],
        href: 'https://github.com/diegodevxd/pdf-crop-studio',
        pattern: 'grid',
        palette: { from: '#0e1030', to: '#07081c', accent: '#4ade80' },
      },
      {
        title: 'Catálogo Betterware',
        tagline: 'Sitio web de catálogo de productos',
        stack: ['Next.js', 'Supabase'],
        bullets: ['Sitio web de catálogo de productos Betterware construido para un cliente.'],
        pattern: 'dots',
        palette: { from: '#07081c', to: '#0e1030', accent: '#8a8db8' },
      },
      {
        title: 'Sistema de ventas a crédito',
        tagline: 'Administración de pedidos, pagos y fiado',
        stack: ['Supabase', 'PostgreSQL'],
        bullets: [
          'Registra pedidos, pagos y ventas a crédito (fiado).',
          'Los saldos por cliente se actualizan automáticamente.',
        ],
        pattern: 'bars',
        palette: { from: '#0e1030', to: '#07081c', accent: '#2b2bff' },
      },
      {
        title: 'Laboratorio de LLMs locales',
        tagline: 'Modelos de lenguaje en mi propia GPU',
        stack: ['Ollama', 'Linux', 'Windows'],
        bullets: [
          'Instalé y ejecuté modelos locales (Gemma, DeepSeek-Coder-V2, Qwen) en Linux y Windows.',
          'Elegí modelos ligeros para una GPU RTX 5060 de 8 GB de VRAM.',
        ],
        pattern: 'waves',
        palette: { from: '#07081c', to: '#0e1030', accent: '#f2f2f2' },
      },
    ],
  },
  stack: {
    heading: { eyebrow: 'Herramientas', line1: 'Mi', line2: 'Stack' },
    groups: [
      {
        group: 'Lenguajes',
        items: [
          { name: 'JavaScript', slug: 'javascript' },
          { name: 'TypeScript', slug: 'typescript' },
          { name: 'Python', slug: 'python' },
          { name: 'C', slug: 'c' },
          { name: 'Go', slug: 'go' },
          { name: 'Dart', slug: 'dart' },
          { name: 'SQL' },
        ],
      },
      {
        group: 'Frontend',
        items: [
          { name: 'Next.js', slug: 'nextdotjs' },
          { name: 'HTML', slug: 'html5' },
          { name: 'CSS', slug: 'css' },
          { name: 'Flutter', slug: 'flutter' },
        ],
      },
      {
        group: 'Backend',
        items: [
          { name: 'APIs REST' },
          { name: 'Supabase', slug: 'supabase' },
          { name: 'Firebase Auth', slug: 'firebase' },
          { name: 'Gemini API', slug: 'googlegemini' },
        ],
      },
      {
        group: 'Bases de datos',
        items: [
          { name: 'PostgreSQL', slug: 'postgresql' },
          { name: 'Firebase', slug: 'firebase' },
        ],
      },
      {
        group: 'DevOps',
        items: [
          { name: 'Git', slug: 'git' },
          { name: 'GitHub', slug: 'github' },
          { name: 'GitHub Actions', slug: 'githubactions' },
          { name: 'CI/CD' },
          { name: 'Vercel', slug: 'vercel' },
          { name: 'Linux', slug: 'linux' },
          { name: 'Kubernetes', slug: 'kubernetes' },
        ],
      },
      {
        group: 'Sistemas',
        items: [
          { name: 'Kernel de Linux', slug: 'linux' },
          { name: 'Drivers de dispositivos' },
          { name: 'Depuración' },
          { name: 'KASAN' },
          { name: 'syzbot' },
        ],
      },
      {
        group: 'IA',
        items: [
          { name: 'Claude Code', slug: 'claude' },
          { name: 'Codex' },
          { name: 'Cursor', slug: 'cursor' },
          { name: 'MCP', slug: 'modelcontextprotocol' },
          { name: 'Ingeniería de prompts' },
          { name: 'LLMs locales (Ollama)', slug: 'ollama' },
        ],
      },
    ],
  },
  certifications: {
    title: 'Certificaciones',
    items: [
      {
        code: 'LFD103',
        name: "A Beginner's Guide to Linux Kernel Development",
        issuer: 'The Linux Foundation',
        year: '2026',
      },
      {
        code: 'LFC102',
        name: 'Inclusive Open Source Community Orientation',
        issuer: 'The Linux Foundation',
        year: '2026',
      },
    ],
  },
  contact: {
    heading: { eyebrow: 'Contacto', line1: '¿Hablamos?', line2: 'Escríbeme' },
    intro: 'Busco prácticas o un puesto junior, remoto o presencial en León.',
    email: 'diegomancera.dev@gmail.com',
    github: 'https://github.com/diegodevxd',
    linkedin: 'https://linkedin.com/in/diego-fernando-mancera-gomez',
    cv: { es: '/cv/Diego-Mancera-CV-ES.pdf', en: '/cv/Diego-Mancera-CV-EN.pdf' },
  },
  footer: { text: '© 2026 Diego Mancera · León, México' },
  ui: {
    navAria: 'Navegación principal',
    languageAria: 'Idioma',
    languageNames: { es: 'Español', en: 'English' },
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    socialAria: 'Redes',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    email: 'Correo',
    resume: 'CV ↓',
    downloadCv: 'Descargar CV',
    downloadCvEs: 'CV en español',
    downloadCvEn: 'CV en inglés',
    viewWork: 'Ver mi trabajo',
    copyEmail: 'Copiar correo',
    copied: 'Copiado',
    openExternal: 'Abre en una pestaña nueva',
  },
} satisfies SiteContent
