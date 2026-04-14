// api/visitors.js — Vercel Serverless Function (CORS proxy for counterapi.dev)
const COUNTER_URL =
  "https://api.counterapi.dev/v1/mf-portfolio-planner-aravindan/visitor-count";

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const action = req.query.action === "increment" ? "up" : "get";
    const url = `${COUNTER_URL}/${action}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CounterAPI responded with ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json({ count: data.count ?? null });
  } catch (err) {
    console.error("Visitor counter error:", err);
    return res.status(200).json({ count: null, error: String(err.message || err) });
  }
};
