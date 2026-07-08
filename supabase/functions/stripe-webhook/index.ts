// =====================================================================
//  Edge Function: stripe-webhook   (proyecto: serviciosweb)
//  Eventos manejados:
//    - checkout.session.completed (mode:"payment")      → pago único (original)
//    - checkout.session.completed (mode:"subscription") → 1er cobro de
//      financiamiento/mantenimiento: crea fila en `suscripciones`
//    - invoice.paid            → ciclos 2/3 de financiamiento y cada mes de
//      mantenimiento; corta sola la suscripción al llegar a ciclos_totales
//    - invoice.payment_failed  → marca la suscripción en 'pago_fallido'
//    - customer.subscription.deleted → marca 'completada' o 'cancelada'
//
//  Secretos en Supabase (Edge Functions → Secrets):
//    - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
//  Endpoint: https://jdjemlyvrafzoqtgrmuk.supabase.co/functions/v1/stripe-webhook
//
//  ⚠ PENDIENTE (manual en Stripe Dashboard): el endpoint del webhook hoy
//  solo tiene suscrito el evento `checkout.session.completed`. Hay que
//  agregarle `invoice.paid`, `invoice.payment_failed` y
//  `customer.subscription.deleted` (Developers → Webhooks → este endpoint
//  → Add events), tanto en modo Test como en modo Live.
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

// ---- checkout.session.completed, mode:"payment" (pago único — original) ----
async function handlePaymentCheckoutCompleted(session: Stripe.Checkout.Session) {
  const solicitudId = session.client_reference_id || session.metadata?.solicitud_id || null;
  const telefono = session.customer_details?.phone ?? null;

  let paquete = session.metadata?.paquete ?? nombrePaquete(session.amount_total ?? 0);
  let nombre = session.customer_details?.name ?? null;
  let email = session.customer_details?.email ?? session.customer_email ?? null;

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

  const { error } = await supabase.from("contrataciones").insert({
    paquete,
    precio_mxn: Math.round((session.amount_total ?? 0) / 100),
    cliente_nombre: nombre,
    cliente_email: email,
    stripe_session_id: session.id,
    monto: session.amount_total,
    moneda: (session.currency ?? "mxn").toUpperCase(),
    estado: session.payment_status ?? "paid",
  });
  if (error) {
    console.error("⚠ Error guardando contratación:", error.message);
    throw error;
  }
  console.log("✔ Anticipo pagado:", email, paquete, "solicitud:", solicitudId);
}

// ---- checkout.session.completed, mode:"subscription" (financiamiento/mantenimiento) ----
async function handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session) {
  const solicitudId = session.client_reference_id || session.metadata?.solicitud_id || null;
  const tipoPago = session.metadata?.tipo_pago as "financiamiento" | "mantenimiento" | undefined;
  const ciclosTotales = session.metadata?.ciclos_totales ? Number(session.metadata.ciclos_totales) : null;

  let userId: string | null = null;
  if (solicitudId) {
    const { data: sol } = await supabase.from("solicitudes").select("user_id").eq("id", solicitudId).single();
    userId = sol?.user_id ?? null;
    const { error: upErr } = await supabase.from("solicitudes").update({
      pago_estado: tipoPago === "mantenimiento" ? "activo_mantenimiento" : "activo_financiamiento",
      stripe_session_id: session.id,
    }).eq("id", solicitudId);
    if (upErr) console.error("⚠ No se pudo actualizar la solicitud:", upErr.message);
  }

  // upsert = idempotente si Stripe reintenta la entrega del webhook
  const { error: susErr } = await supabase.from("suscripciones").upsert({
    stripe_subscription_id: session.subscription as string,
    solicitud_id: solicitudId,
    user_id: userId,
    tipo: tipoPago ?? "mantenimiento",
    stripe_customer_id: session.customer as string,
    monto_mensual_mxn: Math.round((session.amount_total ?? 0) / 100),
    ciclos_pagados: 1,
    ciclos_totales: ciclosTotales,
    estado: "activa",
  }, { onConflict: "stripe_subscription_id" });
  if (susErr) {
    console.error("⚠ Error guardando suscripción:", susErr.message);
    throw susErr;
  }

  const { error: ledgerErr } = await supabase.from("contrataciones").insert({
    paquete: tipoPago === "mantenimiento" ? "Mantenimiento" : "Financiamiento",
    precio_mxn: Math.round((session.amount_total ?? 0) / 100),
    cliente_email: session.customer_details?.email ?? session.customer_email ?? null,
    stripe_session_id: session.id,
    monto: session.amount_total,
    moneda: (session.currency ?? "mxn").toUpperCase(),
    estado: "paid",
  });
  if (ledgerErr) console.error("⚠ Error guardando ledger (1er ciclo):", ledgerErr.message);

  console.log("✔ Suscripción iniciada:", tipoPago, "solicitud:", solicitudId, "sub:", session.subscription);
}

