# Rediseño del portafolio v2 — Plan maestro

> Planeador/auditor: Claude (Opus). Implementador: opencode `opencode-go/deepseek-v4.1-flash`
> (respaldo: Sonnet/Haiku dentro de Claude Code).
> Regla de oro: **el implementador solo ejecuta UNA fase por corrida** y termina con build, lint y tests en verde.
> El auditor revisa el diff antes de pasar a la siguiente fase.

---

## 1. Objetivo

Pasar de un sitio HTML/CSS/JS en cascada (cyberpunk, modo retro, servicios con Stripe, Supabase…) a un
**portafolio de una sola página, hecho en React + TypeScript, con arquitectura clara**, que en 10 segundos
le diga a un reclutador:

1. **Quién soy:** Diego Mancera, desarrollador full-stack y contribuidor del kernel de Linux (León, MX).
2. **Qué he probado:** 2 CVE corregidos en el kernel de Linux, 2 PRs en HAMi (CNCF), más de 10 sitios en producción.
3. **Qué busco:** prácticas o puesto junior (sistemas/kernel o full-stack), remoto o presencial en León.
4. **Cómo contactarme:** correo, LinkedIn, GitHub y el CV en ES/EN.

Todo lo que no sirva a esas 4 cosas se va.

## 2. Qué se elimina

| Se va de `main` | Motivo |
|---|---|
| `servicios/` (landing, checkout, términos, flyer, gracias) | No es portafolio. Es un negocio aparte. |
| `supabase/` (edge functions de Stripe, schema) | Solo existía por servicios. |
| `retro.css`, `retro.js`, modo "★2010" | Ruido visual. |
| `bg3d.js` (three.js), lluvia digital, estética cyberpunk | Se reemplaza por el nuevo sistema visual. |
| `fuentes/Aero*.ttf`, `servicio de paginas web/` | Ya no se usan. |
| `index.html`, `styles.css`, `script.js` | Los reemplaza la app de React. |
| Certificaciones CECATI/Metaphorce, "Rust, Java" en skills | No aparecen en el CV actual: el sitio debe coincidir con el CV. |

**Seguridad antes de borrar:** se crea la etiqueta `v1-legacy` sobre el commit actual. Nada se pierde; si
servicios se quiere seguir publicando, se mueve a su propio repo (igual que se hizo con `admin/`).
Las edge functions ya desplegadas en Supabase siguen funcionando aunque su código salga de este repo.

## 3. Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Build | **Vite 6** + React 19 + TypeScript (strict) | Sitio estático: no necesita Next.js. Vercel lo sirve tal cual. |
| Estilos | **Tailwind CSS v4** + tokens CSS en `globals.css` | Los componentes que vas a pegar (21st.dev/shadcn) lo asumen. |
| Componentes base | **shadcn/ui** (estructura `src/components/ui`) | Es donde los prompts de 21st.dev esperan los componentes. |
| Animación | `motion` (Framer Motion) | Reveals por scroll, contadores, transiciones. |
| Iconos | `lucide-react` (UI) + `simple-icons` (logos de tecnologías) | Lucide ya no trae logos de marcas. |
| Calidad | ESLint + Prettier + **Vitest** + Testing Library | Las partes con lógica (motor ASCII, i18n) llevan tests. |
| Deploy | Vercel (proyecto existente) | Sin cambios de dominio. |

## 4. Arquitectura (no cascada)

Principios:
- **El contenido es un dato, no JSX.** Ningún texto visible vive dentro de un componente: todo sale de
  `src/content/{es,en}.ts`, tipado por `src/content/types.ts`. Cambiar el CV = editar un archivo.
- **Una carpeta por sección (`features/`).** Cada sección es dueña de sus subcomponentes y exporta uno solo.
- **Lógica pura separada de la UI.** El motor ASCII y los helpers viven en `src/lib/` como funciones puras
  testeables; el componente solo pinta.
- **Dependencias en una sola dirección:** `app → features → components → lib`. Un `feature` nunca importa otro `feature`.

