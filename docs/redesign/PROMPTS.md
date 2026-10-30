# Prompts para el implementador (opencode)

Comando base (desde la raíz del repo):

```bash
opencode run -m opencode-go/deepseek-v4.1-flash -f docs/redesign/PLAN.md --title "F0 base" "<prompt de la fase>"
```

El planeador escribe el prompt de cada fase **después de auditar la anterior**, para corregir desviaciones.

---

## F0 — Base

```
Eres el implementador del rediseño descrito en docs/redesign/PLAN.md (adjunto). Léelo completo.
Ejecuta SOLO la Fase F0. Sigue las reglas de la sección 10.

Pasos:
1. git tag v1-legacy (sobre HEAD actual) y git checkout -b redesign/react.
2. Crea una app Vite + React 19 + TypeScript strict EN LA RAÍZ del repo sin borrar archivos existentes
   (si el scaffolder choca con index.html, renombra el actual a legacy-index.html temporalmente).
   El punto de entrada debe ser src/app/main.tsx.
3. Instala y configura Tailwind CSS v4 (@tailwindcss/vite) con src/styles/globals.css.
4. Configura el alias @/ -> src/ en tsconfig y vite.config.ts, y ejecuta shadcn init
   (components en src/components/ui, utils en src/lib/utils.ts).
5. Instala: motion, lucide-react, simple-icons. Dev: vitest, @testing-library/react, jsdom,
   eslint (config flat de Vite), prettier.
6. Scripts en package.json: dev, build, preview, lint, test, format.
7. Crea la estructura de carpetas de la sección 4 con un index.ts vacío donde haga falta.
8. Copia assets:
   - "C:\Users\pibed\Downloads\WhatsApp Image 2026-09-21 at 11.42.30 PM.jpeg" -> public/images/diego-portrait.jpg
     (si hay herramienta disponible, recorta a 4:5 y exporta también public/images/diego-portrait.webp de 900px de ancho)
   - "C:\Users\pibed\Downloads\CVs\Diego-Mancera-FullStack-Kernel-Linux-ES.pdf" -> public/cv/Diego-Mancera-CV-ES.pdf
   - "C:\Users\pibed\Downloads\CVs\Diego-Mancera-FullStack-Kernel-Linux-EN.pdf" -> public/cv/Diego-Mancera-CV-EN.pdf
9. App.tsx muestra solo "Hello" con las clases de Tailwind funcionando.
10. Agrega un test trivial en src/lib/utils.test.ts para cn().
11. Ejecuta npm run lint, npm run test -- --run, npm run build. Todo en verde.
12. Commit: "feat(redesign): F0 base Vite + React + TS + Tailwind + shadcn". NO push.
13. Imprime el resumen pedido en la regla 8.
```

### Auditoría F0 (planeador)

- ✅ Scaffold, alias `@/`, Tailwind v4, shadcn, Vitest, estructura de carpetas, etiqueta `v1-legacy`, rama `redesign/react`.
- 🔧 Corregido por el planeador: copia de assets (opencode rechazó leer fuera del repo), paquete basura `cn` desinstalado,
  test con expresión constante (lint), `dist/` fuera del repo y en `.gitignore`, commit `111d786`.
- ⚠️ Pendiente para F1: shadcn metió `@fontsource-variable/geist` y tokens claros por defecto que no son los del plan;
  `index.html` apunta a `/favicon.svg` que no existe.

---

## F1 — Sistema visual + layout