// ---- invoice.paid (ciclos 2+, y cada mes de mantenimiento) ----
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (invoice.billing_reason === "subscription_create") return; // ciclo 1 ya contado en checkout.session.completed
  const subId = invoice.subscription as string | null;
  if (!subId) return;

  const { data: sus } = await supabase.from("suscripciones").select("*").eq("stripe_subscription_id", subId).single();
  if (!sus) return; // no es una de nuestras suscripciones rastreadas, ignorar

  // Ledger primero: si ya existe (reintento de Stripe), 23505 = unique_violation → ya procesado, salir.
  const { error: insErr } = await supabase.from("contrataciones").insert({
    paquete: sus.tipo === "mantenimiento" ? "Mantenimiento" : "Financiamiento",
    precio_mxn: Math.round((invoice.amount_paid ?? 0) / 100),
    cliente_email: invoice.customer_email ?? null,
    stripe_invoice_id: invoice.id,
    monto: invoice.amount_paid,
    moneda: (invoice.currency ?? "mxn").toUpperCase(),
    estado: "paid",
  });
  if (insErr) {
    if (insErr.code === "23505") return; // evento repetido, ya procesado
    console.error("⚠ Error guardando ledger recurrente:", insErr.message);
    throw insErr;
  }

  const nuevosCiclos = sus.ciclos_pagados + 1;
  await supabase.from("suscripciones").update({ ciclos_pagados: nuevosCiclos }).eq("id", sus.id);

  if (sus.ciclos_totales && nuevosCiclos >= sus.ciclos_totales) {
    // Financiamiento completado: se corta sola, no debe seguir cobrando.
    await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
    await supabase.from("suscripciones").update({ estado: "completada" }).eq("id", sus.id);
    if (sus.solicitud_id) {
      await supabase.from("solicitudes").update({ pago_estado: "financiamiento_completado" }).eq("id", sus.solicitud_id);
    }
    console.log("✔ Financiamiento completado, suscripción cancelada:", subId);
  }
}

// ---- invoice.payment_failed (solo marcar; sin dunning propio) ----
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subId = invoice.subscription as string | null;
  if (!subId) return;
  const { error } = await supabase.from("suscripciones").update({ estado: "pago_fallido" }).eq("stripe_subscription_id", subId);
  if (error) console.error("⚠ No se pudo marcar pago_fallido:", error.message);
  console.error("⚠ Pago fallido en suscripción", subId, "invoice:", invoice.id);
}

// ---- customer.subscription.deleted (cierre de financiamiento o cancelación de mantenimiento) ----
async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const { data: sus } = await supabase.from("suscripciones").select("*").eq("stripe_subscription_id", sub.id).single();
  if (!sus) return;
  const yaCompletado = sus.ciclos_totales != null && sus.ciclos_pagados >= sus.ciclos_totales;
  await supabase.from("suscripciones").update({
    estado: yaCompletado ? "completada" : "cancelada",
    fecha_cancelacion: new Date().toISOString(),
  }).eq("id", sus.id);
  if (sus.solicitud_id) {
    await supabase.from("solicitudes").update({
      pago_estado: yaCompletado ? "financiamiento_completado" : "cancelado",
    }).eq("id", sus.solicitud_id);
  }
  console.log("✔ Suscripción", sub.id, yaCompletado ? "completada" : "cancelada");
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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await handleSubscriptionCheckoutCompleted(session);
        } else {
          await handlePaymentCheckoutCompleted(session);
        }
        break;
      }
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        // Evento no manejado — se ignora silenciosamente, es normal.
        break;
    }
  } catch (err) {
    console.error("⚠ Error procesando evento", event.type, ":", (err as Error).message);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" }, status: 200,
  });
});
