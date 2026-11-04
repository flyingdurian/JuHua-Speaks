import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {classifyQuestion,buildDemoReading,answerDemoFollowUp,DEMO_FOLLOWUPS} from '../src/demo-reading.mjs';
import {APP_VERSION} from '../src/version.mjs';
const picks=[DECK[0],DECK[17],DECK[11]].map((card,i)=>({card,orientation:i===1?'reversed':'upright'}));
const args={question:'Should I accept the new job offer or stay at my current company?',picks,options:['Accept the offer','Stay put'],lang:'en',spread:'crossroads',lens:'western'};

test('v0.7 is explicitly a scripted, completely local placeholder',async()=>{
 assert.match(APP_VERSION,/^\d+\.\d+\.\d+$/);
 const src=await readFile(new URL('../src/demo-reading.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(src,/fetch\s*\(|localStorage\s*\.|OPENAI_API_KEY|new WebSocket/);
 const app=await readFile(new URL('../src/app.mjs',import.meta.url),'utf8');
 assert.match(app,/SCRIPTED DEMO/);assert.match(app,/data-reading-beat/);assert.match(app,/demo-followup-form/);
});
test('scripted reading uses the exact question, choices, cards, orientations and perspective',()=>{
 const result=buildDemoReading(args);
 assert.equal(result.mode,'simulated-demo');assert.equal(result.cards.length,3);assert.match(result.summary,/new job offer/);
 assert.match(result.cards[0].position,/Accept the offer/);assert.match(result.cards[1].position,/Stay put/);
 assert.match(result.cards[1].text,/reversed/);assert.match(result.summary,/The Fool/);assert.match(result.summary,/The Star/);
 assert.equal(result.nextSteps.length,2);assert.equal(result.topicId,'career');
 const different=buildDemoReading({...args,question:'How should I repair this relationship?' });
 assert.notEqual(result.summary,different.summary);assert.equal(different.topicId,'relationship');
 assert.notEqual(result.cards[0].text,different.cards[0].text);
});
test('Chinese and cultural lens are distinct settings',()=>{
 const zh=buildDemoReading({...args,lang:'zh',lens:'chinese',question:'我应该换工作吗？'});
 assert.match(zh.summary,/我应该换工作/);assert.match(zh.summary,/《易经》/);
 assert.match(zh.cards[0].text,/愚者/);assert.ok(DEMO_FOLLOWUPS.zh.length>=3);
 const neutral=buildDemoReading({...args,lens:'universal'});assert.notEqual(neutral.summary,buildDemoReading(args).summary);
 assert.equal(classifyQuestion('Could I manage my debt?').id,'money');
});
test('simulated follow-up remembers original question, cards and previous turns',()=>{
 const reading=buildDemoReading(args);
 const r=answerDemoFollowUp({reading,question:'Can you compare both paths?'});
 assert.equal(r.mode,'scripted-demo');assert.equal(r.intent,'compare');assert.match(r.text,/Accept the offer/);assert.match(r.text,/Stay put/);
 assert.match(answerDemoFollowUp({reading,question:'What should I verify?'}).text,/predict the result/);
 assert.match(answerDemoFollowUp({reading,question:'The Star'}).text,/The Star/);
 assert.equal(answerDemoFollowUp({reading,question:'What next?',history:[r]}).turn,2);
});
test('strict dummy input validation and no accidental real service activation',async()=>{
 assert.throws(()=>buildDemoReading({...args,picks:[picks[0],picks[0],picks[2]]}),/distinct/);
 assert.throws(()=>buildDemoReading({...args,question:'?'}),/Question/);
 assert.throws(()=>buildDemoReading({...args,lens:'mystic'}),/perspective/);
 const reading=buildDemoReading(args);
 assert.throws(()=>answerDemoFollowUp({reading,question:'x'}),/2–280/);
 assert.throws(()=>answerDemoFollowUp({reading,question:'more',history:Array(13).fill({})}),/Too many/);
 const app=await readFile(new URL('../src/app.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(app,/requestAiReading\s*\(/);
});
