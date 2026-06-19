# Portafolio Cyberpunk — Diego Mancera

Portafolio personal con estética cyberpunk, construido con HTML, CSS y JavaScript puro (sin frameworks ni dependencias). Incluye fondo animado en canvas, soporte de dos idiomas (ES/EN) y un diseño responsive.

## Características

- **Fondo animado "digital rain":** animación tipo Matrix hecha con la API Canvas de HTML5. Se redimensiona con la ventana, se pausa cuando la pestaña no está visible y se desactiva si el usuario prefiere reducir el movimiento.
- **Bilingüe (ES / EN):** cambio de idioma en el cliente con un sistema simple de `data-i18n`, sin recargar la página. El idioma elegido se recuerda con `localStorage`.
- **Estética cyberpunk:** variables CSS para el tema, efectos de neón, líneas de escaneo, rejilla de fondo y un efecto glitch en los títulos.
- **Responsive:** uso de grids flexibles y `clamp()` para adaptarse desde móvil hasta pantallas grandes. Menú lateral con hamburguesa en móvil.
- **Detalles de UX:** resaltado de la sección activa en el menú al hacer scroll, animaciones de aparición y efecto de "arranque" en la terminal.
- **Accesibilidad:** respeta `prefers-reduced-motion` y mantiene un contraste de texto legible.

## Tecnologías

- **HTML5** — estructura semántica.
- **CSS3** — variables, grid/flexbox, animaciones.
- **JavaScript (vanilla, ES6+)** — canvas, internacionalización, `IntersectionObserver`.
- **Google Fonts** — Orbitron, Rajdhani y Fira Code.

## Estructura

```
.
├── index.html   # Estructura y contenido (con data-i18n)
├── styles.css   # Estilos, animaciones y responsive
├── script.js    # Canvas, i18n, scroll reveal y nav activo
└── README.md
```

## Cómo ejecutarlo

No requiere instalación ni compilación. Puedes abrir `index.html` directamente en el navegador, o servirlo con un servidor local:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000
```

Luego abre `http://localhost:8000`.

## Pendientes / por personalizar

- Agregar el archivo `Diego_Mancera_CV.pdf` en la raíz para que funcione el botón "Descargar CV".
- Agregar una imagen `og-image.png` (1200×630) para la vista previa al compartir el enlace.
- Actualizar las URLs `og:url` / `og:image` con el dominio final cuando esté desplegado.

## Licencia

MIT.
