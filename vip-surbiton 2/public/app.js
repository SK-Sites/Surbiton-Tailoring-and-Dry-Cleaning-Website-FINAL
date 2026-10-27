
/* ===== EDIT CONTENT HERE ===== */
const SITE={phone:"07728 918003",email:"nagim.ariaa@gmail.com"};
/* IMAGES: drop files in /images and set the path. Empty = labelled placeholder. No other change needed. */
const IMG={hero:"",story:"/images/story-nash-at-counter.webp",nash:"/images/nash-portrait.webp",shop:"/images/vip-surbiton-shopfront.webp",
 cards:{suit:"/images/card-tailoring.webp",press:"/images/card-dry-cleaning.webp",dress:"/images/card-bridal.webp"},
 gallery:[["/images/gallery-sewing-desks.webp","Nash and a colleague at the sewing machines behind the counter"],["/images/gallery-pressing-and-thread.webp","The steam press and a shelf of thread spools"],["/images/gallery-hem-fitting.webp","Nash pinning the hem of a wedding dress during a fitting"],["/images/gallery-bridal-fitting.webp","Nash fitting a wedding dress in the fitting room"],["/images/gallery-cutting-fabric.webp","Nash measuring and marking a garment on the cutting table"],["/images/gallery-shop-interior.webp","The shop interior, with the counter and racks of clothes"],["/images/gallery-seamstress.webp","A member of the team sewing beside the wall of thread"],["/images/gallery-thread-wall.webp","The wall of coloured thread spools"],["/images/gallery-garment-collection.webp","A customer collecting a cleaned garment at the shop door with Nash"],["/images/gallery-customer-consultation.webp","Nash talking through an order with a customer at the counter"],["/images/gallery-customer-at-counter.webp","A customer at the counter with Nash"],["/images/gallery-fitting-room.webp","Nash fitting a wedding dress in the fitting room"]]};
