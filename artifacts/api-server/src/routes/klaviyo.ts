import { Router } from "express";
import { z } from "zod";

const router = Router();

const SubscribeBody = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  source: z.string().optional(),
});

const TrackEventBody = z.object({
  email: z.string().email(),
  event: z.string(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

async function klaviyoRequest(
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: unknown
) {
  const apiKey = process.env.KLAVIYO_API_KEY;
  if (!apiKey) {
    throw new Error("KLAVIYO_API_KEY not configured");
  }

  const res = await fetch(`https://a.klaviyo.com/api/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      revision: "2024-02-15",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Klaviyo error ${res.status}: ${text}`);
  }
  if (res.status === 204 || res.status === 202) return null;
  return res.json();
}

async function getOrCreateProfile(
  email: string,
  firstName?: string,
  lastName?: string
): Promise<string> {
  const apiKey = process.env.KLAVIYO_API_KEY;
  if (!apiKey) throw new Error("KLAVIYO_API_KEY not configured");

  const res = await fetch("https://a.klaviyo.com/api/profiles/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      revision: "2024-02-15",
    },
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes: {
          email,
          ...(firstName ? { first_name: firstName } : {}),
          ...(lastName ? { last_name: lastName } : {}),
        },
      },
    }),
  });

  if (res.status === 201) {
    const data = await res.json();
    return data.data.id;
  }

  if (res.status === 409) {
    const data = await res.json();
    const existingId = data.errors?.[0]?.meta?.duplicate_profile_id;
    if (existingId) return existingId;
  }

  const text = await res.text();
  throw new Error(`Klaviyo profile error ${res.status}: ${text}`);
}

router.post("/klaviyo/subscribe", async (req, res) => {
  try {
    const { email, firstName, lastName } = SubscribeBody.parse(req.body);
    const listId = process.env.KLAVIYO_LIST_ID ?? "";

    const profileId = await getOrCreateProfile(email, firstName, lastName);

    await klaviyoRequest(
      "POST",
      `lists/${listId}/relationships/profiles/`,
      {
        data: [{ type: "profile", id: profileId }],
      }
    );

    res.json({ success: true });
  } catch (err: any) {
    req.log.error({ err }, "Klaviyo subscribe failed");
    res.status(400).json({ error: err.message ?? "Subscribe failed" });
  }
});

router.post("/klaviyo/track", async (req, res) => {
  try {
    const { email, event, properties } = TrackEventBody.parse(req.body);

    await klaviyoRequest("POST", "events", {
      data: {
        type: "event",
        attributes: {
          metric: { data: { type: "metric", attributes: { name: event } } },
          profile: { data: { type: "profile", attributes: { email } } },
          properties: properties ?? {},
        },
      },
    });

    res.json({ success: true });
  } catch (err: any) {
    req.log.error({ err }, "Klaviyo track failed");
    res.status(400).json({ error: err.message ?? "Track failed" });
  }
});

export default router;
