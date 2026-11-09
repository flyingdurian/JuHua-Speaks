import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {ARTEMIS_PHASES,ARTEMIS_PORTRAITS,createArtemisSession,artemisTransition,portraitForPhase,chooseGuidanceCard} from '../preview/artemis/ArtemisMachine.mjs';
import {portraitExpression,artemisPortraitSvg} from '../preview/artemis/ArtemisPortrait.mjs';

const picks=DECK.slice(0,3).map(c=>({id:c.id,orientation:'upright'}));
const enter=()=>createArtemisSession({picks,question:'How do I move forward?'});
test('Artemis: ten explicitly guarded phases with sixteen stable portrait states',()=>{
 assert.equal(ARTEMIS_PHASES.length,10);
 assert.equal(new Set(ARTEMIS_PORTRAITS).size,16);
 assert.equal(portraitForPhase('reading_loading'),'invocation');
 for(const id of ARTEMIS_PORTRAITS){
  assert.ok(portraitExpression(id));
  const svg=artemisPortraitSvg(id);
  assert.match(svg,/<svg/);assert.match(svg,/<path/);assert.match(svg,/Artemis — /);
 }
 assert.throws(()=>artemisPortraitSvg('invented'),/Unknown/);
});
test('Artemis: exactly 3 immutable authentic cards, no resampling, proper order and orientation',()=>{
 const session=enter();
 assert.equal(session.phase,'intro');
 assert.ok(Object.isFrozen(session)&&Object.isFrozen(session.picks));
 assert.deepEqual(session.picks.map(c=>c.id),picks.map(c=>c.id));
 assert.throws(()=>createArtemisSession({picks:picks.slice(0,2)}),/three distinct/);
 assert.throws(()=>createArtemisSession({picks:[picks[0],picks[0],picks[1]]}),/three distinct/);
 assert.throws(()=>createArtemisSession({picks,locale:'xx'}),/language/);
});
test('Artemis: valid reading through intro, welcome, preparation and loading',()=>{
 let s=enter();
 assert.throws(()=>artemisTransition(s,'reading_present'),/Illegal/);
 for(const phase of ['welcome','reading_prepare','reading_loading'])s=artemisTransition(s,phase);
 assert.equal(s.portrait,'invocation');
 assert.throws(()=>artemisTransition(s,'reading_present'),/complete three-card reading/);
 const reading={summary:'Reflective main reading',cards:picks.map(({id})=>({id}))};
 s=artemisTransition(s,'reading_present',{reading});
 assert.deepEqual(s.picks.map(c=>c.id),picks.map(c=>c.id));
 assert.equal(s.portrait,'explaining');
 s=artemisTransition(s,'guidance_offer');
 assert.equal(s.portrait,'presenting');
 s=artemisTransition(s,'guidance_draw');
 assert.equal(s.portrait,'focused');
 const guidance=chooseGuidanceCard(DECK,picks,()=>0);
 assert.equal(guidance.id,DECK[3].id);
 s=artemisTransition(s,'guidance_result',{guidance});
 assert.equal(s.guidance.id,DECK[3].id);
 s=artemisTransition(s,'followup_idle');
 s=artemisTransition(s,'followup_response',{followup:{question:'What next?',answer:'Check the available options.'}});
 assert.equal(s.followups.length,1);assert.equal(s.portrait,'reassuring');
 assert.throws(()=>artemisTransition(s,'guidance_draw'),/Illegal/);
});
test('Artemis: guidance draw samples only 75 original remaining cards',()=>{
 const chosen=chooseGuidanceCard(DECK,picks,n=>n-1);
 assert.equal(chosen.id,DECK.at(-1).id);assert.equal(chosen.orientation,'reversed');
 assert.throws(()=>chooseGuidanceCard(DECK,picks,()=>75),/secure guidance/);
 assert.throws(()=>chooseGuidanceCard(DECK,picks.slice(0,2),()=>0),/75 unselected/);
});
test('Artemis: review is same-document, local-only, bilingual and source-asset preserving',async()=>{
 const scene=await readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8');
 const stage=await readFile(new URL('../preview/artemis/ArtemisStage.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/artemis/artemis.css',import.meta.url),'utf8');
 const server=await readFile(new URL('../scripts/serve-gate-a.mjs',import.meta.url),'utf8');
 assert.match(scene,/onRevealed:\(\{allRevealed\}\)/);
 assert.match(scene,/mountArtemisStage\(\{mount:world,picks:choices,question,locale\}\)/);
 assert.match(stage,/buildDemoReading/);
 assert.match(stage,/answerDemoFollowUp/);
 assert.match(stage,/Scripted preview/);
 assert.match(stage,/脚本演示/);
 assert.match(stage,/assets\/rws\//);
 assert.match(stage,/chooseGuidanceCard\(DECK,state\.picks,secureRandomInt\)/);
 assert.doesNotMatch(stage,/fetch\(/);
 assert.match(css,/\.artemis-stage-v1/);
 assert.match(server,/preview\/artemis/);
});
