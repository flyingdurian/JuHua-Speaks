/**
 * Gate C review: one fullscreen 78-card globe and an independent 3-card
 * physical peel. No gate/cube, no selection dock, no legacy ritual.html.
 *
 * The deck is one immutable sequence transferred from Gate B once through
 * sessionStorage. Visual feedback never changes the selected identities.
 */
import {DECK,BY_ID,shuffleDeck,drawOrientation} from '../../src/deck.mjs';
import {GATE_B_HANDOFF_KEY,parseGateBHandoff} from '../../src/gate-b-handoff.mjs';
import {sphereLayout,projectCard,validateDeck,addChoice,removeChoice,assertSelection,entryProjection,entryProgress} from './geometry.mjs';
import {initCelestialSky} from '../../src/ritual-world/CelestialSky.mjs';

const root=document.getElementById('ritual'),params=new URLSearchParams(location.search);
const roles=['Past','Present','Future'];
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const backArt='../../assets/gate-c14/card-back.svg',frontArt=id=>'../../assets/rws/'+id+'.jpg';
const validIds=new Set(DECK.map(c=>c.id)),skySeed=(globalThis.crypto?.getRandomValues?.(new Uint32Array(1))?.[0]||183792212)>>>0;
let handoff=null;
try{
 const raw=sessionStorage.getItem(GATE_B_HANDOFF_KEY);
 if(raw){sessionStorage.removeItem(GATE_B_HANDOFF_KEY);handoff=parseGateBHandoff(raw)}
}catch(error){console.warn('Gate B handoff discarded:',error.message)}
if(params.get('from')==='gate-b'&&!handoff){
 root.innerHTML='<section role="alert" class="expired-selection"><h1>The cards have lost their place.</h1><p>Your selection session expired. Start again from the resting deck.</p><a href="../gate-b/">Return to shuffling</a></section>';
 throw new Error('Gate B handoff expired or missing; refusing to silently reshuffle 78 cards');
}
const deck=validateDeck(handoff?.cardIds?.every(id=>validIds.has(id))?handoff.cardIds:shuffleDeck().map(c=>c.id));
const layout=sphereLayout(),coordinates=new Map(deck.map((id,i)=>[id,layout[i]])),buttons=new Map();
let stage='sphere',choices=[],yaw=-14,pitch=-9,paused=false,press=null,frame=0,previous=0,enteredAt=0,sky=null,transitionTimer=null;
let peeking=null,ignoreClickUntil=0;
const peel=Array.from({length:3},()=>({mode:'right',progress:0}));
const back=()=>'<img src="'+backArt+'" alt="" draggable="false">';
function sceneSky(){return '<div class="deep-sky" id="deep-sky" aria-hidden="true"><canvas class="deep-star-canvas" id="deep-star-canvas"></canvas></div>'}
function mountSky(){sky?.dispose();sky=initCelestialSky({mount:root.querySelector('#deep-sky'),starCanvas:root.querySelector('#deep-star-canvas'),seed:skySeed,reduceMotion:reduced()})}
function sphereMarkup(){
 return '<section class="scene scene-sphere sphere-immersive" aria-label="Inside the full-screen Tarot sphere">'+sceneSky()+
  '<header class="mast"><div class="brand"><span>✦</span>JuHua Speaks</div><small>WITHIN THE UNIVERSE</small></header>'+
  '<div class="sphere-label"><p id="sphere-message" role="status" aria-live="polite">Please select 3 cards (0 selected)</p></div>'+
  '<div class="sphere-space" id="sphere-space" role="region" aria-label="Inside a living sphere of 78 Tarot cards. Drag to look around; tap three to choose."><div class="orbit-field" id="orbit-field"></div></div>'+
  '<nav class="sphere-controls" aria-label="Look around the universe"><button data-action="left" aria-label="Look left">←</button><button data-action="right" aria-label="Look right">→</button><button data-action="pause" aria-label="Pause orbit">Ⅱ</button></nav>'+
  '<div class="sphere-transition-core" aria-hidden="true"></div></section>';
}
function showSphere(){
 stage='sphere';root.dataset.stage='sphere';root.innerHTML=sphereMarkup();buttons.clear();
 enteredAt=performance.now()-(handoff?2200:0);mountSky();
 const field=root.querySelector('#orbit-field');
 for(const id of deck){
  const b=document.createElement('button');b.type='button';b.className='orbit-card';
  b.dataset.cardId=id;b.setAttribute('aria-label','Select '+(BY_ID.get(id)?.name||id));
  b.innerHTML=back();buttons.set(id,b);field.append(b);
 }
 paint();
}
function paint(){
 if(stage!=='sphere'&&stage!=='select')return;
 const space=root.querySelector('#sphere-space');if(!space)return;
 const rect=space.getBoundingClientRect();if(rect.width<10||rect.height<10)return;
 const entering=entryProgress(performance.now()-enteredAt,reduced());
 const selected=new Set(choices.map(c=>c.id));
 for(const id of deck){
  const b=buttons.get(id),projected=projectCard(coordinates.get(id),yaw,pitch,rect.width,rect.height);
  if(!projected){b.hidden=true;continue}
  const pos=entryProjection(projected,entering,rect.width,rect.height),chosen=selected.has(id);
  b.hidden=false;b.classList.toggle('is-chosen',chosen);b.setAttribute('aria-pressed',String(chosen));
  b.style.cssText='--px:'+pos.x.toFixed(2)+'px;--py:'+pos.y.toFixed(2)+'px;--w:'+pos.width.toFixed(2)+'px;--h:'+pos.height.toFixed(2)+'px;--tilt:'+pos.yaw.toFixed(2)+'deg;--spin:'+pos.angle.toFixed(2)+'deg;--alpha:'+pos.opacity.toFixed(2)+';z-index:'+(chosen?2100:Math.round(1000/(pos.depth+.3)));
 }
}
function announcement(){
 const msg=root.querySelector('#sphere-message');
 if(msg)msg.textContent='Please select 3 cards ('+choices.length+' selected)';
 assertSelection(choices,deck);
}
function choose(id){
 if(!['sphere','select'].includes(stage)||!buttons.has(id))return;
 if(choices.some(c=>c.id===id)){undo(id);return}
 if(choices.length>=3)return;
 choices=addChoice(choices,id,drawOrientation(),deck);
 if(stage==='sphere'){stage='select';root.dataset.stage='select'}
 announcement();paint();
 if(choices.length===3){
  transitionTimer=setTimeout(beginCollapse,reduced()?300:1050);
 }
}
function undo(id){
 if(!['sphere','select'].includes(stage))return;
 if(transitionTimer){clearTimeout(transitionTimer);transitionTimer=null}
 choices=removeChoice(choices,id);
 if(!choices.length){stage='sphere';root.dataset.stage='sphere'}
 announcement();paint();
}
function beginCollapse(){
 if(choices.length!==3||stage!=='select')return;
 stage='collapse';root.dataset.stage='collapse';
 root.querySelector('#sphere-message').textContent='The cards have chosen their places';
 // All other 75 sheets converge; the three chosen sheets retain their golden halo.
 transitionTimer=setTimeout(showTrio,reduced()?150:1280);
}
const progressLabel=mode=>({'left':'left edge','right':'right edge','bottom':'bottom edge','corner':'lower corner'}[mode]||'edge');
function trioMarkup(){
 return '<section class="scene scene-reveal" aria-label="Past Present Future physical card reveal">'+sceneSky()+
 '<header class="mast"><div class="brand"><span>✦</span>JuHua Speaks</div><small>PAST · PRESENT · FUTURE</small></header>'+
 '<h1 class="trio-heading">Click cards to see results</h1>'+
 '<p class="trio-peek-instruction">Drag a side, corner or lower edge to gently peek beneath each card.</p>'+
 '<div class="trio-stage">'+choices.map((choice,i)=>{
  const card=BY_ID.get(choice.id);
  const meaning=choice.orientation==='reversed'?card.reversed:card.upright;
  return '<article class="trio-item" data-trio-index="'+i+'">'+
   '<div class="peek-card" role="slider" tabindex="0" data-peek-index="'+i+'" aria-label="'+roles[i]+' Tarot card, peel to reveal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="Card back unrevealed">'+
   '<div class="peek-art '+(choice.orientation==='reversed'?'orientation-reversed':'')+'"><img src="'+frontArt(choice.id)+'" alt="'+escapeHtml(card.name)+' Tarot card artwork" draggable="false"/></div>'+
   '<div class="peek-back-cover" data-peek-cover="'+i+'">'+back()+'</div>'+
   '<div class="peek-fold" aria-hidden="true"></div>'+
   '<span class="peek-edge-light" aria-hidden="true"></span></div>'+
   '<div class="trio-role"><span>0'+(i+1)+'</span> '+roles[i]+'</div>'+
   '<div class="trio-card-meta" data-trio-meta="'+i+'" aria-live="polite">'+
    '<strong>'+escapeHtml(card.name)+'</strong><span> · '+(choice.orientation==='reversed'?'Reversed':'Upright')+'</span>'+
    '<p>'+escapeHtml(meaning)+'</p></div>'+
  '</article>';
 }).join('')+'</div></section>';
}
function showTrio(){
 if(choices.length!==3)return;
 stage='reveal';root.dataset.stage='reveal';root.innerHTML=trioMarkup();mountSky();
 choices.forEach((_,i)=>paintPeel(i));
}
function clamp(x){return Math.max(0,Math.min(1,Number.isFinite(x)?x:0))}
function paintPeel(i){
 const el=root.querySelector('[data-peek-index="'+i+'"]'),cover=root.querySelector('[data-peek-cover="'+i+'"]'),meta=root.querySelector('[data-trio-meta="'+i+'"]');
 if(!el||!cover||!meta)return;
 const {mode,progress:p}=peel[i],v=+(100*p).toFixed(3);
 // A flexible Tarot paper layer has a CURVED fold line. Build a sampled
 // clip boundary in card-local percentages, not a flat left/right wipe.
 const bulge=4*Math.sin(Math.PI*p),samples=12;
 const xy=(x,y)=>x.toFixed(2)+'% '+y.toFixed(2)+'%';
 const boundary=[];
 let polygon;
 if(mode==='right'||mode==='left'){
  for(let j=0;j<=samples;j++){
   const y=j/samples*100;
   const x=mode==='right'?100-v+bulge*Math.sin(Math.PI*j/samples):v-bulge*Math.sin(Math.PI*j/samples);
   boundary.push(xy(Math.max(0,Math.min(100,x)),y));
  }
  polygon=mode==='right'?[xy(0,0),...boundary,xy(0,100)]:[...boundary,xy(100,100),xy(100,0)];
 }else if(mode==='bottom'){
  for(let j=samples;j>=0;j--){
   const x=j/samples*100,y=100-v+bulge*Math.sin(Math.PI*j/samples);
   boundary.push(xy(x,Math.max(0,Math.min(100,y))));
  }
  polygon=[xy(0,0),xy(100,0),...boundary];
 }else{
  for(let j=0;j<=samples;j++){
   const angle=j/samples*Math.PI/2;
   boundary.push(xy(100-v*Math.sin(angle),100-v*Math.cos(angle)));
  }
  polygon=[xy(0,0),xy(100,0),...boundary,xy(0,100)];
 }
 const mask='polygon('+polygon.join(',')+')';
 cover.style.clipPath=mask;
 cover.style.opacity=p>=.985?'0':'1';
 el.style.setProperty('--peel-progress',String(p));
 el.style.setProperty('--peel-width',v+'%');
 el.dataset.peelMode=mode;
 el.classList.toggle('is-revealed',p>=.985);
 el.setAttribute('aria-valuenow',String(Math.round(p*100)));
 el.setAttribute('aria-valuetext',p>=.985?'Card fully revealed':Math.round(p*100)+' percent revealed from '+progressLabel(mode));
 meta.classList.toggle('is-visible',p>=.985);
}
function setPeel(i,p,mode=peel[i]?.mode||'right'){
 if(!peel[i]||!['left','right','bottom','corner'].includes(mode))return;
 peel[i]={mode,progress:clamp(p)};
 paintPeel(i);
}
function peekMode(target,x,y){
 const rect=target.getBoundingClientRect(),rx=(x-rect.left)/rect.width,ry=(y-rect.top)/rect.height;
 if(ry>.78&&rx>.72)return 'corner';
 if(ry>.77)return 'bottom';
 if(rx<.27)return 'left';
 if(rx>.73)return 'right';
 return 'right';
}
root.addEventListener('click',event=>{
 const button=event.target.closest('button');
 if(button?.dataset.cardId){if(Date.now()>=ignoreClickUntil)choose(button.dataset.cardId);return}
 if(button?.dataset.action){
  if(button.dataset.action==='left'){yaw-=18;paint()}
  if(button.dataset.action==='right'){yaw+=18;paint()}
  if(button.dataset.action==='pause'){paused=!paused;button.textContent=paused?'▶':'Ⅱ';button.setAttribute('aria-label',paused?'Resume orbit':'Pause orbit')}
 }
 const hit=event.target.closest('[data-peek-index]');
 if(hit&&stage==='reveal'&&Date.now()>=ignoreClickUntil){
  const i=Number(hit.dataset.peekIndex);
  if(peel[i].progress<.985)setPeel(i,peel[i].progress+.23,peekMode(hit,event.clientX,event.clientY));
 }
});
root.addEventListener('pointerdown',event=>{
 const hit=event.target.closest('[data-peek-index]');
 if(hit&&stage==='reveal'){
  const i=Number(hit.dataset.peekIndex);
  peeking={pid:event.pointerId,i,mode:peekMode(hit,event.clientX,event.clientY),x:event.clientX,y:event.clientY,base:peel[i].progress,width:hit.clientWidth,height:hit.clientHeight,moved:false};
  hit.setPointerCapture?.(event.pointerId);return;
 }
 if(!['sphere','select'].includes(stage)||!event.target.closest('#sphere-space'))return;
 press={pid:event.pointerId,x:event.clientX,y:event.clientY,yaw,pitch,id:event.target.closest('button[data-card-id]')?.dataset.cardId||null,moved:false};
});
window.addEventListener('pointermove',event=>{
 if(peeking&&peeking.pid===event.pointerId){
  const p=peeking,dx=event.clientX-p.x,dy=event.clientY-p.y;
  if(Math.hypot(dx,dy)>6)p.moved=true;
  if(!p.moved)return;
  const increment=p.mode==='left'?dx/p.width:p.mode==='bottom'?-dy/p.height:p.mode==='corner'?(-dx/p.width-dy/p.height)*.7:-dx/p.width;
  setPeel(p.i,p.base+increment,p.mode);return;
 }
 if(!press||press.pid!==event.pointerId)return;
 const dx=event.clientX-press.x,dy=event.clientY-press.y;
 if(!press.moved&&Math.hypot(dx,dy)<8)return;
 press.moved=true;yaw=press.yaw+dx*.30;pitch=Math.max(-67,Math.min(67,press.pitch-dy*.23));paint();
});
window.addEventListener('pointerup',event=>{
 if(peeking&&peeking.pid===event.pointerId){
  const p=peeking;peeking=null;
  if(p.moved){ignoreClickUntil=Date.now()+400;if(peel[p.i].progress>.93)setPeel(p.i,1,p.mode)}return;
 }
 if(!press||press.pid!==event.pointerId)return;
 const p=press;press=null;ignoreClickUntil=Date.now()+350;
 if(!p.moved&&p.id)choose(p.id);
});
window.addEventListener('pointercancel',()=>{press=null;peeking=null});
root.addEventListener('keydown',event=>{
 if(stage==='reveal'){
  const el=event.target.closest('[data-peek-index]');if(!el)return;
  const i=Number(el.dataset.peekIndex);
  if(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','Home','End','Enter',' '].includes(event.key)){
   event.preventDefault();
   setPeel(i,event.key==='Home'?0:event.key==='End'?1:peel[i].progress+(event.key==='ArrowLeft'||event.key==='ArrowDown'?-.08:event.key==='ArrowUp'||event.key==='ArrowRight'?.08:.23));
  }return;
 }
 if(!['sphere','select'].includes(stage))return;
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
  event.preventDefault();if(event.key==='ArrowLeft')yaw-=17;if(event.key==='ArrowRight')yaw+=17;
  if(event.key==='ArrowUp')pitch=Math.min(67,pitch+12);if(event.key==='ArrowDown')pitch=Math.max(-67,pitch-12);paint();
 }
});
function tick(time){
 const dt=previous?Math.min(75,time-previous):0;previous=time;
 if(['sphere','select'].includes(stage)){
  if(!paused&&!press&&!reduced())yaw=(yaw+dt*.0028)%360;
  paint();
 }
 frame=requestAnimationFrame(tick);
}
window.addEventListener('pagehide',()=>{if(transitionTimer)clearTimeout(transitionTimer);sky?.dispose();cancelAnimationFrame(frame)});
window.__JUHUA_C14__={
 stage:()=>stage,selected:()=>choices.map(x=>({...x})),deck:()=>[...deck],
 visible:()=>[...buttons].filter(([,b])=>!b.hidden).map(([id])=>id),
 choose,undo,enterScene:showSphere,showTrio,
 peek:(i,p,mode)=>setPeel(i,p,mode),peekStates:()=>peel.map(x=>({...x}))
};
showSphere();frame=requestAnimationFrame(tick);
