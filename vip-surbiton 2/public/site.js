(function(){var h=document.getElementById("hd"),n=document.getElementById("nav"),b=document.getElementById("bg");
function t(o){n.classList.toggle("open",o);b.setAttribute("aria-expanded",o);document.body.style.overflow=o?"hidden":""}
b.onclick=function(){t(!n.classList.contains("open"))};addEventListener("keydown",function(e){if(e.key==="Escape")t(false)});
n.querySelectorAll("a").forEach(function(a){a.onclick=function(){t(false)}});
function s(){h.classList.toggle("solid",scrollY>40)}addEventListener("scroll",s,{passive:true});s();
document.addEventListener("click",function(e){if(e.target.closest("[data-order]")){e.preventDefault();location.href="/book"}});
var y=document.getElementById("yr");if(y)y.textContent=new Date().getFullYear();})();
