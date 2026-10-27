// Run: node tests/book.test.js   (logic test with mocked Redis/Resend/Twilio: it does NOT prove real email/SMS delivery)
const assert = require("assert");
const cat = require.resolve("../api/_catalog.js");
require.cache[cat] = { id: cat, filename: cat, loaded: true, exports: { confirmed: true, pricesAreFrom: true, items: [{ id: "coat", group: "Coats", name: "Coat", pricePence: 1200 }, { id: "wd", group: "D", name: "Wedding dress", pricePence: null, quote: true }, { id: "dc", group: "D", name: "Duvet", pricePence: null }] } };
Object.assign(process.env, { SITE_URL: "https://x.test", ORDER_NOTIFY_EMAIL: "o@x.test", ORDER_NOTIFY_PHONE: "+447000000000", RESEND_API_KEY: "k", RESEND_FROM_EMAIL: "V <a@x.test>", TWILIO_ACCOUNT_SID: "AC1", TWILIO_AUTH_TOKEN: "t", TWILIO_FROM: "VIP", UPSTASH_REDIS_REST_URL: "https://r.test", UPSTASH_REDIS_REST_TOKEN: "t" });
let kv, calls, fails;
global.fetch = async (url, o) => {
  calls.push(url);
  const j = (d, ok = true) => ({ ok, json: async () => d });
  if (String(url).includes("r.test")) { if (fails.redis) return j({ error: "x" }, false); const [c, k, v, nx] = JSON.parse(o.body); if (c === "SET") { if (nx === "NX" && kv[k]) return j({ result: null }); kv[k] = v; return j({ result: "OK" }); } if (c === "GET") return j({ result: kv[k] }); if (c === "INCR") { kv[k] = (kv[k] || 0) + 1; return j({ result: kv[k] }); } return j({ result: 1 }); }
  if (String(url).includes("resend")) return j({}, !fails.email);
  if (String(url).includes("twilio")) return j({}, !fails.sms);
  throw new Error("unexpected " + url);
};
const h = require("../api/book.js");
const run = async (body) => { let out; await h({ method: "POST", headers: { origin: "https://x.test", "content-type": "application/json" }, body }, { status: (c) => ({ json: (d) => (out = { c, ...d }) }) }); return out; };
const good = (k) => ({ items: [{ id: "coat", qty: 2 }, { id: "wd", qty: 1 }], name: "Test User", email: "t@x.test", phone: "07700 900123", method: "shop", consent: true, key: k || "a".repeat(20), elapsed: 9000, notes: "<b>hi</b>" });
(async () => {
  const reset = () => { kv = {}; calls = []; fails = {}; };
  reset(); let r = await run(good()); assert(r.ok && /^VIP-[0-9A-F]{8}$/.test(r.ref), "success"); assert.equal(calls.filter((u) => u.includes("resend")).length, 2, "owner+customer email"); assert.equal(calls.filter((u) => u.includes("twilio")).length, 1, "sms");
  const o = JSON.parse(kv["order:" + r.ref]); assert.equal(o.estimatedPence, 2400, "price from server"); assert.equal(o.unpricedCount, 0); assert.equal(o.quoteCount, 1); assert(calls.length > 0); assert.equal(o.estimatedPence, 2400, "dress adds no £0 or number"); assert(!o.notes.includes("<"), "sanitised");
  const n = calls.filter((u) => !u.includes("r.test")).length; r = await run(good()); assert(r.duplicate && calls.filter((u) => !u.includes("r.test")).length === n, "duplicate: no extra notifications");
  reset(); assert.equal((await run({ ...good("b".repeat(20)), items: [{ id: "coat", qty: 1, pricePence: 1 }, { id: "nope", qty: 1 }] })).c, 400, "unknown id rejected");
  reset(); assert.equal((await run({ ...good("c".repeat(20)), email: "bad" })).c, 400, "bad email"); assert.equal((await run({ ...good("d".repeat(20)), website: "x" })).c, 400, "honeypot"); assert.equal((await run({ ...good("e".repeat(20)), elapsed: 100 })).c, 400, "too fast");
  assert.equal((await run({ ...good("f".repeat(20)), method: "request" })).c, 400, "address required for collection");
  reset(); fails.email = fails.sms = true; r = await run(good("1".repeat(20))); assert(r.ok, "stored => accepted even if notifications fail"); assert.equal(JSON.parse(kv["order:" + r.ref]).notify.sms, "failed");
  reset(); fails.email = fails.redis = true; r = await run(good("2".repeat(20))); assert.equal(r.c, 502, "nothing recorded and no email => error shown, never fake success");
  reset(); fails.redis = true; r = await run(good("3".repeat(20))); assert(r.ok, "storage down but owner email sent => accepted");
  reset(); { let out; await h({ method: "POST", headers: { "content-type": "application/json" }, body: good() }, { status: (c) => ({ json: (d) => (out = { c, ...d }) }) }); assert.equal(out.c, 403, "missing Origin rejected"); }
  reset(); { let out; await h({ method: "POST", headers: { origin: "https://evil.test", "content-type": "application/json" }, body: good() }, { status: (c) => ({ json: (d) => (out = { c, ...d }) }) }); assert.equal(out.c, 403, "foreign Origin rejected"); }
  reset(); kv["g:" + new Date().toISOString().slice(0, 13)] = 60; assert.equal((await run(good("4".repeat(20)))).c, 429, "site-wide hourly cap");
  reset(); kv["sms:" + new Date().toISOString().slice(0, 10)] = 40; r = await run(good("5".repeat(20))); assert(r.ok && !calls.some((u) => u.includes("twilio")), "SMS daily cap: booking still accepted, no SMS");
  reset(); r = await run({ ...good("6".repeat(20)), items: [{ id: "wd", qty: 1 }] }); assert.equal(JSON.parse(kv["order:" + r.ref]).estimatedPence, 0, "dress-only: total 0 is never shown as a price"); const L = require("../api/_lib.js"); assert.equal(L.ownerEmail(JSON.parse(kv["order:" + r.ref])).text.includes("Estimated total: Item(s) to be quoted"), true);
  assert.equal(L.ownerEmail({ ...o, name: "x", phone: "1", email: "e", ref: "R", createdAt: new Date().toISOString(), method: "m" }).text.includes("Estimated total: from £24.00 + item(s) to be quoted"), true, "mixed order wording");
  console.log("all booking tests passed");
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });
