import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {setTimeout as wait} from 'node:timers/promises';
import {DECK,shuffleDeck} from '../src/deck.mjs';
import {GATE_B_HANDOFF_KEY,createGateBHandoff,parseGateBHandoff,resumeGateBAtSphere} from '../src/gate-b-handoff.mjs';
import {transitionRitual} from '../src/ritual-machine.mjs';
const at=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('complete 78-card Gate B deck enters sphere without an invisible second shuffle',()=>{
 const issuedAt=Date.now();
 const shuffled=shuffleDeck().map(c=>c.id);
 const pack=createGateBHandoff({question:'How can I navigate the decision ahead?',orderedCardIds:shuffled,issuedAt});
 assert.equal(pack.cardIds.length,78);
 assert.deepEqual(pack.cardIds,shuffled);
 const recovered=parseGateBHandoff(JSON.stringify(pack),issuedAt+3000);
 assert.deepEqual(recovered.cardIds,shuffled);
 const ritual=resumeGateBAtSphere(recovered,issuedAt+3000);
 assert.equal(ritual.phase,'sphere_selection');
 assert.equal(ritual.question,pack.question);
 assert.deepEqual(ritual.selected,[]);
 const chosen=transitionRitual(ritual,'TOGGLE_CARD',{cardId:shuffled[0],orientation:'upright'});
 assert.deepEqual(chosen.selected.map(x=>x.cardId),[shuffled[0]]);
});
test('handoff enforces one full distinct deck, valid question, and maximum age',()=>{
 const atTime=Date.now();
 const ids=DECK.map(c=>c.id);
 const good=createGateBHandoff({question:'A meaningful question?',orderedCardIds:ids,issuedAt:atTime});
 assert.throws(()=>createGateBHandoff({question:'x',orderedCardIds:ids,issuedAt:atTime}),/Question/);
 assert.throws(()=>createGateBHandoff({question:good.question,orderedCardIds:[...ids.slice(1),ids[1]],issuedAt:atTime}),/78 unique/);
 assert.throws(()=>parseGateBHandoff(JSON.stringify({...good,cardIds:ids.slice(0,77)}),atTime),/78 unique/);
 assert.throws(()=>parseGateBHandoff(JSON.stringify({...good,version:5}),atTime),/Unsupported/);
 assert.throws(()=>parseGateBHandoff(JSON.stringify(good),atTime+16*60*1000),/Expired/);
 assert.throws(()=>parseGateBHandoff('not json',atTime),/JSON/);
 assert.match(GATE_B_HANDOFF_KEY,/juhua:gate-b-reveal/);
});
test('Gate B preview is wired to the same-tab private selection and Artemis stage',async()=>{
 const [preview,app,server,markup]=await Promise.all([
  at('preview/gate-b/gate-b.mjs'),at('src/app.mjs'),
  at('scripts/serve-gate-a.mjs'),at('ritual.html')]);
 assert.match(preview,/sessionStorage\.setItem\(GATE_B_HANDOFF_KEY/);
 assert.match(preview,/mountPostShuffle/);
 assert.match(preview,/deckIds:selectionOrder/);
 assert.doesNotMatch(preview,/iframe|window\.location\.assign/);
 assert.match(app,/sessionStorage\.removeItem\(GATE_B_HANDOFF_KEY\)/);
 assert.match(app,/resumeGateBAtSphere\(incomingGateB\)/);
 assert.match(app,/incomingGateB\?3:incomingGateQuestion\?1:0/);
 assert.match(app,/renderArtemisInvitation/);
 assert.match(server,/pathname==='\/ritual\.html'/);
 assert.match(markup,/src="\.\/src\/app\.mjs"/);
 assert.doesNotMatch(preview,/Gate B complete\./);
 assert.doesNotMatch(preview,/shuffle-only visual gate/);
});
test('actual Gate B preview HTTP server serves ritual app and necessary ESM dependencies',async t=>{
 const port=24000+process.pid%5000,endpoint='http://127.0.0.1:'+port;
 const child=spawn(process.execPath,['scripts/serve-gate-b.mjs'],{
  cwd:new URL('../',import.meta.url),env:{...process.env,GATE_B_PORT:String(port)},stdio:'ignore'});
 t.after(()=>child.kill('SIGTERM'));
 let ready=false;
 for(let k=0;k<70;k++){
  if(child.exitCode!==null)break;
  try{if((await fetch(endpoint+'/preview/gate-b/')).status===200){ready=true;break}}catch{}
  await wait(75);
 }
 assert.ok(ready,'Gate B preview server must start');
 for(const url of ['/ritual.html','/src/app.mjs','/src/gate-b-handoff.mjs','/src/artemis-stage.mjs','/src/styles.css']){
  const response=await fetch(endpoint+url);
  assert.equal(response.status,200,'Required continuation route: '+url);
  assert.ok((await response.text()).length>100);
 }
 for(const url of ['/scripts/serve.mjs','/src/../scripts/serve.mjs']){
  const response=await fetch(endpoint+url);
  assert.equal(response.status,404,'Private script must stay blocked: '+url);
 }
});