/* REVIEWS: add the verbatim text in `quote` (and `stars` once confirmed). Highlights are from the supplied summaries. t: w=weddings u=urgent e=everyday & cleaning */
const REVIEWS=[
{n:"Jess Morris",t:"wu",f:1,h:"A highly personalised service from start to finish",p:["Reshaped a sample wedding dress","Recreated sleeves from photographs","Repaired the veil and dry-cleaned the garments","Tailored the groom's suit at short notice"]},
{n:"Grace Thomson",t:"w",h:"A 50-year-old wedding dress, wearable again",p:["Altered and cleaned so it could be worn again","Sentimental significance preserved"]},
{n:"Kerry Davenport-Smith",t:"wu",h:"Wedding dress and wedding suit, tailored",p:["Fiancé's suit completed within a week","Mother's veil repaired at short notice","Friendly and professional"]},
{n:"Jennifer Victor-Smith",t:"w",h:"“Like a glove”",p:["Wedding dress bought online didn't fit","Altered to fit; compliments on the day","Would recommend for future tailoring"]},
{n:"Caitlin Joseph",t:"wu",h:"Major alterations to a tight six-week deadline",p:["Bodice restructured","Intricate detailing preserved","Multiple appointments and reassurance throughout"]},
{n:"Megan Blake",t:"w",h:"Patient and reassuring through significant remodelling",p:["Two wedding dresses considered","Final result matched her wishes"]},
{n:"Amy Cuthbert",t:"w",h:"Five bridesmaid dresses, all altered",p:["Different colours and styles","Confidence and fit for the wedding day"]},
{n:"Alejandro B.B.",t:"u",h:"Suit altered in under 24 hours",p:["Online suit purchase didn't fit","Needed for a work event in Cannes","Extremely impressed with the result"]},
{n:"Mark Haycroft",t:"e",h:"Not only weddings",p:["Hockey shirts altered in under a week","Linen trousers treated after bike-oil staining"]},
{n:"Philippa & Ben Schumann-Nixon",t:"e",h:"Everything perfect before collection",p:["Smart dresses, suits and casual clothing altered","Nash accommodating and helpful"]},
{n:"Alessandro Barone",t:"e",h:"A suit that fits",p:["Attention to detail","Professional tailoring"]}];
/* ============================= */
const $=s=>document.querySelector(s),rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
const real=v=>!/^\[/.test(v);$("#yr").textContent=new Date().getFullYear();
const A={suit:`<path d="M200 74V56a12 12 0 1 1 12 12M200 74 78 138l22 24 14 262h172l14-262 22-24Z"/><path d="M200 74l-38 118 38 86 38-86Z"/><circle cx="200" cy="330" r="4"/><circle cx="200" cy="370" r="4"/><path d="M128 400h144" stroke-dasharray="5 6"/>`,
dress:`<path d="M172 70q28-18 56 0l-8 130q74 70 104 250H76q30-180 104-250Z"/><path d="M184 200h32M150 330q50 26 100 0M200 450v32M164 482h72"/>`,
thread:`<path d="M150 190h100v10H150zM156 200h88v130h-88zM150 330h100v10H150z"/><path d="M160 230h80M160 260h80M160 290h80" stroke-opacity=".5"/><path d="M244 270c90-10 100 130-20 150S70 380 120 350M318 90 120 470"/><circle cx="318" cy="96" r="5"/>`,
fabric:`<path d="M0 120q100-60 200 0t200 0M0 190q100-60 200 0t200 0M0 260q100-60 200 0t200 0M0 330q100-60 200 0t200 0M0 400q100-60 200 0t200 0"/><path d="M40 450h320" stroke-dasharray="6 7"/>`,
press:`<path d="M80 340h230q30 0 20-40l-40-90H190q-70 0-110 130ZM120 340v20h200v-20M240 210v-34"/><path d="M130 130c-20 20 20 30 0 50s20 30 0 50M190 100c-20 20 20 30 0 50" stroke-opacity=".6"/>`,
rail:`<path d="M20 100h360M110 100l-52 36 22 24 14-12v250h32V148l14 12 22-24ZM300 100l-52 36 22 24 14-12v250h32V148l14 12 22-24Z"/>`};
const art=k=>"data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b2e31"/><stop offset="1" stop-color="#0b0c0d"/></linearGradient><pattern id="w" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0L6 6M6 0L0 6" stroke="#fff" stroke-opacity=".05"/></pattern></defs><rect width="400" height="500" fill="url(#g)"/><rect width="400" height="500" fill="url(#w)"/><g fill="none" stroke="#2fc79a" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${A[k]}</g></svg>`);
/* Mock images are generated art. Set a real path in IMG to replace one; the "Mock image" tag disappears automatically. */
const ph=(src,label,cls="",k="fabric")=>`<div class="ph ${cls}"><img src="${src||art(k)}" alt="${src?label:""}" loading="lazy">${src?"":'<em class="mock">Mock image</em>'}</div>`;
$("#img-story").innerHTML=ph(IMG.story,"Nash at the counter of VIP Surbiton Tailoring & Dry Cleaning, with racks of finished clothes behind him","rvimg","thread");
$("#img-nash").innerHTML=ph(IMG.nash,"Nash Aria, founder and master tailor, in a black dinner suit","rvimg","suit");
$("#img-shop").innerHTML=ph(IMG.shop,"The VIP Surbiton Tailoring & Dry Cleaning shopfront at 35 Victoria Road, Surbiton","rvimg banner","fabric");
document.querySelectorAll(".cimg").forEach(e=>e.style.backgroundImage=`url("${IMG.cards[e.dataset.k]||art(e.dataset.k)}")`);
$("#mq").innerHTML+=$("#mq").innerHTML;
const GK=["suit","dress","thread","press","fabric","rail"];
$("#gal").innerHTML=IMG.gallery.map((g,i)=>ph(g[0],g[1],"rv",GK[i%6])).join("");
fetch("/api/catalog").then(r=>r.json()).then(d=>{const g={};d.items.forEach(x=>(g[x.group]=g[x.group]||[]).push(x));$("#pg").innerHTML=Object.entries(g).map(([k,v])=>`<div class="rv in"><h3>${k}</h3>${v.map(x=>`<div class="row"><span>${x.name}</span><span>${x.pricePence?(d.pricesAreFrom?"From ":"")+"£"+(x.pricePence/100).toFixed(2):x.quote?"Quote After Order Confirmation":"Price to be confirmed"}</span></div>`).join("")}</div>`).join("")}).catch(()=>{$("#pg").innerHTML="<p>Please contact us for prices.</p>"});
const tel=real(SITE.phone)?"tel:"+SITE.phone.replace(/[^\d+]/g,"").replace(/^0/,"+44"):"#contact";
$("#ph").href=$("#ph2").href=tel;$("#ph").textContent=SITE.phone;
$("#em").href=real(SITE.email)?"mailto:"+SITE.email:"#contact";$("#em").textContent=SITE.email;
/* nav */
const hd=$("#hd"),nav=$("#nav"),bg=$("#bg"),hbg=$("#hbg");
const tog=o=>{nav.classList.toggle("open",o);bg.setAttribute("aria-expanded",o);document.body.style.overflow=o?"hidden":""};
bg.onclick=()=>tog(!nav.classList.contains("open"));nav.querySelectorAll("a").forEach(a=>a.onclick=()=>tog(false));
addEventListener("keydown",e=>{if(e.key==="Escape")tog(false)});
const links=[...nav.querySelectorAll("a")];
addEventListener("scroll",()=>{hd.classList.toggle("solid",scrollY>40);if(!rm&&scrollY<innerHeight)hbg.style.transform=`translateY(${scrollY*.25}px)`;
 let cur="#top";document.querySelectorAll("main section[id]").forEach(s=>{if(s.getBoundingClientRect().top<200)cur="#"+s.id});links.forEach(a=>a.classList.toggle("on",a.getAttribute("href")===cur))},{passive:true});
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){const t=x.target;t.classList.add("in");t.querySelectorAll(".rvimg").forEach(m=>m.classList.add("in"));io.unobserve(t)}}),{threshold:.15});
const watch=()=>document.querySelectorAll(".rv:not(.in),.rvimg:not(.in)").forEach((el,i)=>{el.style.transitionDelay=(i%4)*70+"ms";io.observe(el.classList.contains("rvimg")?el.parentElement:el)});watch();
/* review carousel with filters */
const F=[["all","All stories"],["w","Weddings"],["u","Urgent work"],["e","Everyday & dry cleaning"]];
let hold=false,flt="all",list=[],ci=0,timer,t0=0,paused=false;const DUR=7000;
$("#chips").innerHTML=F.map(f=>`<button aria-pressed="${f[0]=="all"}" data-f="${f[0]}">${f[1]}</button>`).join("");
const render=()=>{list=REVIEWS.filter(r=>flt=="all"||r.t.includes(flt));ci=0;
 $("#stage").innerHTML=list.map((r,i)=>`<article class="slide${i?"":" on"}"><div>${r.f?'<span class="feat">Featured</span>':""}${r.stars?`<div class="stars" aria-label="${r.stars} out of 5">${"★".repeat(r.stars)}</div>`:""}</div><h3>${r.h}</h3><ul>${r.p.map(x=>`<li>${x}</li>`).join("")}</ul>${r.quote?`<p class="quote">“${r.quote}”</p>`:""}<span class="nm">${r.n}</span></article>`).join("");show(0)};
