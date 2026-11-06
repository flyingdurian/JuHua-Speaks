import {DECK} from '../../src/deck.mjs';
import {createVisualSeed} from '../../src/ritual-world/OrbitalField.mjs';
import {RitualWorld} from '../../src/ritual-world/RitualWorld.mjs';
import {CanvasOrbit} from '../../src/ritual-world/CanvasOrbit.mjs';
import {initCelestialSky} from '../../src/ritual-world/CelestialSky.mjs';

const root=document.getElementById('gate-b');
const scene=document.getElementById('world-root');
const status=document.getElementById('orbit-status');
const overlay=document.getElementById('ritual-panel');
const title=document.getElementById('ritual-title');
const description=document.getElementById('ritual-description');
const beatLabel=document.getElementById('beat-label');
const deckControls=document.getElementById('deck-controls');
const notice=document.getElementById('gate-b-notice');
const buttonStart=document.getElementById('start-shuffle');
const buttonPause=document.getElementById('pause');
const visualSeed=createVisualSeed();
const entrance=new URLSearchParams(location.search).get('entrance');
const entranceMode=['inside-out','outside-in'].includes(entrance)?entrance:(visualSeed%2?'inside-out':'outside-in');
const sky=initCelestialSky({
 mount:document.getElementById('space-background'),
 starCanvas:document.getElementById('star-canvas'),
 seed:visualSeed,
 reduceMotion:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false
});
const faceAssetForId=id=>new URL('../../assets/rws/'+id+'.jpg',import.meta.url).href;
let world=null,loadCount=0,failedAssets=0,lastStatus='',renderError='';
const onStatus=evt=>{
 if(evt.state==='context-lost'){status.textContent='GRAPHICS CONTEXT LOST';return}
 if(Number.isInteger(evt.loaded))loadCount=evt.loaded;
 if(Number.isInteger(evt.failed))failedAssets=evt.failed;
};
try{
 world=new RitualWorld({mount:scene,cards:DECK,faceAssetForId,visualSeed,entranceMode,onStatus});
}catch(error){
 console.warn('Gate B WebGL unavailable; using Canvas2D physical shuffle fallback:',error.message);
 try{world=new CanvasOrbit({mount:scene,cards:DECK,faceAssetForId,visualSeed,entranceMode,onStatus})}
 catch(inner){status.textContent='RENDERER UNAVAILABLE';console.error(inner)}
}
if(world)document.getElementById('card-counter').textContent=String(world.cards.length)+' INDIVIDUAL CARDS';
const label={
 gathering:['Shuffling…','Please meditate on your question.'],
 tornado:['Shuffling…','Please meditate on your question.'],
 storm_to_globe:['Shuffling…','Please meditate on your question.'],
 globe:['Shuffling…','Please meditate on your question.'],
 three_piles:['Shuffling…','Please meditate on your question.'],
 pile_shuffling:['Shuffling…','Please meditate on your question.'],
 consolidating:['Shuffling…','Please meditate on your question.'],
 splitting:['Riffle Shuffle','The deck separates into two complete halves.'],
 interleaving:['Riffle Shuffle','Cards weave together in an alternating bridge.'],
 bridging:['Riffle Shuffle','The interleaved deck arches and settles.'],
 unfurling:['Cosmic Orbit','Two suspended card streams unfold into space.'],
 orbital_shuffle:['Cosmic Orbit','Two orbiting halves move in a coordinated ritual.'],
 spreading:['Table Wash','The deck spreads across the divination plane.'],
 table_wash:['Table Wash','Cards move and overlap on a shared surface.'],
 deck_ready:['The deck is ready','Seventy-eight cards. One complete deck.']
};
const statusText=()=>failedAssets?'ARTWORK ERROR · '+failedAssets+' MISSING':'RWS ILLUSTRATIONS · '+loadCount+'/78 LOADED';
function renderUI(){
 if(!world)return;
 if(renderError){status.textContent='SHUFFLE RENDER ERROR · '+renderError;return;}
 const phase=world.phase,info=world.getShuffleState();
 const state=phase==='shuffle_ritual'?info.beat:phase;
 const nextStatus=(phase==='landing'?'LANDING UNIVERSE':phase==='shuffle_ritual'?'SHUFFLING · '+info.style.toUpperCase():'DECK FORMED')+' · '+statusText();
 if(lastStatus!==nextStatus){status.textContent=nextStatus;lastStatus=nextStatus}
 if(!root.classList.contains('in-ritual'))return;
 deckControls.hidden=phase!=='deck_formed';
 root.classList.toggle('deck-ready',phase==='deck_formed');
 const entry=label[state]||label.deck_ready;
 const newTitle=entry[0],newDescription=entry[1];
 const beatText=info.style==='auto'?'✧ HOLD YOUR QUESTION IN MIND ✧':'✧ '+info.style.toUpperCase()+' SHUFFLE ✧';
 if(beatLabel.textContent!==beatText)beatLabel.textContent=beatText;
 if(title.textContent!==newTitle)title.textContent=newTitle;
 if(description.textContent!==newDescription)description.textContent=newDescription;
 if(phase==='deck_formed'){
  document.querySelectorAll('[data-shuffle]').forEach(b=>b.disabled=false);
  document.getElementById('finish-shuffle').disabled=false;
 }
}
buttonStart.addEventListener('click',()=>{
 if(!world)return;
 const question=document.getElementById('question'),value=question.value.trim();
 if(value.length<3||value.length>600){question.focus();return}
 if(world.phase!=='landing')return;
 try{world.beginAutoShuffle();}
 catch(error){
  console.error('Gate B geometry preflight failed:',error);
  renderError=error.message;
  status.textContent='SHUFFLE RENDER ERROR · '+renderError;
  document.getElementById('gate-b-notice').textContent='Shuffle unavailable: card geometry could not be validated.';
  overlay.hidden=false;root.classList.add('in-ritual');deckControls.hidden=true;
  return;
 }
 root.classList.add('in-ritual');overlay.hidden=false;deckControls.hidden=true;notice.textContent='';
 renderUI();
});
document.querySelectorAll('[data-shuffle]').forEach(button=>button.addEventListener('click',()=>{
 if(!world||world.phase!=='deck_formed')return;
 const style=button.dataset.shuffle;
 notice.textContent='';
 try{world.playShuffle(style);}
 catch(error){
  console.error('Gate B optional shuffle geometry failed:',error);
  renderError=error.message;
  notice.textContent='Shuffle unavailable: card geometry failed validation.';
  return;
 }
 deckControls.hidden=true;renderUI();
}));
document.getElementById('finish-shuffle').addEventListener('click',()=>{
 if(!world||world.phase!=='deck_formed')return;
 notice.textContent='Gate B complete. The cosmic launch and sphere-selection transition are Gate C.';
});
buttonPause.addEventListener('click',()=>{
 if(!world)return;
 const paused=!(world.pause??world.paused);
 world.setPaused(paused);buttonPause.setAttribute('aria-pressed',String(paused));
 buttonPause.textContent=paused?'RESUME ▶':'PAUSE Ⅱ';
});
document.getElementById('reset').addEventListener('click',()=>{
 if(!world)return;
 world.setPaused(false);buttonPause.setAttribute('aria-pressed','false');buttonPause.textContent='PAUSE Ⅱ';
 renderError='';world.resetGateB();root.classList.remove('in-ritual','deck-ready');overlay.hidden=true;
 notice.textContent='';lastStatus='';renderUI();
});
const statusTimer=setInterval(renderUI,180);
renderUI();
window.__ritualGateB={
 world,diagnostics:()=>world?{...world.getDiagnostics(),sky:sky.diagnostics()}:null,
 get phase(){return world?.phase||'unavailable'},
 get shuffle(){return world?.getShuffleState()||null},
 version:'Gate B physical shuffle / draft',
};
window.addEventListener('pagehide',()=>{clearInterval(statusTimer);sky.dispose();world?.dispose()},{once:true});