```
Eres el implementador del rediseño descrito en docs/redesign/PLAN.md (adjunto). Léelo completo.
Ejecuta SOLO la Fase F1. Sigue las reglas de la sección 10. Trabaja en la rama redesign/react.
NO necesitas leer nada fuera del repo.

1. Fuentes (self-hosted, sin Google Fonts en runtime):
   - npm uninstall @fontsource-variable/geist
   - npm install @fontsource-variable/antonio @fontsource-variable/inter @fontsource-variable/jetbrains-mono
   - Impórtalas en src/styles/globals.css y define en @theme:
     --font-display: 'Antonio Variable'; --font-sans: 'Inter Variable'; --font-mono: 'JetBrains Mono Variable'
     (con fallbacks del sistema). Elimina el bloque que pone Geist.
2. Tokens: reemplaza los valores claros/oscuros por defecto de shadcn por la paleta de la sección 5 del plan.
   El sitio es SOLO oscuro: pon los valores en :root, borra el bloque .dark y la @custom-variant dark.
   Mapea las variables de shadcn así: --background=#07081c, --foreground=#f2f2f2, --card=#0e1030,
   --muted=#0e1030, --muted-foreground=#8a8db8, --border=#23265a, --input=#23265a, --primary=#2b2bff,
   --primary-foreground=#ffffff, --ring=#2b2bff, --accent=#2b2bff, --accent-foreground=#ffffff.
   Agrega tokens propios en @theme inline: --color-line, --color-ok (#4ade80), --color-accent-electric (#2b2bff).
   Borra los tokens de sidebar y chart (no se usan).
3. Componentes en src/components/layout/ (cada uno en su archivo, exportados desde index.ts):
   - SiteFrame: marco fijo azul eléctrico de 6px alrededor del viewport (pointer-events:none), envuelve children.
   - Navbar: píldora centrada fija arriba, fondo --card al 80% con backdrop-blur, borde --line. Recibe
     items {id,label}[] y renderiza anclas #id; resalta la sección visible (usa hooks/useActiveSection con
     IntersectionObserver). A la derecha un botón ES/EN. En móvil (<640px) muestra solo iconos lucide o
     un menú compacto; nunca scroll horizontal.
   - SocialRail: columna fija a la izquierda (solo ≥1024px) con iconos de GitHub, LinkedIn y correo
     (recibe links por props; usa simple-icons para GitHub/LinkedIn y lucide Mail).
   - ResumeButton: botón fijo abajo a la derecha (≥1024px), texto mono "CV ↓", recibe href.
   - Footer: una línea mono, recibe texto por props.
   - SectionHeading: props {eyebrow?, line1, line2, id?}. Titular font-display MAYÚSCULAS enorme
     (clamp(3rem, 9vw, 8rem), leading 0.9); line1 en --foreground, line2 en --muted-foreground.
     eyebrow en mono xs mayúsculas con prefijo "// ".
   - CornerFrame: contenedor con 4 esquinas en corchete (pseudo-elementos o spans) de 14px, borde --line,
     las esquinas en --foreground; prop className.
   - TerminalCard: tarjeta estilo terminal (3 puntos, título centrado mono "Terminal — zsh"),
     props {command: string, lines: string[]}; cada línea con ✓ en --color-ok. Fondo #050614, borde --line.
   - Reveal: wrapper con motion que hace fade + y:12 + blur(4px) al entrar en viewport, una sola vez.
4. Locale:
   - src/hooks/useLocale.ts + src/app/providers.tsx con LocaleProvider (contexto {locale:'es'|'en', setLocale}).
     Persistencia en localStorage dentro de try/catch; por defecto 'es'; actualiza document.documentElement.lang.
   - providers.tsx también envuelve en <MotionConfig reducedMotion="user">.
5. Favicon: crea public/favicon.svg: cuadrado #07081c con las letras "DM" en #2b2bff (SVG a mano).
6. App.tsx: SiteFrame > Navbar + SocialRail + ResumeButton + <main> con 5 secciones placeholder
   (id: inicio, open-source, experiencia, proyectos, contacto), cada una con min-h-dvh y un SectionHeading
   de prueba, + Footer. En ESTA fase los textos de prueba pueden estar en App.tsx en un objeto
   const PLACEHOLDER = {...} al inicio del archivo (en F2 se mueven a content/).
7. Tests: useLocale (persistencia y fallback cuando localStorage lanza), SectionHeading (renderiza line1/line2).
8. Verifica a 375px de ancho que no hay scroll horizontal (overflow-x en html/body NO es la solución:
   corrige el elemento que desborda).
9. npm run lint (0 errores), npx vitest --run, npm run build: todo en verde.
10. Commit "feat(redesign): F1 sistema visual y layout". NO push. Imprime el resumen de la regla 8.
```

### Auditoría F1 (planeador)

- opencode se colgó en modo no interactivo (sin salida durante 47 min). F1 la hizo Sonnet → commit `0b60ac5`.
  El proceso de opencode siguió vivo y escribió encima su propia F1. Esa versión se guardó en la rama
  `f1-opencode` (`4a25437`) como referencia, y `redesign/react` se quedó con la de Sonnet.
- ✅ Las dos pasan lint (0 errores), tests y build, y ninguna tiene scroll horizontal.
  Tokens, fuentes, favicon y dirección de dependencias correctos.
