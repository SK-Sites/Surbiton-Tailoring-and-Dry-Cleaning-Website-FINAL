# VIP Surbiton Tailoring & Dry Cleaning – website + online booking requests

Static site (HTML/CSS/JS) plus small Vercel serverless functions in `/api`. **No online payment**: customers send a booking *request*; Nagim contacts them to confirm price, payment and collection/delivery.

Layout: `public/` = website files (deployed), `api/` = serverless functions, `scripts/`, `tests/`, docs (not deployed). Security details: `SECURITY.md`.
Pages: `/`, `/book`, `/booking-confirmed`, `/privacy`, `/cookies`, `/terms`, `/refunds`, `/404`.
Inner pages are generated from the header/footer in `index.html`: after editing them run `cd public && python3 ../scripts/make-pages.py`.

## What happens on "Confirm booking"
1. `/api/book` validates everything (honeypot, minimum time on page, origin check, per-IP limit, field rules) and **re-prices from `api/_catalog.js`**. Browser prices are ignored.
2. Creates a unique reference (`VIP-XXXXXXXX`) and a duplicate-submission key (a resubmit returns the same reference and sends nothing twice).
3. Saves the order to Upstash Redis, then sends in parallel: email to Nagim, SMS to Nagim, confirmation email to the customer.
4. The customer sees "Booking received" **only if** the order was saved OR the email to Nagim was sent. If neither worked they see an error and nothing is claimed. If the order is saved but a notification fails, the booking is still accepted and the failure is recorded on the order (see `/api/orders`).
5. The confirmation page shows the reference in the URL only; the order summary comes from the customer's own browser session, so no personal data is in URLs.

## Prices
Edit `api/_catalog.js` (pence). All priced items display as **"From £X"**: no fixed prices anywhere. Items with `quote: true` (dresses, bridal, bespoke, duvets, curtains, rugs, upholstery, shoe and suede repairs, uniforms, Asian clothing, other requests) show "Quote After Order Confirmation" and are never added to the estimated total. VIP is not VAT registered. The final price is always confirmed by Nash.

## Setup (accounts and environment variables; never paste secrets into chat)
1. **GitHub**: private repo owned by the client; **Vercel**: import it (Framework: Other, no build command); add the custom domain; set `SITE_URL`.
2. **Storage**: Vercel → Storage / Marketplace → add **Upstash Redis**; connect it to the project (sets the Redis env vars).
3. **Email (Resend)**: create an account, add and verify the domain's DNS records, create an API key → `RESEND_API_KEY`; set `RESEND_FROM_EMAIL` (e.g. `VIP Surbiton <orders@yourdomain>`). Customer emails need a verified domain; without one Resend only allows testing to your own address.
4. **SMS (Twilio)**: create an account, buy a UK-capable number (or register an alphanumeric sender ID), then set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`. Trial accounts can only text verified numbers: verify Nagim's, or upgrade.
5. Set `ORDER_NOTIFY_EMAIL` and `ORDER_NOTIFY_PHONE` (E.164, `+447728918003`; the number supplied as "+44 07728918003" is not valid, so please confirm it), `ADMIN_TOKEN` (long random string), and optionally `BUSINESS_PHONE`, `BUSINESS_EMAIL`. All keys are in `.env.example`.
6. Redeploy. Replace `https://www.example.com` in `public/index.html`, `scripts/make-pages.py`, `public/robots.txt`, `public/sitemap.xml`, then re-run the page script.

## Testing checklist
- [ ] Run `npm test` (logic tests with mocked services).
- [ ] Open `/book`, add a service and quantity, fill details, **Review your order**, then **Confirm booking**.
- [ ] Redirected to "Booking received" with reference, services and estimated total; "No payment taken" is shown.
- [ ] Nagim's email arrives (check spam) with the reference, customer, services, estimated total, address only if collection was chosen, notes and time.
- [ ] Nagim's phone gets the short SMS (name, reference, estimated total only).
- [ ] The customer test email arrives (use your own address).
- [ ] Open `/api/orders` with header `Authorization: Bearer <ADMIN_TOKEN>` (e.g. a REST client): the order is listed with `notify` statuses.
- [ ] Press Confirm twice quickly / go back and resubmit: same reference, one set of notifications.
- [ ] Try invalid email/phone, no service, collection without address: clear errors.
- [ ] Temporarily set a wrong `RESEND_API_KEY`: booking should still succeed (saved) and show `ownerEmail: failed` in `/api/orders`.
- [ ] Repeat on a phone and a desktop browser.

