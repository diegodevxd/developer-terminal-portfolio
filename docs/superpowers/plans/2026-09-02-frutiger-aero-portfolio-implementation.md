# Frutiger Aero Professional Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a bilingual, professional Frutiger Aero portfolio that accurately presents Diego Mancera's current CV and remains readable, responsive and motion-accessible.

**Architecture:** Keep the root site static and dependency-free. Replace the cyberpunk markup and token system with semantic portfolio sections, a single Aqua visual theme and a light decorative background module. Retain the existing client-side translation model and progressively enhance static content with navigation, language persistence and motion-aware animation.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Canvas 2D, Google Fonts, static local server/browser QA.

## Global Constraints

- Scope is root portfolio files only; do not alter `/servicios`, `/admin` or Supabase.
- Spanish is default and all visible content, metadata and aria labels have a complete English equivalent.
- Normal text meets WCAG AA 4.5:1; decorative art can never be the only backdrop for prose.
- No third-party runtime dependency or mandatory Three.js scene; background must have a static/reduced-motion fallback.
- Preserve keyboard navigation, 320px responsiveness and external-link safety.
- Remove cyberpunk/retro visual behavior rather than layering another theme on it.
- Update theme color, favicon and social metadata together with the visual identity.

---

### Task 1: Establish the semantic bilingual portfolio document

**Files:**
- Modify: `index.html`
- Modify: `script.js`

**Interfaces:**
- Consumes: existing `data-i18n` and `data-i18n-aria` language application contract in `script.js`.
- Produces: semantic anchors `#profile`, `#experience`, `#projects`, `#education`, `#contact`; complete `translations.es` and `translations.en` keys for every switched string.

- [ ] **Step 1: Add a content-completeness assertion before changing copy**

Add this development-only function at the end of the translations declaration in `script.js`:

```js
function validateTranslations() {
    const keys = [...document.querySelectorAll('[data-i18n]')]
        .map((el) => el.getAttribute('data-i18n'));
    for (const lang of ['es', 'en']) {
        const missing = [...new Set(keys)].filter((key) => !translations[lang][key]);
        console.assert(missing.length === 0, `Missing ${lang} translations: ${missing.join(', ')}`);
    }
}
```

- [ ] **Step 2: Run the local page and verify the assertion fails for one intentionally added untranslated key**

Run: `python -m http.server 8000`

Open `http://localhost:8000`, then DevTools Console. Expected: an assertion naming the temporary key in the missing locale.

- [ ] **Step 3: Replace portfolio markup and translations**

Rebuild `index.html` around a skip link, glass navigation, hero, profile/strengths, experience timeline, selected projects, education/certifications and contact. Add the CV facts supplied by Diego, including both accepted Linux Kernel fixes, CapiHw Labs, Cuentivo and PDF Crop Studio. Use `<section aria-labelledby>`, heading order `h1` then `h2`, real `<a>` controls, `rel="noopener noreferrer"` on external target links, and keep `data-i18n` keys for every translated element.

Use exact identity copy in Spanish:

```html
<p class="eyebrow" data-i18n="hero_eyebrow">DESARROLLADOR DE SOFTWARE · LEÓN, GUANAJUATO</p>
<h1>Diego Fernando<br><em>Mancera Gómez.</em></h1>
<p data-i18n="hero_role">Full-Stack · Contribuidor Open Source (Linux Kernel)</p>
```

Update `translations.es` and `translations.en` with the matching summary, technical strengths, experience, project and education keys. Call `validateTranslations()` after DOMContentLoaded and remove the temporary untranslated key.

- [ ] **Step 4: Verify both locales and document semantics**

Run: `rg -n "data-i18n=|translations|hero_eyebrow|ueagle|em28xx|Cuentivo|PDF Crop" index.html script.js`

Expected: both locale dictionaries contain all profile facts and the document contains each required portfolio section.

- [ ] **Step 5: Commit**

```powershell
git add index.html script.js
git commit -m "feat: refresh bilingual portfolio content"
```

### Task 2: Replace the cyberpunk design system with Aqua professional glass

