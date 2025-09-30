export async function handler(event) {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { playerId, title, message } = JSON.parse(event.body || "{}");
    if (!playerId) return { statusCode: 400, body: "playerId required" };

    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: [playerId],
        headings: { en: title || "Order Ready" },
        contents: { en: message || "Your order is ready." },
        url: process.env.SITE_URL || "",
      }),
    });

    const data = await res.json();
    if (!res.ok) return { statusCode: res.status, body: JSON.stringify(data) };
    return { statusCode: 200, body: JSON.stringify({ ok: true, data }) };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
}
