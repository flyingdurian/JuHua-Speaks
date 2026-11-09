import {DECK,DECKS,BY_ID,AURAS,shuffleDeck,drawOrientation,localCardUrl,commonsThumbnailUrl,commonsFileUrl} from './deck.mjs';
import {buildDemoReading,answerDemoFollowUp,DEMO_FOLLOWUPS} from './demo-reading.mjs';
import {discoverLocalExodia,sendLocalExodia} from './local-exodia-client.mjs';
import {mountWebGLSphere} from './webgl-sphere.mjs';
import {nextOrbitYaw,DRAG_RESUME_DELAY_MS,FLIGHT_DURATION_MS,cardFlightFrames} from './sphere-motion.mjs';
import {APP_VERSION,RELEASE_NAME} from './version.mjs';
import {validatePrivateDeckFiles,deckFileNameGuide} from './private-deck.mjs';
import {BRAND,brandText} from './brand-config.mjs';
import {getDeckConfig,resolveFaceSource,deckIsReady} from './deck-config.mjs';
import {createRitualSession,transitionRitual,canConfirmThree,DEFAULT_SHUFFLE_MS} from './ritual-machine.mjs';
import {prepareQuestionPreflight} from './reading-orchestrator.mjs';
import {renderRitualLanding,renderRitualShuffle} from './ritual-views.mjs';
import {mountRitualCinema,LAUNCH_DURATION_MS} from './ritual-cinema.mjs';
import {renderPhysicalReveal} from './physical-reveal.mjs';
import {renderArtemisInvitation,renderArtemisTable} from './artemis-stage.mjs';
import {GATE_B_HANDOFF_KEY,parseGateBHandoff,resumeGateBAtSphere} from './gate-b-handoff.mjs';
import {allCardsRevealed} from './reveal-interaction.mjs';

