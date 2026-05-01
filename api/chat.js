// api/chat.js — Vercel Serverless Function
// يحمي الـ API key ويمنع الاستخدام المباشر

const ALLOWED_ORIGINS = [
  "https://cihana.chat",
  "https://cihana.app", 
  "http://localhost:3000",
  "http://localhost:5173",
];

const FREE_LIMIT = 15;

// Simple in-memory rate limiter (resets on server restart)
// For production: استخدم Redis أو Upstash
const userRequests = {};

function getRateKey(req) {
  const ip = req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";
  return ip.split(",")[0].trim();
}

function checkRateLimit(key) {
  const now = Date.now();
  const dayStart = new Date().setHours(0, 0, 0, 0);
  
  if (!userRequests[key] || userRequests[key].dayStart !== dayStart) {
    userRequests[key] = { count: 0, dayStart };
  }
  
  userRequests[key].count++;
  return userRequests[key].count <= FREE_LIMIT;
}

export default async function handler(req, res) {
  // ── CORS
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Rate limiting
  const rateKey = getRateKey(req);
  const allowed = checkRateLimit(rateKey);
  
  if (!allowed) {
    return res.status(429).json({
      error: "rate_limit",
      message: "Sînorê rojane temam bû · Daily limit reached",
      limit: FREE_LIMIT,
    });
  }

  // ── Validate request body
  const { model, messages, system, max_tokens } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  // ── Call Anthropic API with hidden key
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY, // Hidden — مخفي
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-haiku-4-5-20251001",
        max_tokens: Math.min(max_tokens || 600, 1000), // Cap at 1000
        system,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "API error" });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
