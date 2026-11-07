import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderArtemisInvitation,renderArtemisTable} from '../src/artemis-stage.mjs';
import {makeLandingCardEntities} from '../src/ritual-world/OrbitalField.mjs';
import {DECK} from '../src/deck.mjs';
import {samplePhysicalShuffle,deckPose,assertShuffleGeometry} from '../src/ritual-world/ShuffleChoreography.mjs';

const cards=makeLandingCardEntities(DECK,2165840022);
const context={state:{picks:[0,1,2].map(i=>({card:DECK[i],orientation:i===1?'reversed':'upright'})),revealedCards:[true,true,true]},
 t:(en)=>en,h:s=>String(s),eyebrow:s=>s,cardFace:c=>'<img data-card-id="'+c.id+'">',description:()=>'<span>question</span>',
 roleNames:()=>['Past','Present','Future'],btn:(id,txt)=>'<button data-action="'+id+'">'+txt+'</button>'};
test('Phase 8.2 requires authentic revealed trio before invoking Artemis',()=>{
 const html=renderArtemisInvitation(context);
 assert.match(html,/data-action="invite-reader"/);
 for(const p of context.state.picks)assert.ok(html.includes('data-card-id="'+p.card.id+'"'));
 const wrong={...context,state:{...context.state,revealedCards:[true,false,true]}};
 assert.throws(()=>renderArtemisInvitation(wrong),/Three revealed/);
 const table=renderArtemisTable(context);
 assert.match(table,/ARTEMIS/);
 assert.equal((table.match(/data-card-id/g)||[]).length,3);
});
test('all three optional shuffles preserve finite full 78-card geometry',()=>{
 for(const style of ['cosmic','riffle','wash']){
  assert.equal(assertShuffleGeometry(cards,{style,landingAt:7,worldTime:17}),true);
  const poses=cards.map(card=>samplePhysicalShuffle(card,{style,age:2.4,landingAt:7,worldTime:17}));
  assert.equal(poses.length,78);
  assert.equal(new Set(poses.map(p=>p.position.join(','))).size,78);
  assert.ok(poses.every(p=>p.attitude.normal.every(Number.isFinite)));
  for(const card of cards)assert.deepEqual(samplePhysicalShuffle(card,{style,age:5.9,landingAt:7,worldTime:17}),deckPose(card,17));
 }
});
test('existing reducer invitation is not implicitly skipped by UI',async()=>{
 const app=await readFile(new URL('../src/app.mjs',import.meta.url),'utf8');
 const reveal=await readFile(new URL('../src/physical-reveal.mjs',import.meta.url),'utf8');
 assert.match(app,/renderArtemisInvitation/);
 assert.match(app,/case 'invite-reader'/);
 assert.match(app,/phase==='reader_invitation'/);
 assert.match(reveal,/data-peek-progress/);
 assert.doesNotMatch(app,/ALL_REVEALED'\);state\.ritual=transitionRitual\(state\.ritual,'INVITE_READER'/);
});