const root=document.querySelector('#app');
let incomingGateQuestion='';
try{
 incomingGateQuestion=sessionStorage.getItem('juhua:gate-a-question')||'';
 sessionStorage.removeItem('juhua:gate-a-question');
 if(incomingGateQuestion.length>600||incomingGateQuestion.length<3)incomingGateQuestion='';
}catch{incomingGateQuestion='';}
// Gate B has already completed its physical 78-card shuffle. Consume the
// private one-use transfer and enter the sphere directly, without replaying
// the old CSS shuffle or changing the original secure deck order.
let incomingGateB=null;
try{
 const raw=sessionStorage.getItem(GATE_B_HANDOFF_KEY);
 if(raw){
  sessionStorage.removeItem(GATE_B_HANDOFF_KEY);
  incomingGateB=parseGateBHandoff(raw);
 }
}catch(error){console.warn('Gate B handoff discarded:',error.message)}
// Decorative per-refresh hue; never affects deck randomization or selection odds.
const ritualHues=[0,45,95,168,240];
const ritualHueIndex=globalThis.crypto?.getRandomValues?globalThis.crypto.getRandomValues(new Uint32Array(1))[0]%ritualHues.length:Math.floor(Math.random()*ritualHues.length);
root.style.setProperty('--ritual-hue',ritualHues[ritualHueIndex]+'deg');
const state={step:incomingGateB?3:incomingGateQuestion?1:0,locale:'en',spread:'insight',lens:'western',question:incomingGateB?.question||incomingGateQuestion,optionA:'Accept the new offer',optionB:'Stay in my current role',shuffled:incomingGateB?incomingGateB.cardIds.map(id=>BY_ID.get(id)):[],picks:[],shuffles:0,rx:-12,ry:-17,modal:null,filter:'all',inspected:null,effects:true,sphereMode:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'2d':'gpu',aiReading:null,aiStatus:'idle',aiError:'',aiRequestId:0,deckId:'rws',privateImages:new Map(),revealIndex:0,revealProgress:0,revealedCards:[false,false,false],orbitPaused:false,orbitHoldUntil:0,readingBeat:-1,demoConversation:[],localExodiaAvailable:false,localMode:'scripted',localReading:'',localTurns:[],localBusy:false,localError:'',localRequestId:0,ritual:incomingGateB?resumeGateBAtSphere(incomingGateB):createRitualSession(),ritualEpoch:0,ritualLocking:false,ritualOverlay:null,ritualAnimationStartAt:0,landingPhaseOffset:0,peekProgress:[0,0,0],peekAxes:[{ax:0,ay:1},{ax:0,ay:1},{ax:0,ay:1}],autoConfirmAt:null,shuffleStyle:'cosmic'};
const t=(en,zh)=>state.locale==='zh'?zh:en;
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roleNames=()=>state.spread==='crossroads'?[t('Path A','方向 A'),t('Path B','方向 B'),t('Guidance','综合建议')]:[t('Past','过去'),t('Present','现在'),t('Future','未来')];
const btn=(action,caption,mode='',disabled=false)=>`<button class="btn ${mode}" data-action="${action}" ${disabled?'disabled':''}>${caption}</button>`;
const description=()=>`<span class="question-badge" title="${h(state.question)}">✧ <span>${h(state.question)}</span></span>`;
const cardBack=()=>`<div class="card-back"><div class="back-inner"><div class="back-mandala"><span>☼</span></div><div class="back-brand">${h(BRAND.cardBackLabel)}</div></div></div>`;
const cardFace=(card,orientation='upright',eager=false,deckId=state.deckId)=>{const chinese=deckId==='chinese-tarot'&&state.privateImages.has(card.id);const artUrl=resolveFaceSource(deckId,card.id,state.privateImages)||localCardUrl(card);const fallback=getDeckConfig(deckId).fallbackAsset(card.id)||'';const alt=chinese?`${card.name} — personal local Chinese Tarot image`:`${card.name} — Pamela Colman Smith 1909 original Rider–Waite–Smith art`;return `<div class="card-face ${orientation==='reversed'?'reversed':''}" style="--aura:${AURAS[card.aura]};" data-card-id="${card.id}"><div class="art-rotation"><img class="card-image" src="${artUrl}" data-remote="${fallback}" data-fallback="0" alt="${h(alt)}" loading="${eager?'eager':'lazy'}" decoding="async"/><div class="image-unavailable" hidden><span>ARTWORK UNAVAILABLE</span><small>${h(card.name)}</small></div></div><div class="foil"></div></div>`;}
const eyebrow=text=>`<div class="eyebrow">${text}</div>`;
function masthead(){return `<header class="masthead"><button class="brand" data-action="home" aria-label="${t('Back to home','返回首页')}"><span class="brand-emblem">✺</span><span><strong>${h(brandText(state.locale))}</strong><small>${h(BRAND.tagline[state.locale])} · TAROT</small></span></button><div class="head-actions"><span class="app-version" title="${h(RELEASE_NAME)}">v${APP_VERSION}</span><button class="head-btn" data-action="gallery">${t('78 cards','78 张牌')}</button><button class="head-btn" data-action="decks">${t('Decks','牌组')}</button><button class="head-btn" data-action="locale">${state.locale==='en'?'简体中文':'EN'}</button></div></header>`}
function navigation(){const names=state.locale==='zh'?['入口','提问','洗牌','牌球','揭晓','解读']:['Enter','Question','Shuffle','Sphere','Reveal','Reading'];return `<nav class="progress" aria-label="${t('Reading progress','解读进度')}">${names.map((n,i)=>`<button data-step="${i}" class="progress-step ${i===state.step?'current':i<state.step?'passed':''}" ${i>state.step?'disabled':''}><b>${i+1}</b><span>${n}</span></button>`).join('')}</nav>`}
function welcome(){return renderRitualLanding({state,t,h,btn,eyebrow,cardFace,cardBack,DECK,brand:brandText(state.locale)});}
function lensChoices(){return `<div class="chip-row">${[['western',t('Western · reflective','西方 · 心理象征')],['chinese',t('Chinese · cultural context','中文 · 文化情境')],['universal',t('Universal','通用视角')]].map(([v,l])=>`<button data-lens="${v}" class="chip ${state.lens===v?'active':''}" aria-pressed="${state.lens===v}">${l}</button>`).join('')}</div>`}
function question(){return `<section class="setup"><div class="setup-form">${eyebrow('01 / '+t('YOUR INTENTION','你的问题'))}<h1>${t('What would you<br><em>like to explore?</em>','有什么心事，<br><em>想听听塔罗怎么说？</em>')}</h1><p class="intro">${t('Write what truly matters. The question should guide how every card is interpreted.','写下你真正关心的事。每张牌都应与这个问题和它所在的牌位联系起来。')}</p><div class="field"><label for="question" class="field-label">${t('Your question','你的问题')}</label><textarea id="question" maxlength="600" spellcheck="true">${h(state.question)}</textarea><span class="field-note">${t('Your question stays in your browser unless you choose to save it.','除非你主动保存，否则问题只保留在本次浏览器会话中。')}</span></div><div class="field"><div class="field-label">${t('Choose a spread','选择牌阵')}</div><div class="chip-row"><button class="chip ${state.spread==='crossroads'?'active':''}" data-spread="crossroads">${t('Crossroads · compare two paths','十字路口 · 比较两条路')}</button><button class="chip ${state.spread==='insight'?'active':''}" data-spread="insight">${t('Three-card insight','三张牌 · 探索现状')}</button></div></div>${state.spread==='crossroads'?`<div class="two-fields field"><div><label for="optionA" class="field-label">${t('Path A (optional)','方向 A（可选）')}</label><input id="optionA" value="${h(state.optionA)}"></div><div><label for="optionB" class="field-label">${t('Path B (optional)','方向 B（可选）')}</label><input id="optionB" value="${h(state.optionB)}"></div></div>`:''}<div class="field"><div class="field-label">${t('Reading lens','文化解读视角')}</div>${lensChoices()}</div><div class="cta-row">${btn('begin',t('Begin the ritual','开始仪式'))}${btn('back',t('Back','返回'),'quiet')}</div></div><aside class="setup-aside">${eyebrow(t('YOUR DECK','你的牌组'))}<h2>${state.deckId==='rws'?'Rider–Waite–Smith':'The Chinese Tarot · 本地私人版'}</h2><p>${state.deckId==='rws'?t('Pamela Colman Smith’s original 78-card art, preserved without redraws or simplification.','Pamela Colman Smith 的经典 78 张原版插画，保留真实原作，不重画、不简化。'):t('78 images from your own authorized local collection. Images stay only in this tab.','78 张你自己授权的本地牌面图片，仅在此标签页使用。')}</p><div class="mini-deck">${[1,2,3].map(()=>cardBack()).join('')}</div><div class="aside-line"><span>${t('Deck size','牌组数量')}</span><strong>78</strong></div><div class="aside-line"><span>${t('Orientation','牌面方向')}</span><strong>${t('Upright + reversed','正位 + 逆位')}</strong></div><div class="aside-line"><span>${t('Foil effect','光泽')}</span><strong>${t('Symbol-driven','由牌义决定')}</strong></div><div class="aside-line"><span>${t('Other artwork','其他画风')}</span><button class="text-link" data-action="decks">${t('View available decks','查看牌组')}</button></div></aside></section>`}
function shuffling(){return renderRitualShuffle({state,t,h,btn,eyebrow,cardFace,cardBack,DECK,description});}
function orbCards(){const count=state.shuffled.length;const phi=Math.PI*(3-Math.sqrt(5));return state.shuffled.map((card,i)=>{const y=1-(i/(count-1))*2,r=Math.sqrt(Math.max(0,1-y*y)),a=i*phi,x=Math.cos(a)*r,z=Math.sin(a)*r;const yaw=Math.atan2(x,z)*180/Math.PI,latitude=-Math.asin(y)*180/Math.PI;return `<button class="orb-card ${state.picks.some(p=>p.card.id===card.id)?'chosen':''}" data-pick="${card.id}" style="--yaw:${yaw.toFixed(3)}deg;--latitude:${latitude.toFixed(3)}deg" title="${t('Select this card','选择这张牌')}" ${state.picks.some(p=>p.card.id===card.id)?'disabled':''}>${cardBack()}</button>`}).join('')}
function flatCardTable(){return `<div class="flat-table" id="flat-table" role="group" aria-label="${t('78 cards on a flat tabletop','平面桌面上的 78 张牌')}"><div class="flat-table-caption">✧ ${t('THE TABLETOP · ALL 78 CARDS','平面牌桌 · 全部 78 张牌')}</div><div class="flat-card-grid">${state.shuffled.map((card,i)=>`<button class="flat-card ${state.picks.some(p=>p.card.id===card.id)?'chosen':''}" data-pick="${card.id}" aria-label="${t('Select card','选择卡牌')} ${i+1}">${cardBack()}</button>`).join('')}</div></div>`}
function sphere(){const is3d=state.sphereMode==='gpu';return `<section class="center-content sphere-page">${eyebrow('03 / '+t('THE CELESTIAL CHAMBER','星辰内殿'))}<h1>${t('You are <em>inside the stars.</em>','置身于<em>满天星辰之间。</em>')}</h1><p class="intro">${is3d?t('The universe rotates around you. Tap a card to mark it with celestial light; tap again to unselect before confirming three.','宇宙星空缓慢旋转。轻触牌面使其发光，再点一次即可取消；选好三张后再确认。'):t('The full 78-card deck is laid out on a flat tabletop. Scroll the grid and choose any three cards.','完整的 78 张牌已平铺在桌面上。滚动牌阵并选择任意三张。')}</p>${is3d?`<div class="sphere-scene inside-dome" id="sphere-scene" aria-label="${t('Inside an immersive three-dimensional sky of tarot cards','置身于沉浸式立体塔罗星空')}"><div class="dome-nebula"></div><div class="dome-stars"></div><div class="dome-horizon"></div><div class="dome-reticle" aria-hidden="true">✧<span></span></div><div class="dome-caption">${t('LOOK AROUND · YOU ARE AT THE CENTER','环顾四周 · 你在球心')}</div></div>`:flatCardTable()}<div class="sphere-tools">${is3d?`<button class="round-btn" data-action="rotate-left" aria-label="${t('Turn left','向左转动')}">←</button><span>${t('SLOW ORBIT · TAP TO SELECT / UNSELECT','缓缓旋转 · 点击选择或取消')}</span><button class="round-btn" data-action="rotate-right" aria-label="${t('Turn right','向右转动')}">→</button><button class="orbit-toggle" data-action="toggle-orbit" aria-pressed="${state.orbitPaused}">${state.orbitPaused?t('▶ Resume universe','▶ 继续旋转'):t('Ⅱ Pause universe','Ⅱ 暂停旋转')}</button>`:`<span>${t('SCROLL THE CARD TABLE · TAP A CARD','滚动平面牌桌 · 点击选牌')}</span>`}</div><p class="sphere-renderer-choice"><button class="text-link" data-action="sphere-mode">${is3d?t('Switch to flat 2D tabletop','切换平面 2D 牌桌'):t('Enter immersive 3D universe','进入沉浸式 3D 宇宙')}</button><span class="scene-mode-label" id="sphere-mode-label">${is3d?t('Inside the 3D chamber','立体星辰内殿'):t('Flat 78-card table','平面 78 张牌桌')}</span></p><div class="hand-label">✦ ${t('YOUR THREE CHOICES · NOT LOCKED YET','你的三张选择 · 尚未锁定')} ✦</div><div class="slots">${roleNames().map((name,i)=>`<div class="slot"><div class="slot-image ${state.picks[i]?'is-filled':''}">${state.picks[i]?cardBack():String(i+1).padStart(2,'0')}</div><span>${name}</span>${state.picks[i]?`<button class="slot-remove" data-unselect="${state.picks[i].card.id}" aria-label="${t('Unselect card','取消选择')} ${i+1}">× ${t('Undo','取消')}</button>`:''} </div>`).join('')}</div>${state.picks.length===3?`<p class="sphere-auto-lock" role="status">${t('Three chosen — view your cards in front of the sphere, then confirm when ready.','三张牌已来到眼前，请欣赏牌阵，再点击确认。')}</p>`:''}<div class="cta-row centered">${btn('random',t('Draw one randomly','随机抽取一张'),'secondary',state.picks.length===3)}${btn('confirm-cards',`${t('Confirm 3 Cards ✧','确认三张牌 ✧')} (${state.picks.length}/3)`,'',state.picks.length!==3)}</div><p class="fine-print centered-text">${t('3D and 2D use the same shuffled deck, the same card backs, and the same selections.','3D 与 2D 使用相同的洗牌顺序、牌背与选牌结果。')}</p></section>`}
function reveal(){return renderPhysicalReveal({state,t,h,btn,eyebrow,cardBack,cardFace,description,roleNames});}

