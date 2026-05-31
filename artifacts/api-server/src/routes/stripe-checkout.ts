import { Router } from "express";
import { z } from "zod";
import Stripe from "stripe";

const router = Router();

const CreateSessionBody = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      quantity: z.number().int().positive(),
      imageUrl: z.string().optional(),
    })
  ),
  customerEmail: z.string().email().optional(),
  successPath: z.string().default("/checkout/success"),
  cancelPath: z.string().default("/checkout"),
});

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

function getBaseUrl(req: any): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) return `https://${domains.split(",")[0]}`;
  return `${req.protocol}://${req.get("host")}`;
}

router.post("/stripe/create-session", async (req, res) => {
  try {
    const body = CreateSessionBody.parse(req.body);
    const stripe = getStripe();
    const base = getBaseUrl(req);
    const basePath = process.env.BASE_PATH ?? "";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: body.customerEmail,
      line_items: body.items.map((item: { name: string; price: number; quantity: number; imageUrl?: string }) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            ...(item.imageUrl && item.imageUrl.startsWith("http")
              ? { images: [item.imageUrl] }
              : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${base}${basePath}${body.successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${basePath}${body.cancelPath}`,
      shipping_address_collection: {
        allowed_countries: ["HR", "BA", "RS", "SI", "AT", "DE", "IT", "GB", "FR", "NL", "BE", "US"],
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    req.log.error({ err }, "Stripe session creation failed");
    res.status(400).json({ error: err.message ?? "Checkout session failed" });
  }
});

router.get("/stripe/session/:sessionId", async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ["line_items"],
    });
    res.json({
      status: session.payment_status,
      customerEmail: session.customer_email,
      customerDetails: session.customer_details,
      amount: session.amount_total,
      currency: session.currency,
    });
  } catch (err: any) {
    req.log.error({ err }, "Failed to retrieve Stripe session");
    res.status(400).json({ error: err.message });
  }
});

export default router;
