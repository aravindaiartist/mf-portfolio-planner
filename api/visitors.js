// api/visitors.js — Vercel Serverless Function (CORS proxy for counterapi.dev)
const COUNTER_URL =
  "https://api.counterapi.dev/v1/mf-portfolio-planner-aravindan/visitor-count";

export default async function handler(req, res) {
  // CORS — allow requests from any origin (including our Vercel frontend)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const action = req.query.action === "increment" ? "up" : "get";
    const response = await fetch(`${COUNTER_URL}/${action}`);

    if (!response.ok) {
      throw new Error(`CounterAPI responded with ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json({ count: data.count ?? null });
  } catch (err) {
    return res.status(500).json({ count: null, error: err.message });
  }
}
