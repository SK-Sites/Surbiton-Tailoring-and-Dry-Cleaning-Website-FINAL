// Private order list: GET /api/orders with header  Authorization: Bearer <ADMIN_TOKEN>  (token must be 32+ characters)
const crypto = require("crypto");
const L = require("./_lib");
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown", key = "adm:" + ip;
  const tok = L.E.ADMIN_TOKEN || "";
  if (req.method !== "GET" || tok.length < 32) return res.status(404).json({ error: "Not found" });
  try { if (Number(await L.redis(["GET", key])) >= 10) return res.status(429).json({ error: "Too many attempts" }); } catch (e) {}
  const t = (req.headers.authorization || "").replace(/^Bearer /, ""), a = Buffer.from(t), b = Buffer.from(tok);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    try { const n = await L.redis(["INCR", key]); if (n === 1) await L.redis(["EXPIRE", key, 3600]); } catch (e) {}
    return res.status(401).json({ error: "Unauthorised" });
  }
  try {
    const refs = (await L.redis(["LRANGE", "orders", 0, 49])) || [];
    res.status(200).json((await Promise.all(refs.map(async (r) => JSON.parse(await L.redis(["GET", "order:" + r]))))).filter(Boolean));
  } catch (e) { res.status(500).json({ error: "Storage not available" }); }
};
