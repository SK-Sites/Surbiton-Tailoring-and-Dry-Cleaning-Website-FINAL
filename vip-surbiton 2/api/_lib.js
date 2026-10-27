const E = process.env;
const cat = require("./_catalog");
const clean = (v, m) => String(v || "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, m);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const gbp = (p) => "£" + (p / 100).toFixed(2);

// Upstash Redis over REST (Vercel Marketplace). Returns undefined when not configured.
async function redis(cmd) {
  const url = E.UPSTASH_REDIS_REST_URL || E.KV_REST_API_URL, token = E.UPSTASH_REDIS_REST_TOKEN || E.KV_REST_API_TOKEN;
  if (!url || !token) return undefined;
  const r = await fetch(url, { method: "POST", headers: { Authorization: "Bearer " + token }, body: JSON.stringify(cmd) });
  const d = await r.json();
  if (!r.ok || d.error) throw new Error("storage error");
  return d.result;
}

async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!E.RESEND_API_KEY || !E.RESEND_FROM_EMAIL || !to) return { skipped: true };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + E.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: E.RESEND_FROM_EMAIL, to: [to], subject, text, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!r.ok) throw new Error("email " + r.status);
  return { ok: true };
}

async function sendSms(body) {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: tok, TWILIO_FROM: from, ORDER_NOTIFY_PHONE: to } = E;
  if (!sid || !tok || !from || !to) return { skipped: true };
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${sid}:${tok}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
  });
  if (!r.ok) throw new Error("sms " + r.status);
  return { ok: true };
}

const totalText = (o) => {
  const x = [];
  if (o.quoteCount) x.push("item(s) to be quoted");
  if (o.unpricedCount) x.push(`${o.unpricedCount} item(s) to be priced`);
  if (o.estimatedPence) return (cat.pricesAreFrom ? "from " : "") + gbp(o.estimatedPence) + (x.length ? " + " + x.join(" + ") : "");
  return x.length ? x.join(" + ").replace(/^./, (c) => c.toUpperCase()) : "To be confirmed";
};
const lineText = (i) => `${i.qty} x ${i.name}` + (i.unitPence ? ` @ ${cat.pricesAreFrom ? "from " : ""}${gbp(i.unitPence)} = ${cat.pricesAreFrom ? "from " : ""}${gbp(i.unitPence * i.qty)}` : i.quote ? " (Quote After Order Confirmation)" : " (price to be confirmed)");
const when = (o) => new Date(o.createdAt).toLocaleString("en-GB", { timeZone: "Europe/London" });

function ownerEmail(o) {
  const text = [
    "NEW VIP WEBSITE BOOKING", `Order reference: ${o.ref}`, `Customer: ${o.name}`, `Phone: ${o.phone}`, `Email: ${o.email}`, "",
    "Services:", ...o.items.map((i) => "- " + lineText(i)), "", `Estimated total: ${totalText(o)}`,
    `Collection/Delivery: ${o.method}`, ...(o.address ? [`Address: ${o.address}`] : []), "", "Customer notes:", o.notes || "(none)", "",
    `Booking submitted: ${when(o)}`, "No payment has been taken on the website. Contact the customer to confirm, arrange payment and collection/delivery.",
  ].join("\n");
  const row = (a, b) => `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">${a}</td><td style="padding:6px 0"><strong>${b}</strong></td></tr>`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;font-size:16px;color:#111"><h2 style="margin:0 0 4px">NEW VIP WEBSITE BOOKING</h2><p style="margin:0 0 16px;color:#0b6e51"><strong>${esc(o.ref)}</strong></p><table style="width:100%;border-collapse:collapse">${row("Customer", esc(o.name))}${row("Phone", `<a href="tel:${esc(o.phone)}">${esc(o.phone)}</a>`)}${row("Email", esc(o.email))}${row("Handover", esc(o.method))}${o.address ? row("Address", esc(o.address)) : ""}${row("Estimated total", esc(totalText(o)))}${row("Submitted", esc(when(o)))}</table><h3>Services</h3><ul>${o.items.map((i) => `<li>${esc(lineText(i))}</li>`).join("")}</ul><h3>Customer notes</h3><p>${esc(o.notes || "(none)")}</p><p style="color:#666;font-size:14px">No payment taken on the website. Contact the customer to confirm, arrange payment and collection/delivery.</p></div>`;
  return { subject: `New VIP booking ${o.ref} - ${o.name}`, text, html };
}

function customerEmail(o) {
  const contact = [E.BUSINESS_PHONE, E.BUSINESS_EMAIL].filter(Boolean).join(" · ");
  const intro = "Your booking request has been received. No payment has been taken online. Nash will reply within 24 hours to confirm the details and final price, arrange payment and organise collection/delivery where applicable." + (o.quoteCount ? " The final price for any item marked Quote After Order Confirmation will be confirmed directly by VIP after your booking has been received." : "");
  const text = [`VIP Surbiton Tailoring & Dry Cleaning`, "", `Hello ${o.name},`, "", intro, "", `Order reference: ${o.ref}`, "Services:", ...o.items.map((i) => "- " + lineText(i)), `Estimated total: ${totalText(o)}`, "", "VIP Surbiton Tailoring & Dry Cleaning, 35 Victoria Road, Surbiton, KT6 4JT", contact].filter((x) => x !== undefined).join("\n");
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111"><div style="background:#0b0c0d;color:#fff;padding:24px;font-family:Georgia,serif;font-size:24px">VIP Surbiton<br><span style="font:11px Arial;letter-spacing:3px;color:#2fc79a">TAILORING &amp; DRY CLEANING</span></div><div style="padding:24px"><p>Hello ${esc(o.name)},</p><p>${esc(intro)}</p><p><strong>Order reference: ${esc(o.ref)}</strong></p><ul>${o.items.map((i) => `<li>${esc(lineText(i))}</li>`).join("")}</ul><p><strong>Estimated total: ${esc(totalText(o))}</strong></p><p style="color:#555;font-size:14px">The final price is confirmed by VIP. ${esc(contact)}<br>35 Victoria Road, Surbiton, KT6 4JT</p></div></div>`;
  return { subject: `Your VIP Surbiton booking request ${o.ref}`, text, html };
}

const smsText = (o) => `VIP Surbiton: New website booking from ${o.name}. Order ${o.ref}. Estimated total ${totalText(o)}. Check your email for full details.`;
module.exports = { E, clean, esc, gbp, redis, sendEmail, sendSms, ownerEmail, customerEmail, smsText };
