import type { SiteContent } from './types'

const CVE_ORG = 'https://www.cve.org/CVERecord?id='
const KERNEL_COMMIT = 'https://git.kernel.org/torvalds/c/'
const HAMI_PR = 'https://github.com/Project-HAMi/HAMi/pull/'

export const en = {
  meta: {
    title: 'Diego Mancera · Full-Stack Developer and Linux kernel contributor',
    description:
      'Full-Stack Developer from León, Mexico, with 2 CVEs fixed in the Linux kernel, 2 PRs to HAMi (CNCF) and 10+ websites in production.',
  },
  nav: [
    { id: 'inicio', label: 'Home' },
    { id: 'open-source', label: 'Open Source' },
    { id: 'experiencia', label: 'Experience' },
    { id: 'proyectos', label: 'Projects' },
    { id: 'contacto', label: 'Contact' },
  ],
  hero: {
    eyebrow: 'León, MX · Available',
    line1: 'Full-Stack',
    line2: '& Linux Kernel',
    summary:
      'Computer Systems Engineering student with 3 years of freelance experience. I fix vulnerabilities in the Linux kernel and build web apps with Next.js and Supabase.',
    primaryCta: 'See my work',
    secondaryCta: 'Download CV',
    portraitAlt: 'Portrait of Diego Mancera',
    terminal: {
      title: 'Terminal — zsh',
      command: 'whoami',
      lines: [
        '2 CVEs fixed in the Linux kernel (7.2, 7.3)',
        '2 PRs to HAMi · CNCF',
        '10+ websites in production',
      ],
    },
  },
  about: {
    heading: { eyebrow: 'Profile', line1: 'About', line2: 'me' },
    paragraphs: [
      'I am a Full-Stack Web Developer and Computer Systems Engineering student with 3 years of freelance experience building web applications with Next.js and Supabase (PostgreSQL).',
      'I am a Linux kernel contributor with two security vulnerability fixes (CVEs) merged upstream, and an open source contributor to HAMi, a Kubernetes GPU scheduler (CNCF).',
    ],
    lookingFor: {
      title: 'What I am looking for',
      items: [
        'A software engineering internship or junior role.',
        'Kernel and systems, or full-stack.',
        'Remote, or on-site in León.',
      ],
    },
    facts: [
      { label: 'Location', value: 'León, Guanajuato, Mexico' },
      { label: 'Education', value: 'Universidad EPCA · graduating 2028' },
      { label: 'Languages', value: 'Spanish (native) · English (B2, upper intermediate)' },
    ],
  },
  openSource: {
    heading: { eyebrow: 'Contributions', line1: 'Open', line2: 'Source' },
    intro: 'Real fixes in projects that many people rely on.',
    plainLabel: 'In plain words',
    technicalLabel: 'Technical detail',
    contributions: [
      {
        project: 'Linux kernel',
        driver: 'ueagle-atm',
        language: 'C',
        title: 'Out-of-bounds memory read in a USB driver',
        plain: 'A malicious USB device could make the driver read memory that was not its own.',
        technical:
          'Slab out-of-bounds read detected with KASAN and syzbot: crafted descriptors made probe and disconnect disagree on the device state.',
        status: 'Linux 7.2 · stable 5.10–7.1',
        links: [
          { label: 'CVE-2026-68344', href: `${CVE_ORG}CVE-2026-68344` },
          {
            label: 'Commit',
            href: `${KERNEL_COMMIT}71132cedd1ecbc4032d76e9928c18a10f7e39b80`,
          },
        ],
      },
      {
        project: 'Linux kernel',
        driver: 'em28xx',
        language: 'C',
        title: 'Use of freed memory in a media driver',
        plain: 'The driver could keep using memory it had already released.',
        technical:
          'Use-after-free reported by syzbot on dual-TS devices; the fix defers the registration of the audio-only extension.',
        status: 'Linux 7.3 · stable 5.10–7.2',
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
        title: 'GPU scoring with the wrong memory value',
        plain:
          'The scheduler calculated pod memory 59% lower than the reserved amount and ranked GPUs incorrectly.',
        technical:
          'Scoring used a different memory value than the one reserved for pods requesting gpumem and gpumem-percentage; I added Go regression tests.',
        status: 'PR #3106',
        links: [{ label: 'PR #3106', href: `${HAMI_PR}3106` }],
      },
      {
        project: 'HAMi · CNCF',
        driver: 'Enflame backend',
        language: 'Go',
        title: 'A mode code read as a percentage',
        plain: 'A number that meant a mode was being read as a memory percentage.',
        technical:
          'The Enflame backend read a mode code (-1) as a memory percentage, producing negative memory in scoring.',
        status: 'PR #3313',
        links: [{ label: 'PR #3313', href: `${HAMI_PR}3313` }],
      },
    ],
  },
  experience: {
    heading: { eyebrow: 'Career', line1: 'My', line2: 'Experience' },
    entries: [
      {
        period: '2023 – Present',
        role: 'Full-Stack Web Developer',
        org: 'CapiHw Labs (Freelance)',
        place: 'León, Mexico',
        bullets: [
          'Delivered 10+ production websites for clients in marketing, design, technology and construction, 5 of them with a Supabase (PostgreSQL) backend.',
          'Built a product catalog website for Betterware products with Next.js and Supabase.',
          'Built a sales management system with Supabase that tracks orders, payments and credit sales per customer.',
          'Automated deployments with GitHub Actions and Vercel, reducing deployment time from 10 to 4–5 minutes.',
          'Debugged, tested and fixed every release myself, working on Git feature branches to keep main stable; used AI coding agents (Claude Code, Codex) to speed up development.',
        ],
      },
      {
        period: 'Aug 2025 – Present',
        role: 'Linux Kernel Contributor (C)',
        org: 'Open source',
        place: 'Remote',
        bullets: [
          'Fixed an out-of-bounds memory read (CVE-2026-68344) in the ueagle-atm USB driver. Merged in Linux 7.2 and backported to stable kernels 5.10 to 7.1.',
          'Fixed a use-after-free bug (CVE-2026-89892) in the em28xx media driver. Merged in Linux 7.3 and backported to stable kernels 5.10 to 7.2.',
        ],
      },
      {
        period: 'Sep 2026 – Present',
        role: 'HAMi Contributor (Go)',
        org: 'Kubernetes GPU Scheduler · CNCF',
        place: 'Remote',
        bullets: [
          'Fixed a scheduler scoring bug (PR #3106) that calculated pod memory 59% lower than the reserved amount; added Go regression tests.',
          'Fixed a bug (PR #3313) in the Enflame backend that read a mode value as a memory percentage.',
        ],
      },
      {
        period: '2024 – 2028',
        role: 'B.S. in Computer Systems Engineering',
        org: 'Universidad EPCA',
        place: 'León, Mexico',
        bullets: ['Graduating in 2028.'],
      },
    ],
  },
  projects: {
    heading: { eyebrow: 'Work', line1: 'My', line2: 'Projects' },
    viewProject: 'View project',
    projects: [
      {
        title: 'Cuentivo',
        tagline: 'Android app for credit sales',
        stack: ['Flutter', 'Dart', 'Firebase', 'Gemini API'],
        bullets: [
          'Lets small businesses track sales, payments and overdue balances per customer.',
          'Tested by 20 users with 10+ confirmed installs.',
          'The Pro version uses Firebase Auth and the Gemini API through a secure backend gateway.',
          'Ran AI-assisted security testing to find vulnerabilities and fixed them in the architecture.',
        ],
        pattern: 'rings',
        palette: { from: '#07081c', to: '#0e1030', accent: '#2b2bff' },
      },
      {
        title: 'PDF Crop Studio',
        tagline: 'PDF image extractor',
        stack: ['Python', 'Open source'],
        bullets: [
          'Crops images from PDF files with pixel accuracy.',
          'Auto-labels them from the text layer and falls back to OCR.',
        ],
        href: 'https://github.com/diegodevxd/pdf-crop-studio',
        pattern: 'grid',
        palette: { from: '#0e1030', to: '#07081c', accent: '#4ade80' },
      },
      {
        title: 'Betterware Catalog',
        tagline: 'Product catalog website',
        stack: ['Next.js', 'Supabase'],
        bullets: ['Product catalog website for Betterware products, built for a client.'],
        pattern: 'dots',
        palette: { from: '#07081c', to: '#0e1030', accent: '#8a8db8' },
      },
      {
        title: 'Credit sales system',
        tagline: 'Orders, payments and credit sales management',
        stack: ['Supabase', 'PostgreSQL'],
        bullets: [
          'Tracks orders, payments and credit sales per customer.',
          'Customer balances update automatically.',
        ],
        pattern: 'bars',
        palette: { from: '#0e1030', to: '#07081c', accent: '#2b2bff' },
      },
      {
        title: 'Local LLM Lab',
        tagline: 'Language models on my own GPU',
        stack: ['Ollama', 'Linux', 'Windows'],
        bullets: [
          'Installed and ran local models (Gemma, DeepSeek-Coder-V2, Qwen) on Linux and Windows.',
          'Chose lightweight models that fit an RTX 5060 GPU with 8 GB of VRAM.',
        ],
        pattern: 'waves',
        palette: { from: '#07081c', to: '#0e1030', accent: '#f2f2f2' },
      },
    ],
  },
  stack: {
    heading: { eyebrow: 'Tools', line1: 'My', line2: 'Stack' },
    groups: [
      {
        group: 'Languages',
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
          { name: 'REST APIs' },
          { name: 'Supabase', slug: 'supabase' },
          { name: 'Firebase Auth', slug: 'firebase' },
          { name: 'Gemini API', slug: 'googlegemini' },
        ],
      },
      {
        group: 'Databases',
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
        group: 'Systems',
        items: [
          { name: 'Linux Kernel', slug: 'linux' },
          { name: 'Device Drivers' },
          { name: 'Debugging' },
          { name: 'KASAN' },
          { name: 'syzbot' },
        ],
      },
      {
        group: 'AI',
        items: [
          { name: 'Claude Code', slug: 'claude' },
          { name: 'Codex' },
          { name: 'Cursor', slug: 'cursor' },
          { name: 'MCP', slug: 'modelcontextprotocol' },
          { name: 'Prompt Engineering' },
          { name: 'Local LLMs (Ollama)', slug: 'ollama' },
        ],
      },
    ],
  },
  certifications: {
    title: 'Certifications',
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
    heading: { eyebrow: 'Contact', line1: "Let's talk?", line2: 'Write me' },
    intro: 'I am looking for an internship or junior role, remote or on-site in León.',
    email: 'diegomancera.dev@gmail.com',
    github: 'https://github.com/diegodevxd',
    linkedin: 'https://linkedin.com/in/diego-fernando-mancera-gomez',
    cv: { es: '/cv/Diego-Mancera-CV-ES.pdf', en: '/cv/Diego-Mancera-CV-EN.pdf' },
  },
  footer: { text: '© 2026 Diego Mancera · León, Mexico' },
  ui: {
    navAria: 'Main navigation',
    languageAria: 'Language',
    languageNames: { es: 'Español', en: 'English' },
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    socialAria: 'Social links',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    email: 'Email',
    resume: 'CV ↓',
    downloadCv: 'Download CV',
    downloadCvEs: 'CV in Spanish',
    downloadCvEn: 'CV in English',
    viewWork: 'See my work',
    copyEmail: 'Copy email',
    copied: 'Copied',
    openExternal: 'Opens in a new tab',
  },
} satisfies SiteContent
