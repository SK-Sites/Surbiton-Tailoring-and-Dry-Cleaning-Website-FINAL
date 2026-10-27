# Security notes

No website can honestly be called "unhackable". This site is built to minimise the attack surface and limit damage, and the remaining risks are mostly account security.

## Built in
- **No payment data, no passwords, no user accounts, no cookies, no database exposed to the browser, zero npm dependencies** (nothing to be compromised through the supply chain).
- Only `public/` (the website) is served, and `functions/` plus `api/` run as the booking functions. Scripts, tests, docs and env examples are never served.
- **Strict CSP** (`script-src 'self'`, no inline scripts, no framing, no plugins), HSTS (HTTPS only), nosniff, referrer and permissions policies (`public/_headers`, and `vercel.json` if Vercel is ever used).
- Booking endpoint: same-origin check, JSON-only, server-side validation, **server-side pricing**, honeypot, minimum-time check, per-IP and site-wide hourly limits, daily SMS cap, duplicate-submission protection, all input stripped of control characters and HTML-escaped in emails.
- Secrets exist only as Cloudflare environment variables (Variables and Secrets). `.env*` is git-ignored. Logs contain order references and statuses only, never personal data.
- `/api/orders` is hidden (404) unless a 32+ character `ADMIN_TOKEN` is set, uses constant-time comparison and locks out repeated wrong guesses.

## You must do (this is where real-world breaches happen)
1. Turn on **2-factor authentication** for GitHub, Vercel, Resend, Twilio, Upstash and the Gmail account used for alerts.
2. Keep the GitHub repo **private**; protect `main` (require review) if more than one person has access.
3. Mark keys and tokens with the **Secret** type in Cloudflare. Use a long random `ADMIN_TOKEN` (e.g. 40+ characters from a password manager).
4. In Cloudflare, use **Security > WAF rate limiting** and "Under Attack" mode if you ever see abuse; Cloudflare Turnstile can add extra bot protection to the booking form.
5. Restrict Twilio and Resend to the minimum needed, set spend limits and low-balance alerts, and rotate keys if anyone leaves.
6. Use a DNS provider with 2FA; keep domain auto-renew on and registrar lock enabled.
7. Re-check `SECURITY.md` and rotate keys at least yearly. Report problems to the contact in `/.well-known/security.txt`.

## Known limits
Rate limiting fails open if storage is down, so orders are never lost. A determined distributed spam attack could still submit fake bookings (capped as above). Google Fonts is a third-party request. A penetration test by a qualified professional is advisable before launch.
