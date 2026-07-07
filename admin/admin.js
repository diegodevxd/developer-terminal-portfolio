/* =====================================================================
   admin.js — Panel de administración (módulo ES)
   Login (Supabase Auth) → verifica admin → KPIs + gráficas + realtime.
   Solo lectura; el acceso lo controla la tabla `admins` + RLS en Supabase.
   ===================================================================== */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = "https://jdjemlyvrafzoqtgrmuk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkamVtbHl2cmFmem9xdGdybXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNjA1ODcsImV4cCI6MjA5ODkzNjU4N30.1MCNRuv4_fl3Z4Ds4ECP0EqFJvNxGcs92zQZMBVJv9Q";

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const fmtMXN = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const NOMBRE_PAQUETE = { basico: "Básico", profesional: "Profesional", premium: "Premium" };
const COLORS = { s1: "#2a78d6", s2: "#1baf7a", s3: "#eda100" }; // Básico / Profesional / Premium

let allSolicitudes = [], allContrataciones = [];
let filtro = "todos";
let chIngresos = null, chPaquetes = null;
let canalRealtime = null;

/* ---------------- arranque ---------------- */
async function boot() {
  wireLogin();
  const { data: { session } } = await sb.auth.getSession();
  if (session) await afterLogin(); else showLogin();
}

function showLogin(msg, type) {
  $("login-view").style.display = "flex";
  $("dash-view").style.display = "none";
  const m = $("login-msg");
  if (msg) { m.textContent = msg; m.className = "msg " + (type || "info"); m.hidden = false; }
  else m.hidden = true;
}

async function afterLogin() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return showLogin();

  // ¿Es admin? (RLS permite ver solo su propia fila en `admins`)
  const { data: adminRow } = await sb.from("admins")
    .select("user_id").eq("user_id", user.id).maybeSingle();

  if (!adminRow) {
    showLogin("Esta cuenta no tiene acceso de administrador. Pásale tu ID a Diego para autorizarte.", "info");
    $("whoami").textContent = "Sesión: " + user.email + "  ·  Tu ID: " + user.id;
    $("btn-salir-login").hidden = false;
    return;
  }

  $("login-view").style.display = "none";
  $("dash-view").style.display = "block";
  $("who-email").textContent = user.email;
  requestNotif();
  await loadData();
  subscribeRealtime();
}

/* ---------------- login UI ---------------- */
function wireLogin() {
  $("btn-entrar").addEventListener("click", entrar);
  $("login-pass").addEventListener("keydown", (e) => { if (e.key === "Enter") entrar(); });
  $("btn-salir-login").addEventListener("click", async (e) => { e.preventDefault(); await sb.auth.signOut(); location.reload(); });
  $("btn-salir").addEventListener("click", async () => { await sb.auth.signOut(); location.reload(); });
  $("btn-refrescar").addEventListener("click", loadData);
  $("chips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    filtro = b.dataset.filter;
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b));
    renderTabla();
  });
}

async function entrar() {
  const email = $("login-email").value.trim();
  const pass = $("login-pass").value;
  if (!email || !pass) return showLogin("Escribe tu correo y contraseña.", "err");
  $("btn-entrar").disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  $("btn-entrar").disabled = false;
  if (error) return showLogin("No se pudo entrar: " + error.message, "err");
  await afterLogin();
}

/* ---------------- datos ---------------- */
async function loadData() {
  const [{ data: cont }, { data: sol }] = await Promise.all([
    sb.from("contrataciones").select("*").order("created_at", { ascending: false }),
    sb.from("solicitudes").select("*").order("created_at", { ascending: false }),
  ]);
  allContrataciones = cont || [];
  allSolicitudes = sol || [];
  renderKPIs();
  renderCharts();
  renderTabla();
}

function suma(arr, campo) { return arr.reduce((a, x) => a + (x[campo] || 0), 0); }

function renderKPIs() {
  const pagadas = allSolicitudes.filter((s) => s.pago_estado === "pagado_anticipo");
  const ingresos = suma(allContrataciones, "precio_mxn");
  const contratado = suma(pagadas, "precio_total_mxn");
  const clientes = allContrataciones.length;
  const leads = allSolicitudes.length;
  const conv = leads ? Math.round((clientes / leads) * 100) : 0;

  $("k-ingresos").textContent = fmtMXN.format(ingresos);
  $("k-contratado").textContent = fmtMXN.format(contratado);
  $("k-porcobrar").textContent = fmtMXN.format(Math.max(0, contratado - ingresos));
  $("k-clientes").textContent = clientes;
  $("k-leads").textContent = leads;
  $("k-conversion").textContent = conv + "%";
}

