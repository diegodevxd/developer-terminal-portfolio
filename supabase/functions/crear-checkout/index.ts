// =====================================================================
//  Edge Function: crear-checkout   (proyecto: serviciosweb)
//  Crea una sesión de Stripe Checkout según `tipoPago`:
//    - "unico"         → anticipo 50% (mode:"payment"), comportamiento original.
//    - "financiamiento"→ 3 mensualidades del paquete (mode:"subscription").
//    - "mantenimiento" → suscripción mensual indefinida (mode:"subscription").
//  Montos calculados EN EL SERVIDOR. Requiere usuario logueado (verify_jwt).
//
//  ⚠ PENDIENTE: hay que re-desplegar esta función (aún corre la versión
//  vieja, solo "unico") con: supabase functions deploy crear-checkout
// =====================================================================
import Stripe from "npm:stripe@16.8.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const PAQUETES: Record<string, { nombre: string; total: number; anticipo: number }> = {
  basico:      { nombre: "Básico",      total: 250000,  anticipo: 125000 },
  profesional: { nombre: "Profesional", total: 500000,  anticipo: 250000 },
  premium:     { nombre: "Premium",     total: 1200000, anticipo: 600000 },
};

// Financiamiento: 3 mensualidades iguales por paquete (mismo total, sin costo
// extra). Deben coincidir con FINANCIAMIENTO en servicios/checkout.js (solo UI).
const FINANCIAMIENTO: Record<string, { ciclos: number; cuota: number }> = {
  basico:      { ciclos: 3, cuota: 83400 },   // 3 × $834.00  (≈ $2,502 MXN)
  profesional: { ciclos: 3, cuota: 166700 },  // 3 × $1,667.00 (≈ $5,001 MXN)
  premium:     { ciclos: 3, cuota: 400000 },  // 3 × $4,000.00 (total exacto $12,000 MXN)
};

// Mantenimiento: suscripción mensual indefinida (hasta que el cliente cancele).
const MANTENIMIENTO = { cuota: 45000, nombre: "Mantenimiento mensual" }; // $450 MXN/mes

const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

function safeOrigin(o: unknown): string {
  if (typeof o === "string" && /^https?:\/\//.test(o)) return o.replace(/\/$/, "");
  return "https://developer-terminal-portfolio-dqg2.vercel.app";
}

function json(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const reqOrigin = req.headers.get("origin") ?? "*";
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(reqOrigin) });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405, reqOrigin);

  // Diagnóstico claro si el secreto de Stripe está mal.
  if (!STRIPE_KEY) {
    return json({ error: "Falta el secreto STRIPE_SECRET_KEY en Supabase (Edge Functions → Secrets)." }, 400, reqOrigin);
  }
  if (!STRIPE_KEY.startsWith("sk_") && !STRIPE_KEY.startsWith("rk_")) {
    return json({ error: "STRIPE_SECRET_KEY no es una secret key. Debe empezar con 'sk_test_' o 'sk_live_' (no 'pk_'). Revísala en Supabase → Secrets." }, 400, reqOrigin);
  }

  try {
    const { solicitudId, origin, tipoPago = "unico" } = await req.json();
    if (!solicitudId) return json({ error: "Falta solicitudId" }, 400, reqOrigin);
    if (!["unico", "financiamiento", "mantenimiento"].includes(tipoPago)) {
      return json({ error: "tipoPago inválido: " + tipoPago }, 400, reqOrigin);
    }

    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return json({ error: "No autenticado" }, 401, reqOrigin);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: sol, error: solErr } = await admin
      .from("solicitudes").select("*").eq("id", solicitudId).single();
    if (solErr || !sol) return json({ error: "Solicitud no encontrada" }, 404, reqOrigin);
    if (sol.user_id !== user.id) return json({ error: "No autorizado" }, 403, reqOrigin);

    const base = safeOrigin(origin);
    let session: Stripe.Checkout.Session;

    if (tipoPago === "mantenimiento") {
      // Suscripción mensual indefinida — no requiere paquete previo.
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"], // recurrente: OXXO/SPEI no sirven para cargos automáticos
        customer_email: sol.email ?? user.email ?? undefined,
        client_reference_id: sol.id,
        metadata: { solicitud_id: sol.id, tipo_pago: "mantenimiento" },
        subscription_data: { metadata: { solicitud_id: sol.id, tipo_pago: "mantenimiento" } },
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "mxn",
            unit_amount: MANTENIMIENTO.cuota,
            recurring: { interval: "month" },
            product_data: {
              name: MANTENIMIENTO.nombre,
              description: "Hosting, soporte y cambios menores. Cancela cuando quieras.",
            },
          },
        }],
        success_url: `${base}/servicios/gracias.html?sid={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/servicios/#mantenimiento`,
      });
    } else {
      const paq = PAQUETES[sol.paquete];
      if (!paq) return json({ error: "Paquete inválido: " + sol.paquete }, 400, reqOrigin);

      if (tipoPago === "financiamiento") {
        const fin = FINANCIAMIENTO[sol.paquete];
        if (!fin) return json({ error: "Ese paquete no soporta financiamiento" }, 400, reqOrigin);
        session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          customer_email: sol.email ?? user.email ?? undefined,
          client_reference_id: sol.id,
          metadata: {
            solicitud_id: sol.id,
            tipo_pago: "financiamiento",
            paquete: paq.nombre,
            ciclos_totales: String(fin.ciclos),
          },
          subscription_data: { metadata: { solicitud_id: sol.id, tipo_pago: "financiamiento" } },
          line_items: [{
            quantity: 1,
            price_data: {
              currency: "mxn",
              unit_amount: fin.cuota,
              recurring: { interval: "month" },
              product_data: {
                name: `Financiamiento ${fin.ciclos} pagos — ${paq.nombre}`,
                description: `Total del paquete: $${paq.total / 100} MXN, en ${fin.ciclos} mensualidades.`,
              },
            },
          }],
          success_url: `${base}/servicios/gracias.html?sid={CHECKOUT_SESSION_ID}`,
          cancel_url: `${base}/servicios/#paquetes`,
        });
      } else {
        // "unico": comportamiento original, sin cambios.
        session = await stripe.checkout.sessions.create({
          mode: "payment",
          customer_email: sol.email ?? user.email ?? undefined,
          phone_number_collection: { enabled: true },
          client_reference_id: sol.id,
          metadata: {
            solicitud_id: sol.id,
            paquete: paq.nombre,
            anticipo_mxn: String(paq.anticipo / 100),
            precio_total_mxn: String(paq.total / 100),
          },
          line_items: [{
            quantity: 1,
            price_data: {
              currency: "mxn",
              unit_amount: paq.anticipo,
              product_data: {
                name: `Anticipo 50% — Página web ${paq.nombre}`,
                description: `Anticipo para iniciar tu proyecto. Total del paquete: $${paq.total / 100} MXN.`,
              },
            },
          }],
          success_url: `${base}/servicios/gracias.html?sid={CHECKOUT_SESSION_ID}`,
          cancel_url: `${base}/servicios/#paquetes`,
        });
      }
    }

    return json({ url: session.url }, 200, reqOrigin);
  } catch (err) {
    const msg = (err as Error).message || "error desconocido";
    console.error("⚠ crear-checkout error:", msg);
    return json({ error: "Stripe: " + msg }, 500, reqOrigin);
  }
});
