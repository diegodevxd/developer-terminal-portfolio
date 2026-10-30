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