function renderCharts() {
  if (!window.Chart) return;
  Chart.defaults.font.family = "Nunito, sans-serif";
  Chart.defaults.color = "#52514e";

  // --- Ingresos por día (últimos 14) ---
  const days = [];
  const hoy = new Date();
  for (let i = 13; i >= 0; i--) { const d = new Date(hoy); d.setDate(hoy.getDate() - i); days.push(d); }
  const key = (d) => d.toISOString().slice(0, 10);
  const map = {}; days.forEach((d) => (map[key(d)] = 0));
  allContrataciones.forEach((c) => { const k = (c.created_at || "").slice(0, 10); if (k in map) map[k] += (c.precio_mxn || 0); });
  const labels = days.map((d) => d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" }));
  const serie = days.map((d) => map[key(d)]);

  if (chIngresos) chIngresos.destroy();
  chIngresos = new Chart($("chart-ingresos"), {
    type: "line",
    data: { labels, datasets: [{
      data: serie, borderColor: COLORS.s1, backgroundColor: "rgba(42,120,214,0.12)",
      borderWidth: 2, fill: true, tension: 0.35, pointRadius: 3, pointBackgroundColor: COLORS.s1,
      pointHoverRadius: 5,
    }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: (c) => fmtMXN.format(c.parsed.y) } } },
      scales: {
        y: { beginAtZero: true, grid: { color: "#ece9e2" }, ticks: { callback: (v) => "$" + (v / 1000 >= 1 ? (v / 1000) + "k" : v) } },
        x: { grid: { display: false } },
      },
    },
  });

  // --- Contrataciones por paquete ---
  const cuenta = { basico: 0, profesional: 0, premium: 0 };
  allSolicitudes.filter((s) => s.pago_estado === "pagado_anticipo").forEach((s) => {
    if (s.paquete in cuenta) cuenta[s.paquete]++;
  });
  if (chPaquetes) chPaquetes.destroy();
  chPaquetes = new Chart($("chart-paquetes"), {
    type: "bar",
    data: { labels: ["Básico", "Profesional", "Premium"],
      datasets: [{ data: [cuenta.basico, cuenta.profesional, cuenta.premium],
        backgroundColor: [COLORS.s1, COLORS.s2, COLORS.s3], borderRadius: 8, maxBarThickness: 64 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => c.parsed.y + " cliente(s)" } } },
      scales: { y: { beginAtZero: true, grid: { color: "#ece9e2" }, ticks: { precision: 0 } }, x: { grid: { display: false } } },
    },
  });
}

function renderTabla() {
  const rows = allSolicitudes.filter((s) => filtro === "todos" ? true : s.pago_estado === filtro);
  const body = $("act-body");
  $("act-empty").hidden = rows.length !== 0;
  body.innerHTML = rows.map((s) => {
    const fecha = new Date(s.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    const paq = NOMBRE_PAQUETE[s.paquete] || s.paquete || "—";
    const pagado = s.pago_estado === "pagado_anticipo";
    const badge = pagado ? `<span class="badge paid">✔ Pagó anticipo</span>` : `<span class="badge pend">⏳ Pendiente</span>`;
    const tel = s.telefono ? `<br><span style="color:var(--ink-mut)">${escapeHtml(s.telefono)}</span>` : "";
    return `<tr>
      <td>${fecha}</td>
      <td><b>${escapeHtml(s.nombre || "—")}</b></td>
      <td>${escapeHtml(s.email || "—")}${tel}</td>
      <td>${paq}</td>
      <td>${badge}</td>
      <td><b>${fmtMXN.format(s.anticipo_mxn || 0)}</b></td>
    </tr>`;
  }).join("");
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ---------------- realtime + notificaciones ---------------- */
function subscribeRealtime() {
  if (canalRealtime) return;
  canalRealtime = sb.channel("panel-admin")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "contrataciones" }, (p) => {
      const r = p.new || {};
      beep();
      toast("🎉", "¡Nuevo cliente pagó!", (r.cliente_nombre || "Alguien") + " · " + (r.paquete || ""), "var(--mint)");
      notify("🎉 ¡Nuevo cliente pagó!", (r.cliente_nombre || "Alguien") + " contrató " + (r.paquete || ""));
      loadData();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "solicitudes" }, (p) => {
      const r = p.new || {};
      toast("📨", "Nueva solicitud", (r.nombre || "Alguien") + " · " + (NOMBRE_PAQUETE[r.paquete] || r.paquete || ""), "var(--sky)");
      loadData();
    })
    .subscribe();
}

function requestNotif() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}
function notify(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    try { new Notification(title, { body }); } catch (_) {}
  }
}
function toast(emoji, title, sub, color) {
  const t = document.createElement("div");
  t.className = "toast";
  if (color) t.style.borderLeftColor = color;
  t.innerHTML = `<span class="emoji">${emoji}</span><div><b>${escapeHtml(title)}</b><small>${escapeHtml(sub)}</small></div>`;
  $("toasts").appendChild(t);
  setTimeout(() => t.remove(), 8000);
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 880;
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    o.start(); o.stop(ctx.currentTime + 0.47);
  } catch (_) {}
}

boot();
