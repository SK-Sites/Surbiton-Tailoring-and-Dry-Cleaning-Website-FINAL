const crypto = require("crypto");
const catalog = require("./_catalog");
const L = require("./_lib");
const fail = (res, code, error) => res.status(code).json({ ok: false, error });

module.exports = async (req, res) => {
  if (req.method !== "POST") return fail(res, 405, "Method not allowed.");
  const site = L.E.SITE_URL, origin = req.headers.origin;
  let okOrigin = false; try { okOrigin = !!site && !!origin && new URL(origin).host === new URL(site).host; } catch (e) {}
  if (!site) return fail(res, 503, "Booking is not available yet.");
  if (!okOrigin) return fail(res, 403, "Request not allowed.");
  if (!String(req.headers["content-type"] || "").includes("application/json")) return fail(res, 415, "Unsupported request.");
  const b = req.body && typeof req.body === "object" ? req.body : {};
  if (b.website || !(Number(b.elapsed) > 2500)) return fail(res, 400, "We couldn't submit your booking. Please try again.");

  try { // basic abuse limit per IP (only when storage is configured)
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
    const n = await L.redis(["INCR", "rl:" + ip]);
    if (n === 1) await L.redis(["EXPIRE", "rl:" + ip, 600]);
    if (n > 8) return fail(res, 429, "Too many attempts. Please try again later or call us.");
    const hr = "g:" + new Date().toISOString().slice(0, 13), g = await L.redis(["INCR", hr]); // site-wide hourly cap against floods
    if (g === 1) await L.redis(["EXPIRE", hr, 7200]);
    if (g > 60) return fail(res, 429, "We are very busy right now. Please call us to book.");
  } catch (e) { /* rate limiting is best-effort */ }

  const name = L.clean(b.name, 100), email = L.clean(b.email, 150), phone = L.clean(b.phone, 30), notes = L.clean(b.notes, 400);
  const collect = b.method === "request";
  const address = collect ? L.clean(b.address, 250) : "";
  if (!name) return fail(res, 400, "Please enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, "Please enter a valid email address.");
  if (phone.replace(/\D/g, "").length < 10) return fail(res, 400, "Please enter a valid phone number.");
  if (collect && !address) return fail(res, 400, "Please enter your collection / delivery address.");
  if (b.consent !== true) return fail(res, 400, "Please confirm you've read our privacy policy and terms.");
  if (!/^[a-f0-9-]{16,64}$/.test(String(b.key))) return fail(res, 400, "Invalid request.");
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 20) return fail(res, 400, "Please choose at least one service.");

  const items = [], seen = new Set();
  for (const it of b.items) { // prices come from the server catalogue ONLY
    const p = catalog.items.find((c) => c.id === it.id), qty = Number(it.qty);
    if (!p || seen.has(p.id) || !Number.isInteger(qty) || qty < 1 || qty > 50) return fail(res, 400, "Invalid order.");
    seen.add(p.id);
    items.push({ id: p.id, name: p.name, qty, unitPence: Number.isInteger(p.pricePence) && !p.quote ? p.pricePence : null, quote: !!p.quote });
  }
  const o = {
    ref: "VIP-" + crypto.randomBytes(4).toString("hex").toUpperCase(), createdAt: new Date().toISOString(),
    name, email, phone, method: collect ? "Collection / delivery requested" : "Customer will drop off / collect in shop", address, notes, items,
    estimatedPence: items.reduce((s, i) => s + (i.unitPence || 0) * i.qty, 0), unpricedCount: items.filter((i) => !i.unitPence && !i.quote).length, quoteCount: items.filter((i) => i.quote).length,
    pricesConfirmed: !!catalog.confirmed,
  };

  const idem = "idem:" + b.key;
  let stored = false;
  try {
    const first = await L.redis(["SET", idem, o.ref, "NX", "EX", 86400]);
    if (first === null) { // same submission key seen before: return the original reference, send nothing again
      const ref = await L.redis(["GET", idem]);
      return res.status(200).json({ ok: true, ref, duplicate: true });
    }
    if (first !== undefined) { await L.redis(["SET", "order:" + o.ref, JSON.stringify(o), "EX", 94608000]); await L.redis(["LPUSH", "orders", o.ref]); stored = true; }
  } catch (e) { console.error("storage failed"); }

  let smsOk = true; // daily cap so an attacker cannot run up the SMS bill or flood Nagim's phone
  try { const d = "sms:" + new Date().toISOString().slice(0, 10), n = await L.redis(["INCR", d]); if (n === 1) await L.redis(["EXPIRE", d, 172800]); if (n > 40) smsOk = false; } catch (e) {}
  const oe = L.ownerEmail(o), ce = L.customerEmail(o);
  const [ownerR, smsR, custR] = await Promise.allSettled([
    L.sendEmail({ to: L.E.ORDER_NOTIFY_EMAIL, replyTo: o.email, ...oe }), smsOk ? L.sendSms(L.smsText(o)) : Promise.resolve({ skipped: true, capped: true }), L.sendEmail({ to: o.email, ...ce }),
  ]);
  const st = (r) => (r.status === "rejected" ? "failed" : r.value.capped ? "capped" : r.value.skipped ? "not configured" : "sent");
  const notify = { ownerEmail: st(ownerR), sms: st(smsR), customerEmail: st(custR) };
  console.log("booking", o.ref, JSON.stringify(notify)); // reference + status only: no personal data

  if (!stored && notify.ownerEmail !== "sent") { // nothing durable holds this order: do NOT tell the customer it worked
    try { await L.redis(["DEL", idem]); } catch (e) {}
    return fail(res, 502, "Sorry, we couldn't submit your booking. You haven't been charged. Please try again or call us.");
  }
  if (stored) { try { o.notify = notify; await L.redis(["SET", "order:" + o.ref, JSON.stringify(o), "EX", 94608000]); } catch (e) {} }
  return res.status(200).json({ ok: true, ref: o.ref });
};
