const ALLOWED_ORIGINS = [
  "https://cihana-chat.vercel.app",
  "https://cihana-chat-7vexauoek-janssalam1122-5885s-projects.vercel.app",
  "https://cihana.chat",
  "https://cihana.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

const FREE_LIMIT = 15;
const userRequests = {};

function getRateKey(req) {
  const ip = req.headers["x-forwarded-for"] || "unknown";
  return ip.split(",")[0].trim();
}

function checkRateLimit(key) {
  const dayStart = new Date().setHours(0, 0, 0, 0);
  if (!userRequests[key] || userRequests[key].dayStart !== dayStart) {
    userRequests[key] = { count: 0, dayStart };
  }
  userRequests[key].count++;
  return userRequests[key].count <= FREE_LIMIT;
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS.includes(origin) ? origin : "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rateKey = getRateKey(req);
  if (!checkRateLimit(rateKey)) {
    return res.status(429).json({ error: "rate_limit", message: "Daily limit reached" });
  }

  const { model, messages, system, max_tokens } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-haiku-4-5-20251001",
        max_tokens: Math.min(max_tokens || 600, 1000),
        system,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "API error" });
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
