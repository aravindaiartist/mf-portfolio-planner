// api/visitors.js — Vercel Serverless Function (CORS proxy for counterapi.dev)
// Uses Node.js built-in https module to avoid dependency on global fetch
const https = require("https");

const COUNTER_URL =
  "https://api.counterapi.dev/v1/mf-portfolio-planner-aravindan/visitor-count";

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("Invalid JSON: " + data.slice(0, 200)));
          }
        });
      })
      .on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const action = req.query.action === "increment" ? "up" : "get";
    const data = await httpsGet(`${COUNTER_URL}/${action}`);
    return res.status(200).json({ count: data.count ?? null });
  } catch (err) {
    console.error("Visitor counter error:", err);
    return res.status(200).json({ count: null, error: String(err.message || err) });
  }
};
