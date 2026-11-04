import test from 'node:test';
import assert from 'node:assert/strict';
import {DECK} from '../src/deck.mjs';
import {sphereLayout,SPHERE_RADIUS,rotatePoint,projectPoint,pickSphereCard} from '../src/webgl-sphere.mjs';
import {normalizeReadingRequest,validateAiReading} from '../src/reading-contract.mjs';
import {requestAiReading,configuredAiEndpoint} from '../src/ai-client.mjs';
import worker from '../worker/index.mjs';
const input={question:'Should I take the design role or stay at my current company?',options:['Accept design job','Stay'],spread:'crossroads',lens:'chinese',locale:'en',deckId:'rws',picks:[{id:DECK[0].id,orientation:'upright'},{id:DECK[12].id,orientation:'reversed'},{id:DECK[19].id,orientation:'upright'}]};
const sample={summary:'The Fool invites an exploration of the new role, while The Hanged Man reversed suggests checking why staying feels more secure. The Sun points toward asking for concrete terms before choosing.',cards:[{id:DECK[0].id,interpretation:'The new job could be an opening to learn, but check the team and compensation.',evidenceQuestion:'What does the role actually involve day-to-day?'},{id:DECK[12].id,interpretation:'Staying may feel safer, though it could delay a change you have been considering.',evidenceQuestion:'What specifically would improve if you stayed six months?'},{id:DECK[19].id,interpretation:'The Sun encourages asking directly about expectations rather than assuming a positive outcome.',evidenceQuestion:'Which answer would make your choice more informed?'}],reflection:'Which concrete working conditions need verification before deciding?',nextSteps:['Ask for the job description in writing.','Discuss career development with your current manager.']};
test('GPU sphere positions and perspective are stable for 78 unique faces',()=>{
 const layout=sphereLayout();assert.equal(layout.length,78);
 for(const p of layout){assert.ok(Math.abs(Math.hypot(...p.center)-SPHERE_RADIUS)<1e-8);assert.ok(Math.abs(Math.hypot(...p.normal)-1)<1e-8)}
 assert.throws(()=>sphereLayout(1));
 const a=rotatePoint([1,0,0],0,Math.PI/2);assert.ok(Math.abs(a[0])<1e-10);assert.ok(Math.abs(a[2]+1)<1e-10);
 const projected=projectPoint([0,0,2],800,420);assert.equal(projected.x,400);assert.equal(projected.y,210);
 const visible=layout.findIndex(p=>p.normal[2]>.6);assert.ok(visible>=0);
 const c=projectPoint(layout[visible].center,800,420);const ids=layout.map((_,i)=>`id${i}`);
 const picked=pickSphereCard(layout,ids,new Set(),0,0,c.x,c.y,800,420);assert.ok(picked,'Hit testing must select a front-facing card');
 const excluded=new Set(ids);assert.equal(pickSphereCard(layout,ids,excluded,0,0,c.x,c.y,800,420),null);
});
test('reading request strictly validates IDs, lens, three distinct cards and deck license',()=>{
 const valid=normalizeReadingRequest(input);assert.equal(valid.cards[0].name,'The Fool');assert.equal(valid.cards[0].position,'Path A');
 assert.equal(valid.cards[1].meaning,DECK[12].reversed);assert.equal(valid.deckId,'rws');
 assert.throws(()=>normalizeReadingRequest({...input,deckId:'chinese-tarot'}),/not enabled/);
 assert.throws(()=>normalizeReadingRequest({...input,picks:[input.picks[0],input.picks[0],input.picks[2]]}),/Duplicate/);
 assert.throws(()=>normalizeReadingRequest({...input,lens:'telepathy'}),/Unknown/);
 assert.throws(()=>normalizeReadingRequest({...input,question:' x '}),/Question/);
 assert.throws(()=>normalizeReadingRequest({...input,picks:[{id:'made-up',orientation:'upright'},...input.picks.slice(1)]}),/Invalid card/);
});
test('AI interpretation must return matching selected IDs in order and meaningful text',()=>{
 const v=normalizeReadingRequest(input);const res=validateAiReading(sample,v);assert.equal(res.mode,'ai');assert.equal(res.cards.length,3);
 assert.throws(()=>validateAiReading({...sample,cards:[sample.cards[1],sample.cards[0],sample.cards[2]]},v),/does not match/);
 assert.throws(()=>validateAiReading({...sample,summary:'generic'},v),/Malformed/);
});
test('AI frontend is strictly opt-in and requires configured HTTPS URL',async()=>{
 assert.equal(configuredAiEndpoint({querySelector(){return {content:''}}}),null);
 assert.equal(configuredAiEndpoint({querySelector(){return {content:'http://example.com/api/reading'}}}),null);
 assert.equal(configuredAiEndpoint({querySelector(){return {content:'https://example.com/api/reading'}}}),'https://example.com/api/reading');
 let seen;
 const result=await requestAiReading('https://api.example.com/api/reading',input,{fetcher:async (url,opts)=>{seen=JSON.parse(opts.body);return {ok:true,json:async()=>({reading:sample})}}});
 assert.equal(result.cards[0].id,input.picks[0].id);assert.equal(seen.question,input.question);assert.equal(seen.picks.length,3);
 assert.equal(Object.hasOwn(seen.picks[0],'meaning'),false);
});
test('AI Worker refuses unconfigured callers before any provider traffic',async()=>{
 const url='https://example.test/api/reading',origin='https://flyingdurian.github.io';
 const body=JSON.stringify(input);
 const invalidOrigin=await worker.fetch(new Request(url,{method:'POST',headers:{Origin:'https://evil.invalid','Content-Type':'application/json'},body}),{ALLOWED_ORIGIN:origin});assert.equal(invalidOrigin.status,403);
 const missingSecret=await worker.fetch(new Request(url,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body}),{ALLOWED_ORIGIN:origin});assert.equal(missingSecret.status,503);
 const blocked=await worker.fetch(new Request(url,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body}),{ALLOWED_ORIGIN:origin,OPENAI_API_KEY:'private',AI_RATE_LIMITER:{limit:async()=>({success:false})}});assert.equal(blocked.status,429);
});
test('Worker forwards validated question, requests strict JSON, disables provider storage',async()=>{
 const origFetch=globalThis.fetch;let sent;
 globalThis.fetch=async(url,options)=>{sent=JSON.parse(options.body);return new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(sample)}]}]}),{status:200,headers:{'Content-Type':'application/json'}})};
 try{const origin='https://flyingdurian.github.io';const res=await worker.fetch(new Request('https://example.test/api/reading',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(input)}),{ALLOWED_ORIGIN:origin,OPENAI_API_KEY:'private',OPENAI_MODEL:'gpt-4.1-mini',AI_RATE_LIMITER:{limit:async()=>({success:true})}});
 assert.equal(res.status,200);const data=await res.json();assert.equal(data.reading.mode,'ai');assert.equal(sent.store,false);assert.equal(sent.text.format.type,'json_schema');assert.match(sent.input[1].content,/design role/);
 }finally{globalThis.fetch=origFetch}
});
