// Lets the shared handlers in /api (written as (req, res)) run as Cloudflare Pages Functions.
export function wrap(handler) {
  return async ({ request, env }) => {
    if (typeof process !== "undefined" && process.env) Object.assign(process.env, env); // settings from the Cloudflare dashboard
    const headers = {};
    request.headers.forEach((v, k) => (headers[k] = v));
    if (headers["cf-connecting-ip"]) headers["x-forwarded-for"] = headers["cf-connecting-ip"]; // real visitor IP for rate limits
    let body;
    if (request.method === "POST") { try { body = await request.json(); } catch (e) { body = undefined; } }
    let status = 200, out = "";
    const hdr = { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff", "x-robots-tag": "noindex" };
    const res = {
      setHeader: (k, v) => { hdr[String(k).toLowerCase()] = v; },
      status: (c) => { status = c; return res; },
      json: (d) => { out = JSON.stringify(d); return res; },
      send: (t) => { out = String(t); return res; },
      end: () => res,
    };
    await handler({ method: request.method, headers, body }, res);
    return new Response(out, { status, headers: hdr });
  };
}