function scriptedReading(){return buildDemoReading({question:state.question,picks:state.picks,spread:state.spread,lens:state.lens,options:[state.optionA,state.optionB],lang:state.locale})}
function demoMessages(){return state.demoConversation.length?state.demoConversation.map((entry,i)=>`<div class="demo-turn"><div class="demo-user"><span>${t('YOU','你')} · ${i+1}</span><p>${h(entry.question)}</p></div><div class="demo-answer"><span>✺ ${t('JUHUA · SCRIPTED REPLY','菊花说 · 脚本回复')}</span><p>${h(entry.answer.text)}</p></div></div>`).join(''):`<p class="demo-empty">${t('Your questions and simulated replies will appear here. Nothing is transmitted or saved.','你的提问和模拟回复会显示在这里，不会发送到服务器或自动保存。')}</p>`}
function localExodiaPanel(){
 if(!state.localExodiaAvailable||state.deckId!=='rws'||state.localMode!=='exodia')return '';
 const busy=state.localBusy;
 return `<section class="local-exodia-panel" aria-label="${t('Local Exodia AI reading','本地 Exodia AI 解读')}">
  ${eyebrow(t('LOCAL EXODIA · EXPERIMENTAL','本地 EXODIA · 实验版'))}
  <h2>${t('Your ChatGPT interpretation','来自本地 ChatGPT 的真实解读')}</h2>
  <p>${t('Only when you click Generate, the local Node server sends your question and cards to Exodia on port 8765. This may take 20–60 seconds. Nothing is submitted to the public JuHua website.','仅在点击生成后，本地 Node 服务器才会将问题与牌组提交给 8765 端口的 Exodia。可能需要 20–60 秒。不会提交给公开的菊花说网站。')}</p>
  ${state.localReading?`<div class="local-exodia-answer" role="region" aria-label="${t('Generated reading','生成的解读')}"><div class="local-exodia-label">✺ ${t('EXODIA RESPONSE','EXODIA 回复')}</div><p>${h(state.localReading)}</p></div>`:`<p class="local-exodia-prompt">${t('The scripted interpretation is still above. Generate an experimental alternative with your local ChatGPT session.','上方仍保留脚本解读。点击生成，使用你本机 ChatGPT 会话获得另一份实验性解读。')}</p>`}
  ${!state.localReading?btn('exodia-generate',busy?t('Generating locally…','本地生成中…'):t('Generate with local Exodia','使用本地 Exodia 生成'),'secondary',busy):''}
  ${busy?`<p class="local-exodia-wait" role="status">${t('Exodia is processing one task. Additional requests are disabled.','Exodia 正在处理一个任务，额外的生成请求已禁用。')}</p>`:''}
  ${state.localError?`<p class="local-exodia-error" role="alert">${h(state.localError)}</p>`:''}
  ${state.localReading?`<div class="local-exodia-conversation">
    <h3>${t('Follow up on this reading','针对本次解读继续追问')}</h3>
    <p>${t('Exodia creates a new conversation per task. JuHua resends the original question, selected cards, initial reading and recent follow-ups each time.','Exodia 每项任务都使用新的会话。菊花说会在每次追问中重新发送原问题、选牌、首次解读和最近的问答。')}</p>
    <div class="local-exodia-turns" role="log">${state.localTurns.map(turn=>`<div class="local-exodia-turn"><div class="local-exodia-ask">${h(turn.question)}</div><div class="local-exodia-reply">${h(turn.answer)}</div></div>`).join('')}</div>
    <form id="local-exodia-followup"><label for="local-exodia-question">${t('Follow-up question','追问内容')}</label><div class="local-exodia-input-row"><input id="local-exodia-question" maxlength="280" minlength="2" required placeholder="${t('How does the guidance card relate to my options?','综合建议牌与我的选择有什么关联？')}" ${busy||state.localTurns.length>=8?'disabled':''}/><button class="btn" type="submit" ${busy||state.localTurns.length>=8?'disabled':''}>${t('Ask Exodia','追问 Exodia')}</button></div><small>${state.localTurns.length}/8 · ${t('One generation at a time','每次仅生成一项任务')}</small></form>
   </div>`:''}
 </section>`;
}

function localReadingContext(){
 return {question:state.question,options:[state.optionA,state.optionB],spread:state.spread,lens:state.lens,locale:state.locale,deckId:state.deckId,picks:state.picks.map(p=>({id:p.card.id,orientation:p.orientation}))};
}

function resetLocalResponses(){
 state.localRequestId++;state.localReading='';state.localTurns=[];state.localBusy=false;state.localError='';
}

async function runLocalReading(followup=''){
 if(state.step!==5||state.readingBeat!==3||!state.localExodiaAvailable||state.deckId!=='rws'||state.localBusy)return;
 if(followup&&(state.localTurns.length>=8||!state.localReading))return;
 const currentId=++state.localRequestId;
 const payload={kind:followup?'followup':'reading',context:localReadingContext(),...(followup?{followup,initialReading:state.localReading,history:state.localTurns}:{})};
 state.localBusy=true;state.localError='';render();
 try{
  const result=await sendLocalExodia(payload);
  if(currentId!==state.localRequestId)return;
  if(followup)state.localTurns.push({question:followup,answer:result.answer});
  else state.localReading=result.answer;
 }catch(e){if(currentId!==state.localRequestId)return;state.localError=e.message;}
 finally{if(currentId===state.localRequestId){state.localBusy=false;render();}}
}

