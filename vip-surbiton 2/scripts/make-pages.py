#!/usr/bin/env python3
"""Generates the inner pages, re-using the header/footer of index.html. Run from the public folder: cd public && python3 ../scripts/make-pages.py"""
import re
D='https://www.example.com'  # TODO production domain
idx=open('index.html').read()
hdr=re.search(r'<header id="hd">.*?</header>',idx,re.S).group(0).replace('href="#','href="/#')
ftr=re.search(r'<footer id="contact">.*?</footer>',idx,re.S).group(0).replace('href="#','href="/#').replace('href="/#"','href="#"')
site=re.search(r'const SITE=\{phone:"(.*?)",email:"(.*?)"\}',open('app.js').read())
ph,em=site.groups()
if not ph.startswith('['): ftr=ftr.replace('id="ph" href="/#contact"','id="ph" href="tel:%s"'%re.sub(r'[^\d+]','',ph).replace('0','+44',1) if re.sub(r'[^\d+]','',ph).startswith('0') else re.sub(r'[^\d+]','',ph)).replace('[INSERT PHONE NUMBER]',ph)
if not em.startswith('['): ftr=ftr.replace('id="em" href="/#contact"','id="em" href="mailto:%s"'%em).replace('[INSERT EMAIL]',em)
HEAD='''<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%(t)s</title><meta name="description" content="%(d)s">%(r)s<link rel="canonical" href="'''+D+'''%(p)s">
<meta property="og:type" content="website"><meta property="og:locale" content="en_GB"><meta property="og:title" content="%(t)s"><meta property="og:description" content="%(d)s"><meta property="og:url" content="'''+D+'''%(p)s"><meta property="og:image" content="'''+D+'''/images/og-image.jpg"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b0c0d"><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✂️</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/styles.css"></head>
<body><a class="skip" href="#main">Skip to content</a>'''
def page(path,t,d,body,noindex=False,extra=''):
    h=HEAD%dict(t=t,d=d,p=path,r='<meta name="robots" content="noindex">' if noindex else '')
    f=path.lstrip('/')+'.html' if path!='/' else 'index.html'
    mm=re.match(r'<script>(.*)</script>$',extra,re.S)
    if mm:
        n=path.lstrip('/')
        open(n+'.js','w').write(mm.group(1)); extra='<script src="/%s.js" defer></script>'%n
    open(f,'w').write(h+hdr+'<main id="main">'+body+'</main>'+ftr+'<script src="/site.js"></script>'+extra+'</body></html>')
DRAFT=''
def legal(path,t,d,h1,inner):
    page(path,t,d,'<section class="light top"><div class="wrap prose"><span class="eyebrow">Legal</span><h1>%s</h1>%s%s<p><a href="/">Back to home</a> · <a href="/book">Book a service</a></p></div></section>'%(h1,DRAFT,inner))
