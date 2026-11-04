/**
 * Optional server-only AI service. NOT deployed by GitHub Pages.
 * No provider API key is ever sent to or stored by frontend JS.
 * Deploy to a trusted region/provider after privacy, moderation and rate-limit review.
 */
import {normalizeReadingRequest,validateAiReading,AI_RESPONSE_SCHEMA} from '../src/reading-contract.mjs';
const UPSTREAM='https://api.openai.com/v1/responses';
const json=(data,status=200,origin='')=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(origin?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})}});
const prompt=`You are JuHua Speaks, a thoughtful bilingual Tarot interpretation assistant. Tarot is a reflective tool, not supernatural certainty. Address the EXACT user question and circumstances in the provided JSON, not generic dictionary definitions. Give THREE specific card readings in the exact incoming order; discuss each card's position, orientation, archetype, and how it bears on the question. Then synthesize connections/tensions among the cards. For Crossroads, compare the actual A/B options instead of predicting a winner. For a Chinese cultural lens, consider contextual traditions only if relevant; never equate Tarot with I Ching and avoid assuming identity or values. For the universal lens, avoid supernatural claims. Do not fabricate background facts. Say what information is missing and ask evidence-oriented questions. Avoid deterministic predictions or prescriptive legal, medical or investment advice; if faced with urgent safety risk, encourage qualified support. Use the requested English or Simplified Chinese. Exactly match IDs in JSON. Return only the required JSON fields.`;
function getText(body){
 const texts=[];for(const item of body?.output||[]){if(item.type==='message')for(const part of item.content||[])if(part.type==='output_text'&&typeof part.text==='string')texts.push(part.text)}
 return texts.join('');
}
export default {async fetch(request,env){
 const pathname=new URL(request.url).pathname;
 const origin=request.headers.get('Origin')||'';
 const allow=typeof env.ALLOWED_ORIGIN==='string'?env.ALLOWED_ORIGIN.replace(/\/$/,''):'';
 // A server-to-server request without a browser Origin is not supported for this public endpoint.
 if(!allow||origin!==allow)return json({error:'Origin not allowed'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}});
 if(pathname!=='/api/reading')return json({error:'Not found'},404,origin);
 if(request.method!=='POST')return json({error:'Method not allowed'},405,origin);
 if(!env.OPENAI_API_KEY||!env.AI_RATE_LIMITER||typeof env.AI_RATE_LIMITER.limit!=='function')return json({error:'Service not configured'},503,origin);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required'},415,origin);
 if(Number(request.headers.get('Content-Length')||0)>7500)return json({error:'Payload too large'},413,origin);
 let payload;
 try{const raw=await request.text();if(raw.length>7500)return json({error:'Payload too large'},413,origin);payload=normalizeReadingRequest(JSON.parse(raw));}catch(e){return json({error:e.message||'Invalid payload'},400,origin)}
 const ip=request.headers.get('CF-Connecting-IP')||'anonymous';
 const {success}=await env.AI_RATE_LIMITER.limit({key:'reading:'+ip});
 if(!success)return json({error:'Please try again later'},429,origin);
 const message=JSON.stringify(payload);
 const body={model:env.OPENAI_MODEL||'gpt-4.1-mini',store:false,max_output_tokens:1600,
   input:[{role:'system',content:prompt},{role:'user',content:message}],
   text:{format:{type:'json_schema',name:'juhua_tarot_reading',strict:true,schema:AI_RESPONSE_SCHEMA}}};
 try{
  const res=await fetch(UPSTREAM,{method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(35000)});
  if(!res.ok)return json({error:res.status===429?'Reading service busy':'AI provider unavailable'},502,origin);
  const data=await res.json();if(data.status!=='completed')return json({error:'Incomplete reading'},502,origin);
  const parsed=JSON.parse(getText(data));const result=validateAiReading(parsed,payload);
  return json({reading:result},200,origin);
 }catch{return json({error:'Reading unavailable; your local preview remains available'},502,origin)}
}};