- ⚠️ Pendiente para F2: a 278px "DESARROLLADOR" se parte a media palabra y el botón ES/EN queda recortado;
  la rama `f1-opencode` resuelve mejor el móvil (menú hamburguesa + selector ES/EN segmentado).
- 📌 Lección: opencode `run` solo es fiable con `--auto` o en sesión interactiva. Si se usa, el usuario lo corre en su terminal.

---

## F2 — Contenido (+ arreglos móviles de F1)

```
Eres el implementador del rediseño descrito en docs/redesign/PLAN.md. Léelo completo.
Ejecuta SOLO la Fase F2. Sigue las reglas de la sección 10. Rama: redesign/react.

Fuentes de contenido (lee las tres; NO inventes nada que no esté ahí):
- C:\Users\pibed\Downloads\CVs\Diego-Mancera-FullStack-Kernel-Linux-ES.pdf
- C:\Users\pibed\Downloads\CVs\Diego-Mancera-FullStack-Linux-Kernel-EN.pdf
- C:\Users\pibed\Downloads\CVs\README.md (URLs exactas de CVE, commits y PRs)

1. src/content/types.ts: tipos readonly para todo el sitio: SiteContent { meta, nav, hero, about,
   openSource, experience, projects, stack, certifications, contact, footer, ui }.
   - Contribution: { project, driver?, language, title, plain (bug explicado a un no-programador, 1 frase),
     technical (1 frase), status (p. ej. "Linux 7.2 · stable 5.10–7.1"), links: {label, href}[] }
   - Job / TimelineEntry: { period, role, org, place?, bullets[] }
   - Project: { title, tagline, stack[], bullets[], href?, pattern?, palette? } (pattern/palette son para
     el DiscCascadeCarousel de F5; deja palettes coherentes con los tokens: fondos #07081c/#0e1030, acento #2b2bff)
   - StackGroup: { group, items: { name, slug? }[] } (slug = id de simple-icons cuando exista)
   - ui: todas las micro-etiquetas (botones, aria-labels, "Copiar correo", "Copiado", "Descargar CV", etc.)
2. src/content/es.ts y en.ts que cumplen SiteContent (satisfies). Contenido según PLAN secciones 6 y 8:
   - hero.terminal: command "whoami" y 3 líneas con los números reales del CV.
   - openSource: 4 contribuciones (ueagle-atm CVE-2026-68344, em28xx CVE-2026-89892, HAMi #3106, HAMi #3313)
     con enlaces a cve.org, git.kernel.org y github.
   - experience: CapiHw Labs 2023–hoy, Kernel ago 2025, HAMi sep 2026, EPCA 2024–2028.
   - projects: Cuentivo, PDF Crop Studio (href github.com/diegodevxd/pdf-crop-studio), Catálogo Betterware,
     Sistema de ventas a crédito, Laboratorio de LLMs locales.
   - stack: grupos del CV (Lenguajes, Frontend, Backend, Bases de datos, DevOps, Sistemas, IA).
   - certifications: LFD103 y LFC102 (2026).
   - contact: email diegomancera.dev@gmail.com, GitHub https://github.com/diegodevxd,
     LinkedIn https://linkedin.com/in/diego-fernando-mancera-gomez, cv.es /cv/Diego-Mancera-CV-ES.pdf,
     cv.en /cv/Diego-Mancera-CV-EN.pdf. SIN teléfono.
   - Titulares de sección en 2 líneas (line1/line2) cortas para el estilo de dos tonos.
     Evita palabras de más de 11 letras en los titulares grandes (para que no se partan en móvil);
     ej. hero line1 "Full-Stack", line2 "& Kernel Linux".
3. src/content/index.ts: getContent(locale) y un hook useContent() en src/hooks/useContent.ts
   (usa useLocale + getContent).
4. Test src/content/content.test.ts: es y en tienen exactamente la misma forma (mismas claves y mismas
   longitudes de arrays, recursivo), todos los href son https:// o empiezan con "/" o "mailto:", y no hay
   ningún número de teléfono (regex de 10 dígitos).
5. App.tsx: elimina PLACEHOLDER; todo sale de useContent(). Los componentes de layout reciben textos por props
   (Navbar items, aria-labels, Footer, ResumeButton href según locale, SocialRail links).
6. Arreglos móviles de F1 (referencia: git show f1-opencode:src/components/layout/Navbar.tsx):
   - Navbar por debajo de 640px: píldora compacta con selector ES/EN segmentado + botón hamburguesa que abre un
     panel con las secciones (aria-expanded, cierra con Escape y al elegir un enlace). Que nada quede recortado a 280px.
   - SectionHeading: quita break-words si parte palabras; ajusta el clamp para que la palabra más larga quepa a 280px.
7. npm run lint (0 errores), npx vitest --run, npm run build: todo en verde.
8. Commit "feat(redesign): F2 capa de contenido ES/EN" con línea Co-Authored-By. NO push.
9. Reporta: archivos, comandos y resultados, hash del commit, desviaciones.
```

