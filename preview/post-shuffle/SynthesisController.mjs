/**
 * Gate D: one-way, single-request synthesis transition.
 * Keeps original three card DOM nodes and all selected orientations intact.
 * Live AI is available ONLY through the existing local Exodia proxy. Otherwise
 * the scene visibly identifies its deterministic scripted demonstration.
 */
import {DECK,BY_ID,secureRandomInt,drawOrientation} from '../../src/deck.mjs';
import {discoverLocalExodia,sendLocalExodia} from '../../src/local-exodia-client.mjs';
import {assetUrl} from './reading-stage.mjs';
import {renderSynthesisChat,demoSynthesis,demoGuidance} from './SynthesisChat.mjs';

const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const readingContext=(question,choices)=>({
 question,options:['',''],spread:'insight',lens:'western',locale:'en',deckId:'rws',
 picks:choices.map(c=>({id:c.id,orientation:c.orientation}))
});
export function drawOneGuidance(choices,random=secureRandomInt,orientation=drawOrientation){
 const locked=new Set(choices.map(c=>c.id));
 if(locked.size!==3)throw new Error('Three locked cards required for guidance');
 const remaining=DECK.filter(card=>!locked.has(card.id));
 const card=remaining[random(remaining.length)];
 const side=orientation();
 if(!card||!['upright','reversed'].includes(side))throw new Error('Invalid guidance draw');
 return {id:card.id,name:card.name,orientation:side,meaning:card[side]};
}
export function createSynthesisController({world,question,choices,reading,reducedMotion=false}={}){
 if(!world||!reading||choices?.length!==3)throw new Error('Synthesis needs locked original three and their reading');
 let disposed=false,started=false,phase='idle',status='generating';
 let mode='scripted-demo',response='',error='',guidance=null;
 let history=[],pending=false,requestToken=0,transitionTimer=null;
 const context=readingContext(question,choices);
 const room=()=>world.querySelector('.scene-artemis-reading');
 const imageUrl=assetUrl('warmWelcome')||assetUrl('reflective')||'';
 function render(){
  if(disposed||!started||phase!=='chat')return;
  const html=renderSynthesisChat({question,mode,status,response,error,avatar:imageUrl,guidance,history});
  const old=world.querySelector('.reading-chat-hud');
  const viewport=old?.querySelector('.synthesis-chat-scroll');
  const y=viewport?.scrollTop??0;
  const element=document.createElement('div');element.innerHTML=html;
  const next=element.firstElementChild;
  if(old)old.replaceWith(next);
  else room()?.querySelector('.reading-art-panel')?.replaceWith(next);
  const list=next.querySelector('.synthesis-chat-scroll');
  if(list)list.scrollTop=guidance||history.length?list.scrollHeight:y;
  world.dataset.synthesisStatus=status;
 }
 function updatePortrait(){
  const portrait=room()?.querySelector('.reading-art-portrait');
  if(!portrait)return;
  const slot=['invocation','presenting','reflective'].find(s=>assetUrl(s));
  if(!slot)return; // Never invent missing portrait assets.
  const src=assetUrl(slot);
  if(portrait.querySelector('img')?.getAttribute('src')===src)return;
  const img=new Image();
  img.decoding='async';img.alt='';img.src=src;
  img.decode().then(()=>{
   if(disposed||!portrait.isConnected)return;
   portrait.replaceChildren(img);
   portrait.dataset.artSlot=slot;
   portrait.dataset.artFilename=src.split('/').pop();
  }).catch(()=>{}); // Keep currently installed reader art on decode failure.
 }
 async function synthesize(){
  const token=++requestToken;
  try{
   const service=await discoverLocalExodia();
   if(disposed||token!==requestToken)return;
   if(service?.available){
    mode='exodia-local';render();
    const result=await sendLocalExodia({kind:'reading',context});
    if(disposed||token!==requestToken)return;
    response=result.answer;
   }else{
    mode='scripted-demo';render();
    await delay(1800);
    if(disposed||token!==requestToken)return;
    response=demoSynthesis({question,reading});
   }
   status='ready';error='';
  }catch(e){
   if(disposed||token!==requestToken)return;
   status='error';
   error='Live synthesis was not available: '+String(e?.message||'Please try the scripted preview.').slice(0,190);
  }
  render();
 }
 function activateChat(){
  if(disposed||!started)return;
  phase='chat';
  room().dataset.phase='chat';
  render();
  void synthesize();
 }
 function start(){
  if(disposed||started)return false;
  started=true;phase='sacrificing';
  world.dataset.beat='synthesis';
  room().dataset.phase='sacrificing';
  const hero=room().querySelector('.reading-art-hero');
  if(hero&&!hero.querySelector('.reading-synthesis-portal')){
   const portal=document.createElement('div');
   portal.className='reading-synthesis-portal';
   portal.setAttribute('aria-hidden','true');
   hero.append(portal);
  }
  updatePortrait();
  transitionTimer=setTimeout(activateChat,reducedMotion?10:950);
  return true;
 }
 function drawGuidance(){
  if(disposed||status!=='ready'||guidance)return false;
  guidance=drawOneGuidance(choices);
  status='guidance';render();return true;
 }
 function useDemo(){
  if(disposed||status!=='error')return false;
  ++requestToken;mode='scripted-demo';error='';
  response=demoSynthesis({question,reading});
  status='ready';render();return true;
 }
 async function askFollowUp(q){
  const prompt=String(q||'').trim();
  if(disposed||!guidance||pending||prompt.length<2||prompt.length>280||history.length>=8)return false;
  pending=true;status='followup-generating';render();
  const token=++requestToken;let answer='';
  try{
   if(mode==='exodia-local'){
    const result=await sendLocalExodia({kind:'followup',context,
     followup:prompt,initialReading:response,
     guidanceCard:{id:guidance.id,orientation:guidance.orientation},
     history:history.map(x=>({question:x.question,answer:x.answer}))});
    if(disposed||token!==requestToken)return false;
    answer=result.answer;
   }else{
    await delay(550);
    if(disposed||token!==requestToken)return false;
    answer=demoGuidance({card:BY_ID.get(guidance.id),
     orientation:guidance.orientation,question:prompt,reading});
   }
   history.push({question:prompt,answer});
   status='followup-ready';error='';
  }catch(e){
   if(disposed||token!==requestToken)return false;
   status='guidance';error=String(e?.message||'Follow-up unavailable').slice(0,190);
  }finally{pending=false}
  render();
  return true;
 }
 function handleClick(event){
  if(disposed||!started||phase!=='chat')return false;
  const button=event.target.closest('[data-action]');
  if(!button)return false;
  if(button.dataset.action==='draw-guidance'){drawGuidance();return true}
  if(button.dataset.action==='synthesis-demo'){useDemo();return true}
  return false;
 }
 function handleSubmit(event){
  if(disposed||!started||!event.target?.matches?.('[data-action="guidance-followup-form"]'))return false;
  event.preventDefault();
  const input=event.target.querySelector('input[name="question"]');
  const value=input?.value.trim();
  if(value){input.value='';void askFollowUp(value)}
  return true;
 }
 return {
  start,handleClick,handleSubmit,drawGuidance,askFollowUp,dispose(){
   disposed=true;requestToken++;clearTimeout(transitionTimer);
  },
  get state(){return {started,phase,status,mode,locked:choices.map(x=>x.id),
   guidance:guidance?{...guidance}:null,historyLength:history.length}}
 };
}
