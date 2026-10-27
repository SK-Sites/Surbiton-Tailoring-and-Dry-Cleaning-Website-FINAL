#!/usr/bin/env python3
"""Builds a single-file interactive preview (booking is simulated). Run from the project root: python3 scripts/build-preview.py"""
import re, json, os, base64, subprocess
P = 'public/'
cat = subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./api/_catalog.js')))"]).decode()
idx = open(P + 'index.html').read()
idx = idx.replace('<link rel="stylesheet" href="/styles.css">', '<style>' + open(P + 'styles.css').read() + '</style>')
idx = idx.replace('<script src="/app.js" defer></script>', '<script>' + open(P + 'app.js').read() + '</script>')
import io
from PIL import Image
LIGHT = os.environ.get('LIGHT', '1') == '1'   # LIGHT=1 (default): smaller photos so the preview file stays under 1 MB
def small(f):
    im = Image.open(P + 'images/' + f).convert('RGB')
    w = 420 if f.startswith('hero') else 800 if f.startswith('vip-surbiton-shopfront') else 480 if f.startswith(('nash', 'story')) else 640 if f.startswith(('card-', 'gallery-shop-interior')) else 420
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=56, method=6); return buf.getvalue()
for f in os.listdir(P + 'images'):
    if f.endswith('.webp'):
        data = small(f) if LIGHT else open(P + 'images/' + f, 'rb').read()
        idx = idx.replace('/images/' + f, 'data:image/webp;base64,' + base64.b64encode(data).decode())
idx = idx.replace('location.href="/book"', 'go("/book")')
pages = {}
for n in ['book', 'booking-confirmed', 'privacy', 'cookies', 'terms', 'refunds', '404']:
    s = open(P + n + '.html').read()
    main = re.search(r'<main id="main">(.*?)</main>', s, re.S).group(1)
    js = open(P + n + '.js').read() if os.path.exists(P + n + '.js') else ''
    js = js.replace('location.href="/booking-confirmed?ref="+encodeURIComponent(d.ref)', 'go("/booking-confirmed?ref="+encodeURIComponent(d.ref))')
    js = js.replace('new URLSearchParams(location.search)', 'new URLSearchParams(window.__q)')
    pages['/' + n] = {'main': main, 'js': js}
shim = '''<script>
/* PREVIEW ONLY: simulates the /api endpoints. No email, SMS or storage happens here. */
(function(){const CAT=%s,rf=window.fetch.bind(window);
window.fetch=function(u,o){u=String(u);
 if(u.indexOf("/api/catalog")===0)return Promise.resolve(new Response(JSON.stringify(CAT),{status:200}));
 if(u.indexOf("/api/book")===0){const ref="VIP-"+Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();
  return new Promise(r=>setTimeout(()=>r(new Response(JSON.stringify({ok:true,ref:ref}),{status:200})),900))}
 return rf(u,o)}})();
</script>''' % cat
router = '''<main id="sub" hidden></main>
<div style="position:fixed;left:10px;bottom:70px;z-index:70;background:#fff;color:#111;font:600 11px/1.3 Inter,sans-serif;padding:6px 10px;border-left:3px solid #0b6e51;max-width:230px">PREVIEW: bookings are simulated. No email or text is sent.</div>
<script>
(function(){const PAGES=%s,main=document.getElementById("main"),sub=document.getElementById("sub");let cur="/";
window.go=function(path,hash){const p=path.split("?")[0],q=path.split("?")[1];window.__q=q?"?"+q:"";cur=p;
 if(p==="/"){sub.hidden=true;main.hidden=false;sub.innerHTML="";if(hash){const t=document.querySelector(hash);if(t)t.scrollIntoView();}else scrollTo(0,0);return}
 const pg=PAGES[p]||PAGES["/404"];main.hidden=true;sub.hidden=false;sub.innerHTML=pg.main;scrollTo(0,0);
 if(pg.js){const s=document.createElement("script");s.textContent="(function(){"+pg.js+"})()";document.body.appendChild(s);s.remove()}};
document.addEventListener("click",function(e){const a=e.target.closest("a[href]");if(!a)return;const h=a.getAttribute("href");
 if(/^(https?:|mailto:|tel:)/.test(h))return;
 if(h==="#"){e.preventDefault();return}
 if(h.charAt(0)==="#"){if(cur!=="/"){e.preventDefault();go("/",h)}return}
 if(h.charAt(0)==="/"){e.preventDefault();const i=h.indexOf("#");go(i<0?h:h.slice(0,i)||"/",i<0?"":h.slice(i))}},true);})();
</script>''' % json.dumps(pages)
idx = idx.replace('<body>', '<body>' + shim, 1).replace('</main>', '</main>' + router, 1)
os.makedirs('../vip-surbiton-preview', exist_ok=True)
open('../vip-surbiton-preview/index.html', 'w').write(idx)
print('preview built', len(idx) // 1024, 'KB')
