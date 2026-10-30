# Portafolio de Diego Mancera

Portafolio de una sola página, bilingüe (ES/EN), de Diego Mancera: desarrollador Full-Stack y
contribuidor del kernel de Linux (León, MX). Producción: https://diegomancera.vercel.app/

El sitio anterior (HTML/CSS/JS) sigue disponible en la etiqueta de git `v1-legacy`.

## Stack

- Vite 6, React 19 y TypeScript (strict)
- Tailwind CSS v4 con tokens en `src/styles/globals.css`
- `motion` (reveals por scroll, cargado bajo demanda) y `lucide-react`; `simple-icons` para los logos del stack
- Vitest y Testing Library; ESLint y Prettier
- Despliegue en Vercel (sitio estático, carpeta `dist`)

## Estructura

```
src/
├── app/            # main.tsx, App.tsx (orden de secciones), providers.tsx
├── content/        # types.ts, es.ts, en.ts, index.ts: TODO el texto visible
├── features/       # una carpeta por sección: hero, about, open-source, experience,
│                   #   projects, stack, contact
├── components/
│   ├── ui/         # ascii-portrait, disc-cascade-carousel
│   └── layout/     # SiteFrame, Navbar, SocialRail, Footer, SectionHeading, CornerFrame...
├── hooks/          # useLocale, useContent, useActiveSection, useMediaQuery
├── lib/            # utils.ts (cn) y lib/ascii/engine.ts (motor puro del retrato)
└── styles/         # globals.css
public/             # imágenes, CV en PDF, favicon, og-image, robots.txt, sitemap.xml
scripts/            # make-portrait-mask.py
docs/redesign/      # plan y prompts del rediseño
```

Dependencias en una sola dirección: `app → features → components → lib`. Un `feature` nunca
importa otro `feature`.

## Cómo correrlo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run lint      # ESLint
npm test          # Vitest (modo watch); usa `npx vitest --run` para una sola pasada
npm run build     # tsc -b y vite build -> dist/
npm run preview   # sirve dist/ en local
```

## Cómo editar el contenido

Ningún texto visible vive en los componentes. Edita `src/content/es.ts` y `src/content/en.ts`
(ambos deben cumplir el tipo de `src/content/types.ts`; un test verifica que tengan la misma
forma). Los PDF del CV están en `public/cv/`.

## Regenerar imágenes

La máscara del retrato ASCII requiere Python 3 con Pillow (`pip install pillow`):

```bash
python -I scripts/make-portrait-mask.py   # public/images/diego-portrait-mask.png
```

La imagen de vista previa para redes (`public/og-image.jpg`, 1200×630) es una captura real del
hero del sitio. Si cambia el diseño, vuelve a tomarla a 1200×630 y reemplaza el archivo.