**Files:**
- Modify: `styles.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: semantic classes and section IDs from Task 1.
- Produces: CSS custom properties `--ink`, `--sky`, `--aqua`, `--glass`, `--glass-border`, `--focus-ring`; reusable classes `.glass-panel`, `.aero-button`, `.section-shell`, `.timeline-item`, `.project-card`.

- [ ] **Step 1: Add a contrast token check target**

Define the core light-surface variables at the top of `styles.css`:

```css
:root {
  --ink: #10264a;
  --muted-ink: #34506f;
  --sky: #eff9ff;
  --aqua: #0575e6;
  --aqua-deep: #0759ba;
  --glass: rgba(255, 255, 255, .82);
  --glass-border: rgba(255, 255, 255, .92);
  --focus-ring: #004fb5;
}
```

- [ ] **Step 2: Inspect the page before the replacement**

Serve locally and capture a desktop screenshot. Expected: the existing dark Matrix/glitch presentation is still visible, providing a before-state for visual QA.

- [ ] **Step 3: Implement the Aero component system**

Replace dark grid, scanlines, neon/glitch cards and terminal-window styles with a pale aqua field, double-edged glass panels, controlled shadows, 20–28px radii and glossy pill actions. Load a humanist display/body pairing such as `Plus Jakarta Sans` plus `JetBrains Mono`; do not load unused Orbitron/Rajdhani fonts. Ensure paragraphs always sit on `--glass`, not on transparent art.

Implement visible focus styles:

```css
a:focus-visible, button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 4px;
}
```

Add responsive breakpoints for 320px, tablet and wide desktop. On narrow viewports remove expensive `backdrop-filter` and keep a solid pale panel fill.

- [ ] **Step 4: Verify readability and responsiveness**

At 320px, 768px and 1440px, confirm no horizontal scroll and all body text remains on an opaque panel. Tab through the navigation, language control, CTAs and project links. Expected: a visible focus ring and no hidden focus target.

- [ ] **Step 5: Commit**

```powershell
git add styles.css index.html
git commit -m "feat: add Aqua glass portfolio design system"
```

### Task 3: Implement the motion-safe Frutiger Aero environment

**Files:**
- Modify: `script.js`
- Modify: `styles.css`
- Delete: `retro.js`
- Delete: `retro.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: decorative canvas element `#aero-bg` and `.reveal` targets from Tasks 1–2.
- Produces: `initAeroBackground(canvas, reducedMotion)` and `initMobileMenu()` behavior that pauses or reduces motion without affecting page content.

- [ ] **Step 1: Add a reduced-motion behavior check**

Add an early branch to the new background initializer:

```js
if (reducedMotion) {
  canvas.hidden = true;
  return () => {};
}
```

- [ ] **Step 2: Verify the initial check**

Emulate `prefers-reduced-motion: reduce` in browser rendering controls and reload. Expected: `#aero-bg` is hidden and all content is immediately visible.

- [ ] **Step 3: Replace Matrix/3D/retro behavior with lightweight bokeh**

Remove `bg3d.js`, Matrix canvas initialization, scanlines, grid and retro toggle/module references from `index.html`. Draw a capped set of slow translucent bubbles and soft light discs in Canvas 2D, bounded by device pixel ratio and paused through `visibilitychange`. Do not use a continuous animation on coarse/mobile pointers. Preserve only the language toggle, navigation behavior and motion-aware reveal logic.

Make the mobile menu close on Escape and when a navigation link is activated; its toggle keeps `aria-expanded` synchronized.

- [ ] **Step 4: Verify visual/motion behavior**

Check normal desktop for gentle background movement, then reduced-motion and a mobile-size viewport. Expected: no Matrix glyphs, 3D hardware, sparkle cursor or Winamp widget; all modes keep content usable.

- [ ] **Step 5: Commit**

```powershell
git add index.html styles.css script.js retro.js retro.css
git commit -m "feat: add motion-safe Aero background"
```

### Task 4: Refresh brand metadata and perform release QA

**Files:**
- Modify: `index.html`
- Modify: `README.md`
- Modify: `og-image.jpg` or create `assets/og-frutiger-aero.jpg`

**Interfaces:**
- Consumes: final identity copy and visual palette from Tasks 1–3.
- Produces: accurate title, description, theme color, favicon and Open Graph card.

- [ ] **Step 1: Update metadata assertions**

Use this target content in `index.html`:

```html
<meta name="theme-color" content="#e6f4ff">
<meta name="description" content="Diego Fernando Mancera Gómez — Desarrollador Full-Stack y contribuidor open source del Linux Kernel.">
<title>Diego Mancera — Full-Stack & Linux Kernel Contributor</title>
```

- [ ] **Step 2: Verify stale branding is present before cleanup**

Run: `rg -n -i "cyberpunk|matrix|glitch|orbitron|rajdhani|retro 2010" index.html styles.css script.js README.md`

Expected: stale references are reported before they are removed or rewritten.

- [ ] **Step 3: Update social assets and documentation**

Generate a 1200×630 professional Aqua-glass social card with readable name and role; point OG/Twitter metadata to it. Replace cyberpunk wording in README with the actual feature set, current architecture and static local run command.

- [ ] **Step 4: Run release checks**

Run:

```powershell
rg -n -i "cyberpunk|matrix|glitch|retro 2010" index.html styles.css script.js README.md
python -m http.server 8000
```

Expected: no stale primary-branding matches; the page serves without console errors. Manually verify ES and EN, external links, CV download, keyboard path, reduced motion, 320px and desktop viewports.

- [ ] **Step 5: Commit**

```powershell
git add index.html README.md og-image.jpg assets
git commit -m "feat: refresh portfolio brand metadata"
```

## Plan self-review

- **Spec coverage:** Task 1 covers current CV, sections and bilingual content; Task 2 covers glass visual hierarchy and responsiveness; Task 3 covers background, keyboard/motion behavior and retirement of old systems; Task 4 covers metadata, social card and browser QA.
- **Placeholders:** no deferred requirements or unspecified files remain.
- **Interface consistency:** `data-i18n`/`data-i18n-aria`, `#aero-bg`, `initAeroBackground`, and the CSS component classes are introduced before their dependent tasks.
