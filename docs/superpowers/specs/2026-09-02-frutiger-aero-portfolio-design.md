# Frutiger Aero Professional Portfolio — Design Specification

## Objective

Replace the current cyberpunk-terminal presentation of Diego Fernando Mancera Gómez's portfolio with an accessible, professional Frutiger Aero experience. The site remains a static, responsive ES/EN portfolio and presents the supplied CV as the source of truth.

## Design direction

The visual language is *Aqua professional*: optimistic technology and nature, not a novelty wallpaper. It combines a calm sky/water field, sparse bokeh bubbles and refraction-like motion with opaque enough glass surfaces for reliable reading.

- Base: ceramic sky white and pale aqua (`#F4F9FD`, `#E6F4FF`), with deep navy text (`#0B1B3D`).
- Accents: glaze cyan (`#0072FF` / `#00C6FF`) for interactive controls and eco green (`#00A85A` or darker as needed) for status/highlights.
- Material: rounded, double-edged translucent panels with a controlled `backdrop-filter`; panels that carry body text must have a solid/translucent fill strong enough to retain at least WCAG AA contrast.
- Type: humanist sans display/body (e.g. Plus Jakarta Sans or a comparable system-safe stack) and a single clean monospace for technical metadata. The old glitch, scanline, terminal and neon treatments are removed from the primary experience.
- Motion: low-frequency canvas/CSS bokeh, bubbles and caustic-like light only. Interaction creates subtle lift/glint, never fast flashing. The animation pauses when hidden and becomes static under `prefers-reduced-motion`.

## Information architecture and content

The top navigation uses glass-pill styling and anchors to: Profile, Experience, Projects, Education, Contact, plus the existing Services route. The language toggle persists the selected locale.

1. **Hero** — name, “Software Developer · Full-Stack · Open Source Contributor (Linux Kernel),” León, Guanajuato, and clear actions for CV, GitHub and contact. It introduces the two accepted upstream fixes as a compact credibility signal.
2. **Profile / strengths** — professional summary and grouped skills: languages; Linux/open source; web, mobile and data; CI/CD and AI.
3. **Experience** — CapiHw Labs and Linux Kernel contributor timeline. Each kernel contribution explains impact in plain language and links to the patch when existing project URLs are available.
4. **Selected projects** — Cuentivo, PDF Crop Studio, plus existing verified portfolio projects that remain relevant. Cards expose stack, concise outcome and link.
5. **Education and certifications** — EPCA degree timeline, LFD103, LFC102 and CECATI credential.
6. **Contact** — location, phone, email, LinkedIn, GitHub and portfolio links. Use real URLs only where already present; retain text labels otherwise.

Spanish is the default. Every new visible string receives a complete English counterpart in the existing client-side translation system; no locale should expose Spanish fallback text. Metadata, aria labels and download/action labels are also translated.

## Components and behavior

- A background layer sits behind all content, has no semantic role and never receives pointer input.
- Reusable glass panels form hero, experience items and project cards; a darker “Kernel console” panel may be used solely for technical patch summaries.
- Cards are grids on desktop and scroll-snap/carousel-friendly on mobile only when density needs it. Content remains reachable by keyboard.
- Buttons and links have visible focus rings, clear hover/active feedback and generous targets.
- Existing language persistence, mobile navigation, section highlighting and reduced-motion handling are preserved or improved. The retro 2010 easter egg should be removed or fully re-themed so it cannot restore the cyberpunk visual system.

## Accessibility and performance acceptance criteria

- Normal body text meets WCAG AA contrast (4.5:1); essential hero and navigation text cannot sit on unbounded translucent imagery.
- Keyboard navigation, semantic headings, labeled icon-only controls and external-link safety remain intact.
- No animation is required to understand content. Reduced-motion disables continuous canvas/3D motion and card entrance effects.
- The background is rendered in a single lightweight canvas or CSS layer; no mandatory high-cost shader/Three.js scene. It throttles/pause on hidden tabs and has a static fallback.
- Images are decorative unless they convey project information; decorative art is hidden from assistive technology.
- The site remains functional at 320px and on large desktop screens.

## Implementation boundaries

The scope is the root portfolio (`index.html`, `styles.css`, `script.js`, and background assets/scripts as needed). Do not change the `/servicios`, `/admin` or Supabase payment flow. The current CV PDF remains downloadable unless a new CV file is supplied.

## Review input incorporated

The Art Director review from Agy/Gemini recommends: aqua/cerulean and eco-green accents, glass with real opacity rather than decorative transparency, humanist typography, and bokeh/caustics in place of Matrix rain. It specifically identifies a toy-like/bloatware result and GPU-heavy 3D as risks. Claude Code has been asked to provide an independent UX/accessibility review; its findings will be applied to the implementation plan before coding begins.

## Verification plan

1. Serve the static site locally and inspect desktop plus narrow mobile layouts.
2. Check Spanish and English content, language persistence, navigation and all CTA routes.
3. Enable reduced motion and verify no continuous animation remains.
4. Keyboard-test menu, language toggle, cards, carousel and contact links.
5. Inspect text contrast and ensure the background cannot obscure prose.
