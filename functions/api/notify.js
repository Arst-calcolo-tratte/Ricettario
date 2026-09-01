// Questa funzione gira sui server di Cloudflare, mai sul telefono:
// la chiave segreta di OneSignal resta protetta e non è mai visibile
// nel codice del sito.

export async function onRequestPost(context) {
  const { request, env } = context;

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return new Response("Corpo della richiesta non valido", { status: 400 });
  }

  const record = payload.record || payload.new || {};
  const text = record.text;
  const deviceId = record.device_id;

  if (!text) {
    return new Response("Messaggio mancante", { status: 400 });
  }

  const body = {
    app_id: env.ONESIGNAL_APP_ID,
    headings: { it: "Nuovo messaggio nel ricettario", en: "New message" },
    contents: { it: text, en: text },
    included_segments: ["Subscribed Users"],
  };

  if (deviceId) {
    body.filters = [{ field: "tag", key: "device_id", relation: "!=", value: deviceId }];
  }

  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const resultText = await response.text();
  return new Response(resultText, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