## Verified vs not verified
Verified here: API logic with mocked Redis/Resend/Twilio (`tests/book.test.js`: success, server-side pricing, tampering, duplicates, validation, honeypot, notification failure, storage failure) and JS syntax of every page. **Not verified**: real email/SMS delivery, real storage, mobile/desktop rendering, Lighthouse. Notifications are not operational until the accounts above are configured.

## Data retention (matches the Privacy Policy)
Stored bookings expire automatically after 3 years (Redis expiry). Booking emails and texts in Nash's Gmail/phone are NOT deleted automatically: he must clear them after 3 years, or change the policy wording. Invoices: 6 years.

## Flags before launch
`[CONFIRM]` / `[INSERT]` items in the legal pages; data-retention periods (the client keeps records indefinitely, which is not stated as compliant anywhere); public phone, email and opening hours; business email/phone shown to customers; collection/delivery offer; reviews (verbatim quotes needed); real photographs (all current images are mock artwork); Google Fonts disclosed (consider self-hosting).

## Deploying on Cloudflare Pages (recommended)
Shared logic lives in `api/`; `functions/api/*` wraps it for Cloudflare via `lib/cf-adapter.js`; `public/_headers` holds the security headers; `wrangler.toml` sets the output folder (`public`) and the Node compatibility flag. Vercel still works too (`vercel.json`).
1. Push this folder to a private GitHub repo.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git > choose the repo. Framework: None. Build command: leave empty. Output directory: `public`.
3. Settings > Variables and Secrets (Production): add everything in `.env.example`, using "Secret" for keys and tokens. Settings > Compatibility flags: add `nodejs_compat` if not already shown.
4. Deploy, open the `*.pages.dev` address, set `SITE_URL` to exactly that address, redeploy, and run the test booking.
5. Custom domain: Pages project > Custom domains > Set up a domain. Then run `python3 scripts/set-domain.py www.yourdomain.co.uk`, set `SITE_URL=https://www.yourdomain.co.uk`, commit and redeploy. Not yet tested on Cloudflare itself, so do the full test booking first.

## How Nagim is notified
Each confirmed booking triggers, within seconds: (1) an email to `ORDER_NOTIFY_EMAIL` with the full structured order (reply goes straight to the customer); (2) an SMS to `ORDER_NOTIFY_PHONE` with name, reference and estimated total only; (3) a copy kept in storage, viewable at `/api/orders`. Not live until Resend, Twilio and Upstash are configured.

## Photos (final)
All photos live in `public/images/` and are wired in `public/app.js` (the `IMG` block) and the hero collage in `public/index.html`. To swap a photo, upload a new file with the same name (WebP or JPG, around 1000 to 1600 pixels wide, under 300 KB) and commit. The shopfront photo was straightened and colour-corrected; the tailoring-table photo was cropped so the hangers at the top no longer appear.
Photos held back (customers' faces visible, or duplicates): they are not on the site. Nothing from them is in this folder.

## Opening hours
Confirmed by the client: open 7 days a week, 8am to 6pm; delivery until 8pm every day. The shop door sign (visible in the shopfront photo and in the old Google listing) may still show Saturday 9am to 5pm and Sunday closed: update the sign and the Google Business Profile to match. To change hours later, edit `public/index.html` (visit section, FAQ, footer and the schema block) and run `cd public && python3 ../scripts/make-pages.py`.

## Tests that were run
- `npm test`: booking logic (pricing, quote items, duplicates, spam limits, notification and storage failures) and the Cloudflare adapter.
- End-to-end: start `node tests/e2e/server.mjs` (a local stand-in for Cloudflare that runs the real functions with mocked Upstash, Resend and Twilio), then `python3 tests/e2e/run.py`. It checks security headers, no CSP violations, images, one h1 and alt text on every page, desktop and phone bookings through the real form, the emails and text produced, and the private order list.
- Not testable here: the real Cloudflare deployment, real email and SMS delivery, Safari and Firefox, and real devices. Do the test booking in the launch pack on the live `.pages.dev` address.