```
src/
├── app/
│   ├── main.tsx                # monta <App/>
│   ├── App.tsx                 # orden de secciones, nada más
│   └── providers.tsx           # LocaleProvider (+ MotionConfig reducedMotion="user")
├── content/
│   ├── types.ts                # tipos: Profile, Contribution, Job, Project, Skill, Nav...
│   ├── es.ts                   # contenido en español (fuente: CV ES)
│   ├── en.ts                   # contenido en inglés (fuente: CV EN)
│   └── index.ts                # getContent(locale)
├── features/
│   ├── hero/                   # Hero.tsx, HeroTerminal.tsx
│   ├── about/                  # About.tsx (perfil + qué busco)
│   ├── open-source/            # OpenSource.tsx, ContributionCard.tsx  ← la sección estrella
│   ├── experience/             # Experience.tsx, TimelineRow.tsx
│   ├── projects/               # Projects.tsx (disc carousel + lista accesible)
│   ├── stack/                  # Stack.tsx, TechBadge.tsx
│   └── contact/                # Contact.tsx
├── components/
│   ├── ui/                     # shadcn + componentes pegados: ascii-portrait.tsx,
│   │                           # disc-cascade-carousel.tsx, button.tsx...
│   └── layout/                 # SiteFrame.tsx, Navbar.tsx, SocialRail.tsx, Footer.tsx,
│                               # SectionHeading.tsx, CornerFrame.tsx, TerminalCard.tsx
├── hooks/                      # useLocale.ts, useInView.ts, usePrefersReducedMotion.ts
├── lib/
│   ├── utils.ts                # cn()
│   └── ascii/                  # engine.ts (muestreo, luminancia, charset), engine.test.ts
└── styles/globals.css          # @import "tailwindcss"; tokens; fuentes
public/
├── images/diego-portrait.webp  # tu foto, 900px, recortada 4:5
├── cv/Diego-Mancera-CV-ES.pdf
├── cv/Diego-Mancera-CV-EN.pdf
└── og-image.jpg                # se regenera con el nuevo diseño
```

## 5. Dirección visual (síntesis de las referencias)

| Referencia | Qué tomamos | Qué NO tomamos |
|---|---|---|
| **hermes-agent.nousresearch.com** (estilo base) | Fondo azul marino casi negro, **marco azul eléctrico** de 6px alrededor de la ventana, titulares en tipografía **condensada y alta**, etiquetas en mono MAYÚSCULAS, tarjeta tipo terminal con ✓, imágenes **monocromas/dither** | Sus fuentes comerciales (Rules, Aeonik) → usamos alternativas libres |
| **redoyanulhaque.me** | Hero con nombre enorme, **rail de redes fijo a la izquierda**, botón "RESUME" fijo abajo a la derecha, línea de tiempo de carrera con **año gigante al centro**, tarjetas "What I do" con **esquinas en corchete** | El brillo morado |
| **sawad.framer.website** | Titulares de sección en **dos tonos** (línea 1 clara, línea 2 apagada: "OPEN / SOURCE"), nav superior en **píldora** con iconos, mucho aire | Plantilla Framer, blog |

**Tokens (en `globals.css`):**

```css
--bg:        #07081c;  /* azul marino casi negro */
--surface:   #0e1030;  /* tarjetas */
--line:      #23265a;  /* bordes finos */
--fg:        #f2f2f2;  /* texto */
--muted:     #8a8db8;  /* texto secundario / 2º tono de titulares */
--accent:    #2b2bff;  /* azul eléctrico (marco, botones, focus) */
--ok:        #4ade80;  /* ✓ de la terminal */
```

**Tipografía (Google Fonts, gratis):**
- Display: **Antonio** 600/700 (condensada, la más cercana a Hermes).
- Texto: **Inter** 400/500.
- Mono: **JetBrains Mono** 400/500 (etiquetas, terminal, años).

**Movimiento:** reveal suave por scroll (opacidad + 12px + blur 4px), nada que dure más de 0.8s.
Todo respeta `prefers-reduced-motion` (el retrato ASCII se queda en un fotograma estático).

