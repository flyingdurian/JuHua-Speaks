import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createLocalExodiaAdapter,buildExodiaPrompt} from '../scripts/exodia-local.mjs';
import {isLocalJuHua,discoverLocalExodia,sendLocalExodia} from '../src/local-exodia-client.mjs';
const context={question:'Should I accept the new job offer?',options:['Accept new job','Stay here'],spread:'crossroads',lens:'western',locale:'en',deckId:'rws',picks:[{id:'major-00',orientation:'upright'},{id:'cups-02',orientation:'upright'},{id:'major-09',orientation:'reversed'}]};
const original='The Fool invites a new beginning; Two of Cups asks for mutual understanding; The Hermit suggests measured reflection and checking facts before deciding.';
const loc={protocol:'http:',hostname:'127.0.0.1',port:'4173'};

test('Exodia prompt validates exact three-card spread and complete follow-up history',()=>{
 const reading=buildExodiaPrompt({kind:'reading',context});
 assert.match(reading,/The Fool/);assert.match(reading,/Two of Cups/);assert.match(reading,/The Hermit/);
 assert.match(reading,/Accept new job/);assert.match(reading,/Stay here/);
 const follow=buildExodiaPrompt({kind:'followup',context,followup:'What should I verify?',initialReading:original,history:[{question:'Compare both paths',answer:'The paths differ in readiness and commitments.'}]});
 assert.match(follow,/Your next task is a FOLLOW-UP/);
 assert.match(follow,/Original reading:/);assert.match(follow,/Compare both paths/);assert.match(follow,/What should I verify/);
 assert.throws(()=>buildExodiaPrompt({kind:'reading',context:{...context,deckId:'chinese-tarot'}}),/not enabled/);
 assert.throws(()=>buildExodiaPrompt({kind:'followup',context,followup:'?',initialReading:original}),/follow-up/);
});
test('one generation at a time; five second gap between generations; task polling stays sequential',async()=>{
 let time=0,created=0,active=0,peak=0;
 const calls=[];
 const fetcher=async(url,opts={})=>{
  active++;peak=Math.max(peak,active);
  calls.push({time,method:opts.method||'GET',url,body:opts.body||''});
  try{
   if(opts.method==='POST')return new Response(JSON.stringify({id:'t'+(++created)}),{status:201});
   return new Response(JSON.stringify({tasks:[{id:'t'+created,state:'answered',answer:original,metrics:{total_s:2}}]}),{status:200});
  }finally{active--}
 };
 const adapter=createLocalExodiaAdapter({fetcher,now:()=>time,sleep:async ms=>{time+=ms;},cooldownMs:5000,pollMs:1500});
 const first=await adapter.generate({kind:'reading',context});
 assert.equal(first.answer,original);assert.equal(adapter.status().busy,false);
 const second=await adapter.generate({kind:'followup',context,followup:'And what next?',initialReading:original,history:[]});
 assert.equal(second.kind,'followup');
 const posts=calls.filter(c=>c.method==='POST');
 assert.equal(posts.length,2);
 assert.ok(posts[1].time-posts[0].time>=5000);
 assert.equal(peak,1);
 assert.match(posts[1].body,/Original reading/);
 assert.ok(calls.filter(c=>c.method==='GET').length>=2);
});
test('second generation is rejected while task is pending, not silently queued or duplicated',async()=>{
 let release;
 const gate=new Promise(resolve=>{release=resolve});
 let posts=0;
 const fetcher=async(url,opts={})=>{
  if(opts.method==='POST'){posts++;await gate;return new Response(JSON.stringify({id:'task-1'}),{status:201});}
  return new Response(JSON.stringify({tasks:[{id:'task-1',state:'answered',answer:original}]}),{status:200});
 };
 const adapter=createLocalExodiaAdapter({fetcher,sleep:async()=>{},now:()=>1000});
 const active=adapter.generate({kind:'reading',context});
 assert.equal(adapter.status().busy,true);
 await assert.rejects(adapter.generate({kind:'reading',context}),e=>e.status===429);
 release();await active;assert.equal(posts,1);
});
test('local URL restriction prevents remote Exodia exposure',()=>{
 assert.throws(()=>createLocalExodiaAdapter({baseUrl:'https://evil.example'}),/loopback/);
 assert.throws(()=>createLocalExodiaAdapter({baseUrl:'http://192.168.1.3:8765'}),/loopback/);
 assert.equal(isLocalJuHua(loc),true);
 assert.equal(isLocalJuHua({...loc,hostname:'flyingdurian.github.io',protocol:'https:'}),false);
});
test('browser client only uses same-origin JuHua proxy, never calls Exodia directly',async()=>{
 const no=await discoverLocalExodia({loc:{protocol:'https:',hostname:'flyingdurian.github.io'},fetcher:()=>{throw Error('Must not fetch')}});
 assert.equal(no,null);
 const calls=[];
 const fake=async(url,opts={})=>{
  calls.push({url,opts});
  if(url.endsWith('/status'))return new Response(JSON.stringify({available:true,service:'local-only',cooldownMs:5000}),{status:200});
  return new Response(JSON.stringify({mode:'exodia-local',answer:original}),{status:200});
 };
 const status=await discoverLocalExodia({loc,fetcher:fake});
 assert.equal(status.cooldownMs,5000);
 const result=await sendLocalExodia({kind:'reading',context},{loc,fetcher:fake});
 assert.equal(result.answer,original);
 assert.deepEqual(calls.map(c=>c.url),['/api/local-exodia/status','/api/local-exodia/reading']);
 assert.equal(calls[1].opts.headers['X-JuHua-Local-Client'],'1');
 await assert.rejects(sendLocalExodia({kind:'reading',context},{loc:{protocol:'https:',hostname:'flyingdurian.github.io'},fetcher:fake}),/local JuHua/);
});
test('local server checks same origin and does not serve private scripts',async()=>{
 const server=await readFile(new URL('../scripts/serve.mjs',import.meta.url),'utf8');
 const app=await readFile(new URL('../src/app.mjs',import.meta.url),'utf8');
 assert.match(server,/origins\.has\(req\.headers\.origin\)/);
 assert.match(server,/x-juhua-local-client/);
 assert.match(server,/path\.startsWith\('\/src\/'\)/);
 assert.match(app,/localExodiaPanel/);
 assert.match(app,/discoverLocalExodia\(\)/);
 assert.match(app,/state\.localMode==='exodia'/);
});