### Auditoría F2 (planeador)

- ✅ Commit `3134559`. Lint con 0 errores, 14 tests y build en verde.
- ✅ Hechos verificados contra el CV y el README: CVE-2026-68344 / 89892, commits `71132ced…` / `95f76f51…`,
  HAMi #3106 / #3313, links de GitHub y LinkedIn, sin teléfono. ES y EN tienen la misma forma (lo cubre un test).
- ✅ Decisión correcta del implementador: los PRs de HAMi dicen "2 PRs en HAMi", no "integrados", porque el CV no dice merged.
- ⚠️ El menú móvil de 280px solo está cubierto por unit tests; en F3 se verifica visualmente.
- ℹ️ El reporte decía que Prettier había tocado unos 20 archivos solo en saltos de línea; `git diff -w` muestra 14 archivos con cambios reales. Sin ruido.

---

## F3 — Hero + retrato ASCII

```
Eres el implementador del rediseño descrito en docs/redesign/PLAN.md. Léelo completo (sobre todo las secciones 6 y 7).
Ejecuta SOLO la Fase F3. Sigue las reglas de la sección 10. Rama: redesign/react.

1. src/lib/ascii/engine.ts: funciones PURAS, sin DOM, testeables:
   - CHARSETS = { standard: ' .:-=+*#%@' }.
   - luminance(r,g,b) en 0..1 (Rec. 709).
   - adjust(l, { brightness: -1..1, contrast: 0..255 con 128 = neutro }) → 0..1, con clamp.
   - sampleGrid(data: Uint8ClampedArray, width, height, cellSize) → { cols, rows, values: Float32Array }
     con la luminancia media por celda.
   - glyphFor(value, charset, invert=false) → string.
   - shimmer(value, col, row, t, intensity 0..1) → valor modulado por una onda diagonal
     0.5 + 0.5*sin(t*speed - (col+row)*k) y con clamp.
   - noiseTile(size, seed) → Uint8ClampedArray en escala de grises, determinista (PRNG con semilla).
   Tests (engine.test.ts): extremos de luminancia, contraste neutro = identidad, sampleGrid con una imagen sintética
   de 4×4, glyphFor en los extremos y con invert, shimmer dentro de 0..1, noiseTile determinista con la misma semilla.
2. src/components/ui/ascii-portrait.tsx (cliente, sin texto visible propio; recibe alt por props):
   props { src, alt, cellSize?=10, charset?='standard', contrast?=128, animate?=true, className? }.
   - Carga la imagen y la dibuja en un canvas offscreen al tamaño del contenedor (object-fit: cover y ancla
     superior para no cortar la cara). Muestrea con sampleGrid UNA vez y otra vez por cada resize (ResizeObserver,
     con debounce de 150ms). Usa devicePixelRatio con un máximo de 2.
   - Capas: (a) <img> de fondo con filter blur(2px) grayscale(1) y opacity .9 * .25 (muy tenue);
     (b) canvas principal con glifos en font-mono, color --foreground; las celdas con valor > .8 se tiñen hacia
     --accent-electric (mezcla de un 25%); (c) viñeta con radial-gradient (intensidad ~.58); (d) grano con noiseTile
     en un canvas pequeño en mosaico, con mix-blend-mode overlay y opacity ~.32.
   - Animación shimmer a ≤30 fps con requestAnimationFrame. Se pausa con IntersectionObserver fuera de pantalla y
     con document.hidden. Con prefers-reduced-motion o animate=false pinta un solo fotograma.
   - El fondo gris de la foto debe quedar casi vacío: aplica un umbral (valores < ~.12 → espacio) después de invertir
     según haga falta, para que el retrato resalte sobre --background. Ajusta invert/umbral hasta que la cara se lea bien.
   - role="img" aria-label={alt}. Libera todos los observers y el rAF al desmontar.
   - cellSize 8 por debajo de 640px.
3. src/features/hero/: Hero.tsx (+ HeroTerminal.tsx si ayuda), exportado desde index.ts. Layout:
   - ≥1024px: dos columnas. Izquierda: eyebrow, titular de dos tonos (font-display enorme, line1/line2), summary,
     botones (primario bg-accent-electric → #proyectos; secundario con borde → CV según idioma, con download)
     y TerminalCard. Derecha: AsciiPortrait con aspect 4/5 y alto máximo ~80vh, dentro de un CornerFrame.
   - <1024px: el retrato arriba (aspect 4/5, ancho completo y máximo 420px, centrado) y el texto debajo.
   - Usa Reveal para la entrada escalonada. Todo el texto sale de useContent().hero.
   - El h1 de la página es el titular del hero (SectionHeading usa h2; aquí usa h1 o agrega una prop `as`).
   - Imagen: /images/diego-portrait.webp, con /images/diego-portrait.jpg como fallback si webp falla.
4. App.tsx: reemplaza el placeholder de la sección #inicio por <Hero/>.
5. Verificación visual OBLIGATORIA: haz el build, sírvelo con vite preview y revisa en el navegador a 1280×800,
   375×812 y 280×600. Confirma que (a) el retrato es reconocible y está animado, (b) no hay scroll horizontal,
   (c) el menú móvil de F2 abre y cierra y nada se recorta a 280px. Arregla lo que falle. Detén el servidor al terminar.
   Rendimiento: con el retrato visible, el frame debe tardar menos de 8ms en desktop
   (mídelo con performance.now() alrededor del dibujo y quita esa instrumentación antes del commit).
6. npm run lint (0 errores), npx vitest --run, npm run build: todo en verde.
7. Commit "feat(redesign): F3 hero y retrato ASCII" con línea Co-Authored-By. NO push.
8. Reporta: archivos, comandos y resultados, hash, ms por frame medidos, desviaciones,
   y la ruta de 2 capturas (desktop y 375) guardadas en la carpeta scratchpad que se te indique.
```

