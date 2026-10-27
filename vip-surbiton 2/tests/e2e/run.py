"""End-to-end check. Start the server first:  node tests/e2e/server.mjs   then:  python3 tests/e2e/run.py"""
import json, urllib.request, sys
from playwright.sync_api import sync_playwright
B='http://localhost:8787'; fails=[]
def ok(c,msg):
    print(('PASS ' if c else 'FAIL ')+msg); 
    if not c: fails.append(msg)
def get(p,h=None):
    r=urllib.request.Request(B+p,headers=h or {}); 
    try: x=urllib.request.urlopen(r); return x.status,dict(x.headers),x.read().decode()
    except urllib.error.HTTPError as e: return e.code,dict(e.headers),e.read().decode()
# headers
s,h,_=get('/'); ok('Content-Security-Policy' in h and "script-src 'self'" in h['Content-Security-Policy'],'CSP header on pages')
ok(h.get('X-Frame-Options')=='DENY' and 'Strict-Transport-Security' in h,'frame + HSTS headers')
s,h,_=get('/api/catalog'); ok(s==200 and h.get('cache-control')=='no-store','API no-store')
s,_,_=get('/nonexistent-page'); ok(s==404,'unknown URL returns the 404 page')
s,_,t=get('/sitemap.xml'); ok(s==200 and '<urlset' in t,'sitemap.xml served'); s,_,t=get('/robots.txt'); ok('Disallow: /api/' in t,'robots.txt blocks /api/')
s,_,t=get('/.well-known/security.txt'); ok(s==200,'security.txt served')
s,_,_=get('/api/orders'); ok(s==401,'/api/orders refuses requests without the admin token')
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,vp,kw in (('desktop',{'width':1366,'height':800},{}),('phone',{'width':390,'height':844},{'has_touch':True,'is_mobile':True})):
        ctx=b.new_context(viewport=vp,**kw); pg=ctx.new_page(); viol=[]; errs=[]
        pg.add_init_script("window.__v=[];document.addEventListener('securitypolicyviolation',e=>window.__v.push(e.violatedDirective+' '+e.blockedURI));")
        pg.on('pageerror',lambda e: errs.append(str(e)))
        for path in ['/','/book','/privacy','/cookies','/terms','/refunds','/booking-confirmed?ref=VIP-ABCDEF12','/nonexistent']:
            pg.goto(B+path); pg.wait_for_timeout(500)
            for y in range(0,9000,800): pg.evaluate("y=>scrollTo(0,y)",y); pg.wait_for_timeout(40)
            pg.wait_for_timeout(600)
            v=[x for x in pg.evaluate('window.__v') if 'fonts.g' not in x]; viol+=v
            broken=pg.evaluate("[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src.slice(-40))")
            noalt=pg.evaluate("[...document.images].filter(i=>!i.hasAttribute('alt')).length")
            h1=pg.evaluate("document.querySelectorAll('h1').length")
            ok(not v and not broken and noalt==0 and h1==1 and not errs,f'{name} {path.split("?")[0]}: no CSP violations, images load, alt on all, one h1')
            if broken or v or errs: print('   ',broken,v,errs)
        # homepage details
        pg.goto(B+'/'); pg.wait_for_timeout(800)
        for y in range(0,9000,700): pg.evaluate("y=>scrollTo(0,y)",y); pg.wait_for_timeout(40)
        pg.wait_for_timeout(1200)
        n=pg.evaluate("[...document.images].length"); bg=pg.evaluate("[...document.querySelectorAll('.cimg')].map(e=>getComputedStyle(e).backgroundImage.includes('/images/card-'))")
        ok(n>=18 and len(bg)==3 and all(bg),f'{name} home: {n} photos in the page, service cards use real photos {bg}')
        ok(pg.evaluate("document.documentElement.scrollWidth-innerWidth")<=0,f'{name} home: no sideways scrolling')
        txt=pg.evaluate("document.body.innerText"); ok('12424328' in txt and 'Open 7 days a week, 8am to 6pm' in txt and 'Surbiton station' in txt,f'{name} home: company number, hours, station present')
        ok('[INSERT' not in txt and '[CONFIRM' not in txt and 'Mock image' not in txt,f'{name} home: no placeholders or mock tags left')
        # booking through the real UI -> real functions
        pg.goto(B+'/book'); pg.wait_for_selector('#items button')
        for _ in range(2): pg.click('[data-id="coat"][data-d="1"]')
        pg.click('[data-id="wedding-dress"][data-d="1"]')
        ok('From £36.90' in pg.inner_text('#total') and 'to be quoted' in pg.inner_text('#total'),f'{name} booking: total reads "From £36.90 + item(s) to be quoted"')
        pg.fill('#name','Jess Test'); pg.fill('#email','jess@example.test'); pg.fill('#phone','07700 900123'); pg.check('#consent')
        pg.click('#rev'); pg.wait_for_selector('#s3:not([hidden])'); pg.wait_for_timeout(2700); pg.click('#go')
        pg.wait_for_url('**/booking-confirmed**',timeout=8000); pg.wait_for_timeout(600)
        ref=pg.inner_text('#ref'); body=pg.inner_text('#ord')
        ok(ref.startswith('VIP-') and 'Quote After Order Confirmation' in body and 'From £36.90' in body and 'ref=' in pg.url and '@' not in pg.url,f'{name} booking: confirmation page shows {ref}, quote wording, and no personal data in the URL')
        ctx.close()
    b.close()
sent=json.loads(get('/__sent')[2]); emails=[x for x in sent if x['kind']=='email']; sms=[x for x in sent if x['kind']=='sms']
ok(len(emails)==4 and len(sms)==2,f'2 bookings produced 4 emails (owner + customer each) and 2 texts (got {len(emails)} and {len(sms)})')
own=[e for e in emails if e['to']==['nagim.ariaa@gmail.com']][0]
ok('NEW VIP WEBSITE BOOKING' in own['text'] and 'Jess Test' in own['text'] and '07700 900123' in own['text'] and 'Estimated total: from £36.90 + item(s) to be quoted' in own['text'],"Nash's email has reference, customer, phone, services and estimated total")
ok(all('jess@example.test' not in s['Body'] and '07700' not in s['Body'] for s in sms) and 'Estimated total from £36.90' in sms[0]['Body'] and sms[0]['To']=='+447728918003' and sms[0]['From']=='VIPSurbiton',f"text to Nash is short and carries no email/phone: {sms[0]['Body']}")
cust=[e for e in emails if e['to']==['jess@example.test']][0]
ok('No payment has been taken online' in cust['text'] and 'within 24 hours' in cust['text'] and '<script' not in cust['html'],'customer confirmation email says no payment taken, 24-hour reply, no scripts')
st,_,t=get('/api/orders',{'Authorization':'Bearer '+'x'*40}); orders=json.loads(t)
ok(st==200 and len(orders)==2 and orders[0]['notify']['sms']=='sent' and orders[0]['notify']['ownerEmail']=='sent','private order list shows 2 saved orders with notification status')
st,_,_=get('/api/orders',{'Authorization':'Bearer wrong'}); ok(st==401,'wrong admin token is rejected')
print('\nRESULT:', 'ALL PASSED' if not fails else f'{len(fails)} FAILED'); sys.exit(1 if fails else 0)
