import {normalizeReadingRequest} from '../src/reading-contract.mjs';

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const supportedHosts=new Set(['127.0.0.1','localhost','[::1]']);
const error=(message,status=502)=>Object.assign(new Error(message),{status});

export function buildExodiaPrompt({kind,context,followup='',initialReading='',history=[]}){
 const normalized=normalizeReadingRequest(context);
 if(!['reading','followup'].includes(kind))throw error('Unsupported reading operation',400);
 if(kind==='followup'){
  if(typeof followup!=='string'||followup.trim().length<2||followup.length>280)throw error('Invalid follow-up question',400);
  if(typeof initialReading!=='string'||initialReading.length<30||initialReading.length>12000)throw error('Original reading is required for follow-up',400);
  if(!Array.isArray(history)||history.length>8||history.some(turn=>typeof turn?.question!=='string'||turn.question.length>280||typeof turn?.answer!=='string'||turn.answer.length>6000))throw error('Invalid conversation history',400);
 }
 const details={
  locale:normalized.locale==='zh'?'Simplified Chinese':'English',
  question:normalized.question,
  spread:normalized.spread,
  perspective:normalized.lens,
  options:normalized.options,
  cards:normalized.cards.map(card=>({id:card.id,position:card.position,name:card.name,chineseName:card.zh,orientation:card.orientation,meaning:card.meaning}))
 };
 const guidance=[
  'You are JuHua Speaks, offering reflective Tarot entertainment, not certain future predictions.',
  'Interpret the exact original question and its practical choices, NOT a generic card glossary.',
  'Keep all three provided cards, their positions, and their upright/reversed orientations. Do not draw new cards.',
  'Compare Path A and Path B fairly when it is a crossroads reading.',
  'Reply ONLY in '+details.locale+'. Interpret Chinese cultural context thoughtfully when requested; Tarot is not I Ching.',
  'Synthesize the relationships between the three cards. End with a realistic reflection question.',
  'Avoid prescriptive medical, legal, or financial advice. Do not fabricate personal background information.',
  'Spread context (authoritative server-side data): '+JSON.stringify(details)
 ];
 if(kind==='reading')return guidance.join('\n');
 guidance.push('Your next task is a FOLLOW-UP in a separate conversation; you MUST use the original reading and recent turns below.');
 guidance.push('Original reading:\n'+initialReading);
 guidance.push('Previous follow-up exchanges:\n'+JSON.stringify(history.map(turn=>({question:turn.question,answer:turn.answer}))));
 guidance.push('New user follow-up question: '+followup.trim());
 guidance.push('Answer this new question in relation to the original question and cards. Do not redo the shuffle.');
 return guidance.join('\n');
}

export function createLocalExodiaAdapter({
 baseUrl=process.env.EXODIA_URL||'http://127.0.0.1:8765',
 fetcher=globalThis.fetch,
 sleep=wait,
 now=()=>Date.now(),
 cooldownMs=5000,
 pollMs=1500,
 taskTimeoutMs=180000,
 requestTimeoutMs=25000,
}={}){
 const url=new URL(baseUrl);
 if(url.protocol!=='http:'||!supportedHosts.has(url.hostname)||url.username||url.password||url.pathname!=='/'||url.search)throw error('Exodia URL must be a local HTTP loopback endpoint',400);
 for(const n of [cooldownMs,pollMs,taskTimeoutMs,requestTimeoutMs])if(!Number.isFinite(n)||n<0)throw error('Invalid timing configuration',400);
 let busy=false,lastFinish=0,lastTaskId='';
 const request=async(path,init={})=>{
  let response;
  try{response=await fetcher(url.origin+path,{...init,signal:AbortSignal.timeout(requestTimeoutMs)});}
  catch{throw error('Local Exodia is not reachable on port 8765',503);}
  if(!response.ok)throw error('Exodia returned HTTP '+response.status,502);
  try{return {body:await response.json(),status:response.status};}
  catch{throw error('Exodia returned invalid JSON',502);}
 };
 async function generate(payload){
  if(busy)throw error('Exodia is already generating. Please finish this request first.',429);
  const prompt=buildExodiaPrompt(payload);
  busy=true;
  let submitted=false;
  try{
   if(lastFinish)await sleep(Math.max(0,cooldownMs-(now()-lastFinish)));
   const created=await request('/api/command/tasks',{
    method:'POST',
    headers:{'Content-Type':'application/json','X-Exodia-Client':'exodia-dashboard'},
    body:JSON.stringify({model_choice:'chatgpt',agent_id:'kiko',prompt,web_research:false})
   });
   submitted=true;
   if(created.status!==201||typeof created.body.id!=='string'||!created.body.id)throw error('Exodia did not create a valid task',502);
   lastTaskId=created.body.id;
   const deadline=now()+taskTimeoutMs;
   while(now()<deadline){
    await sleep(pollMs);
    const listed=await request('/api/command/tasks');
    const task=listed.body.tasks?.find(item=>item.id===lastTaskId);
    if(!task)throw error('Exodia task not found in recent task list',502);
    if(task.state==='failed')throw error('Exodia task failed; manual retry only',502);
    if(task.state==='answered'){
     const answer=String(task.answer||'').trim();
     if(answer.length<30)throw error('Exodia returned an empty or incomplete reading',502);
     return {mode:'exodia-local',kind:payload.kind,answer:answer.slice(0,12000),taskId:lastTaskId,elapsedSeconds:task.metrics?.total_s??null};
    }
   }
   throw error('Exodia timed out. No automatic regeneration was attempted.',504);
  }finally{
   lastFinish=now();
   busy=false;
  }
 }
 return {generate,status:()=>({available:true,busy,cooldownMs,pollMs,service:'local-only'}),get lastTaskId(){return lastTaskId}};
}
