import {DECK} from '../../src/deck.mjs';
import {RitualWorld} from '../../src/ritual-world/RitualWorld.mjs';
import {CanvasOrbit} from '../../src/ritual-world/CanvasOrbit.mjs';
import {createVisualSeed} from '../../src/ritual-world/OrbitalField.mjs';
import {initCelestialSky} from '../../src/ritual-world/CelestialSky.mjs';

const page=document.getElementById('gate-a'),root=document.getElementById('world-root'),status=document.getElementById('orbit-status');
const isProductionLanding=document.body.dataset.gateRole==='production';
const visualSeed=createVisualSeed();
// Deterministic for the lifetime of one visit; different on each refresh.
// Query override supports comparable recordings of both entry rituals.
const requestedEntrance=new URLSearchParams(location.search).get('entrance');
let entranceMode=['inside-out','outside-in'].includes(requestedEntrance)?requestedEntrance:(visualSeed%2?'inside-out':'outside-in');
// Refresh-seeded, mostly black starfield. Two cached turbulent cloud textures
// and a separate twinkle layer drift via CSS; no full-frame JS simulation.
const hue=(visualSeed>>>6)%6;
const background=document.getElementById('space-background');
const sky=initCelestialSky({
 mount:background,
 starCanvas:document.getElementById('star-canvas'),
 seed:visualSeed,
 reduceMotion:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false
});
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
 const question=document.getElementById('question'),value=question.value.trim();
 if(value.length<3||value.length>600){question.focus();return}
 if(!isProductionLanding){
  document.getElementById('demo-notice').textContent='I am still working on it princess, I hope you like it so far 😋';
  return;
 }
 try{
  sessionStorage.setItem('juhua:gate-a-question',value);
  document.getElementById('demo-notice').textContent='Entering the Tarot ritual…';
 }catch{
  document.getElementById('demo-notice').textContent='Continuing to your reading. You may need to re-enter the question if private storage is disabled.';
 }
 document.getElementById('gate-a').classList.add('exiting-landing');
 window.setTimeout(()=>window.location.assign(new URL('../../ritual.html',import.meta.url).href),550);
});
window.__ritualGateA={world,diagnostics:()=>({...world?.getDiagnostics(),sky:sky.diagnostics()}),hue,visualSeed,get entranceMode(){return entranceMode},replayEntrance:runEntrance,phase:'landing'};
window.addEventListener('pagehide',()=>{world?.dispose();sky.dispose()}, {once:true});