## 6. Mapa de la página (orden final)

1. **Navbar** — píldora centrada: `Inicio · Open Source · Experiencia · Proyectos · Contacto` + `ES/EN`.
2. **Hero** — izquierda: etiqueta mono `// LEÓN, MX · DISPONIBLE`, titular condensado
   "Desarrollador Full-Stack. / Contribuidor del kernel de Linux." (2º renglón en `--muted`),
   1 frase de valor, botones `Ver mi trabajo` / `Descargar CV`, y **TerminalCard**:
   ```
   ~ % whoami
   ✓ 2 CVE corregidos en el kernel de Linux (7.2, 7.3)
   ✓ 2 PRs integrados en HAMi · CNCF
   ✓ 10+ sitios web en producción
   ```
   Derecha: **retrato ASCII animado** de tu foto (sección 7).
3. **Sobre mí** — 3–4 líneas del perfil del CV + bloque "Qué busco".
4. **Open Source** — titular en dos tonos. 4 `ContributionCard` con `CornerFrame`:
   driver, bug en lenguaje claro, versión de Linux, enlace al CVE y al commit / PR. Esta es tu sección diferenciadora.
5. **Experiencia** — línea de tiempo estilo Redoyan: `2023–HOY` CapiHw Labs · `AGO 2025` Kernel · `SEP 2026` HAMi · `2024–2028` EPCA.
6. **Proyectos** — `DiscCascadeCarousel` (el componente que pasaste) con Cuentivo, PDF Crop Studio,
   Catálogo Betterware, Sistema de ventas a crédito, Laboratorio de LLMs locales. Etiquetas de disco
   **generadas en SVG** (no necesita imágenes). En móvil (<720px) se muestra una lista de tarjetas.
7. **Stack** — rejilla de logos (`simple-icons`) agrupada como en el CV: Lenguajes / Frontend / Backend / DevOps / Sistemas / IA.
   Debajo, la fila de certificaciones LFD103 · LFC102.
8. **Contacto** — titular grande "¿HABLAMOS?", correo copiable, LinkedIn, GitHub, CV ES/EN.
9. **Footer** mínimo. **SocialRail** fijo a la izquierda y botón **CV** fijo abajo a la derecha (desktop).

## 7. Retrato ASCII (adaptación del prompt de 21st.dev)

Componente propio `components/ui/ascii-portrait.tsx` + motor puro `lib/ascii/engine.ts`.
De todos los parámetros del prompt, implementamos **solo los que usa este look**:

| Parámetro | Valor | Implementación |
|---|---|---|
| `renderMode` | `characters` | glifo por celda según luminancia |
| `charSet` | `standard` → `" .:-=+*#%@"` | invertible por prop |
| `cellSize` | 10 (8 en móvil) | rejilla de muestreo |
| `grayscale` 100, `saturation` 0, `contrast` 128 | | se aplican al valor de luminancia en el motor |
| `bgMode` `blur`, `bgBlur` 2, `bgOpacity` 90 | | foto desenfocada muy tenue detrás (CSS `filter: blur(2px)`) |
| `vignette` 58 | | gradiente radial encima |
| `filmGrain` 32 | | textura de ruido precalculada, 1 canvas pequeño en mosaico |
| `animStyle` `shimmer`, speed 100, intensity 60 | | onda diagonal que modula el brillo por celda con `sin(t + x + y)` |
| `blurType` `tilt` 30 | | se omite en v1 (costoso) |

Reglas de rendimiento: muestrear la imagen **una sola vez** (y al cambiar de tamaño); animar a ≤30 fps;
pausar con `IntersectionObserver` fuera de pantalla y con la pestaña oculta; con reduced-motion se pinta
un solo fotograma. Accesibilidad: `role="img"` + `aria-label="Retrato de Diego Mancera"`.
El color de los glifos usa `--fg` con un leve tinte `--accent` en las zonas brillantes.

