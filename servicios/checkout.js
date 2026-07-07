/* =====================================================================
   checkout.js — Funnel de contratación (módulo ES)
   Flujo: [Contratar] → login/registro (Supabase Auth) → formulario
   (nombre, teléfono, descripción) → aceptar 50% anticipo + términos →
   crear solicitud en la BD → Stripe Checkout (50%) → gracias.html
   ===================================================================== */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = "https://jdjemlyvrafzoqtgrmuk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkamVtbHl2cmFmem9xdGdybXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNjA1ODcsImV4cCI6MjA5ODkzNjU4N30.1MCNRuv4_fl3Z4Ds4ECP0EqFJvNxGcs92zQZMBVJv9Q";

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PAQUETES = {
  basico:      { nombre: "Básico",      total: 2500,  anticipo: 1250 },
  profesional: { nombre: "Profesional", total: 5000,  anticipo: 2500 },
  premium:     { nombre: "Premium",     total: 12000, anticipo: 6000 },
};

const mxn = (n) => "$" + n.toLocaleString("es-MX") + " MXN";
const $ = (id) => document.getElementById(id);

let planActual = null;

// ---------- helpers de UI ----------
function showStep(step) {
  ["step-auth", "step-form", "step-loading"].forEach((s) => {
    const el = $(s);
    if (el) el.hidden = (s !== "step-" + step);
  });
  document.querySelectorAll(".modal-steps span").forEach((sp) => {
    const n = Number(sp.dataset.step);
    const map = { auth: 1, form: 2, loading: 3 };
    sp.classList.toggle("active", n === map[step]);
    sp.classList.toggle("done", n < map[step]);
  });
}
function showError(msg) {
  const e = $("modal-error");
  if (!e) return;
  e.textContent = msg;
  e.hidden = !msg;
}
function setBusy(busy) {
  document.querySelectorAll("#checkout-modal button").forEach((b) => (b.disabled = busy));
}

function openModal(key) {
  planActual = key;
  const p = PAQUETES[key];
  if (!p) return;
  $("modal-title").textContent = "Paquete " + p.nombre;
  $("anticipo-lbl").textContent = mxn(p.anticipo);
  $("anticipo-box").innerHTML =
    `<div class="mono">RESUMEN</div>` +
    `<div class="anticipo-row"><span>Paquete ${p.nombre}</span><b>${mxn(p.total)}</b></div>` +
    `<div class="anticipo-row hl"><span>Anticipo hoy (50%)</span><b>${mxn(p.anticipo)}</b></div>` +
    `<div class="anticipo-row"><span>Resto al entregar</span><b>${mxn(p.total - p.anticipo)}</b></div>`;
  showError("");
  $("checkout-modal").hidden = false;
  document.body.style.overflow = "hidden";
  refreshAuth();
}
function closeModal() {
  $("checkout-modal").hidden = true;
  document.body.style.overflow = "";
}

// ---------- auth ----------
async function refreshAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session && session.user) {
    $("form-user-email").textContent = session.user.email || "";
    const nombreInput = $("f-nombre");
    if (nombreInput && !nombreInput.value && session.user.user_metadata?.nombre) {
      nombreInput.value = session.user.user_metadata.nombre;
    }
    showStep("form");
  } else {
    showStep("auth");
  }
}

async function login() {
  showError("");
  const email = $("auth-email").value.trim();
  const pass = $("auth-pass").value;
  if (!email || !pass) return showError("Escribe tu correo y contraseña.");
  setBusy(true);
  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  setBusy(false);
  if (error) return showError("No se pudo iniciar sesión: " + error.message);
  refreshAuth();
}

async function signup() {
  showError("");
  const email = $("auth-email").value.trim();
  const pass = $("auth-pass").value;
  if (!email || !pass) return showError("Escribe un correo y una contraseña.");
  if (pass.length < 6) return showError("La contraseña debe tener al menos 6 caracteres.");
  setBusy(true);
  const { data, error } = await sb.auth.signUp({ email, password: pass });
  setBusy(false);
  if (error) return showError("No se pudo crear la cuenta: " + error.message);
  if (data.session) {
    refreshAuth(); // confirmación de correo desactivada → entra directo
  } else {
    showError("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.");
  }
}

async function logout() {
  await sb.auth.signOut();
  refreshAuth();
}

// ---------- crear solicitud + ir a pago ----------
async function continuarAPago() {
  showError("");
  const p = PAQUETES[planActual];
  const nombre = $("f-nombre").value.trim();
  const telefono = $("f-tel").value.trim();
  const descripcion = $("f-desc").value.trim();
  if (!nombre) return showError("Escribe tu nombre.");
  if (!telefono) return showError("Escribe tu teléfono o WhatsApp.");
  if (!descripcion) return showError("Cuéntame brevemente qué necesitas.");
  if (!$("f-anticipo").checked) return showError("Debes aceptar el pago del anticipo del 50%.");
  if (!$("f-terminos").checked) return showError("Debes aceptar los términos y condiciones.");

  const { data: { user } } = await sb.auth.getUser();
  if (!user) { showStep("auth"); return showError("Tu sesión expiró, inicia sesión de nuevo."); }

  setBusy(true);
  showStep("loading");

  // 1) Guardar la solicitud (RLS: solo puede crear la suya).
  const { data: sol, error: insErr } = await sb.from("solicitudes").insert({
    user_id: user.id,
    nombre,
    email: user.email,
    telefono,
    descripcion,
    paquete: planActual,
    precio_total_mxn: p.total,
    anticipo_mxn: p.anticipo,
    acepto_anticipo: true,
    acepto_terminos: true,
  }).select("id").single();

  if (insErr || !sol) {
    setBusy(false); showStep("form");
    return showError("No se pudo guardar tu solicitud: " + (insErr?.message || ""));
  }

  // 2) Crear la sesión de pago (Edge Function protegido por JWT).
  const { data: fnData, error: fnErr } = await sb.functions.invoke("crear-checkout", {
    body: { solicitudId: sol.id, origin: window.location.origin },
  });

  if (fnErr || !fnData?.url) {
    setBusy(false); showStep("form");
    let detalle = fnErr?.message || "intenta de nuevo";
    try {
      if (fnErr?.context && typeof fnErr.context.json === "function") {
        const b = await fnErr.context.json();
        if (b?.error) detalle = b.error;
      }
    } catch (_) { /* sin cuerpo JSON */ }
    return showError("No se pudo iniciar el pago: " + detalle);
  }

  // 3) A Stripe.
  window.location.href = fnData.url;
}

// ---------- wiring ----------
function init() {
  document.querySelectorAll("[data-plan]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(btn.getAttribute("data-plan"));
    });
  });
  $("modal-close")?.addEventListener("click", closeModal);
  $("checkout-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "checkout-modal") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("checkout-modal").hidden) closeModal();
  });
  $("btn-login")?.addEventListener("click", login);
  $("btn-signup")?.addEventListener("click", signup);
  $("btn-logout")?.addEventListener("click", (e) => { e.preventDefault(); logout(); });
  $("btn-pagar")?.addEventListener("click", continuarAPago);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
