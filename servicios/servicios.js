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
})();