function reading(){
 if(state.ritual.phase==='reader_invitation')return renderArtemisInvitation({state,t,h,btn,eyebrow,cardFace,description,roleNames});
 const demo=scriptedReading(),beat=state.readingBeat,full=beat===3,opening=beat<0;
 const active=beat>=0&&beat<3?demo.cards[beat]:null;
 const narration=opening?{
   kicker:t('THE CARDS HAVE ARRIVED','三张牌已归位'),
   heading:t('Enter your <em>three-card story.</em>','走入你的<em>三张牌故事。</em>'),
   text:t('The cards you chose have moved from your hand into the constellation. Select a card, or begin with the first. Each interpretation is a scripted preview, not an AI response.','你刚才选出的三张牌已经从手中来到星空牌阵。点击任意一张牌，或从第一张开始。所有解读均为脚本演示，并非 AI 生成。')
 }:full?{
   kicker:t('THE THREAD BETWEEN THE CARDS','牌与牌之间的线索'),
   heading:t('See the <em>whole constellation.</em>','看见<em>整个牌阵。</em>'),
   text:demo.summary
 }:{
   kicker:`${t('CARD','第')} ${beat+1} / 3 · ${h(active.position)}`,
   heading:`${h(active.name)} <em>${active.orientation==='reversed'?t('reversed','逆位'):t('upright','正位')}</em>`,
   text:active.text
 };
 const nextLabel=opening?t('Begin the interpretation ✧','开始解读 ✧'):beat<2?t('Illuminate the next card →','照亮下一张牌 →'):beat===2?t('Bring the three meanings together →','汇聚三张牌的含义 →'):t('Revisit the first card','重温第一张牌');
 const phaseName=opening?'00':full?'04':String(beat+1).padStart(2,'0');
 return `<section class="reading-page reading-v07 ${state.localMode==='exodia'?'reading-exodia-mode':''}">
   ${renderArtemisTable({state,t,h,cardFace,roleNames})}
   <div class="reading-header"><div>${eyebrow('05 / '+t('THE READING COMES ALIVE','让解读鲜活起来'))}<h1>${t('The story <em>between the stars.</em>','星辰之间，<em>藏着怎样的线索？</em>')}</h1></div><div class="reading-demo-status"><strong>✧ ${state.localMode==='exodia'?t('LOCAL EXODIA · EXPERIMENTAL','本地 EXODIA · 实验版'):t('SCRIPTED DEMO','脚本演示')}</strong><span>${state.localMode==='exodia'?t('Only on this computer','仅限本机'):t('No live AI · No AI network calls','无实时 AI · 无 AI 网络请求')}</span></div></div>
   ${description()}
   ${state.localExodiaAvailable&&state.deckId==='rws'?`<div class="reading-source-switch" role="group" aria-label="${t('Reading source','解读来源')}"><button type="button" data-action="reading-scripted" aria-pressed="${state.localMode==='scripted'}" class="${state.localMode==='scripted'?'active':''}">${t('Scripted demo','脚本演示')}</button><button type="button" data-action="reading-exodia" aria-pressed="${state.localMode==='exodia'}" class="${state.localMode==='exodia'?'active':''}">${t('Local Exodia AI','本地 Exodia AI')}</button></div>`:''}
   <div class="reading-cinema" id="reading-cinema" aria-label="${t('Interactive cinematic Tarot interpretation','互动电影式塔罗解读')}">
     <div class="cinema-sky" aria-hidden="true"><span>✦</span><span>✧</span><span>✶</span></div>
     <div class="cinema-deck" role="group" aria-label="${t('Choose a card to illuminate','点击卡牌照亮对应解读')}">
       ${state.picks.map((p,i)=>`<button class="cinema-card ${beat===i?'is-focused':''} ${full?'is-complete':''}" data-reading-beat="${i}" style="--focus-color:${AURAS[p.card.aura]};--card-order:${i}" aria-label="${h(roleNames()[i])}: ${h(state.locale==='zh'?p.card.zh:p.card.name)}" aria-pressed="${beat===i}">${cardFace(p.card,p.orientation,true)}<span class="cinema-card-caption">${h(roleNames()[i])}</span></button>`).join('')}
     </div>
     <div class="cinema-narrative" aria-live="polite">
       <div class="cinema-counter">✧ ${phaseName} / 04 · ${h(narration.kicker)}</div>
       <h2>${narration.heading}</h2><p>${h(narration.text)}</p>
       ${active?`<p class="cinema-evidence">✦ ${h(active.evidenceQuestion)}</p>`:''}
       ${full?`<p class="cinema-evidence">✦ ${h(demo.transition)}</p>`:''}
       <div class="cinema-controls">${btn('cinema-prev',t('← Previous','← 上一段'),'secondary',opening)}${btn('cinema-next',nextLabel,'',false)}</div>
     </div>
   </div>
   <div class="cinema-progress" aria-label="${t('Reading chapters','解读章节')}">${[-1,0,1,2,3].map((v,i)=>`<button class="cinema-progress-dot ${beat===v?'active':''}" data-reading-beat="${v}" aria-label="${t('Chapter','章节')} ${i+1}" aria-current="${beat===v?'step':'false'}"></button>`).join('')}</div>
   ${full?`<section class="reading-v07-details" aria-label="${t('Complete three-card analysis','完整三张牌解读')}">${eyebrow(t('YOUR THREE CARD THEMES','你的三张牌主题'))}<div class="reading-v07-detail-grid">${demo.cards.map((c,i)=>`<article><span>${h(c.position)}</span><h3>${h(c.name)}</h3><p>${h(c.text)}</p><p class="cinema-evidence">${h(c.evidenceQuestion)}</p></article>`).join('')}</div><div class="takeaway"><div>${eyebrow(t('TAKE YOUR READING INTO THE WORLD','把启示带回现实'))}<h3>${t('One question. Two useful steps.','一个问题，两项实际行动。')}</h3><p>${h(demo.reflection)}</p><ol>${demo.nextSteps.map(x=>`<li>${h(x)}</li>`).join('')}</ol></div></div></section>
   <section class="demo-chat" aria-label="${t('Scripted follow-up conversation','脚本式追问对话')}">
     <div class="demo-chat-heading"><div>${eyebrow(t('CONTINUE THE CONVERSATION','继续探索'))}<h2>${t('Ask the cards another question.','再问牌阵一个问题。')}</h2><p>${t('Replies below are deterministic sample scripts based on the exact question and your three cards. They are NOT generated by AI. No text leaves this browser.','以下回复是根据问题与所选三张牌生成的固定脚本样例，并非 AI 解读。文字不会离开本浏览器。')}</p></div><span>${t('SIMULATED · ON DEVICE','模拟 · 本地')}</span></div>
     <div class="demo-suggestions">${DEMO_FOLLOWUPS[state.locale==='zh'?'zh':'en'].map(([key,label])=>`<button type="button" data-demo-suggest="${key}" data-demo-label="${h(label)}">✧ ${h(label)}</button>`).join('')}</div>
     <div class="demo-chat-log" id="demo-chat-log" role="log" aria-live="polite" aria-label="${t('Scripted conversation','脚本对话')}">${demoMessages()}</div>
     <form class="demo-chat-form" id="demo-followup-form"><label for="demo-followup-input">${t('Your follow-up question','你的追问')}</label><div><input id="demo-followup-input" type="text" maxlength="280" minlength="2" autocomplete="off" placeholder="${t('What does the guidance card mean for me?','综合建议牌对我意味着什么？')}" ${state.demoConversation.length>=12?'disabled':''} required/><button class="btn" type="submit" ${state.demoConversation.length>=12?'disabled':''}>${t('Ask →','提问 →')}</button></div><span>${t(`${state.demoConversation.length}/12 sample replies · No account or AI service`,`${state.demoConversation.length}/12 条模拟回复 · 无需账户或 AI 服务`)}</span></form>
     <div id="demo-chat-clear-slot">${state.demoConversation.length?btn('demo-chat-clear',t('Clear this conversation','清空本次对话'),'quiet'):''}</div>
   </section>`:''}
   ${full?localExodiaPanel():''}
   <div class="cta-row reading-end-actions">${btn('restart',t('Begin another reading','开始新的解读'))}${btn('save',t('Save this spread on my device','将牌阵保存到本设备'),'secondary')}${btn('gallery',t('Browse the original illustrations','查看原版插画'),'quiet')}</div>
   <p class="fine-print">${t('v0.7 is a cinematic, local scripted experience. It does not use an AI model, know facts about your life, predict outcomes, or replace professional advice. Live AI connection is intentionally deferred.','v0.7 是本地电影式脚本体验，不使用 AI 模型，不知道你的真实生活情况，不能预测结果，也不能代替专业建议。实时 AI 接入已按要求暂缓。')}</p>
 </section>`;
}
function resetDemo(){state.readingBeat=-1;state.demoConversation=[];resetLocalResponses();}
function changeReadingBeat(beat){if(state.step!==5)return;state.readingBeat=Math.max(-1,Math.min(3,Number(beat)));render();}
function submitDemoFollowUp(text){
 if(state.step!==5||state.readingBeat!==3)return;
 try{const reading=scriptedReading();const answer=answerDemoFollowUp({reading,question:text,history:state.demoConversation});state.demoConversation.push({question:answer.question,answer});const log=root.querySelector('#demo-chat-log');if(log){log.innerHTML=demoMessages();log.scrollTop=log.scrollHeight;}const counter=root.querySelector('.demo-chat-form>span');if(counter)counter.textContent=t(`${state.demoConversation.length}/12 sample replies · No account or AI service`,`${state.demoConversation.length}/12 条模拟回复 · 无需账户或 AI 服务`);const clearSlot=root.querySelector('#demo-chat-clear-slot');if(clearSlot)clearSlot.innerHTML=btn('demo-chat-clear',t('Clear this conversation','清空本次对话'),'quiet');if(state.demoConversation.length>=12){root.querySelector('#demo-followup-input').disabled=true;root.querySelector('#demo-followup-form button').disabled=true;root.querySelectorAll('[data-demo-suggest]').forEach(b=>b.disabled=true);}}
 catch(error){toast(t('Please enter 2–280 characters (maximum 12 turns).','请填写 2–280 个字符（最多 12 轮）。'))}
}