### Auditoría F3 (planeador)

- ✅ Commits `624815b` (hero + motor ASCII) y `9ee2c98` (F3.1). Lint con 0 errores, 30 tests y build en verde.
  Layout desktop/móvil aprobado: no hay scroll horizontal a 375 ni a 280.
- 🔧 La primera versión del retrato dejaba la cara vacía (el mapeo "distancia al fondo" confundía la piel gris con la pared).
  F3.1: máscara del sujeto generada offline (`scripts/make-portrait-mask.py`) + densidad fotográfica positiva dentro de
  la máscara. Ahora la cara se ve llena, la silueta se lee y el fondo queda vacío.
- ⚠️ Frame de 5.8 ms de media (p95 6.6 ms) en Chrome headless por software: dentro de los 8 ms pero con poco margen.
  Si en F6 Lighthouse lo marca, sube cellSize a 9 en desktop.
- ⚠️ A 280px el menú móvil sigue apretado: "Open Source" ocupa 2 líneas y algunos iconos se encogen. Va en F4.

---

## F4 — Secciones de contenido

```
Eres el implementador del rediseño descrito en docs/redesign/PLAN.md. Léelo (secciones 4, 5, 6 y 10).
Ejecuta SOLO la Fase F4. Rama: redesign/react. Todo el texto sale de useContent() (src/content/es.ts y en.ts ya
están completos; si falta una micro-etiqueta, agrégala en types.ts + es.ts + en.ts).

Crea, cada una en su carpeta de src/features/ con un solo export en index.ts:
1. about/About.tsx (#sobre-mi; agrega el ítem a nav SOLO si cabe en el menú; si no, déjalo sin ítem): SectionHeading +
   párrafo del perfil + bloque "Qué busco" como lista de CornerFrame pequeños. Grid de 2 columnas en ≥1024px.
2. open-source/OpenSource.tsx + ContributionCard.tsx (#open-source): grid de 2 columnas en ≥768px. Cada card va
   dentro de un CornerFrame y muestra, en este orden: proyecto + lenguaje (mono xs mayúsculas), título, `plain` en
   texto normal, `technical` en mono pequeño --muted-foreground, `status` como badge, y enlaces con icono
   ExternalLink (target _blank rel noopener). Hover: borde --accent y una leve elevación. Es la sección estrella:
   dale aire (gap grande).
3. experience/Experience.tsx + TimelineRow.tsx (#experiencia): estilo Redoyan. Cada fila es una grid de 3 columnas en
   ≥1024px: [rol + org en --accent] | [periodo GIGANTE font-display al centro] | [bullets]. En móvil se apila,
   con el periodo grande arriba. Línea vertical fina --line con un punto --accent por fila.
4. stack/Stack.tsx + TechBadge.tsx (#stack, sin ítem en nav): grupos con un título mono y badges. TechBadge: si
   `slug` existe, renderiza el path SVG del icono de simple-icons (import { siX } por slug; arma un mapa
   slug→icono SOLO con los slugs que usa el contenido para no inflar el bundle) en color --foreground; si no,
   muestra solo el texto. Debajo, la fila de certificaciones (LFD103, LFC102) como badges con borde.
5. contact/Contact.tsx (#contacto): SectionHeading gigante, el correo como botón grande que copia al portapapeles
   (navigator.clipboard con try/catch; feedback "Copiado" con aria-live 2s), y enlaces a GitHub, LinkedIn,
   CV ES y CV EN.
6. App.tsx: orden Hero → About → OpenSource → Experience → (placeholder #proyectos se queda para F5) → Stack →
   Contact → Footer. Envuelve cada sección en Reveal. Padding vertical consistente (py-24 md:py-32) y un ancho máximo
   común (max-w-6xl mx-auto px-5 md:px-8). Separa las secciones con un borde fino --line.
7. Arreglo móvil (de la auditoría F3): a 280px el panel del menú debe mostrar cada ítem en 1 línea con su icono a
   tamaño fijo (shrink-0 size-4); si no cabe, reduce el padding o la letra, pero no partas palabras.
8. Tests: ContributionCard (renderiza los enlaces con target _blank y rel), Contact (copiar llama a clipboard.writeText
   y muestra el feedback; hay fallback si lanza), TechBadge (con y sin slug).
9. Verificación visual a 1280×800, 375×812 y 280×600 con vite preview (configuración f3-preview en .claude/launch.json):
   no hay scroll horizontal, todos los links funcionan y el menú a 280 se ve bien. Guarda capturas desktop-full y
   mobile-375 de cada sección nueva en scratchpad/f4-shots (la ruta se te indica). Detén el servidor.
10. lint (0 errores), vitest, build en verde. Commit "feat(redesign): F4 secciones de contenido" con Co-Authored-By. NO push.
```

