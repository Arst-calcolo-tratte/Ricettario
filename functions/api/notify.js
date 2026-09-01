export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  try {
    let payload;
    try { payload = await request.json(); } catch { return new Response(JSON.stringify({ ok:false, error:"Corpo non valido" }), { status:400, headers }); }
    const record = payload.record || payload.new || {};
    const text = String(record.text || "").trim();
    const senderDeviceId = String(record.device_id || "").trim();
    if (!text) return new Response(JSON.stringify({ ok:false, error:"Messaggio mancante" }), { status:400, headers });
    if (!env.ONESIGNAL_APP_ID || !env.ONESIGNAL_REST_API_KEY) return new Response(JSON.stringify({ ok:false, error:"Variabili Cloudflare mancanti" }), { status:500, headers });

    const body = {
      app_id: env.ONESIGNAL_APP_ID.trim(),
      headings: { it:"Nuovo messaggio nel ricettario", en:"New message" },
      contents: { it:text, en:text },
    };
    if (senderDeviceId) {
      body.filters = [{ field:"tag", key:"device_id", relation:"!=", value:senderDeviceId }];
    } else {
      body.included_segments = ["Subscribed Users"];
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method:"POST", headers:{ "Content-Type":"application/json; charset=utf-8", "Authorization":"Basic " + env.ONESIGNAL_REST_API_KEY.trim() }, body:JSON.stringify(body),
    });
    const resultText = await response.text();
    return new Response(resultText, { status: response.status, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok:false, error:String(err) }), { status:500, headers });
  }
}