function gallery(){const matching=DECK.filter(c=>state.filter==='all'||c.suit===state.filter);return `<div class="modal" role="dialog" aria-modal="true" aria-label="${t('Tarot artwork gallery','塔罗插画画廊')}"><div class="modal-header"><div>${eyebrow(state.deckId==='rws'?'PAMELA COLMAN SMITH · 1909':'JUI GUOLIANG · PERSONAL LOCAL IMAGES')}<h2>${state.deckId==='rws'?t('The complete original artwork','完整的 78 张原版插画'):t('Your private Chinese Tarot gallery','你的私人中国塔罗画廊')}</h2><p>${state.deckId==='rws'?t('Select an original card to see its artwork, meaning and source. No redrawn card faces.','点击原版牌面，查看插画、含义和来源。不使用重画牌面。'):t('The 78 pictures were imported locally by you. They are not distributed from this website. Meanings currently use standard Tarot correspondences.','这 78 张图片由你在本机导入，网站不会分发。牌义目前采用标准塔罗体系的对应解释。')}</p></div><button class="close-btn" data-action="close">✕ ${t('Close','关闭')}</button></div><div class="chip-row filter-row">${[['all',t('All 78','全部 78 张')],['major',t('Major Arcana','大阿尔卡那')],['wands',t('Wands','权杖')],['cups',t('Cups','圣杯')],['swords',t('Swords','宝剑')],['pentacles',t('Pentacles','星币')]].map(([key,label])=>`<button data-filter="${key}" class="chip ${state.filter===key?'active':''}">${label}</button>`).join('')}</div><div class="gallery-grid">${matching.map(c=>`<button class="gallery-item" data-inspect="${c.id}">${cardFace(c)}<span>${h(state.locale==='zh'?c.zh:c.name)}</span></button>`).join('')}</div><p class="fine-print">${state.deckId==='rws'?t('Source: Wikimedia Commons TaionWC scans, self-hosted on deployment.','来源：Wikimedia Commons TaionWC 扫描图，部署时自有托管。'):t('Personal local image preview. Refreshed pages discard the private image files.','本地私人牌面预览，刷新页面会清除图片。')}</p></div>`}
function inspect(){const c=BY_ID.get(state.inspected);return `<div class="modal" role="dialog" aria-modal="true" aria-label="${h(c.name)}"><div class="modal-header"><div>${eyebrow(state.deckId==='rws'?t('ORIGINAL ILLUSTRATION','原版插画'):t('LOCAL CHINESE TAROT ILLUSTRATION','本地中国塔罗插画'))}<h2>${h(state.locale==='zh'?c.zh:c.name)}</h2></div><button class="close-btn" data-action="back-gallery">✕ ${t('Gallery','返回画廊')}</button></div><div class="inspector"><div class="inspector-card">${cardFace(c,'upright',true)}</div><div><p class="intro">${state.deckId==='rws'?t('Original illustration by Pamela Colman Smith for the 1909 Rider–Waite–Smith Tarot.','Pamela Colman Smith 于 1909 年为经典韦特塔罗创作的原版插画。'):t('Your privately imported Chinese Tarot image. The symbolic interpretation uses the standard Tarot card mapping.','你私下导入的中国塔罗图片，解读采用标准塔罗牌的对应关系。')}</p><div class="aside-line"><span>${t('Suit','花色')}</span><strong>${h(c.suit)}</strong></div><div class="aside-line"><span>${t('Symbolic finish','象征光泽')}</span><strong style="color:${AURAS[c.aura]}">● ${h(c.aura)}</strong></div><div class="aside-line"><span>${t('Upright','正位')}</span><strong>${h(c.upright)}</strong></div><div class="aside-line"><span>${t('Reversed','逆位')}</span><strong>${h(c.reversed)}</strong></div>${state.deckId==='rws'?`<p><a class="external" target="_blank" rel="noopener noreferrer" href="${commonsFileUrl(c)}">${t('Original scan, attribution and license ↗','查看原图、署名与版权信息 ↗')}</a></p>`:`<p><a class="external" target="_blank" rel="noopener noreferrer" href="${DECKS[1].infoUrl}">${t('Publisher artwork and rights ↗','出版商原版插画与版权 ↗')}</a></p>`}<div class="cta-row">${btn('back-gallery',t('See all the cards','返回全部卡牌'),'secondary')}</div></div></div></div>`}
function decks(){const cn=DECKS[1],local=state.privateImages.size===78;return `<div class="modal" role="dialog" aria-modal="true" aria-label="${t('Artwork decks','插画牌组')}"><div class="modal-header"><div>${eyebrow(t('DECK COLLECTION','插画牌组'))}<h2>${t('Two visual traditions','两种插画传统')}</h2><p>${t('The complete classic deck is included. For Chinese Tarot, explore the genuine illustrations at the publisher, or privately load your own authorized 78 images.','经典原版牌组已完整提供。中国塔罗可在出版商网站欣赏真实插画，或将自己获授权的 78 张图片仅在本机载入。')}</p></div><button class="close-btn" data-action="close">✕ ${t('Close','关闭')}</button></div><div class="deck-collection"><div class="deck-panel"><div class="deck-image">${cardFace(DECK[17],'upright',false,'rws')}</div><h3>Rider–Waite–Smith</h3><p>${t('All 78 historical illustrations by Pamela Colman Smith.','Pamela Colman Smith 的完整 78 张历史经典插画。')}</p><button class="btn ${state.deckId==='rws'?'':'secondary'}" data-action="use-rws">${state.deckId==='rws'?t('✓ Current deck','✓ 当前牌组'):t('Use main deck','使用主牌组')}</button></div><div class="deck-panel"><div class="pending-art chinese-deck-intro"><strong>中国塔罗</strong><span>THE CHINESE TAROT · JUI GUOLIANG</span></div><h3>${cn.title}</h3><p>${t('A complete illustrated 1989 Chinese ink-and-watercolor Tarot. Digital publication rights are held by the publisher.','一套完整的 1989 年中国风水墨设色塔罗牌，数字出版须取得出版商许可。')}</p><a class="external" href="${cn.infoUrl}" target="_blank" rel="noopener noreferrer">${t('See original artwork at the publisher ↗','在出版商网站欣赏原版插画 ↗')}</a><a class="external" href="https://benebellwen.com/2021/06/07/the-chinese-tarot-by-jui-guoliang/" target="_blank" rel="noopener noreferrer">${t('Browse photographs of the real cards ↗','浏览真实牌面的实拍照片 ↗')}</a><div class="private-deck-import"><label for="private-deck-files" class="field-label">${t('Private local preview · 78 authorized images','私人本地预览 · 78 张获授权图片')}</label><p>${t('Files stay in this browser tab, are not sent to our servers, and disappear after refresh. File names must match the mapping guide.','图片仅保留在此浏览器标签页，不会上传服务器；刷新即清除。文件名必须与对照表一致。')}</p><button data-action="mapping-guide" class="text-link">${t('Download 78-card filename guide ↓','下载 78 张图片文件名对照表 ↓')}</button><input id="private-deck-files" class="private-file-input" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="${t('Import 78 local tarot image files','导入 78 张本地塔罗图片')}"><div class="private-import-status" id="private-import-status" role="status">${local?t('78 personal images loaded for this session.','本次会话已载入 78 张私人图片。'):t('No Chinese card images loaded yet.','尚未载入中国塔罗牌面。')}</div>${local?btn('use-chinese',state.deckId==='chinese-tarot'?t('✓ Using private Chinese deck','✓ 正在使用私人中国塔罗'):t('Use my local Chinese deck','使用我的私人中国塔罗'),'secondary'):''}</div></div></div><div class="license-note">${t('Public distribution of The Chinese Tarot scans requires the publisher’s permission. Private files you import are not uploaded or bundled with the GitHub Pages site.','公开分发《中国塔罗》的扫描图须取得出版商许可。你导入的私人图片不会上传，也不会打包到 GitHub Pages 网站。')}</div></div>`}
let webglSphere=null,pendingFlight=null,ritualCinema=null,launchCinema=null,launchOverlay=null,autoConfirmTimer=null;
const cancelAutoConfirm=()=>{if(autoConfirmTimer)clearTimeout(autoConfirmTimer);autoConfirmTimer=null;state.autoConfirmAt=null;};
const clearLaunch=()=>{launchCinema?.dispose();launchCinema=null;launchOverlay?.remove();launchOverlay=null;};
const motionReduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
function orbitTick(delta,time){
 if(!drag&&!state.orbitPaused&&!motionReduced()&&time>=state.orbitHoldUntil&&!pendingFlight?.pauseOrbit)state.ry=nextOrbitYaw(state.ry,delta,true);
}
function render(){
 if(pendingFlight){pendingFlight.cancel();pendingFlight=null;}if(webglSphere){webglSphere.dispose();webglSphere=null;}if(ritualCinema){ritualCinema.dispose();ritualCinema=null;}document.documentElement.lang=state.locale==='zh'?'zh-CN':'en';document.title=BRAND.pageTitle;root.innerHTML=`<div class="site ${state.effects?'':'effects-off'} ${state.step<=4?'ritual-focused':''}">${masthead()}${navigation()}<main class="stage" aria-live="polite">${[welcome,question,shuffling,sphere,reveal,reading][state.step]()}</main><footer class="site-footer"><span>✺ <strong>${h(brandText(state.locale,'lockup'))}</strong> <span class="footer-version">v${APP_VERSION}</span> · ${t('Original illustrated Tarot · No rarity economy','原版插画塔罗 · 无稀有度系统')}</span><div><button data-action="effects" class="footer-link">${state.effects?t('Reduce shine','减少光效'):t('Restore shine','恢复光效')}</button><span> · </span><button data-action="decks" class="footer-link">${t('Artwork & rights','插画与版权')}</button></div></footer>${state.modal==="gallery"?gallery():state.modal==='inspect'?inspect():state.modal==='decks'?decks():''}<div id="toast" class="toast" role="status" aria-live="polite" hidden></div></div>`;
 if(!state.modal&&!motionReduced()&&(state.step===0||state.step===2)){
  const target=state.step===0?root.querySelector('.ritual-landing'):root.querySelector('.ritual-shuffle-scene');
  ritualCinema=mountRitualCinema(target,{mode:state.step===0?'landing':'shuffle',startAt:state.ritualAnimationStartAt,phaseOffset:state.landingPhaseOffset,deckId:state.deckId,localImages:state.privateImages,style:state.shuffleStyle});
 }
 if(state.step===3&&!state.modal&&state.sphereMode==='gpu'){
  webglSphere=mountWebGLSphere(root.querySelector('#sphere-scene'),state.shuffled,state.picks,()=>({rx:state.rx,ry:state.ry}),{onFrame:orbitTick});
  const label=root.querySelector('#sphere-mode-label');
  if(!webglSphere){state.sphereMode='2d';render();return;}
  if(label)label.textContent=t('INSIDE 3D · LOOK AROUND','内侧 3D · 环顾四周');
 }
}
function toast(message){const el=root.querySelector('#toast');if(!el)return;el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{if(el.isConnected)el.hidden=true},4000)}