### Auditoría F4 (planeador)

- ✅ Commit `f095c97`. Lint con 0 errores, 37 tests y build en verde. Ninguna resolución tiene scroll horizontal.
  El menú a 280px ya muestra una opción por línea. Las secciones siguen el estilo del plan (capturas revisadas).
- ⚠️ Bundle JS: 486 kB (161 kB gzip). Hay que revisarlo en F6 (manualChunks / lazy de la sección de proyectos).
- ⚠️ Experiencia en desktop: la columna del rol es angosta (los títulos en azul se parten mucho) y "AGO 2025 - HOY"
  ocupa 2 líneas. Se pule en F6.
- 📦 El planeador dejó `src/components/ui/disc-cascade-carousel.tsx` con el código del usuario sin cambios.

---

## F5 — Proyectos (DiscCascadeCarousel)

```
Eres el implementador del rediseño descrito en docs/redesign/PLAN.md. Ejecuta SOLO la Fase F5. Rama: redesign/react.
El componente src/components/ui/disc-cascade-carousel.tsx YA está en el repo (código del usuario, sin cambios).
Úsalo sin reescribirlo; solo se permiten los cambios mínimos del punto 1.

1. Adaptaciones mínimas al componente (documenta cada una con un comentario de 1 línea):
   - i18n: los textos internos en inglés ("Previous film", "Next film", "Film X of N", "of", aria-label "Catalogue")
     pasan a props opcionales (p. ej. labels?: { prev, next, slideOf, live, nav }) con los valores actuales por defecto.
   - Si lint o tsc fallan por el estilo del archivo (comillas dobles, "use client", ternarios largos), excluye SOLO este
     archivo de Prettier en .prettierignore y arregla los errores reales de lint con cambios mínimos. No toques
     eslint.config.js.
2. src/features/projects/Projects.tsx (#proyectos), exportado desde index.ts. Reemplaza el placeholder en App.tsx.
   - Mapea content.projects → DiscCascadeItem[]: title, label (más corto si hace falta), pattern y palette (ya vienen en el
     contenido), credits = [{label: ui.stack, value: stack.join(' · ')}, {label: ui.year o rol si existe}, ...] SOLO con
     datos reales del contenido, sin reviews (reviews={false}).
   - Props: height "clamp(560px, 92svh, 820px)", background "transparent" (la sección ya trae --background),
     color "var(--color-foreground)", serif/sans/display = las fuentes del sitio (Antonio para serif/display, Inter para
     sans; NO cargues fontHref), brand "DM", indexLabel = ui de contenido, hint = ui de contenido, loop, autoplay 0,
     frame false (ya hay CornerFrame alrededor), labels del punto 1 desde useContent().
   - onSelect: si el proyecto tiene href, ábrelo en una pestaña nueva (noopener).
   - Debajo del carrusel, un panel con el proyecto activo (controla index/onIndexChange): tagline, bullets y stack como
     badges, y un botón "Ver repositorio" si hay href. Esto mantiene el texto legible y accesible (el componente pone
     sus detalles con aria-hidden).
   - <720px: NO renderices el carrusel; muestra una lista de tarjetas (CornerFrame) con la misma información.
     Usa un hook useMediaQuery en src/hooks (con SSR-safe default y listener de change).
   - Arriba, SectionHeading con heading de content.projects.
   - Carga diferida: importa Projects con React.lazy en App.tsx + Suspense (fallback: el SectionHeading y un bloque
     de la misma altura) para sacar el carrusel del bundle inicial.
3. Tests: mapeo de projects → items (función pura projectsToDiscItems en el feature, con test), useMediaQuery, y que
   en móvil (matchMedia mock) se renderiza la lista y no el carrusel.
4. Verificación visual a 1280×800 y 375×812 (configuración f3-preview, o chrome-devtools si el panel es angosto):
   arrastre, flechas del teclado y botones funcionan; el panel del proyecto activo cambia; no hay scroll horizontal.
   Capturas en scratchpad/f5-shots (desktop-projects.png, mobile-375-projects.png). Detén el servidor.
5. lint (0 errores), vitest, build en verde. Reporta el tamaño del bundle inicial antes y después del lazy.
6. Commit "feat(redesign): F5 proyectos con disc carousel" con Co-Authored-By. NO push.
```

