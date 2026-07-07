# 🛠 Guía de configuración — Funnel de contratación (login + anticipo 50%)

Flujo del cliente:
**[Contratar]** → **inicia sesión / crea cuenta** → **formulario** (nombre, teléfono, descripción)
→ acepta **50% de anticipo** + **términos** → **Stripe Checkout (50%)** → **pantalla de gracias** con tu WhatsApp.

---

## ✅ Ya está hecho (automático, en tu proyecto Supabase `serviciosweb`)
- ✔ Tablas **`solicitudes`** (leads + estado de pago) y **`contrataciones`** (ledger de pagos), con RLS.
- ✔ Edge Function **`crear-checkout`** — crea el cobro del 50% (monto calculado en el servidor). Protegido por JWT.
- ✔ Edge Function **`stripe-webhook`** — al pagar, marca la solicitud como `pagado_anticipo` y registra la contratación.
  ```
  Endpoint webhook: https://jdjemlyvrafzoqtgrmuk.supabase.co/functions/v1/stripe-webhook
  ```
- ✔ Frontend completo: modal de login + formulario + consentimientos, páginas `gracias.html` y `terminos.html`.
- ✔ Tu **WhatsApp** (`525645049448`) y llaves **públicas** ya integradas.

Faltan solo **3 ajustes** de tu lado. 👇

---

## 1. Poner los 2 secretos de Stripe en Supabase
**Supabase → proyecto `serviciosweb` → Edge Functions → Secrets** (o Project Settings → Edge Functions):
| Nombre | De dónde sale |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → **Secret key** (`sk_test_...` para pruebas) |
| `STRIPE_WEBHOOK_SECRET` | Se genera en el paso 3 (`whsec_...`) |

> `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` ya vienen inyectados: NO hay que ponerlas.
> *(Ya hiciste este paso con las llaves de test — solo verifica que sigan ahí.)*

---

## 2. Desactivar la confirmación por correo (para que el registro sea fluido)
Para que un cliente pueda registrarse y pagar sin esperar un correo de confirmación:
1. **Supabase → Authentication → Sign In / Providers → Email**.
2. **Desactiva** la opción **"Confirm email"** (Confirmar correo) y guarda.

Así, al crear cuenta, el usuario entra directo y continúa al pago. *(Si prefieres dejarla activada,
el cliente tendrá que confirmar su correo antes de poder pagar.)*

---

## 3. Crear el Webhook en Stripe
1. En Stripe, activa **modo Test** (switch naranja) y ve a **Developers → Webhooks → + Add endpoint**.
2. **Endpoint URL:**
   ```
   https://jdjemlyvrafzoqtgrmuk.supabase.co/functions/v1/stripe-webhook
   ```
3. **Select events:** marca **`checkout.session.completed`**.
4. Crea el endpoint y copia el **Signing secret** (`whsec_...`) → ponlo como `STRIPE_WEBHOOK_SECRET` (paso 1).

---

## 4. Probar de punta a punta
1. Abre `/servicios/`, clic en **CONTRATAR** de un paquete.
2. **Crea una cuenta** (correo + contraseña) → **llena el formulario** → marca los 2 checkboxes → **continuar al pago**.
3. En Stripe (modo test) paga con la tarjeta **`4242 4242 4242 4242`**, fecha futura, CVC cualquiera.
4. Deberías caer en **`gracias.html`**. Verifica en Supabase:
   - **Table Editor → `solicitudes`**: tu fila con `pago_estado = pagado_anticipo`.
   - **Table Editor → `contrataciones`**: la fila del pago.
5. Si algo falla, revisa **Supabase → Edge Functions → Logs** (`crear-checkout` y `stripe-webhook`) y
   **Stripe → Webhooks → intentos** (deben ser `200`).

---

## 5. Ver quién contrató
- **Supabase → Table Editor → `solicitudes`**: todos los que llenaron el formulario (con o sin pagar).
- Filtra por `pago_estado = pagado_anticipo` para ver quién ya pagó el anticipo.
- La tabla `contrataciones` es el registro de pagos confirmados.

---

## Pasar a producción (cobros reales)
1. Cambia los secretos de Supabase a las llaves **`sk_live_...`** y crea un **webhook nuevo en modo Live**
   (mismo URL, mismo evento) → actualiza `STRIPE_WEBHOOK_SECRET` con el `whsec_` de live.
2. Verás el dinero en tu cuenta de Stripe/banco.

## Recordatorio de costos
- **Dominio y hosting** son aparte (hosting suele ser gratis en Vercel).
- **Supabase**: gratis para empezar; planes de pago si crece el uso.
- **Stripe**: sin renta, retiene ~**3.6% + IVA + comisión fija** por transacción en México (la web lo comunica como "~3%").

> Nota: el webhook y los pagos corren como **Edge Functions de Supabase** (`stripe-webhook` y `crear-checkout`); el sitio en Vercel es 100% estático, no necesita variables de entorno ni funciones serverless.
