import {DECK} from '../../src/deck.mjs';
import {RitualWorld} from '../../src/ritual-world/RitualWorld.mjs';
import {CanvasOrbit} from '../../src/ritual-world/CanvasOrbit.mjs';
import {createVisualSeed} from '../../src/ritual-world/OrbitalField.mjs';

const page=document.getElementById('gate-a'),root=document.getElementById('world-root'),status=document.getElementById('orbit-status');
const hueChoices=[0,27,68,124,207,278];
const rng=globalThis.crypto?.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]:Math.floor(Math.random()*0xffffffff);
const visualSeed=createVisualSeed();const hue=hueChoices[rng%hueChoices.length];document.getElementById('space-background').style.setProperty('--hue',hue+'deg');
function paintSpace(){
 const canvas=document.getElementById('star-canvas'),rect=canvas.getBoundingClientRect(),ratio=Math.min(1.25,devicePixelRatio||1);
 const w=canvas.width=Math.ceil(rect.width*ratio),h=canvas.height=Math.ceil(rect.height*ratio),ctx=canvas.getContext('2d');
 if(!ctx)return;ctx.fillStyle='#02040a';ctx.fillRect(0,0,w,h);
 const glow=(x,y,rad,color)=>{const g=ctx.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-rad,y-rad,rad*2,rad*2)};
 glow(w*.65,h*.21,w*.52,'rgba(63,72,117,.2)');glow(w*.17,h*.65,w*.29,'rgba(52,75,111,.09)');glow(w*.81,h*.56,w*.35,'rgba(99,66,104,.12)');
 ctx.save();ctx.globalCompositeOperation='screen';ctx.filter=`blur(${Math.max(10,w*.026)}px)`;
 for(let i=0;i<36;i++){const t=i/35,x=w*(.26+t*.66),y=h*(.04+t*.69)+Math.sin(t*7)*h*.1;
  glow(x,y,h*(.14+.07*Math.sin(i)),i%3===0?'rgba(134,113,165,.04)':'rgba(111,141,169,.027)')}
 ctx.restore();
 let seed=147269;const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<940;i++){
  const x=next()*w,y=next()*h,bright=next(),r=bright>.975?1.35:.22+bright*.58;
  ctx.fillStyle=bright>.8?'rgba(230,214,205,.66)':'rgba(159,183,212,.31)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 }
}
paintSpace();window.addEventListener('resize',paintSpace,{passive:true});
const localFiles=id=>new URL(`../../assets/rws/${id}.jpg`,import.meta.url).href;
let world=null;
try{
 world=new RitualWorld({mount:root,cards:DECK,faceAssetForId:localFiles,visualSeed,onStatus:evt=>{
  if(evt.state==='context-lost'){status.textContent='GRAPHICS CONTEXT LOST';return}
  if(Number.isInteger(evt.loaded))status.textContent=evt.loaded===78?'ORBIT ACTIVE · 78 FACES LOADED':`ORBIT ACTIVE · LOADING RWS ART ${evt.loaded}/78`;
  if(evt.failed)status.textContent='ILLUSTRATION ERROR — VERIFY RWS ASSETS';
 }});
 document.getElementById('card-counter').textContent=`${world.cards.length} CARD ENTITIES`;
 }catch(error){
 console.warn('Gate A WebGL unavailable; using perspective-preserving Canvas2D fallback:',error.message);
 try{world=new CanvasOrbit({mount:root,cards:DECK,faceAssetForId:localFiles,visualSeed,onStatus:evt=>{status.textContent=evt.loaded===78?'ORBIT ACTIVE · 78 FACES LOADED':`ORBIT ACTIVE · ILLUSTRATIONS ${evt.loaded||0}/78`}});status.textContent='ORBIT ACTIVE · 2D FALLBACK';}
 catch(inner){status.textContent='RENDERER UNAVAILABLE';console.error(inner)}
}
// The user's comparison videos supplied CTA-on and CTA-off views.
 // This control toggles ONLY the overlay; the 3D world/camera are never recreated.
const hideButton=document.getElementById('hide-cta');
function toggleCta(force){
 const hide=typeof force==='boolean'?force:!page.classList.contains('review-no-cta');
 if(hide&&document.activeElement?.closest?.('.question-panel'))document.activeElement.blur();
 page.classList.toggle('review-no-cta',hide);
 hideButton.setAttribute('aria-pressed',String(hide));
 hideButton.innerHTML=hide?'SHOW CTA <span>H</span>':'HIDE CTA <span>H</span>';
}
hideButton.addEventListener('click',()=>toggleCta());
window.addEventListener('keydown',event=>{
 if(event.key.toLowerCase()==='h'&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){toggleCta();event.preventDefault();}
});
const paused=document.getElementById('pause');paused.addEventListener('click',()=>{if(!world)return;const state=!(world.pause??world.paused);world.setPaused(state);paused.innerHTML=state?'RESUME ORBIT <span>▶</span>':'PAUSE ORBIT <span>Ⅱ</span>';status.textContent=state?'ORBIT PAUSED':'ORBIT ACTIVE'});
document.getElementById('divine').addEventListener('click',()=>{
 const question=document.getElementById('question');if(question.value.trim().length<3){question.focus();return}
 document.getElementById('demo-notice').textContent='Gate A review: landing universe only. Shuffle begins after visual approval.';
});
window.__ritualGateA={world,diagnostics:()=>world?.getDiagnostics(),hue,visualSeed,phase:'landing'};
window.addEventListener('pagehide',()=>world?.dispose(),{once:true});
