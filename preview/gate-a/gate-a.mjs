import {DECK} from '../../src/deck.mjs';
import {RitualWorld} from '../../src/ritual-world/RitualWorld.mjs';
import {CanvasOrbit} from '../../src/ritual-world/CanvasOrbit.mjs';
import {createVisualSeed} from '../../src/ritual-world/OrbitalField.mjs';

const page=document.getElementById('gate-a'),root=document.getElementById('world-root'),status=document.getElementById('orbit-status');
const visualSeed=createVisualSeed();
// Deterministic for the lifetime of one visit; different on each refresh.
// Query override supports comparable recordings of both entry rituals.
const requestedEntrance=new URLSearchParams(location.search).get('entrance');
let entranceMode=['inside-out','outside-in'].includes(requestedEntrance)?requestedEntrance:(visualSeed%2?'inside-out':'outside-in');
const hues=[0,25,75,142,200,270],hue=hues[(visualSeed>>>2)%hues.length];
const background=document.getElementById('space-background');
background.style.setProperty('--hue',hue+'deg');
const starSeed=visualSeed^0xd7a960c3;
function randomGenerator(seed){let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296};}
function paintSpace(){
 const canvas=document.getElementById('star-canvas'),rect=canvas.getBoundingClientRect(),ratio=Math.min(1.25,window.devicePixelRatio||1);
 const w=canvas.width=Math.max(2,Math.ceil(rect.width*ratio)),h=canvas.height=Math.max(2,Math.ceil(rect.height*ratio)),ctx=canvas.getContext('2d');
 if(!ctx)return;
 ctx.fillStyle='#020309';ctx.fillRect(0,0,w,h);
 const random=randomGenerator(starSeed);
 const glow=(x,y,rad,color)=>{const g=ctx.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-rad,y-rad,rad*2,rad*2)};
 const palettes=[
  ['rgba(94,82,136,.19)','rgba(120,104,164,.13)','rgba(93,112,167,.12)'],
  ['rgba(90,115,152,.18)','rgba(102,133,182,.12)','rgba(142,101,163,.09)'],
  ['rgba(113,83,125,.16)','rgba(160,107,151,.12)','rgba(107,127,167,.10)'],
  ['rgba(107,119,115,.16)','rgba(111,141,142,.10)','rgba(116,94,151,.10)']
 ],palette=palettes[(visualSeed>>>5)%palettes.length];
 // Low-cost, original static cloud/glow gradients; only CSS layers drift.
 glow(w*(.31+random()*.20),h*(.25+random()*.18),w*.40,palette[0]);
 glow(w*(.72+random()*.10),h*(.53+random()*.14),w*.33,palette[1]);
 glow(w*(.25+random()*.17),h*(.78+random()*.12),w*.31,palette[2]);
 // Interstellar filaments: blurred low-alpha puffs at a coherent diagonal.
 ctx.save();ctx.globalCompositeOperation='screen';ctx.filter='blur('+Math.min(28,Math.max(7,w*.017))+'px)';
 const direction=random()>.5?1:-1;
 for(let i=0;i<19;i++){
  const t=i/18,x=w*(.17+t*.63),y=h*(direction>0?.14+t*.64:.74-t*.52)+Math.sin(t*8+visualSeed*.00001)*h*.045;
  glow(x,y,h*(.12+.04*random()),i%3===0?'rgba(158,139,184,.026)':'rgba(116,146,171,.019)');
 }
 ctx.restore();
 // Small, varied stars with a few soft bright points, not a noisy galaxy.
 for(let i=0;i<460;i++){
  const x=random()*w,y=random()*h,v=random(),r=v>.989?1.35:.19+v*.48;
  ctx.fillStyle=v>.97?'rgba(235,228,221,.70)':v>.70?'rgba(177,187,216,.43)':'rgba(141,162,201,.24)';
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  if(v>.992)glow(x,y,9*ratio,'rgba(169,185,213,.05)');
 }
 // A little light from below: subtle gradients, not a solid glowing footer.
 glow(w*.15,h*1.055,w*.42,'rgba(131,107,172,.12)');
 glow(w*.86,h*1.045,w*.38,'rgba(113,136,173,.12)');
}
paintSpace();window.addEventListener('resize',paintSpace,{passive:true});
const localFiles=id=>new URL(`../../assets/rws/${id}.jpg`,import.meta.url).href;
let world=null;
try{
 world=new RitualWorld({mount:root,cards:DECK,faceAssetForId:localFiles,visualSeed,entranceMode,onStatus:evt=>{
  if(evt.state==='context-lost'){status.textContent='GRAPHICS CONTEXT LOST';return}
  if(Number.isInteger(evt.loaded))status.textContent=evt.loaded===78?'ORBIT ACTIVE · 78 FACES LOADED':`ORBIT ACTIVE · LOADING RWS ART ${evt.loaded}/78`;
  if(evt.failed)status.textContent='ILLUSTRATION ERROR — VERIFY RWS ASSETS';
 }});
 document.getElementById('card-counter').textContent=`${world.cards.length} CARD ENTITIES`;
 }catch(error){
 console.warn('Gate A WebGL unavailable; using perspective-preserving Canvas2D fallback:',error.message);
 try{world=new CanvasOrbit({mount:root,cards:DECK,faceAssetForId:localFiles,visualSeed,entranceMode,onStatus:evt=>{status.textContent=evt.loaded===78?'ORBIT ACTIVE · 78 FACES LOADED':`ORBIT ACTIVE · ILLUSTRATIONS ${evt.loaded||0}/78`}});status.textContent='ORBIT ACTIVE · 2D FALLBACK';}
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
// Review-only controls: rerun either entrance without re-creating the persistent world.
const entranceLabel=document.getElementById('entrance-label');
const changeEntry=document.getElementById('change-entrance');
const replayEntry=document.getElementById('replay-entrance');
function showEntrance(){entranceLabel.textContent=entranceMode==='inside-out'?'CORE EXPANSION':'STAR ASSEMBLY';}
function runEntrance(mode){if(!world)return;entranceMode=mode;world.restartEntrance(mode);showEntrance();}
changeEntry.addEventListener('click',()=>runEntrance(entranceMode==='inside-out'?'outside-in':'inside-out'));
replayEntry.addEventListener('click',()=>runEntrance(entranceMode));
showEntrance();
const paused=document.getElementById('pause');paused.addEventListener('click',()=>{if(!world)return;const state=!(world.pause??world.paused);world.setPaused(state);paused.innerHTML=state?'RESUME ORBIT <span>▶</span>':'PAUSE ORBIT <span>Ⅱ</span>';status.textContent=state?'ORBIT PAUSED':'ORBIT ACTIVE'});
document.getElementById('divine').addEventListener('click',()=>{
 const question=document.getElementById('question');if(question.value.trim().length<3){question.focus();return}
 document.getElementById('demo-notice').textContent='Gate A review: landing universe only. Shuffle begins after visual approval.';
});
window.__ritualGateA={world,diagnostics:()=>world?.getDiagnostics(),hue,visualSeed,get entranceMode(){return entranceMode},replayEntrance:runEntrance,phase:'landing'};
window.addEventListener('pagehide',()=>world?.dispose(),{once:true});
