/** Gate C concept fidelity — only 01 Fullscreen Gate, 02 Entry Cube, 03 Inside, 04 Selection.
 * Single 78-ID deck, no stage 05; safe standalone visual acceptance branch.
 */
import {DECK,shuffleDeck,drawOrientation} from '../../src/deck.mjs';
import {GATE_B_HANDOFF_KEY,parseGateBHandoff} from '../../src/gate-b-handoff.mjs';
import {sphereLayout,projectCard,validateDeck,addChoice,removeChoice,assertSelection,entryProjection,entryProgress} from './geometry.mjs';
import {initCelestialSky} from '../../src/ritual-world/CelestialSky.mjs';
const root=document.getElementById('ritual'),params=new URLSearchParams(location.search),roles=['Past','Present','Future'],reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const validIds=new Set(DECK.map(c=>c.id)),asset='../../assets/gate-c14/card-back.svg';
let handoff=null;
try{const raw=sessionStorage.getItem(GATE_B_HANDOFF_KEY);if(raw){sessionStorage.removeItem(GATE_B_HANDOFF_KEY);handoff=parseGateBHandoff(raw)}}catch(e){console.warn('Expired Gate B handoff discarded:',e.message)}
// Only a standalone direct review may generate a temporary deck. Arrival from
// Gate B must have its one-use 78-ID envelope; never substitute a second draw.
if(params.get('from')==='gate-b'&&!handoff){
 root.innerHTML='<section role="alert" style="padding:23vh 7vw;text-align:center;color:#f2ddbb"><h1>Selection session expired</h1><p>Return to Finish Shuffling to enter with your existing 78-card deck.</p><a href="../gate-b/" style="color:#f4d092">Back to shuffling</a></section>';
 throw new Error('Gate B handoff was missing or expired — no replacement deck was drawn');
}
const deck=validateDeck(handoff?.cardIds?.every(x=>validIds.has(x))?handoff.cardIds:shuffleDeck().map(x=>x.id));
const layout=sphereLayout(),coordinates=new Map(deck.map((id,i)=>[id,layout[i]])),buttons=new Map();
let activeGhost=null;let entryPulseTimer=null;let skyEnvironment=null,sphereEnteredAt=0;let stage='sphere',choices=[],yaw=-14,pitch=-9,paused=false,lastSelected=null,press=null,suppressClickUntil=0,enterTimer=null,frame=0,previous=0;
const back=()=>'<img src="'+asset+'" alt="" draggable="false">';
const skySeed=(globalThis.crypto?.getRandomValues?.(new Uint32Array(1))?.[0]||183792212)>>>0;
function mast(index,name){return '<header class="mast"><div class="brand"><span>✦</span>JuHua Speaks</div><small>'+index+' / 04 &nbsp; '+name+'</small></header>'}
function common(cls){return '<div class="backdrop" aria-hidden="true"></div>'+(cls==='gate'?'<div class="architecture" aria-hidden="true"></div>':'')+'<div class="veil" aria-hidden="true"></div>'}
// The rejected Gate/Cube opening is intentionally absent: Gate B hands
// its single shuffled 78-card deck directly into the full-screen sphere.
function sphere(){return '<section class="scene scene-sphere" aria-label="Inside the full-screen 78-card Tarot sphere">'+common('sphere')+'<div class="deep-sky" id="deep-sky" aria-hidden="true"><canvas class="deep-star-canvas" id="deep-star-canvas"></canvas></div><div class="dome-rings" aria-hidden="true"><div class="dome-ring"></div><div class="dome-ring"></div><div class="dome-ring"></div></div>'+mast('03','INSIDE THE SPHERE')+'<div class="sphere-label"><div class="title" id="sphere-title">✧ &nbsp; YOU ARE WITHIN THE STARS &nbsp; ✧</div><p id="sphere-message" aria-live="polite">Please select 3 cards (0 selected)</p></div><div class="sphere-space" id="sphere-space" role="region" aria-label="78 inward-facing Tarot cards, drag to look around and tap a card"><div class="orbit-field" id="orbit-field"></div></div><div class="focus" id="focus" aria-hidden="true"><div class="focus-halo"></div><div class="focus-front">'+back()+'</div></div><nav class="sphere-controls"><button data-action="left" aria-label="Look left">←</button><button data-action="right" aria-label="Look right">→</button><button data-action="pause" aria-label="Pause orbit">Ⅱ</button></nav><section class="dock" aria-label="Your Past Present Future card choices"><strong>THE THREE PATHS</strong><div class="dock-slots" id="dock-slots"></div><div class="dock-count" id="dock-count">0 <small>/ 3</small></div></section><div class="finish-label" id="finish-label" hidden>✧ THREE CARDS SELECTED · PAST · PRESENT · FUTURE ✧</div></section>'}
function show(next){if(skyEnvironment){skyEnvironment.dispose();skyEnvironment=null;}if(enterTimer){clearTimeout(enterTimer);enterTimer=null}if(entryPulseTimer){clearTimeout(entryPulseTimer);entryPulseTimer=null}stage=next;root.dataset.stage=next;root.innerHTML=sphere();
 buttons.clear();
 if(next==='sphere'){sphereEnteredAt=performance.now();skyEnvironment=initCelestialSky({mount:root.querySelector('#deep-sky'),starCanvas:root.querySelector('#deep-star-canvas'),seed:skySeed,reduceMotion:reduced()});const field=root.querySelector('#orbit-field');for(const id of deck){const b=document.createElement('button');b.type='button';b.className='orbit-card';b.dataset.cardId=id;b.setAttribute('aria-label','Choose '+(DECK.find(c=>c.id===id)?.name||id));b.innerHTML=back();buttons.set(id,b);field.append(b)}updateDock();paint()}
}
function paint(){
 if(stage!=='sphere'&&stage!=='select')return;
 const world=root.querySelector('#sphere-space');if(!world)return;
 const rect=world.getBoundingClientRect();if(rect.width<10||rect.height<10)return;
 const entering=entryProgress(performance.now()-sphereEnteredAt,reduced());
 const selected=new Set(choices.map(c=>c.id));
 for(const id of deck){
  const b=buttons.get(id),projection=projectCard(coordinates.get(id),yaw,pitch,rect.width,rect.height);
  if(!projection){b.hidden=true;continue}
  const p=entryProjection(projection,entering,rect.width,rect.height),chosen=selected.has(id);
  // A selected sheet has physically left the spherical shell and now
  // lives in the foreground Past/Present/Future dock, never duplicated.
  if(chosen){b.hidden=true;continue}
  b.hidden=false;b.classList.toggle('is-chosen',false);
  b.setAttribute('aria-pressed',String(chosen));
  const scale=1;
  b.style.cssText='--px:'+p.x.toFixed(2)+'px;--py:'+p.y.toFixed(2)+'px;--w:'+(p.width*scale).toFixed(2)+'px;--h:'+(p.height*scale).toFixed(2)+'px;--tilt:'+p.yaw.toFixed(2)+'deg;--spin:'+p.angle.toFixed(2)+'deg;--alpha:'+p.opacity.toFixed(2)+';z-index:'+(chosen?2000:Math.round(p.depth*1000));
 }
}
function dockHtml(){return roles.map((r,i)=>{const choice=choices[i];return '<div class="dock-slot"><label>'+r+'</label><div class="dock-back '+(choice?'chosen':'')+'">'+(choice?back():'0'+(i+1))+'</div>'+(choice?'<button data-undo="'+choice.id+'" aria-label="Unselect '+r+'">UNDO</button>':'<small>AWAITING</small>')+'</div>'}).join('')}
function updateDock(){const slots=root.querySelector('#dock-slots');if(!slots)return;slots.innerHTML=dockHtml();root.querySelector('#dock-count').innerHTML=choices.length+' <small>/ 3</small>';root.querySelector('#focus').classList.remove('active');root.querySelector('#finish-label').hidden=choices.length!==3;const msg=root.querySelector('#sphere-message');if(msg)msg.textContent='Please select 3 cards ('+choices.length+' selected)';assertSelection(choices,deck)}
function choose(id){if(!['sphere','select'].includes(stage)||!buttons.has(id))return;if(choices.some(x=>x.id===id)){undo(id);return;}if(choices.length>=3)return;
 const node=buttons.get(id),from=node.getBoundingClientRect(),next=addChoice(choices,id,drawOrientation(),deck);
 if(next===choices)return;choices=next;lastSelected=id;
 if(stage==='sphere'){stage='select';root.dataset.stage='select';root.querySelector('.mast small').innerHTML='04 / 04 &nbsp; SELECT THE CARDS';root.querySelector('#sphere-title').innerHTML='✧ &nbsp; THE CARDS ANSWER &nbsp; ✧';root.querySelector('#sphere-message').textContent='Select three cards (1 selected) · Drag to look around'}
 const focus=root.querySelector('#focus');focus.classList.remove('active');
 if(activeGhost){activeGhost.remove();activeGhost=null}if(from.width>5&&!reduced()){const ghost=document.createElement('div');activeGhost=ghost;ghost.className='card-flight';ghost.innerHTML=back();ghost.style.cssText='left:'+from.left+'px;top:'+from.top+'px;width:'+from.width+'px;height:'+from.height+'px';document.body.append(ghost);
 const destination=root.querySelectorAll('.dock-back')[choices.length-1]?.getBoundingClientRect();
 const centerX=destination?destination.left+destination.width*.5:innerWidth*.5;
 const centerY=destination?destination.top+destination.height*.5:innerHeight*.78;
 const dx=centerX-(from.left+from.width*.5),dy=centerY-(from.top+from.height*.5);
 const animation=ghost.animate([{transform:'translate(0,0) scale(1)',filter:'drop-shadow(0 0 2px #fff4ca)'},{offset:.54,transform:'translate('+dx*.48+'px,'+(dy*.38-70)+'px) scale(2.15)',filter:'drop-shadow(0 0 40px #ffe6ae)'},{transform:'translate('+dx+'px,'+dy+'px) scale(.78)',opacity:0}],{duration:1050,fill:'forwards',easing:'cubic-bezier(.15,.68,.16,1)'});animation.finished.catch(()=>{}).finally(()=>{ghost.remove();if(activeGhost===ghost)activeGhost=null});setTimeout(()=>{ghost.remove();if(activeGhost===ghost)activeGhost=null},1320)}
 updateDock();paint();
}
function undo(id){if(stage!=='select'||!choices.some(c=>c.id===id))return;choices=removeChoice(choices,id);lastSelected=choices.at(-1)?.id||null;
 if(!choices.length){stage='sphere';root.dataset.stage='sphere';root.querySelector('.mast small').innerHTML='03 / 04 &nbsp; INSIDE THE SPHERE';root.querySelector('#sphere-title').textContent='✧ YOU ARE WITHIN THE STARS ✧';root.querySelector('#sphere-message').textContent='Select three cards (0 selected) · Drag to look around'}
 updateDock();paint();}