legal('/privacy','Privacy Policy | VIP Surbiton Tailoring & Dry Cleaning','How VIP Surbiton Tailoring & Dry Cleaning collects, uses and protects your personal information.','Privacy Policy','''
<h2>Who we are</h2><p>VIP Surbiton Tailoring &amp; Dry Cleaning, 35 Victoria Road, Surbiton, KT6 4JT, is a trading name of Finefix Ltd (company number 12424328), which is responsible for your personal information. Privacy contact: <a href="mailto:nagim.ariaa@gmail.com">nagim.ariaa@gmail.com</a>.</p>
<h2>What we collect, and why</h2><ul><li><strong>Booking details</strong> (name, email, phone, services and quantities, notes, and an address only if you ask for collection or delivery): to review your booking, contact you, confirm the price, arrange payment and collection/delivery, and carry out the work. Basis: performing our contract with you or taking steps at your request before a contract.</li><li><strong>Enquiries</strong> by phone, WhatsApp or email: to reply to you.</li><li><strong>Business records</strong> such as invoices and payment records: to meet our legal and accounting obligations.</li></ul><p>We do not take payment on this website and never collect card details through it.</p>
<h2>Who processes it for us</h2><ul><li>Our website hosting provider (website delivery and server logs).</li><li>Upstash (a secure record of booking requests).</li><li>Resend (booking notification emails to us, and your confirmation email).</li><li>Twilio (a short text alert to the business containing your name, order reference and estimated total only).</li><li>Google Fonts: your browser requests fonts from Google when you visit, which shares your IP address with Google.</li></ul><p>Some of these providers process data outside the UK under appropriate safeguards. We do not sell your data and use no advertising or analytics trackers.</p>
<h2>How long we keep it</h2><table style="width:100%;border-collapse:collapse"><tr><th align="left">Information</th><th align="left">How long</th></tr><tr><td>Booking requests and customer contact details</td><td>3 years from the date of the booking, then deleted</td></tr><tr><td>Booking emails and text alerts</td><td>3 years from the date of the booking, then deleted</td></tr><tr><td>Invoices and payment records</td><td>6 years, as required for tax and accounting</td></tr><tr><td>Website server logs</td><td>A short period, under our hosting provider's standard settings</td></tr></table>
<h2>Your rights</h2><p>You can ask to access, correct or delete your data, restrict or object to its use, or request a copy of it. Contact us using the details above. You can also complain to the Information Commissioner's Office at <a href="https://ico.org.uk" rel="noopener">ico.org.uk</a>.</p>''')
legal('/cookies','Cookie Policy | VIP Surbiton Tailoring & Dry Cleaning','What cookies and similar technologies the VIP Surbiton Tailoring & Dry Cleaning website uses.','Cookie Policy','''
<h2>Our site</h2><p>This website does not use analytics, advertising or marketing cookies or pixels, and it does not take payments, so there is no cookie banner. If we add any non-essential tracking in future we will ask for your consent first and update this page.</p>
<h2>Your booking</h2><p>While you complete a booking, your browser keeps a temporary note of your order summary for the confirmation page. It stays on your device, is cleared when you close the tab, and is not a tracking cookie.</p>
<h2>External resources</h2><p>Fonts load from Google Fonts. This is not a cookie, but your browser contacts Google's servers. Links to Google Maps open Google's site only when you click them.</p>''')
legal('/terms','Terms & Conditions | VIP Surbiton Tailoring & Dry Cleaning','Terms for tailoring, alterations and dry-cleaning bookings with VIP Surbiton Tailoring & Dry Cleaning.','Terms &amp; Conditions','''
<h2>Who we are</h2><p>VIP Surbiton Tailoring &amp; Dry Cleaning, 35 Victoria Road, Surbiton, KT6 4JT, is a trading name of Finefix Ltd (company number 12424328, registered in England and Wales). We provide tailoring, alterations, repairs, dry cleaning, laundry and specialist garment care.</p>
<h2>Booking requests</h2><p>Submitting a booking on this website is a <strong>request</strong>, not a payment. Nothing is charged online. Nash will reply within 24 hours to confirm the details, the final price, payment and any collection or delivery. A booking is confirmed once these have been agreed with you.</p>
<h2>Prices</h2><p>Our prices are &quot;from&quot; prices and totals shown online are estimates. The final price depends on the garment and the work needed and is confirmed by Nash. Dresses, bridal and bespoke work, duvets, curtains, rugs, upholstery and other specific requests are priced by quote after your order is confirmed. We are not VAT registered, so no VAT is added.</p>
<h2>Payment</h2><p>We accept all major payment methods, including American Express. Payment is arranged directly with Nash. For bridal and bespoke work, a 50% deposit is taken before work begins, with the balance paid on completion.</p>
<h2>Turnaround</h2><p>Many services are typically completed within approximately 24 hours, depending on the garment, service required and workload. If your order will take longer, Nash will send you a message.</p>
<h2>Your garments</h2><p>Please tell us about stains, damage or special care needs. Results depend on the garment, fabric, stain and circumstances, so we cannot guarantee that every mark will be removed.</p>
<h2>Damage or loss</h2><p>VIP takes full responsibility for compensation if an item is damaged or lost while in our care.</p>
<h2>Uncollected items</h2><p>Uncollected items are held until collected, for up to 3 months. After that, they are given to charity.</p>
<h2>Cancelling</h2><p>For bridal and bespoke work, if you cancel once the work has been agreed, the 50% deposit covers the cost of the work already committed. See our <a href="/refunds">Refunds, Complaints &amp; Re-cleaning</a> page.</p>
<h2>Your legal rights</h2><p>Nothing here affects your statutory rights, including under the Consumer Rights Act 2015. See also our <a href="/privacy">Privacy Policy</a>.</p>''')
legal('/refunds','Refunds & Re-cleaning | VIP Surbiton Tailoring & Dry Cleaning','What happens if you are not happy with the result of a service at VIP Surbiton Tailoring & Dry Cleaning.','Refunds, Complaints &amp; Re-cleaning','''
<h2>If something isn't right</h2><p>Tell us as soon as you can. If you have a genuine problem with the result of a service, our first step is to make every reasonable effort to put it right by re-cleaning the garment or redoing the work. Our priority is to achieve the best possible result for you.</p>
<h2>Refunds</h2><p>Where there is a genuine and reasonable basis for a refund and the issue cannot be appropriately resolved by re-cleaning or redoing the work, we will consider a refund. Each case is looked at individually.</p>
<h2>What we can and can't promise</h2><p>Cleaning results depend on the garment, fabric, stain and circumstances. We take great care, but we cannot guarantee that every stain or mark will be removed.</p>
<h2>Cancelling a booking</h2><p>No payment is taken online, so you can cancel a booking request before work begins by contacting us. For bridal and bespoke work, if you cancel once the work has been agreed, the 50% deposit covers the cost of the work already committed.</p>
<h2>Your rights</h2><p>This does not affect your statutory rights. See also our <a href="/terms">Terms &amp; Conditions</a>.</p>''')
page('/book','Book Online | VIP Surbiton Tailoring & Dry Cleaning, Surbiton','Select your tailoring, alterations or dry-cleaning services and send a booking request to VIP Surbiton Tailoring & Dry Cleaning. No online payment.','''<section class="light top"><div class="wrap"><span class="eyebrow">Book online</span><h1>Book your service</h1>
<p class="muted">Send us your booking request. <strong>No payment is taken on this website</strong>: Nash will reply within 24 hours to confirm details, final price, payment and collection/delivery.</p>
<div class="note" id="est" hidden>Prices shown are "from" prices and estimates only. Nash confirms the final price for every order. VIP is not VAT registered, so no VAT is added.</div>
<div class="bk"><form id="bf" class="f" novalidate>
<div id="s1"><fieldset><legend>1. Choose services</legend><div id="items" aria-live="polite">Loading services…</div></fieldset>
<fieldset><legend>2. Your details</legend>
<label for="name">Full name</label><input id="name" autocomplete="name" required>
<label for="email">Email</label><input id="email" type="email" autocomplete="email" required>
<label for="phone">Phone</label><input id="phone" type="tel" autocomplete="tel" required>
<label for="method">Collection / delivery</label><select id="method"><option value="shop">I'll drop off and collect in the shop</option><option value="request">I'd like to request collection / delivery</option></select>
<div id="addrw" hidden><label for="addr">Collection / delivery address</label><textarea id="addr" rows="3" autocomplete="street-address"></textarea><p class="hint">Only needed for collection or delivery. We confirm availability with you.</p></div>
<label for="notes">Notes or special instructions (optional)</label><textarea id="notes" rows="3" maxlength="400"></textarea>
<div class="hp" aria-hidden="true"><label for="website">Leave blank</label><input id="website" tabindex="-1" autocomplete="off"></div>
<label class="chk" for="consent"><input id="consent" type="checkbox" required><span>I've read the <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a>, and agree that VIP may use these details to contact me about this booking.</span></label></fieldset>
<div class="err" id="err" role="alert"></div><button class="btn btn-em" id="rev" type="submit" disabled>Review your order</button></div>
<div id="s3" hidden><fieldset><legend>3. Review and confirm</legend><div id="rv"></div><p class="muted">No payment is taken now. VIP will contact you to confirm and arrange payment.</p></fieldset>
<div class="err" id="err2" role="alert"></div><button class="btn btn-em" id="go" type="button">Confirm booking</button> <button class="btn btn-line" id="back" type="button">Edit details</button></div></form>
<aside class="sum" aria-labelledby="st"><h2 id="st" style="font-size:1.7rem">Your order</h2><div id="lines" aria-live="polite"><p class="muted">No services selected yet.</p></div>
<div class="row"><strong>Estimated total</strong><strong id="total">To be confirmed</strong></div></aside></div></div></section>''',extra=r"""<script>
const $=s=>document.querySelector(s),gbp=p=>"£"+(p/100).toFixed(2),Q={},T0=Date.now(),KEY=(crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g,()=>(crypto.getRandomValues(new Uint8Array(1))[0]&15).toString(16)));let CAT=[],F=false;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
$("#method").onchange=e=>{$("#addrw").hidden=e.target.value!=="request"};
const sel=()=>CAT.filter(i=>Q[i.id]>0).map(i=>({...i,qty:Q[i.id]}));
const QT="Quote After Order Confirmation";const tot=()=>{const s=sel(),p=s.reduce((a,i)=>a+(i.pricePence||0)*i.qty,0),q=s.some(i=>i.quote),u=s.filter(i=>!i.pricePence&&!i.quote).length,x=[];if(q)x.push("item(s) to be quoted");if(u)x.push(`${u} item${u>1?"s":""} to be priced`);return p?(F?"From ":"")+gbp(p)+(x.length?" + "+x.join(" + "):""):(x.length?x.join(" + ").replace(/^./,c=>c.toUpperCase()):"To be confirmed")};const qn=()=>sel().some(i=>i.quote)?'<p class="note">The final price for any item marked "Quote After Order Confirmation" will be confirmed directly by VIP after your booking has been received.</p>':"";
const lines=()=>sel().map(i=>`<div class="row"><span>${i.qty} × ${esc(i.name)}</span><span>${i.pricePence?(F?"From ":"")+gbp(i.pricePence*i.qty):i.quote?QT:"Price TBC"}</span></div>`).join("");
function draw(){$("#lines").innerHTML=(lines()||'<p class="muted">No services selected yet.</p>')+qn();$("#total").textContent=tot();$("#rev").disabled=!sel().length}
fetch("/api/catalog").then(r=>r.json()).then(d=>{CAT=d.items;F=!!d.pricesAreFrom;$("#est").hidden=false;
 $("#items").innerHTML=CAT.map(i=>`<div class="item"><div><strong>${esc(i.name)}</strong><small>${i.pricePence?(F?"From ":"")+gbp(i.pricePence):i.quote?QT:"Price to be confirmed"}</small></div><div class="qty"><button type="button" data-d="-1" data-id="${i.id}" aria-label="Decrease ${esc(i.name)}">−</button><input id="q-${i.id}" value="0" inputmode="numeric" aria-label="Quantity of ${esc(i.name)}"><button type="button" data-d="1" data-id="${i.id}" aria-label="Increase ${esc(i.name)}">+</button></div></div>`).join("");
 $("#items").onclick=e=>{const b=e.target.closest("button");if(!b)return;const id=b.dataset.id,q=Math.max(0,Math.min(50,(Q[id]||0)+ +b.dataset.d));Q[id]=q;$("#q-"+id).value=q;draw()};
 $("#items").oninput=e=>{const id=e.target.id.slice(2);Q[id]=Math.max(0,Math.min(50,parseInt(e.target.value)||0));draw()}}).catch(()=>{$("#items").textContent="Sorry, services couldn't be loaded. Please contact us to book."});
const v=id=>$("#"+id).value.trim(),fld=()=>({name:v("name"),email:v("email"),phone:v("phone"),method:$("#method").value,address:v("addr"),notes:v("notes")});
$("#bf").onsubmit=e=>{e.preventDefault();if($("#s3").hidden===false)return;const er=$("#err");er.classList.remove("on");
 const bad=!sel().length?"items":!v("name")?"name":!/^\S+@\S+\.\S+$/.test(v("email"))?"email":v("phone").replace(/\D/g,"").length<10?"phone":($("#method").value==="request"&&!v("addr"))?"addr":!$("#consent").checked?"consent":"";
 if(bad){er.textContent={items:"Please choose at least one service.",name:"Please enter your name.",email:"Please enter a valid email address.",phone:"Please enter a phone number we can reach you on.",addr:"Please enter the collection / delivery address.",consent:"Please confirm you've read our policies."}[bad];er.classList.add("on");($("#"+bad)||$("#items")).focus();return}
 const f=fld();$("#rv").innerHTML=qn()+lines()+`<div class="row"><strong>Estimated total</strong><strong>${esc(tot())}</strong></div><p><strong>${esc(f.name)}</strong><br>${esc(f.email)} · ${esc(f.phone)}<br>${f.method==="request"?"Collection / delivery requested:<br>"+esc(f.address).replace(/\n/g,"<br>"):"Drop off and collect in the shop"}${f.notes?"<br><em>"+esc(f.notes)+"</em>":""}</p>`;
 $("#s1").hidden=true;$("#s3").hidden=false;scrollTo(0,0);$("#go").focus()};
$("#back").onclick=()=>{$("#s3").hidden=true;$("#s1").hidden=false};
$("#go").onclick=async()=>{const b=$("#go"),er=$("#err2");er.classList.remove("on");b.disabled=true;b.textContent="Submitting…";
 try{const r=await fetch("/api/book",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...fld(),items:sel().map(i=>({id:i.id,qty:i.qty})),consent:$("#consent").checked,website:v("website"),key:KEY,elapsed:Date.now()-T0})});
  const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||"Something went wrong.");
  sessionStorage.setItem("vipOrder",JSON.stringify({ref:d.ref,lines:sel().map(i=>({n:i.name,q:i.qty,p:i.pricePence?i.pricePence*i.qty:null,k:i.quote?1:0})),total:tot(),f:F?1:0,quote:sel().some(i=>i.quote)}));
  location.href="/booking-confirmed?ref="+encodeURIComponent(d.ref)}
 catch(x){er.textContent=(x.message||"Something went wrong.")+" Your booking has not been submitted. You can safely try again.";er.classList.add("on");b.disabled=false;b.textContent="Confirm booking"}};
</script>""")
page('/booking-confirmed','Booking received | VIP Surbiton Tailoring & Dry Cleaning','Your booking request has been received by VIP Surbiton Tailoring & Dry Cleaning.','''<section class="light top"><div class="wrap prose"><span class="eyebrow">Booking received</span><h1>Thank you for choosing VIP Surbiton Tailoring &amp; Dry Cleaning</h1>
<p><strong>Your booking request has been successfully received.</strong> Nash and the VIP team will review your order and contact you directly, within 24 hours, to confirm the details, the final price, arrange payment and organise collection/delivery where applicable.</p>
<p><strong>No payment has been taken through the website.</strong> VIP will contact you directly about payment and any collection or delivery arrangements.</p>
<div class="sum" style="position:static"><p>Order reference: <strong id="ref">shown in your confirmation email</strong></p><div id="ord"></div></div>
<p class="muted">A confirmation email is sent to the address you gave; please check your spam folder if you can't see it.</p>
<p><a class="btn btn-em" href="/">Return to homepage</a> <a class="btn btn-line" href="/#contact">Contact VIP</a></p></div></section>''',noindex=True,extra=r"""<script>(function(){var q=new URLSearchParams(location.search).get("ref");if(!q||!/^VIP-[A-F0-9]{8}$/.test(q))return;document.getElementById("ref").textContent=q;try{var o=JSON.parse(sessionStorage.getItem("vipOrder")||"null");if(!o||o.ref!==q)return;var e=function(t){return String(t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};document.getElementById("ord").innerHTML=o.lines.map(function(l){return'<div class="row"><span>'+l.q+" × "+e(l.n)+"</span><span>"+(l.p?(o.f?"From ":"")+"£"+(l.p/100).toFixed(2):l.k?"Quote After Order Confirmation":"Price TBC")+"</span></div>"}).join("")+'<div class="row"><strong>Estimated total</strong><strong>'+e(o.total)+"</strong></div>"+(o.quote?'<p class="note">The final price for any item marked "Quote After Order Confirmation" will be confirmed directly by VIP after your booking has been received.</p>':"")}catch(x){}})();</script>""")
page('/404','Page not found | VIP Surbiton Tailoring & Dry Cleaning','The page you were looking for could not be found.','<section class="light top"><div class="wrap prose"><span class="eyebrow">404</span><h1>We couldn\'t find that page</h1><p>It may have moved. Try our <a href="/#services">services</a>, <a href="/#prices">prices</a> or <a href="/book">book online</a>.</p><p><a class="btn btn-em" href="/">Back to home</a></p></div></section>',noindex=True)
