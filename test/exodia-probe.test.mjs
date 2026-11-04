import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const probe=fileURLToPath(new URL('../scripts/test-exodia-api.mjs',import.meta.url));

async function mockExodia({fail=false}={}){
 const calls=[];
 let polls=0;
 const server=createServer((request,response)=>{
  const path=request.url;
  calls.push({method:request.method,path,time:Date.now()});
  const send=(status,body,kind='application/json')=>{
   response.writeHead(status,{'Content-Type':kind});
   response.end(kind==='application/json'?JSON.stringify(body):body);
  };
  if(path==='/api/docs')return send(200,'<html><title>Swagger UI</title></html>','text/html');
  if(path==='/openapi.json')return send(200,{paths:{'/api/command/tasks':{get:{},post:{}}}});
  if(path==='/api/command/tasks'&&request.method==='POST'){
   let body='';
   request.on('data',chunk=>body+=chunk);
   request.on('end',()=>{
    const payload=JSON.parse(body);
    assert.equal(payload.model_choice,'chatgpt');
    assert.equal(payload.web_research,false);
    assert.match(payload.prompt,/The Fool/);
    return send(201,{id:'mock-exodia-01'});
   });
   return;
  }
  if(path==='/api/command/tasks'&&request.method==='GET'){
   polls++;
   return send(200,{tasks:[{id:'mock-exodia-01',state:polls===1?'waiting_for_reply':fail?'failed':'answered',
    error:fail?'Simulated generation failed':null,
    answer:'The Fool (Path A), Two of Cups (Path B), and The Hermit (Guidance) suggest reflection. 简体中文：愚者、圣杯二、隐者分别提示不同的选择。',
    metrics:{total_s:1.2}}]});
  }
  return send(404,{error:'Unexpected path'});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const {port}=server.address();
 return {url:'http://127.0.0.1:'+port,calls,close:()=>new Promise(resolve=>server.close(resolve))};
}

async function runProbe(url,extraArgs=[]){
 return new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[probe,...extraArgs],{
   env:{...process.env,EXODIA_URL:url,EXODIA_TEST_INTERVAL_MS:'10',
    EXODIA_TEST_POLL_INTERVAL_MS:'25',EXODIA_TEST_REQUEST_TIMEOUT_MS:'3000',EXODIA_TEST_TIMEOUT_MS:'6000'}
  });
  let output='';
  child.stdout.on('data',chunk=>output+=chunk);
  child.stderr.on('data',chunk=>output+=chunk);
  const timer=setTimeout(()=>{child.kill();reject(new Error('Mock probe timed out: '+output))},7000);
  child.on('error',error=>{clearTimeout(timer);reject(error)});
  child.on('close',code=>{clearTimeout(timer);resolve({code,output})});
 });
}

test('contract-only dry-run makes no generation POST',async()=>{
 const server=await mockExodia();
 try{
  const result=await runProbe(server.url,['--dry-run']);
  assert.equal(result.code,0,result.output);
  assert.match(result.output,/Dry run complete/);
  assert.deepEqual(server.calls.map(x=>x.path),['/api/docs','/openapi.json']);
 }finally{await server.close()}
});

test('live mock submits exactly one generation POST, then safely polls status GET',async()=>{
 const server=await mockExodia();
 try{
  const result=await runProbe(server.url);
  assert.equal(result.code,0,result.output);
  assert.match(result.output,/Compatibility result: PASS/);
  const posts=server.calls.filter(x=>x.method==='POST');
  assert.equal(posts.length,1,'Never resubmit a generation automatically');
  const polls=server.calls.filter(x=>x.method==='GET'&&x.path==='/api/command/tasks');
  assert.equal(polls.length,2);
  assert.ok(polls[1].time-polls[0].time>=15,'GET polling should be sequential and paced');
 }finally{await server.close()}
});

test('failed task exits without a second POST',async()=>{
 const server=await mockExodia({fail:true});
 try{
  const result=await runProbe(server.url);
  assert.notEqual(result.code,0);
  assert.match(result.output,/Compatibility result: FAIL/);
  assert.equal(server.calls.filter(x=>x.method==='POST').length,1);
 }finally{await server.close()}
});