function startQuestionRitual(){
 if(state.question.trim().length<3||state.question.length>600){root.querySelector('#question')?.focus();toast(t('Please enter a question (3–600 characters)','请输入 3–600 个字符的问题'));return;}
 if(!deckIsReady(state.deckId,state.privateImages)){toast(t('This deck needs 78 authorized illustrations first','此牌组需要先提供获授权的 78 张插画'));return;}
 const preflight=prepareQuestionPreflight({question:state.question,locale:state.locale,spreadId:state.spread==='insight'?'past-present-future':'crossroads',deckId:state.deckId,readerId:'artemis'});
 state.ritual=createRitualSession({deckId:state.deckId,readerId:'artemis',spreadId:preflight.spreadId,locale:state.locale});
 state.ritual=transitionRitual(state.ritual,'SUBMIT_QUESTION',{question:state.question,preflight});
 state.shuffleStyle='cosmic';state.ritualAnimationStartAt=performance.now();state.landingPhaseOffset=state.ritualAnimationStartAt/1000;
 reshuffle();state.step=2;const token=++state.ritualEpoch;render();
 setTimeout(()=>{
  if(token!==state.ritualEpoch||state.step!==2||state.ritual.phase!=='question_submitted')return;
  state.ritual=transitionRitual(state.ritual,'COLLAPSE_COMPLETE',{},performance.now());render();
  setTimeout(()=>{
   if(token!==state.ritualEpoch||state.step!==2||state.ritual.phase!=='shuffle_ritual')return;
   try{state.ritual=transitionRitual(state.ritual,'MIN_SHUFFLE_ELAPSED',{},performance.now());render();}
   catch(e){console.warn('Ritual timer guard',e)}
  },DEFAULT_SHUFFLE_MS+60);
 },950);
}
function replayShuffle(style){
 if(state.ritual.phase!=='deck_formed'||!['cosmic','riffle','wash'].includes(style)||launchOverlay)return;
 state.shuffleStyle=style;state.shuffled=shuffleDeck(state.shuffled);state.shuffles++;
 state.ritualAnimationStartAt=performance.now();state.ritual=transitionRitual(state.ritual,'RESHUFFLE',{},state.ritualAnimationStartAt);
 const token=++state.ritualEpoch;render();
 setTimeout(()=>{if(token!==state.ritualEpoch||state.ritual.phase!=='shuffle_ritual'||state.step!==2)return;try{state.ritual=transitionRitual(state.ritual,'MIN_SHUFFLE_ELAPSED',{},performance.now());render();}catch(e){console.warn('Shuffle guard',e)}},DEFAULT_SHUFFLE_MS+60);
}
function finishShuffling(){
 if(state.ritual.phase!=='deck_formed'||launchOverlay)return;
 state.ritual=transitionRitual(state.ritual,'FINISH_SHUFFLING');
 if(motionReduced()){go(3);return;}
 const token=++state.ritualEpoch;
 const overlay=document.createElement('div');overlay.className='ritual-launch-overlay';overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML='<div class="ritual-launch-cloud"></div><div class="ritual-launch-prompt">'+t('Entering the celestial sphere…','正穿越星辰，进入塔罗牌宇宙……')+'</div>';
 document.body.append(overlay);launchOverlay=overlay;
 launchCinema=mountRitualCinema(overlay,{mode:'launch',startAt:performance.now(),deckId:state.deckId,localImages:state.privateImages});
 setTimeout(()=>{if(token!==state.ritualEpoch){clearLaunch();return;}clearLaunch();go(3);},LAUNCH_DURATION_MS);
}

function confirmThreeCards(){
 if(!canConfirmThree(state.ritual)||state.ritualLocking)return;
 cancelAutoConfirm();
 state.ritual=transitionRitual(state.ritual,'CONFIRM_THREE',{},performance.now());
 state.ritualLocking=true;const token=++state.ritualEpoch;
 // The API will be called exactly once on this lock in 8.3; Phase 8.1 does not invoke it.
 if(motionReduced()){finishVortex(token);return;}
 const overlay=document.createElement('div');overlay.className='ritual-vortex-transition';
 overlay.setAttribute('role','status');overlay.setAttribute('aria-label',t('Three cards locked. The remaining cards return to the stars.','三张牌已锁定，其余牌面重返星辰。'));
 overlay.innerHTML='<div class="ritual-black-hole"></div><div class="ritual-vortex-debris">'+Array.from({length:38},(_,i)=>'<div style="--i:'+i+';--angle:'+(i*137.5)+'deg">'+cardBack()+'</div>').join('')+'</div>'+
 '<div class="ritual-locked-trio">'+state.picks.map((p,i)=>'<div style="--i:'+i+'">'+cardBack()+'<span>'+['01 PAST','02 PRESENT','03 FUTURE'][i]+'</span></div>').join('')+'</div>';
 document.body.append(overlay);state.ritualOverlay=overlay;
 setTimeout(()=>finishVortex(token),1550);
}
function finishVortex(token){
 if(token!==state.ritualEpoch||state.ritual.phase!=='three_locked')return;
 state.ritualOverlay?.remove();state.ritualOverlay=null;state.ritualLocking=false;
 state.ritual=transitionRitual(state.ritual,'VORTEX_COMPLETE');go(4);
}

