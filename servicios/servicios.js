/* =====================================================================
   servicios.js — interacciones del landing (FAQ, año, WhatsApp genérico)
   El flujo de contratación (login + formulario + pago 50%) vive en
   checkout.js (módulo). Este archivo solo maneja lo básico del landing.
   ===================================================================== */

// --- Datos de contacto (se usan en los CTA genéricos del hero/footer) ---
const WHATSAPP_NUMERO = "525645049448"; // 52 (México) + 5645049448
const EMAIL_CONTACTO  = "diegomancera.dev@gmail.com";

(function () {
    "use strict";

    // ---- Año dinámico en el footer ----
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ---- FAQ acordeón ----
    document.querySelectorAll(".faq-q").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const item = btn.closest(".faq-item");
            const abierto = item.classList.contains("open");
            document.querySelectorAll(".faq-item.open").forEach(function (i) {
                i.classList.remove("open");
                const q = i.querySelector(".faq-q");
                if (q) q.setAttribute("aria-expanded", "false");
            });
            if (!abierto) {
                item.classList.add("open");
                btn.setAttribute("aria-expanded", "true");
            }
        });
    });

    // ---- Prellenar los CTA genéricos de WhatsApp/correo (hero y footer) ----
    if (WHATSAPP_NUMERO) {
        document.querySelectorAll("#cta-whatsapp").forEach(function (wa) {
            if (wa.href.indexOf("wa.me/?") !== -1) {
                wa.href = wa.href.replace("wa.me/?", "wa.me/" + WHATSAPP_NUMERO + "?");
            }
        });
    }

    // ---- Animaciones de entrada al hacer scroll ----
    var revealTargets = document.querySelectorAll(
        ".proof-card, .pkg, .why-card, .stat, .faq-item, .section-head, .guarantee, .notice"
    );
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealTargets.forEach(function (el) { el.classList.add("visible"); });
    } else {
        revealTargets.forEach(function (el) { el.classList.add("reveal"); });
        var revealObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
        revealTargets.forEach(function (el) { revealObserver.observe(el); });
    }

    // ---- Carrusel de precios en móvil (scroll-snap nativo + puntos) ----
    var pricingGrid = document.querySelector(".pricing-grid");
    var dots = document.querySelectorAll(".pricing-dots .dot");
    if (pricingGrid && dots.length) {
        var ticking = false;
        pricingGrid.addEventListener("scroll", function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                var card = pricingGrid.children[0];
                if (card) {
                    var step = card.getBoundingClientRect().width + 20;
                    var idx = Math.round(pricingGrid.scrollLeft / step);
                    dots.forEach(function (d, i) { d.classList.toggle("active", i === idx); });
                }
                ticking = false;
            });
        }, { passive: true });
    }
})();
