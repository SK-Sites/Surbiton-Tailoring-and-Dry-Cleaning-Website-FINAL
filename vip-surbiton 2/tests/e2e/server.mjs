// Local stand-in for Cloudflare Pages: serves /public with the _headers file applied, and runs the REAL functions/api/*.js
// through the same adapter. Redis, Resend and Twilio are replaced with in-memory mocks that record what would be sent.
import http from "http"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PORT = Number(process.env.PORT || 8787), BASE = `http://localhost:${PORT}`;
const env = { SITE_URL: BASE, ORDER_NOTIFY_EMAIL: "nagim.ariaa@gmail.com", ORDER_NOTIFY_PHONE: "+447728918003", RESEND_API_KEY: "re_test", RESEND_FROM_EMAIL: "VIP Surbiton <orders@example.test>", TWILIO_ACCOUNT_SID: "ACtest", TWILIO_AUTH_TOKEN: "tok", TWILIO_FROM: "VIPSurbiton", UPSTASH_REDIS_REST_URL: "https://redis.test", UPSTASH_REDIS_REST_TOKEN: "t", ADMIN_TOKEN: "x".repeat(40), BUSINESS_PHONE: "07728 918003", BUSINESS_EMAIL: "nagim.ariaa@gmail.com" };
const kv = new Map(), lists = new Map(), sent = [];
globalThis.fetch = async (url, o = {}) => {
  const j = (d, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => d });
  url = String(url);
  if (url.startsWith("https://redis.test")) { const [c, k, v, a] = JSON.parse(o.body);
    if (c === "SET") { if (a === "NX" && kv.has(k)) return j({ result: null }); kv.set(k, v); return j({ result: "OK" }); }
    if (c === "GET") return j({ result: kv.has(k) ? kv.get(k) : null }); if (c === "INCR") { kv.set(k, (Number(kv.get(k)) || 0) + 1); return j({ result: kv.get(k) }); }
    if (c === "DEL") { kv.delete(k); return j({ result: 1 }); } if (c === "LPUSH") { const l = lists.get(k) || []; l.unshift(v); lists.set(k, l); return j({ result: l.length }); }
    if (c === "LRANGE") return j({ result: (lists.get(k) || []).slice(0, 50) }); return j({ result: 1 }); }
  if (url.includes("resend.com")) { sent.push({ kind: "email", ...JSON.parse(o.body) }); return j({ id: "e1" }); }
  if (url.includes("twilio.com")) { sent.push({ kind: "sms", ...Object.fromEntries(new URLSearchParams(o.body)) }); return j({ sid: "s1" }); }
  throw new Error("unexpected outbound request " + url);
};
const fns = {};
for (const n of ["book", "catalog", "orders"]) fns[n] = (await import(`../../functions/api/${n}.js`)).onRequest;
const headers = []; let cur = null;
for (const line of fs.readFileSync(path.join(root, "public/_headers"), "utf8").split("\n")) { if (!line.trim()) continue; if (!line.startsWith(" ")) { cur = {}; headers.push(cur); } else { const i = line.indexOf(":"); cur[line.slice(0, i).trim()] = line.slice(i + 1).trim(); } }
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".txt": "text/plain", ".xml": "application/xml" };
http.createServer(async (req, res) => {
  const u = new URL(req.url, BASE);
  if (u.pathname === "/__sent") { res.setHeader("content-type", "application/json"); return res.end(JSON.stringify(sent)); }
  if (u.pathname === "/__store") { res.setHeader("content-type", "application/json"); return res.end(JSON.stringify({ keys: [...kv.keys()] })); }
  if (u.pathname.startsWith("/api/")) {
    const fn = fns[u.pathname.slice(5)]; if (!fn) { res.statusCode = 404; return res.end("not found"); }
    const chunks = []; for await (const c of req) chunks.push(c);
    const request = new Request(u, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) });
    const r = await fn({ request, env }); res.statusCode = r.status; r.headers.forEach((v, k) => res.setHeader(k, v)); return res.end(await r.text());
  }
  let p = path.join(root, "public", decodeURIComponent(u.pathname)); let status = 200;
  if (u.pathname.endsWith("/")) p = path.join(p, "index.html");
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { if (fs.existsSync(p + ".html")) p += ".html"; else { p = path.join(root, "public/404.html"); status = 404; } }
  for (const h of headers) for (const [k, v] of Object.entries(h)) res.setHeader(k, v);
  res.statusCode = status; res.setHeader("content-type", types[path.extname(p)] || "application/octet-stream"); res.end(fs.readFileSync(p));
}).listen(PORT, () => console.log("ready " + BASE));
