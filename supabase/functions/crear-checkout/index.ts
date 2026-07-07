// =====================================================================
//  Edge Function: crear-checkout   (proyecto: serviciosweb)  [DESPLEGADO]
//  Crea una sesión de Stripe Checkout para cobrar el ANTICIPO (50%).
//  Monto calculado EN EL SERVIDOR. Requiere usuario logueado (verify_jwt).
//  Re-desplegar con: supabase functions deploy crear-checkout
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
    const { solicitudId, origin } = await req.json();
    if (!solicitudId) return json({ error: "Falta solicitudId" }, 400, reqOrigin);

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

    const paq = PAQUETES[sol.paquete];
    if (!paq) return json({ error: "Paquete inválido: " + sol.paquete }, 400, reqOrigin);

    const base = safeOrigin(origin);
    const session = await stripe.checkout.sessions.create({
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

    return json({ url: session.url }, 200, reqOrigin);
  } catch (err) {
    const msg = (err as Error).message || "error desconocido";
    console.error("⚠ crear-checkout error:", msg);
    return json({ error: "Stripe: " + msg }, 500, reqOrigin);
  }
});
