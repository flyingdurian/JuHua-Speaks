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
import {SYNTHESIS_ART,SYNTHESIS_TRANSITION_MS} from './ArtemisSynthesisAssets.mjs';

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
 let ritualLayer=null;
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
  // Asset loading can fail in an incomplete developer checkout. Keep the chat
  // readable with an existing registered Artemis portrait, without concealing
  // an asset installation failure from validation tests.
  for(const image of next.querySelectorAll('img.synthesis-avatar')){
   image.addEventListener('error',()=>{
    const stage=Number(image.dataset.fallbackStage||0);
    if(stage===0){
     image.dataset.fallbackStage='1';
     image.src=image.getAttribute('src').replace('/avatar_artemis_face_','/avatar_artemis_');
    }else if(stage===1&&imageUrl){
     image.dataset.fallbackStage='2';
     image.src=imageUrl;
    }
   });
  }
  world.dataset.synthesisStatus=status;
 }
 function buildCardConjuringScene(){
  const stage=room();
  if(!stage)return;
  const layer=document.createElement('div');
  layer.className='artemis-synthesis-ritual';
  layer.setAttribute('role','status');
  layer.setAttribute('aria-label','Artemis is conjuring your three chosen cards');
  layer.dataset.ritualDuration=String(SYNTHESIS_TRANSITION_MS);
  const conjuring=document.createElement('img');
  conjuring.className='artemis-conjuring-art';conjuring.alt='';
  conjuring.decoding='async';conjuring.src=SYNTHESIS_ART.conjuring;
  conjuring.addEventListener('error',()=>{conjuring.hidden=true},{once:true});
  const circle=document.createElement('div');circle.className='artemis-synthesis-circle';
  circle.setAttribute('aria-hidden','true');
  circle.innerHTML='<i></i><i></i><i></i><b></b>';
  const veil=document.createElement('div');veil.className='artemis-synthesis-veil';
  const label=document.createElement('div');label.className='artemis-synthesis-ritual-label';
  label.textContent='The three cards become one story';
  layer.append(veil,conjuring,circle,label);
  stage.append(layer);
  const stageBox=stage.getBoundingClientRect();
  const cards=[...stage.querySelectorAll('.reading-art-card')].slice(0,3);
  if(cards.length!==3)throw Error('Synthesis lost the original three physical cards');
  const portal={x:stageBox.width*.5,y:Math.min(stageBox.height*.59,stageBox.height-120)};
  cards.forEach((button,index)=>{
   const image=button.querySelector('img.reading-actual-card-face');
   const foil=button.querySelector('.reading-art-card-foil');
   if(!image||!foil)throw Error('Synthesis cannot detach selected RWS/foil identities');
   const rect=button.getBoundingClientRect();
   const token=document.createElement('div');
   token.className='artemis-synthesis-card-token';token.dataset.cardIndex=String(index);
   token.dataset.originalCardId=button.dataset.originalCardId||'';
   token.style.left=(rect.left-stageBox.left)+'px';
   token.style.top=(rect.top-stageBox.top)+'px';
   token.style.width=rect.width+'px';token.style.height=rect.height+'px';
   const dx=portal.x-(rect.left-stageBox.left+rect.width*.5);
   const dy=portal.y-(rect.top-stageBox.top+rect.height*.5);
   token.style.setProperty('--ritual-dx',dx+'px');
   token.style.setProperty('--ritual-dy',dy+'px');
   token.style.setProperty('--ritual-dx65',dx*.65+'px');
   token.style.setProperty('--ritual-dy55',dy*.55+'px');
   const face=image.cloneNode(true);
   face.removeAttribute('id');face.classList.add('artemis-synthesis-card-face');
   const shimmer=foil.cloneNode(true);
   shimmer.removeAttribute('id');shimmer.classList.add('artemis-synthesis-card-foil');
   token.append(face,shimmer);layer.append(token);
  });
  ritualLayer=layer;
 }
 function showFocusedReadingArt(){
  const hero=room()?.querySelector('.reading-art-hero');
  if(!hero)return;
  const img=document.createElement('img');
  img.className='artemis-focused-chat-art';
  img.alt='';img.decoding='async';img.src=SYNTHESIS_ART.focused;
  img.addEventListener('load',()=>{
   if(!disposed&&room()?.contains(img))room().dataset.synthesisPortrait='focused';
  },{once:true});
  img.addEventListener('error',()=>{
   // Do not hide the old readable Artemis art if an asset is missing.
   img.remove();if(room())room().dataset.synthesisPortrait='fallback';
  },{once:true});
  hero.append(img);
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
    await delay(3300);
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
  const stage=room();
  stage.dataset.phase='chat';
  // Deliberately retire the scripted stage's visual layers. Card and foil
  // identities remain mounted but hidden for continuity and diagnostics.
  // The repeated backdrop tabletop must not paint behind the chat.
  for(const selector of ['.reading-art-spread','.reading-art-table-surface',
    '.reading-art-card-glow','.reading-art-reading-glow']){
   const obsolete=stage.querySelector(selector);
   if(obsolete){obsolete.hidden=true;obsolete.setAttribute('aria-hidden','true');}
  }
  ritualLayer?.remove();ritualLayer=null;
  showFocusedReadingArt();
  render();
  room()?.querySelector('#synthesis-title')?.focus({preventScroll:true});
  void synthesize();
 }
 function start(){
  if(disposed||started)return false;
  started=true;phase='sacrificing';
  world.dataset.beat='synthesis';
  room().dataset.phase='sacrificing';
  // The three card identities and foil DOM nodes remain in their frames.
  // Faithful visual tokens fly into the circle; no replacement card is drawn.
  buildCardConjuringScene();
  transitionTimer=setTimeout(activateChat,reducedMotion?60:SYNTHESIS_TRANSITION_MS);
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
   ritualLayer?.remove();ritualLayer=null;
  },
  get state(){return {started,phase,status,mode,locked:choices.map(x=>x.id),
   guidance:guidance?{...guidance}:null,historyLength:history.length}}
 };
}
