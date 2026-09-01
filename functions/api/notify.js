export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response("Corpo della richiesta non valido", { status: 400 });
    }

    const record = payload.record || payload.new || {};
    const text = record.text;

    if (!text) {
      return new Response("Messaggio mancante", { status: 400 });
    }

    if (!env.ONESIGNAL_APP_ID || !env.ONESIGNAL_REST_API_KEY) {
      return new Response("Variabili ONESIGNAL_APP_ID o ONESIGNAL_REST_API_KEY mancanti", { status: 500 });
    }

    const body = {
      app_id: env.ONESIGNAL_APP_ID.trim(),
      headings: { it: "Nuovo messaggio nel ricettario", en: "New message" },
      contents: { it: text, en: text },
      included_segments: ["Subscribed Users"],
    };

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
