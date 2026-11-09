/**
 * Gate D → Artemis, fullscreen same-document reading ritual.
 * A local scripted preview is deliberately labeled as such. No network
 * request is sent and no AI reading is claimed until the API is enabled.
 */
import {DECK,BY_ID,commonsThumbnailUrl,secureRandomInt} from '../../src/deck.mjs';
import {buildDemoReading,answerDemoFollowUp} from '../../src/demo-reading.mjs';
import {ARTEMIS_PORTRAITS,createArtemisSession,artemisTransition,chooseGuidanceCard} from './ArtemisMachine.mjs';
import {artemisPortraitSvg} from './ArtemisPortrait.mjs';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cardImage=(id)=>new URL('../../assets/rws/'+id+'.jpg',import.meta.url).href;
const T={
 en:{
  stage:'Your reading',tag:'ARTEMIS · CELESTIAL TAROT READER',
  intro:'The cards have spoken. Let us explore what they may illuminate.',
  welcome:'Welcome. These three cards reflect the story you brought into this ritual.',
  preparing:'We will read the Past, Present and Future as symbols, never a fixed fate.',
  loading:'Artemis studies the symbols…',
  guidance:'One additional card may illuminate a useful next step.',
  guidanceDrawing:'A card rises from the remaining deck…',
  guidanceResult:'Your guidance card',continue:'Continue',begin:'Begin with Artemis',
  explore:'Explore my three cards',read:'Receive my reading',
  chooseGuidance:'Draw a guidance card',skipGuidance:'Continue without another card',
  ask:'Ask Artemis a question',send:'Ask',again:'Ask another question',
  return:'Back to your cards',portrait:'Expression',
  question:'Your question',reflection:'For your reflection',next:'Possible next steps',
  main:'Past · Present · Future',local:'Scripted preview · No AI request sent',
  fallbackQuestion:'What can I learn from this moment?',
  input:'What would you like to explore next?',
  cardUnavailable:'Original RWS art is unavailable',
  roles:['Past','Present','Future'],upright:'Upright',reversed:'Reversed'
 },
 zh:{
  stage:'你的塔罗解读',tag:'ARTEMIS · 星空塔罗解读者',
  intro:'三张牌已经就位。让我们一起探寻其中的象征。',
  welcome:'欢迎你。这三张牌映照着你带入仪式的故事。',
  preparing:'我们将从过去、现在、未来三个角度阅读，而非断言命运。',
  loading:'阿尔忒弥斯正在观察牌面…',
  guidance:'如果你愿意，可以再抽一张指引牌，看看下一步值得关注什么。',
  guidanceDrawing:'一张牌正从余下的牌组中升起…',
  guidanceResult:'你的指引牌',continue:'继续',begin:'与 Artemis 开始解读',
  explore:'了解我的三张牌',read:'开始解读',
  chooseGuidance:'抽取一张指引牌',skipGuidance:'暂不抽牌，继续',
  ask:'向 Artemis 提问',send:'提问',again:'再问一个问题',
  return:'查看三张牌',portrait:'表情',
  question:'你的问题',reflection:'值得思考的问题',next:'可以尝试的下一步',
  main:'过去 · 现在 · 未来',local:'脚本演示 · 未发送 AI 请求',
  fallbackQuestion:'此刻我应该关注什么？',
  input:'你还想进一步了解什么？',
  cardUnavailable:'原版韦特塔罗牌画面无法载入',
  roles:['过去','现在','未来'],upright:'正位',reversed:'逆位'
 }
};
export function mountArtemisStage({mount,picks,question='',locale='en',onClose=()=>{}}={}){
 if(!mount)throw new Error('Artemis requires a mount element');
 const lang=locale==='zh'?'zh':'en',txt=T[lang];
 let state=createArtemisSession({picks,locale:lang,question:question||txt.fallbackQuestion});
 let portraitOverride=null,disposed=false,pending=null,demoReading=null;
 const root=document.createElement('section');
 root.className='artemis-stage-v1';root.setAttribute('aria-label','Artemis Tarot reading');
 root.setAttribute('data-phase',state.phase);root.setAttribute('data-demo','true');
 mount.append(root);
 const image=(id,orientation='upright',cls='')=>{
  const card=BY_ID.get(id);
  if(!card)throw new Error('Unknown Tarot card ID in Artemis');
  return '<figure class="ar-card '+cls+'"><div class="ar-card-image-wrap">'+
   '<img loading="lazy" data-rws-card="'+escapeHtml(id)+'" src="'+escapeHtml(cardImage(id))+'" '+
   'alt="'+escapeHtml(card.name)+' RWS Tarot card" style="transform:'+(orientation==='reversed'?'rotate(180deg)':'none')+'">'+
   '<span class="ar-card-asset-error" hidden>'+txt.cardUnavailable+'</span></div>'+
   '<figcaption>'+escapeHtml(lang==='zh'?card.zh:card.name)+' <small>'+txt[orientation]+'</small></figcaption></figure>';
 };
 const button=(action,label,extra='')=>'<button type="button" class="ar-button '+extra+'" data-artemis-action="'+action+'">'+escapeHtml(label)+'</button>';
 const currentMessage=()=>{
  if(state.phase==='intro')return txt.intro;
  if(state.phase==='welcome')return txt.welcome;
  if(state.phase==='reading_prepare')return txt.preparing;
  if(state.phase==='reading_loading')return txt.loading;
  if(state.phase==='guidance_offer')return txt.guidance;
  if(state.phase==='guidance_draw')return txt.guidanceDrawing;
  if(state.phase==='guidance_result')return txt.guidanceResult;
  if(state.phase==='followup_response')return state.followups.at(-1)?.answer||'';
  return state.reading?.summary||txt.welcome;
 };
 const readingBody=()=>{
  if(state.phase==='reading_present'||state.phase==='guidance_offer'||state.phase==='guidance_draw'||
     state.phase==='guidance_result'||state.phase==='followup_idle'||state.phase==='followup_response'){
   const r=state.reading;if(!r)return '';
   return '<div class="ar-reading-summary"><h2>'+txt.stage+'</h2><p>'+escapeHtml(r.summary)+'</p>'+
    '<div class="ar-reading-meanings">'+r.cards.map((c,i)=>
     '<article><span>'+escapeHtml(txt.roles[i])+'</span><strong>'+escapeHtml(c.name)+'</strong><p>'+escapeHtml(c.text)+'</p></article>'
    ).join('')+'</div>'+
    '<h3>'+txt.reflection+'</h3><p>'+escapeHtml(r.reflection)+'</p>'+
    '<h3>'+txt.next+'</h3><ol>'+r.nextSteps.map(s=>'<li>'+escapeHtml(s)+'</li>').join('')+'</ol></div>';
  }
  return '';
 };
 const guidanceBody=()=>state.guidance?'<div class="ar-guidance-reveal"><div><span>✦ '+txt.guidanceResult+'</span>'+
  image(state.guidance.id,state.guidance.orientation,'ar-guidance-card')+'</div>'+
  '<p>'+escapeHtml((lang==='zh'?BY_ID.get(state.guidance.id).zh:BY_ID.get(state.guidance.id).name))+
  ' · '+txt[state.guidance.orientation]+'</p></div>':'';
 const followupBody=()=>state.phase==='followup_idle'
  ?'<form class="ar-followup-form" data-artemis-followup><label for="ar-followup-input">'+txt.ask+'</label>'+
   '<textarea id="ar-followup-input" rows="2" minlength="2" maxlength="280" required placeholder="'+txt.input+'"></textarea>'+
   '<button type="submit" class="ar-button">'+txt.send+'</button></form>'
  :state.phase==='followup_response'?'<div class="ar-followup-reply"><p>'+escapeHtml(state.followups.at(-1)?.question)+'</p>'+
   '<blockquote>'+escapeHtml(state.followups.at(-1)?.answer)+'</blockquote></div>':'';
 const actions=()=>{
  switch(state.phase){
   case 'intro':return button('welcome',txt.begin,'ar-primary');
   case 'welcome':return button('prepare',txt.explore,'ar-primary');
   case 'reading_prepare':return button('read',txt.read,'ar-primary');
   case 'reading_loading':return '<span class="ar-loading" role="status">'+txt.loading+'</span>';
   case 'reading_present':return button('guidance_offer',txt.chooseGuidance,'ar-primary')+button('followup_idle',txt.ask);
   case 'guidance_offer':return button('draw',txt.chooseGuidance,'ar-primary')+button('followup_idle',txt.skipGuidance);
   case 'guidance_draw':return '<span class="ar-loading" role="status">'+txt.guidanceDrawing+'</span>';
   case 'guidance_result':return button('followup_idle',txt.continue,'ar-primary');
   case 'followup_idle':return state.guidance?'':button('guidance_offer',txt.chooseGuidance);
   case 'followup_response':return button('followup_idle',txt.again,'ar-primary');
   default:return '';
  }
 };
 function setPortrait(id){
  if(!ARTEMIS_PORTRAITS.includes(id))throw new Error('Unknown portrait');
  portraitOverride=id;render();
 }
 function render(){
  if(disposed)return;
  const portrait=portraitOverride||state.portrait;
  root.dataset.phase=state.phase;root.dataset.portrait=portrait;
  root.innerHTML='<div class="ar-atmosphere" aria-hidden="true"></div>'+
   '<header class="ar-header"><span>✧ 菊花说 · JuHua Speaks</span><span>ARTEMIS / '+escapeHtml(state.phase.replaceAll('_',' '))+'</span></header>'+
   '<div class="ar-layout"><aside class="ar-reader"><div class="ar-portrait-frame ar-pose-'+portrait+'">'+artemisPortraitSvg(portrait)+'</div>'+
    '<span class="ar-reader-caption">'+txt.tag+'</span>'+
    '<div class="ar-dialogue" aria-live="polite"><p>'+escapeHtml(currentMessage())+'</p></div></aside>'+
   '<main class="ar-content"><div class="ar-eyebrow">✧ '+txt.main+'</div>'+
    '<div class="ar-original-spread">'+state.picks.map((pick,i)=>
     '<div class="ar-spread-slot"><span>'+txt.roles[i]+'</span>'+image(pick.id,pick.orientation)+'</div>').join('')+'</div>'+
    readingBody()+guidanceBody()+followupBody()+
    '<div class="ar-actions">'+actions()+'</div>'+
    '<p class="ar-demo-label">'+txt.local+'</p></main></div>';
  root.querySelectorAll('img[data-rws-card]').forEach(img=>{
   img.addEventListener('error',()=>{
    if(!img.dataset.triedCommons){
     img.dataset.triedCommons='true';
     const card=BY_ID.get(img.dataset.rwsCard);
     img.src=commonsThumbnailUrl(card);return;
    }
    img.hidden=true;img.parentElement.querySelector('.ar-card-asset-error').hidden=false;
   });
  });
 }
 function advance(next,payload){
  portraitOverride=null;state=artemisTransition(state,next,payload);render();return state;
 }
 function perform(action){
  if(disposed)return;
  if(action==='welcome'&&state.phase==='intro')advance('welcome');
  else if(action==='prepare'&&state.phase==='welcome')advance('reading_prepare');
  else if(action==='read'&&state.phase==='reading_prepare'){
   advance('reading_loading');
   pending=setTimeout(()=>{
    if(disposed)return;
    try{
     demoReading=buildDemoReading({
      question:state.question,picks:state.picks.map(p=>({card:BY_ID.get(p.id),orientation:p.orientation})),
      spread:'insight',lens:'universal',lang:state.locale
     });
     advance('reading_present',{reading:demoReading});
    }catch(error){console.error('Scripted reading failed',error);root.dataset.error='reading-unavailable'}
   },650);
  }else if(action==='guidance_offer'&&['reading_present','followup_idle'].includes(state.phase)&&!state.guidance)advance('guidance_offer');
  else if(action==='draw'&&state.phase==='guidance_offer'){
   advance('guidance_draw');
   pending=setTimeout(()=>{
    if(disposed)return;
    const guidance=chooseGuidanceCard(DECK,state.picks,secureRandomInt);
    advance('guidance_result',{guidance});
   },650);
  }else if(action==='followup_idle'&&['reading_present','guidance_offer','guidance_result','followup_response'].includes(state.phase))advance('followup_idle');
 }
 root.addEventListener('click',e=>{
  const action=e.target.closest('[data-artemis-action]')?.dataset.artemisAction;
  if(action)perform(action);
 });
 root.addEventListener('submit',e=>{
  if(!e.target.matches('[data-artemis-followup]'))return;
  e.preventDefault();
  if(state.phase!=='followup_idle'||!demoReading)return;
  const input=e.target.querySelector('textarea'),question=input.value.trim();
  if(question.length<2||question.length>280)return;
  try{
   const response=answerDemoFollowUp({reading:demoReading,question,history:state.followups});
   advance('followup_response',{followup:{question,answer:response.text}});
  }catch(error){console.error('Artemis demo followup rejected',error)}
 });
 render();
 return {
  get state(){return state},get element(){return root},
  perform,setPortrait,
  dispose(){disposed=true;if(pending!==null)clearTimeout(pending);root.remove();onClose()}
 };
}