Tu foto (fondo gris liso, buena luz) funciona muy bien: el fondo queda casi vacío y la cara/pelo se llenan de glifos.

## 8. Contenido

Fuente única: `C:\Users\pibed\Downloads\CVs\Diego-Mancera-FullStack-Kernel-Linux-{ES,EN}.pdf` y
`C:\Users\pibed\Downloads\CVs\README.md`. **No se inventa nada** que no esté ahí. Reglas de redacción:

- Frases cortas, verbo primero, con número cuando lo hay ("Reduje el deploy de 10 a 4–5 min").
- Explicar cada bug del kernel en una línea que entienda alguien que no sabe C, y debajo el detalle técnico.
- **No se publica el teléfono** (sí está en el CV PDF descargable). Correo público: `diegomancera.dev@gmail.com`.
- Enlaces: CVE-2026-68344, CVE-2026-89892, commits en git.kernel.org, HAMi PR #3106 y #3313, GitHub, LinkedIn
  (URLs exactas en el README de CVs).

## 9. Fases

Cada fase = 1 corrida de opencode = 1 commit en la rama `redesign/react`. Al final de cada una:
`npm run lint && npm run test -- --run && npm run build` en verde.

| Fase | Entrega | Criterio de aceptación |
|---|---|---|
| **F0 Base** | Etiqueta `v1-legacy`, rama, scaffold Vite+React+TS en la raíz, Tailwind v4, shadcn init (alias `@/`), ESLint/Prettier/Vitest, estructura de carpetas vacía, assets copiados a `public/` | `npm run dev` muestra "Hello"; build verde; archivos legacy **aún no** borrados |
| **F1 Sistema visual + layout** | `globals.css` con tokens y fuentes, `SiteFrame`, `Navbar`, `SocialRail`, `Footer`, `SectionHeading` (dos tonos), `CornerFrame`, `TerminalCard`, `LocaleProvider` + `useLocale` (persistido en `localStorage` con try/catch) | Página vacía con layout completo, ES/EN conmuta, responsive a 375px sin scroll horizontal |
| **F2 Contenido** | `content/types.ts`, `es.ts`, `en.ts` completos desde el CV; test que verifica que ES y EN tienen la misma forma | Ningún string visible fuera de `content/` |
| **F3 Hero + ASCII** | `lib/ascii/engine.ts` + tests, `ascii-portrait.tsx`, `features/hero` | Retrato animado fluido, se pausa fuera de pantalla, estático con reduced-motion |
| **F4 Secciones** | about, open-source, experience, stack, contact | Todas las secciones con contenido real y enlaces funcionando |
| **F5 Proyectos** | `disc-cascade-carousel.tsx` en `components/ui` (código tal cual, lo deja el planeador en `docs/redesign/vendor/`), `features/projects` con fallback de lista en móvil | Arrastre, teclado y botones funcionan; en móvil se ve la lista |
| **F6 Pulido y limpieza** | Meta/OG/`lang`, favicon, `og-image` nuevo, `vercel.json` si hace falta, README nuevo, **borrar archivos legacy** de la sección 2, Lighthouse ≥ 90 en las 4 métricas | Auditoría final del planeador aprobada |

## 10. Reglas para el implementador (van en cada prompt)

1. Lee `docs/redesign/PLAN.md` completo antes de tocar nada. Ejecuta **solo la fase indicada**.
2. Respeta la estructura de carpetas de la sección 4 y la dirección de dependencias.
3. Nada de texto visible dentro de componentes (desde F2).
4. TypeScript strict, sin `any`, sin `// @ts-ignore`.
5. No instales librerías fuera de la sección 3 sin justificarlo en el resumen final.
6. No borres archivos legacy antes de F6. No toques `.git`, `.claude`, `.codex`, `.agents`.
7. Termina con lint + test + build en verde y un commit `feat(redesign): F<n> …`. **No hagas push.**
8. Al final imprime: archivos creados/modificados, comandos ejecutados y su resultado, y cualquier desviación del plan.
