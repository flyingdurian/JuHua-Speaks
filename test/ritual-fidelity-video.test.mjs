import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cinematicPose,cinematicBeat,SHUFFLE_BEATS,LAUNCH_DURATION_MS} from '../src/ritual-cinema.mjs';
import {renderPhysicalReveal} from '../src/physical-reveal.mjs';
import {createRitualSession,transitionRitual,DEFAULT_SHUFFLE_MS} from '../src/ritual-machine.mjs';
import {DECK} from '../src/deck.mjs';

test('reference-based ritual beats are continuous, bounded and deterministic',()=>{
 assert.deepEqual(SHUFFLE_BEATS.map(b=>b.id),['tornado','collapse','mini-sphere','three-piles','single-deck']);
 assert.equal(cinemaAct(0),'tornado');assert.equal(cinemaAct(1800),'collapse');assert.equal(cinemaAct(2800),'mini-sphere');
 assert.equal(cinemaAct(4200),'three-piles');assert.equal(cinemaAct(6000),'single-deck');
 assert.ok(LAUNCH_DURATION_MS>=3000);
 for(const ms of [0,450,1700,2100,2700,3600,4000,5300,5800,6500,7000]){
  for(let i=0;i<DECK.length;i++){
   const p=cinematicPose(i,ms);
   assert.equal(Object.keys(p).length,7);
   assert.ok(Object.values(p).every(Number.isFinite),'All positions finite');
   assert.ok(p.scale>=0,'Card scale not negative');
   assert.deepEqual(p,cinematicPose(i,ms),'Pure keyframes independent of frame count');
  }
 }
});
function cinemaAct(ms){return cinematicBeat(ms)}
test('shuffle styles are visibly distinct and settle into one shared deck',()=>{
 const t=4200,variants=['cosmic','riffle','wash'].map(style=>cinematicPose(16,t,'shuffle',0,style));
 assert.notDeepEqual(variants[0],variants[1]);assert.notDeepEqual(variants[1],variants[2]);
 assert.ok(Math.abs(cinemaPose(0,6500,'shuffle').x)<.1);
 for(const style of ['cosmic','riffle','wash'])assert.ok(Math.abs(cinematicPose(12,6600,'shuffle',0,style).x)<.1);
});
function cinemaPose(...args){return cinematicPose(...args)}
test('near-card orbit, camera launch and interior formation are genuine 3D coordinates',()=>{
 const around=Array.from({length:78},(_,i)=>cinematicPose(i,1600,'landing'));
 assert.ok(around.some(p=>p.z<0));assert.ok(around.some(p=>p.z>0));
 const near=cinematicPose(8,300,'launch');const far=cinematicPose(8,1050,'launch');
 assert.ok(far.z<near.z);
 const globe=cinematicPose(8,3300,'launch');
 assert.ok(Math.abs(globe.x)+Math.abs(globe.y)+Math.abs(globe.z)>2);
});
test('ceremonial reveal uses three real illustrated cards with button-triggered flips',()=>{
 const roles=['Past','Present','Future'];
 const picks=DECK.slice(0,3).map(card=>({card,orientation:'upright'}));
 const base={state:{locale:'en',picks,revealedCards:[false,false,false]},t:en=>en,h:v=>String(v),eyebrow:v=>v,cardBack:()=>'<span class="back"></span>',cardFace:card=>'<img data-card-id="'+card.id+'">',description:()=>'',roleNames:()=>roles,btn:()=>'<button></button>'};
 const html=renderPhysicalReveal(base);
 assert.equal((html.match(/data-flip-card=/g)||[]).length,3);
 assert.equal((html.match(/data-card-id=/g)||[]).length,3);
 assert.doesNotMatch(html,/data-peek-card|data-peek-progress|data-action="peel"/);
 assert.match(html,/Past/);assert.match(html,/Present/);assert.match(html,/Future/);
 const revealed=renderPhysicalReveal({...base,state:{...base.state,revealedCards:[true,true,true]}});
 assert.equal((revealed.match(/is-flipped/g)||[]).length,3);
});
test('shuffle again is state-gated and leaves original 78-card deck unbiased',()=>{
 let s=createRitualSession();
 assert.throws(()=>transitionRitual(s,'RESHUFFLE'),/Illegal/);
 s=transitionRitual(s,'SUBMIT_QUESTION',{question:'Where am I headed?'});
 s=transitionRitual(s,'COLLAPSE_COMPLETE',{},500);
 s=transitionRitual(s,'MIN_SHUFFLE_ELAPSED',{},500+DEFAULT_SHUFFLE_MS);
 s=transitionRitual(s,'RESHUFFLE',{},10000);
 assert.equal(s.phase,'shuffle_ritual');
 assert.throws(()=>transitionRitual(s,'FINISH_SHUFFLING'),/Illegal/);
 assert.throws(()=>transitionRitual(s,'MIN_SHUFFLE_ELAPSED',{},13000),/minimum/);
 s=transitionRitual(s,'MIN_SHUFFLE_ELAPSED',{},10000+DEFAULT_SHUFFLE_MS);
 assert.equal(s.phase,'deck_formed');
 assert.equal(DECK.length,78);assert.equal(new Set(DECK.map(x=>x.id)).size,78);
});
test('UI uses video fidelity stages without changing AI/reading back-end contract',async()=>{
 const app=await readFile(new URL('../src/app.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../src/styles.css',import.meta.url),'utf8');
 const gl=await readFile(new URL('../src/webgl-sphere.mjs',import.meta.url),'utf8');
 const view=await readFile(new URL('../src/ritual-views.mjs',import.meta.url),'utf8');
 assert.match(app,/mountRitualCinema/);assert.match(app,/renderPhysicalReveal/);
 assert.match(app,/replayShuffle\(style\)/);assert.match(app,/LAUNCH_DURATION_MS/);
 assert.match(app,/case 'next-reveal':if\(allCardsRevealed/);
 assert.match(app,/state\.autoConfirmAt=null/); // Trio waits in foreground for explicit user confirmation
 assert.match(gl,/setHover\(id\)/);
 assert.match(gl,/v_halo/);
 assert.match(css,/rotateY\(180deg\)/);
 assert.match(view,/data-shuffle-style/);
 assert.doesNotMatch(app,/requestAiReading\s*\(/,'No new direct live AI calls');
});
