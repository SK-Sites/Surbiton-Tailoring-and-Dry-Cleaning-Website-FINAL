
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
