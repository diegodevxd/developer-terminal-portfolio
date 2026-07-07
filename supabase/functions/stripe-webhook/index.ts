// =====================================================================
//  Edge Function: stripe-webhook   (proyecto: serviciosweb)  [DESPLEGADO]
//  Al completarse el pago del anticipo (checkout.session.completed):
//    1) marca la solicitud como 'pagado_anticipo'
//    2) registra la contratación en la tabla `contrataciones` (ledger)
//
//  Secretos en Supabase (Edge Functions → Secrets):
//    - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
//  Endpoint: https://jdjemlyvrafzoqtgrmuk.supabase.co/functions/v1/stripe-webhook
//  Re-desplegar con: supabase functions deploy stripe-webhook --no-verify-jwt
// =====================================================================
import Stripe from "npm:stripe@16.8.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

function nombrePaquete(montoCentavos: number): string {
  const mxn = Math.round((montoCentavos || 0) / 100);
  if (mxn >= 6000) return "Premium";
  if (mxn >= 2500) return "Profesional";
  if (mxn >= 1250) return "Básico";
  return "Personalizado";
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const diag = `[STRIPE_WEBHOOK_SECRET len=${webhookSecret.length} prefijo="${webhookSecret.slice(0, 6)}"]`;
  if (!webhookSecret) {
    return new Response(`Falta STRIPE_WEBHOOK_SECRET en Supabase. ${diag}`, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, signature!, webhookSecret, undefined, cryptoProvider,
    );
  } catch (err) {
    console.error("⚠ Firma inválida:", (err as Error).message, diag);
    return new Response(`Webhook Error: ${(err as Error).message} ${diag}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const solicitudId = session.client_reference_id || session.metadata?.solicitud_id || null;
    const telefono = session.customer_details?.phone ?? null;

    let paquete = session.metadata?.paquete ?? nombrePaquete(session.amount_total ?? 0);
    let nombre = session.customer_details?.name ?? null;
    let email = session.customer_details?.email ?? session.customer_email ?? null;

    // 1) Marcar la solicitud como pagada.
    if (solicitudId) {
      const { data: sol } = await supabase
        .from("solicitudes").select("*").eq("id", solicitudId).single();
      if (sol) {
        paquete = sol.paquete ?? paquete;
        nombre = sol.nombre ?? nombre;
        email = sol.email ?? email;
      }
      const { error: upErr } = await supabase.from("solicitudes").update({
        pago_estado: "pagado_anticipo",
        stripe_session_id: session.id,
        telefono: telefono ?? sol?.telefono ?? null,
      }).eq("id", solicitudId);
      if (upErr) console.error("⚠ No se pudo actualizar la solicitud:", upErr.message);
    }

    // 2) Registrar en el ledger de contrataciones.
    const { error } = await supabase.from("contrataciones").insert({
      paquete,
      precio_mxn: Math.round((session.amount_total ?? 0) / 100), // anticipo cobrado
      cliente_nombre: nombre,
      cliente_email: email,
      stripe_session_id: session.id,
      monto: session.amount_total,
      moneda: (session.currency ?? "mxn").toUpperCase(),
      estado: session.payment_status ?? "paid",
    });
    if (error) {
      console.error("⚠ Error guardando contratación:", error.message);
      return new Response("DB insert error", { status: 500 });
    }
    console.log("✔ Anticipo pagado:", email, paquete, "solicitud:", solicitudId);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" }, status: 200,
  });
});