root.addEventListener('click',event=>{const btn=event.target.closest('button');if(!btn)return;const id=btn.dataset.cardId;if(id){if(Date.now()>=suppressClickUntil)choose(id);return}if(btn.dataset.undo){undo(btn.dataset.undo);return}
 switch(btn.dataset.action){case 'left':yaw-=17;paint();break;case 'right':yaw+=17;paint();break;case 'pause':paused=!paused;btn.textContent=paused?'▶':'Ⅱ';break;}});
root.addEventListener('pointerdown',event=>{if(!['sphere','select'].includes(stage)||!event.target.closest('#sphere-space'))return;press={pid:event.pointerId,x:event.clientX,y:event.clientY,yaw,pitch,id:event.target.closest('button[data-card-id]')?.dataset.cardId||null,moved:false}});
window.addEventListener('pointermove',event=>{if(!press||event.pointerId!==press.pid)return;const dx=event.clientX-press.x,dy=event.clientY-press.y;if(!press.moved&&Math.hypot(dx,dy)<8)return;press.moved=true;yaw=press.yaw+dx*.30;pitch=Math.max(-67,Math.min(67,press.pitch-dy*.23));paint()});
window.addEventListener('pointerup',event=>{if(!press||event.pointerId!==press.pid)return;const p=press;press=null;suppressClickUntil=Date.now()+370;if(!p.moved&&p.id)choose(p.id)});
window.addEventListener('pointercancel',()=>{press=null});
function tick(t){const dt=previous?Math.min(75,t-previous):0;previous=t;if(['sphere','select'].includes(stage)){if(!paused&&!press&&!reduced())yaw=(yaw+dt*.0028)%360;paint()}frame=requestAnimationFrame(tick)}
window.addEventListener('pagehide',()=>{clearTimeout(enterTimer);clearTimeout(entryPulseTimer);skyEnvironment?.dispose();cancelAnimationFrame(frame)});
window.__JUHUA_C14__={stage:()=>stage,selected:()=>choices.map(x=>({...x})),deck:()=>[...deck],visible:()=>[...buttons].filter(([,b])=>!b.hidden).map(([id])=>id),choose,undo,enterScene:()=>show('sphere')};
show('sphere');frame=requestAnimationFrame(tick);
