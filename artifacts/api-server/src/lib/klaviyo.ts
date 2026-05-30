const KLAVIYO_API = "https://a.klaviyo.com/api";

async function klaviyoPost(path: string, body: unknown) {
  const apiKey = process.env.KLAVIYO_API_KEY;
  if (!apiKey) return;

  const res = await fetch(`${KLAVIYO_API}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      revision: "2024-02-15",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Klaviyo ${path} error ${res.status}: ${text}`);
  }
}

export async function klaviyoTrackEvent(
  email: string,
  eventName: string,
  properties: Record<string, unknown> = {}
) {
  await klaviyoPost("events", {
    data: {
      type: "event",
      attributes: {
        metric: { data: { type: "metric", attributes: { name: eventName } } },
        profile: { data: { type: "profile", attributes: { email } } },
        properties,
      },
    },
  });
}

export async function klaviyoIdentifyProfile(email: string, properties: Record<string, unknown> = {}) {
  await klaviyoPost("profiles", {
    data: {
      type: "profile",
      attributes: { email, ...properties },
    },
  });
}