const show=n=>{const s=[...document.querySelectorAll(".slide")];s[ci]&&s[ci].classList.remove("on");ci=(n+s.length)%s.length;s[ci].classList.add("on");$("#ct").textContent=`${ci+1} / ${s.length}`;t0=performance.now()};
$("#chips").onclick=e=>{const b=e.target.closest("button");if(!b)return;flt=b.dataset.f;document.querySelectorAll("#chips button").forEach(x=>x.setAttribute("aria-pressed",x===b));render()};
$("#pv").onclick=()=>show(ci-1);$("#nx").onclick=()=>show(ci+1);
const stg=$("#stage");["mouseenter","focusin"].forEach(v=>stg.addEventListener(v,()=>paused=true));["mouseleave","focusout"].forEach(v=>stg.addEventListener(v,()=>{paused=false;t0=performance.now()}));
if(!rm)(function tick(now){if(!paused&&!hold){const p=(now-t0)/DUR;$("#pb").style.width=Math.min(p,1)*100+"%";if(p>=1)show(ci+1)}requestAnimationFrame(tick)})(performance.now());
render();
$("#pp").onclick=e=>{hold=!hold;t0=performance.now();e.currentTarget.textContent=hold?"▶":"❚❚";e.currentTarget.setAttribute("aria-label",hold?"Play auto-play":"Pause auto-play")};
document.addEventListener("click",e=>{if(e.target.closest("[data-order]")){e.preventDefault();location.href="/book"}});