function go(step){if(step!==3)cancelAutoConfirm();if(step===3&&state.ritual.phase!=='sphere_selection')return;if(step===4&&state.ritual.phase!=='three_reveal')return;if(step===2&&state.ritual.phase==='sphere_selection')return;if(step>=4&&state.picks.length!==3)return;if(step===5&&!allCardsRevealed(state.revealedCards))return;if(step===5&&state.ritual.phase==='three_reveal'){state.ritual=transitionRitual(state.ritual,'ALL_REVEALED');}if(step===4&&state.step<4){state.revealIndex=0;state.revealProgress=0;state.revealedCards=[false,false,false];state.peekProgress=[0,0,0];state.peekAxes=[{ax:0,ay:1},{ax:0,ay:1},{ax:0,ay:1}];}state.step=Math.max(0,Math.min(5,step));render()}
function reshuffle(){cancelAutoConfirm();resetDemo();state.shuffled=shuffleDeck();state.picks=[];state.shuffles++;state.revealIndex=0;state.revealProgress=0;state.revealedCards=[false,false,false]}
function selectCard(card){if(!card||state.ritual.phase!=='sphere_selection'||state.ritualLocking)return;try{cancelAutoConfirm();state.ritual=transitionRitual(state.ritual,'TOGGLE_CARD',{cardId:card.id,orientation:drawOrientation()});state.picks=state.ritual.selected.map(c=>({card:BY_ID.get(c.cardId),orientation:c.orientation}));if(state.picks.length===3){state.autoConfirmAt=null;/* Foreground trio remains for visual inspection until explicit confirmation. */}render();}catch(e){toast(e.message);}}
function toggleCard(card){selectCard(card);}
function revealPhysicalCard(index){if(state.step!==4||state.revealedCards[index])return;state.revealedCards[index]=true;state.peekProgress[index]=1;if(state.ritual.phase==='three_reveal')state.ritual=transitionRitual(state.ritual,'REVEAL_CARD',{index});render();}
function centerRect(rect){return rect&&Number.isFinite(rect.left)?{x:rect.left+rect.width/2,y:rect.top+rect.height/2,width:rect.width,height:rect.height}:null}
/** Picking remains locked until the chosen card has visibly arrived in the next hand slot. */
function catchCard(card,source){
 if(!card||pendingFlight||state.step!==3||state.picks.length>=3||state.picks.some(p=>p.card.id===card.id))return;
 const destination=root.querySelectorAll('.slots .slot-image')[state.picks.length];
 const from=source||webglSphere?.projectCard(card.id)||centerRect(root.querySelector('#sphere-scene')?.getBoundingClientRect())||{x:innerWidth/2,y:innerHeight/2,width:60,height:96};
 const to=centerRect(destination?.getBoundingClientRect());
 if(!to||motionReduced()||!document.body||typeof document.body.animate==='undefined'){
  selectCard(card);render();return;
 }
 webglSphere?.hideCard(card.id);
 const overlay=document.createElement('div');overlay.className='card-flight';
 overlay.style.width=Math.min(96,Math.max(38,from.width||56))+'px';overlay.style.height='auto';overlay.innerHTML=cardBack();
 overlay.style.left=from.x+'px';overlay.style.top=from.y+'px';
 overlay.setAttribute('aria-hidden','true');document.body.append(overlay);
 const burst=document.createElement('div');burst.className='card-flight-burst';burst.style.left=from.x+'px';burst.style.top=from.y+'px';burst.setAttribute('aria-hidden','true');burst.innerHTML='✦ <span>✧</span> ✦';document.body.append(burst);
 destination.classList.add('receiving');
 const animation=overlay.animate(cardFlightFrames(from,to),{duration:FLIGHT_DURATION_MS,easing:'cubic-bezier(.2,.6,.2,1)',fill:'forwards'});
 const burstAnimation=burst.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.2)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.65)',offset:.24},{opacity:0,transform:'translate(-50%,-50%) scale(3)'}],{duration:FLIGHT_DURATION_MS*.72,fill:'forwards'});
 let active=true;
 const cleanup=()=>{overlay.remove();burst.remove();destination.classList.remove('receiving');};
 const cancel=()=>{if(!active)return;active=false;animation.cancel();burstAnimation.cancel();cleanup();};
 pendingFlight={cancel};
 animation.onfinish=()=>{if(!active||state.step!==3)return;active=false;cleanup();pendingFlight=null;selectCard(card);render();};
}

function orbOrientation(){const el=root.querySelector('#orb');if(el){el.style.setProperty('--rx',state.rx+'deg');el.style.setProperty('--ry',state.ry+'deg')}}
const oldDefault='Should I accept the new job offer or stay in my current role?',newDefault='我应该接受新工作，还是留在目前的职位？';
root.addEventListener('sphere-webgl-lost',()=>{state.sphereMode='2d';render()});
root.addEventListener('input',e=>{const key={question:'question',optionA:'optionA',optionB:'optionB'}[e.target.id];if(key)state[key]=e.target.value});
root.addEventListener('error',e=>{const img=e.target;if(!(img instanceof HTMLImageElement)||!img.classList.contains('card-image'))return;if(img.dataset.fallback==='0'&&img.dataset.remote){img.dataset.fallback='1';img.src=img.dataset.remote}else{img.hidden=true;const fallback=img.nextElementSibling;if(fallback)fallback.hidden=false}},true);
root.addEventListener('change',e=>{
 if(e.target?.id!=='private-deck-files')return;
 try{
  const files=validatePrivateDeckFiles(e.target.files,DECK);
  for(const url of state.privateImages.values())URL.revokeObjectURL(url);
  state.privateImages=new Map(Array.from(files,([id,file])=>[id,URL.createObjectURL(file)]));
  state.deckId='chinese-tarot';state.modal=null;state.aiReading=null;state.aiStatus='idle';state.aiError='';state.aiRequestId++;
  render();toast(t('78 private Chinese illustrations loaded for this session.','本次会话已载入 78 张私人中国塔罗插画。'));
 }catch(err){const output=root.querySelector('#private-import-status');if(output)output.textContent=err.message}
});
window.addEventListener('pagehide',()=>{for(const url of state.privateImages.values())URL.revokeObjectURL(url);ritualCinema?.dispose();clearLaunch();cancelAutoConfirm();});
let drag=null,ignoreClickUntil=0;
root.addEventListener('pointerdown',e=>{
 const scene=e.target.closest('#sphere-scene');if(!scene||pendingFlight)return;state.orbitHoldUntil=performance.now()+DRAG_RESUME_DELAY_MS;drag={startX:e.clientX,startY:e.clientY,rx:state.rx,ry:state.ry,moved:false};scene.classList.add('dragging')});
