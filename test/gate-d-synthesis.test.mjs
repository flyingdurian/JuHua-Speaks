import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK,BY_ID} from '../src/deck.mjs';
import {drawOneGuidance} from '../preview/post-shuffle/SynthesisController.mjs';
import {SYNTHESIS_STATES,renderSynthesisChat,demoSynthesis,demoGuidance}
 from '../preview/post-shuffle/SynthesisChat.mjs';
import {buildExodiaPrompt} from '../scripts/exodia-local.mjs';

const locked=[{id:DECK[0].id,orientation:'upright'},
 {id:DECK[1].id,orientation:'reversed'},{id:DECK[2].id,orientation:'upright'}];
const question='How can I find clarity in the decision ahead?';
const reading={cards:locked.map((c,i)=>({name:BY_ID.get(c.id).name,
 position:['Past','Present','Future'][i],meaning:BY_ID.get(c.id)[c.orientation]})),
 reflection:'What can you verify about the choices you can influence?'};
test('One guidance card never overwrites or repeats the original three',()=>{
 const snapshot=JSON.stringify(locked);
 const draw=drawOneGuidance(locked,()=>0,()=> 'reversed');
 assert.ok(BY_ID.has(draw.id));
 assert.ok(!locked.some(c=>c.id===draw.id));
 assert.equal(draw.orientation,'reversed');
 assert.equal(draw.meaning,BY_ID.get(draw.id).reversed);
 assert.equal(JSON.stringify(locked),snapshot);
 assert.throws(()=>drawOneGuidance(locked,()=>999),/Invalid guidance draw/);
});
test('Chat states escape original question, response and follow-up without HTML injection',()=>{
 const malicious='<img src=x onerror=alert(1)>';
 for(const state of SYNTHESIS_STATES){
  const html=renderSynthesisChat({question:question+malicious,status:state,response:malicious,
   avatar:'../../assets/artemis/artemis_warm_welcome.webp'});
  assert.match(html,/Unified Reading/);
  assert.match(html,/Your Question/);
  assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.ok(!html.includes(malicious));
  assert.match(html,/SYNTHESIZED INTERPRETATION/);
 }
 assert.throws(()=>renderSynthesisChat({status:'impossible'}),/state/);
});
test('Scripted fallback explicitly identifies itself and uses all three original meanings',()=>{
 const narrative=demoSynthesis({question,reading});
 for(const card of reading.cards)assert.ok(narrative.includes(card.name));
 assert.ok(narrative.includes(question));
 const html=renderSynthesisChat({question,status:'ready',response:narrative});
 assert.match(html,/SCRIPTED PREVIEW/);
 assert.match(html,/Draw Guidance Card &amp; Ask Follow-up/);
 const card=DECK[4],text=demoGuidance({card,orientation:'upright',question:'What next?',reading});
 assert.match(text,/What next/);assert.match(text,new RegExp(card.name));
});
test('Local Exodia prompt validates exactly ONE additional guidance card against original three',()=>{
 const context={question,options:['',''],spread:'insight',lens:'western',locale:'en',deckId:'rws',picks:locked};
 const base={kind:'followup',context,followup:'What should I consider?',initialReading:'A sufficiently long initial reading that addresses the three cards and question.',history:[]};
 const good=buildExodiaPrompt({...base,guidanceCard:{id:DECK[4].id,orientation:'upright'}});
 assert.match(good,/Artemis/);assert.match(good,/ONE newly drawn guidance card/);
 assert.match(good,new RegExp(DECK[4].name));
 assert.throws(()=>buildExodiaPrompt({...base,guidanceCard:locked[0]}),/distinct/);
 assert.throws(()=>buildExodiaPrompt({...base,guidanceCard:{id:'invented',orientation:'upright'}}),/valid/);
});
test('The final interpretation CTA triggers a real synthesis phase, never another scripted chapter',async()=>{
 const scene=await readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/post-shuffle/reading-polish-v4.css',import.meta.url),'utf8');
 const server=await readFile(new URL('../scripts/serve-gate-a.mjs',import.meta.url),'utf8');
 assert.match(scene,/if\(readingChapter===3\)/);
 assert.match(scene,/synthesis\?\.start\(\)/);
 assert.match(css,/data-phase="sacrificing"/);
 assert.match(css,/gateDSacrificeCenter/);
 assert.match(css,/reading-chat-hud/);
 assert.match(css,/overflow-wrap:break-word/);
 assert.match(server,/localApi/);
 assert.match(server,/origin/);
 assert.match(server,/1200/);
});

test('Original question stays outside scrolling chat log after guidance is drawn',()=>{
 const html=renderSynthesisChat({question,status:'guidance',response:'Sufficient response',
  guidance:{id:DECK[4].id,name:DECK[4].name,orientation:'upright',meaning:DECK[4].upright}});
 const questionPos=html.indexOf('class="synthesis-question"');
 const scrollPos=html.indexOf('class="synthesis-chat-scroll"');
 assert.ok(questionPos>=0&&scrollPos>questionPos);
 assert.match(html,/guidance-followup-form/);
 assert.ok(html.indexOf('class="synthesis-chat-actions"') < html.indexOf('class="synthesis-followup-form"'));
 assert.ok(html.indexOf('class="synthesis-followup-form"') > html.indexOf('</div></div>'));
});