### Auditoría F5 (planeador)

- ✅ Commit `3bb0cf9`. Lint con 0 errores, 45 tests y build en verde. Carrusel funcional (arrastre, teclado, botones),
  lista en móvil, sin scroll horizontal. Cambios en el componente del usuario: mínimos y documentados (labels i18n +
  eslint-disable de `react-hooks/refs`, que el motor de resortes usa a propósito).
- ✅ El carrusel va en un chunk aparte (11.5 kB gzip), pero el bundle inicial sigue en ~162 kB gzip.
- ⚠️ Pendiente para F6: (a) el scroll-spy marca "Experiencia" sobre #proyectos; (b) el nav interno del carrusel
  ("DM · Índice") choca con la navbar fija del sitio; (c) el texto del borde del disco repite "STACK … RESUMEN …".

---

## F6 — Pulido, rendimiento, SEO y limpieza (fase final)

```
Eres el implementador del rediseño descrito en docs/redesign/PLAN.md. Ejecuta SOLO la Fase F6. Rama: redesign/react.
Lee la "Auditoría F4" y la "Auditoría F5" de docs/redesign/PROMPTS.md: todos sus ⚠️ se resuelven aquí.

A. Arreglos de UI
 1. useActiveSection: la sección activa es la que cruza una línea a ~40% de la altura del viewport
    (rootMargin "-40% 0px -55% 0px" o equivalente). Que funcione con #proyectos aunque se monte tarde (React.lazy).
    Agrega un test.
 2. Carrusel: oculta su nav interno (brand="" e indexLabel="") O bájalo para que no choque con la navbar; recomendado:
    ocultarlo, porque el panel de detalle ya cumple esa función. fine = stack.join(' · ') (sin "RESUMEN").
 3. Experiencia en ≥1024px: columnas [minmax(14rem,1fr) | auto | 1.4fr], el periodo con whitespace-nowrap y un tamaño
    que quepa en 1 línea ("AGO 2025 – HOY" debe entrar en una sola línea); el rol con un tamaño legible, sin partirse letra
    por letra.
B. Rendimiento
 4. Investiga por qué el bundle inicial pesa ~162 kB gzip (usa `npx vite-bundle-visualizer` o rollup-plugin-visualizer
    SOLO como herramienta temporal, sin dejarlo en package.json; o lee el output de build con --mode production y
    sourcemap). Causas típicas: simple-icons importado entero, motion completo, radix-ui sin usar, shadcn button.
    Objetivo: ≤ 110 kB gzip inicial. Usa `motion/react` con LazyMotion + domAnimation y `m.` si ayuda; quita
    dependencias que no se usen (p. ej. radix-ui, class-variance-authority si button.tsx no se usa: si no se usa, bórralo).
    Reporta antes y después.
 5. Imágenes: el retrato con width/height, fetchpriority="high" en la del hero y preload del webp y de la máscara
    en index.html.
C. SEO y metadatos
 6. index.html: <html lang> dinámico (ya se hace en runtime; deja "es" por defecto), title y meta description desde ES,
    canonical y og:url = https://diegomancera.vercel.app/ (dominio del CV), Open Graph y Twitter card completos,
    theme-color, favicon y apple-touch-icon (genera un PNG de 180px desde favicon.svg con Pillow en un script temporal;
    no lo dejes en el repo).
 7. og-image: genera public/og-image.png de 1200×630 con el estilo del sitio (fondo #07081c, marco #2b2bff, nombre en
    Antonio, subtítulo "Full-Stack & Kernel Linux", y el retrato a la derecha). Hazlo con un script Python/Pillow en
    scripts/make-og-image.py (sí se versiona). Si la fuente Antonio no está disponible como TTF, usa la woff2 de
    node_modules/@fontsource-variable/antonio convertida, o una fuente condensada del sistema, y repórtalo.
 8. public/robots.txt y public/sitemap.xml (una URL). JSON-LD de tipo Person en index.html con name, jobTitle, url,
    sameAs (GitHub, LinkedIn), email; sin teléfono.
D. Accesibilidad
 9. Enlace "Saltar al contenido" visible al recibir foco. Foco visible en todos los interactivos. Contraste AA del
    texto --muted-foreground sobre --background (calcúlalo; si no llega a 4.5:1 en texto normal, ajusta el token).
E. Limpieza (con la etiqueta v1-legacy como respaldo)
10. Borra del repo: legacy-index.html, styles.css, script.js, retro.css, retro.js, bg3d.js, og-image.jpg (si ya existe
    el png nuevo), fuentes/, servicios/, supabase/, "servicio de paginas web/", skills-lock.json si no se usa en el build,
    y cv/ (el CV ya vive en public/cv/). NO borres .agents/, .codex/, .claude/, docs/. Quita de eslint ignores lo que ya
    no exista SOLO si el hook lo permite; si no, déjalo.
11. .vercelignore: deja solo lo necesario para un sitio Vite (o bórralo si ya no aplica). Agrega vercel.json solo si hace
    falta (Vite se detecta solo; framework "vite", outputDirectory "dist").
12. README.md nuevo y breve (ES): qué es, stack, estructura de carpetas (la de PLAN §4), cómo correrlo
    (npm i, npm run dev, test, build), cómo editar el contenido (src/content/es.ts y en.ts) y cómo regenerar la máscara
    y la og-image.
F. Verificación final
13. lint (0 errores), vitest, build en verde.
14. Lighthouse (chrome-devtools MCP lighthouse_audit o la CLI vía npx, sin instalarla en el proyecto) contra vite preview,
    en desktop y en móvil: reporta Performance, Accessibility, Best Practices y SEO. Objetivo ≥ 90 en las 4; si alguna
    no llega, arregla lo razonable y reporta el resto.
15. Capturas finales en scratchpad/f6-shots: desktop-full.png, mobile-375-full.png. Detén servidores y resetea la emulación.
16. Commits separados: "fix(redesign): F6 pulido de UI", "perf(redesign): F6 bundle e imágenes",
    "feat(redesign): F6 SEO y metadatos", "chore(redesign): F6 eliminar sitio legacy". Todos con Co-Authored-By. NO push.
```