const finishDrag=()=>{if(drag?.moved)ignoreClickUntil=Date.now()+300;if(drag)state.orbitHoldUntil=performance.now()+DRAG_RESUME_DELAY_MS;drag=null;root.querySelector('#sphere-scene')?.classList.remove('dragging')};
root.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;if(Math.abs(dx)+Math.abs(dy)>7)drag.moved=true;if(drag.moved){state.ry=drag.ry+dx*.5;state.rx=Math.max(-82,Math.min(82,drag.rx-dy*.45));orbOrientation()}});
root.addEventListener('pointerup',()=>finishDrag());
root.addEventListener('pointercancel',()=>finishDrag());
root.addEventListener('pointerleave',()=>finishDrag());
root.addEventListener('click',e=>{
  const flipButton=e.target.closest?.('[data-flip-card]');if(flipButton){if(Date.now()<ignoreClickUntil)return;revealPhysicalCard(Number(flipButton.dataset.flipCard));return;}
  if(e.target.id==='sphere-webgl'){if(Date.now()<ignoreClickUntil||pendingFlight)return;const id=webglSphere?.pick(e.clientX,e.clientY);if(id)catchCard(BY_ID.get(id),{x:e.clientX,y:e.clientY,width:70,height:112});return}
  const button=e.target.closest('button');if(!button||!root.contains(button))return;
  if(pendingFlight&&button.dataset.action==='next')return;
  if(button.hasAttribute('data-reading-beat')){changeReadingBeat(Number(button.dataset.readingBeat));return;}
  if(button.hasAttribute('data-demo-suggest')){submitDemoFollowUp(button.dataset.demoLabel);return;}
  if(button.hasAttribute('data-step')){const n=Number(button.dataset.step);if(n<=state.step){if(state.step===2&&n!==2)state.ritualEpoch++;go(n)}return}
  if(button.dataset.shuffleStyle){replayShuffle(button.dataset.shuffleStyle);return}
 if(button.dataset.lens){state.demoConversation=[];resetLocalResponses();state.lens=button.dataset.lens;state.aiReading=null;state.aiStatus='idle';state.aiError='';state.aiRequestId++;render();return}
  if(button.dataset.spread){state.spread=button.dataset.spread;state.aiReading=null;render();return}
  if(button.dataset.filter){state.filter=button.dataset.filter;render();return}
  if(button.dataset.inspect){state.inspected=button.dataset.inspect;state.modal='inspect';render();return}
  if(button.hasAttribute('data-reveal-card')){const j=Number(button.dataset.revealCard);if(j<=state.revealIndex){state.revealIndex=j;state.revealProgress=state.revealedCards[j]?1:0;render()}return}
  if(button.dataset.pick){if(Date.now()<ignoreClickUntil||state.ritualLocking)return;toggleCard(BY_ID.get(button.dataset.pick));return}
   if(button.dataset.unselect){toggleCard(BY_ID.get(button.dataset.unselect));return}
  switch(button.dataset.action){
    case 'home':cancelAutoConfirm();clearLaunch();state.ritualEpoch++;state.ritual=createRitualSession({deckId:state.deckId,spreadId:state.spread==='insight'?'past-present-future':'crossroads',locale:state.locale});state.step=0;state.modal=null;render();break;
    case 'gallery':state.filter='all';state.modal='gallery';render();break;
    case 'decks':state.modal='decks';render();break;
    case 'close':state.modal=null;render();break;
    case 'back-gallery':state.modal='gallery';render();break;
    case 'locale':{state.demoConversation=[];resetLocalResponses();state.locale=state.locale==='en'?'zh':'en';if(state.question===oldDefault||state.question===newDefault)state.question=state.locale==='zh'?newDefault:oldDefault;if(['Accept the new offer','接受新工作'].includes(state.optionA))state.optionA=state.locale==='zh'?'接受新工作':'Accept the new offer';if(['Stay in my current role','留在目前的职位'].includes(state.optionB))state.optionB=state.locale==='zh'?'留在目前的职位':'Stay in my current role';render();break}
    case 'begin':startQuestionRitual();break;
     case 'configure':go(1);break;
     case 'finish-shuffle':finishShuffling();break;
     case 'invite-reader':if(state.step===5&&state.ritual.phase==='reader_invitation'){state.ritual=transitionRitual(state.ritual,'INVITE_READER');render()}break;
     case 'confirm-cards':confirmThreeCards();break;
    case 'shuffle':break; // 8.1 automatic shuffle is gated, not manually accelerated
    case 'next':go(state.step+1);break;
    case 'next-reveal':if(allCardsRevealed(state.revealedCards))go(5);break;
    case 'mapping-guide':{const blob=new Blob([deckFileNameGuide(DECK)],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='JuHua-Chinese-Tarot-78-card-filename-guide.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);break;}
    case 'use-rws':state.deckId='rws';state.modal=null;render();break;
    case 'use-chinese':if(state.privateImages.size===78){state.deckId='chinese-tarot';state.modal=null;render()}break;
    case 'back':go(state.step-1);break;
    case 'rotate-left':state.ry-=25;state.orbitHoldUntil=performance.now()+DRAG_RESUME_DELAY_MS;orbOrientation();break;
    case 'rotate-right':state.ry+=25;state.orbitHoldUntil=performance.now()+DRAG_RESUME_DELAY_MS;orbOrientation();break;
    case 'toggle-orbit':state.orbitPaused=!state.orbitPaused;state.orbitHoldUntil=performance.now()+DRAG_RESUME_DELAY_MS;{const b=root.querySelector('[data-action="toggle-orbit"]');if(b){b.textContent=state.orbitPaused?t('▶ Resume universe','▶ 继续旋转'):t('Ⅱ Pause universe','Ⅱ 暂停旋转');b.setAttribute('aria-pressed',String(state.orbitPaused));}}break;
    case 'random':{const available=state.shuffled.filter(c=>!state.picks.some(p=>p.card.id===c.id));if(available.length){toggleCard(available[0])}break}
    case 'restart':cancelAutoConfirm();clearLaunch();state.ritualEpoch++;state.ritual=createRitualSession({deckId:state.deckId,spreadId:state.spread==='insight'?'past-present-future':'crossroads',locale:state.locale});resetDemo();state.step=0;state.shuffled=[];state.picks=[];state.shuffles=0;state.aiReading=null;state.aiStatus='idle';state.aiError='';state.aiRequestId++;render();break;
    case 'save':{try{const payload={savedAt:new Date().toISOString(),question:state.question,options:[state.optionA,state.optionB],spread:state.spread,lens:state.lens,picks:state.picks.map(p=>({id:p.card.id,orientation:p.orientation})),deckId:state.deckId};localStorage.setItem('juhua-reading-v1',JSON.stringify(payload));toast(t('Saved privately on this device','已保存在本设备'))}catch{toast(t('Local saving is unavailable','本地保存不可用'))}break}
    case 'cinema-next':changeReadingBeat(state.readingBeat===3?0:state.readingBeat+1);break;
    case 'cinema-prev':changeReadingBeat(state.readingBeat-1);break;
    case 'demo-chat-clear':state.demoConversation=[];render();break;
    case 'reading-scripted':state.localMode='scripted';render();break;
    case 'reading-exodia':if(state.localExodiaAvailable&&state.deckId==='rws'){state.localMode='exodia';render()}break;
    case 'exodia-generate':runLocalReading();break;
    case 'effects':state.effects=!state.effects;render();break;
    case 'sphere-mode':state.sphereMode=state.sphereMode==='gpu'?'2d':'gpu';render();break;

  }
});
root.addEventListener('submit',event=>{if(event.target?.id==='local-exodia-followup'){event.preventDefault();const field=root.querySelector('#local-exodia-question');const value=field?.value.trim();if(value?.length>=2)runLocalReading(value);return;}if(event.target?.id!=='demo-followup-form')return;event.preventDefault();const input=root.querySelector('#demo-followup-input');const message=input?.value.trim();if(!message)return;submitDemoFollowUp(message);if(input&&!input.disabled){input.value='';input.focus();}});
root.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.modal){state.modal=null;render()}if(state.step===3&&!state.modal&&e.target.closest('#sphere-scene')){if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();state.orbitHoldUntil=performance.now()+DRAG_RESUME_DELAY_MS;if(e.key==='ArrowLeft')state.ry-=24;if(e.key==='ArrowRight')state.ry+=24;if(e.key==='ArrowUp')state.rx=Math.min(75,state.rx+16);if(e.key==='ArrowDown')state.rx=Math.max(-75,state.rx-16);orbOrientation()}else if(e.key==='Enter'&&e.target.id==='sphere-webgl'){const id=webglSphere?.pickCenter();if(id)catchCard(BY_ID.get(id),webglSphere?.projectCard(id))}}});
render();

// Local Exodia is unavailable from GitHub Pages and is never called automatically.
discoverLocalExodia().then(status=>{if(!status)return;state.localExodiaAvailable=true;if(state.step===5)render();});
