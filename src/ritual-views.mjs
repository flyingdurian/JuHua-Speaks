/**
 * Phase 8.1 presentation: decorative landing orbit and staged shuffle.
 * Receives only rendering callbacks; no networking or draw logic in views.
 */
export function renderRitualLanding({state,t,h,btn,eyebrow,cardFace,cardBack,DECK,brand}){
 const near=[17,0,19,8,4,18,21,11,12,6,16,9];
 const cards=near.map((index,i)=>'<div class="landing-floater landing-depth-'+(i%3)+'" style="--n:'+i+';--angle:'+(i*30)+'deg;--delay:'+(-i*1.6)+'s">'+(i%4===3?cardBack():cardFace(DECK[index],'upright',i<4))+'</div>').join('');
 const intro=state.locale==='zh'?'把你的问题交给星辰，让塔罗为你照亮新的视角。':'A question, 78 cards, and a universe of possibilities.';
 return '<section class="ritual-landing" aria-label="'+h(t('Ask your Tarot question','向塔罗提出你的问题'))+'">'+
  '<div class="landing-starlight" aria-hidden="true"></div><div class="landing-orbit" aria-hidden="true">'+cards+'</div>'+
  '<div class="landing-center">'+eyebrow(t('THE STARS ARE LISTENING','星辰正在聆听'))+
  '<h1>'+h(brand)+'</h1><p class="landing-tagline">'+h(intro)+'</p>'+
  '<label for="question">'+t('What would you like to ask?','你想问些什么？')+'</label>'+
  '<textarea id="question" maxlength="600" spellcheck="true" placeholder="'+t('Write your question here…','在这里写下你的问题……')+'">'+h(state.question)+'</textarea>'+
  '<div class="landing-cta">'+btn('begin',t('Start Divination ✧','开始占卜 ✧'))+
  btn('configure',t('Spread & deck options','牌阵与牌组选项'),'secondary')+'</div>'+
  '<div class="landing-note">'+h(t('Authentic 78-card Rider–Waite–Smith · Reflective, not predictive','78 张经典韦特塔罗原版插画 · 反思启示而非命运预测'))+'</div>'+
  '</div></section>';
}
export function renderRitualShuffle({state,t,h,btn,eyebrow,cardFace,cardBack,DECK,description}){
 const phase=state.ritual.phase;
 const ready=phase==='deck_formed';
 const isCollapse=phase==='question_submitted';
 const cardVisuals=Array.from({length:26},(_,i)=>{
  const angle=i*137.5,rad=Math.PI*angle/180;
  const x=Math.cos(rad)*(85+(i%7)*18),y=Math.sin(rad)*(80+(i%5)*21);
  const content=(i%4===0)?cardFace(DECK[(i*7+2)%78],'upright',true):cardBack();
  return '<div class="ritual-swirl-card" style="--i:'+i+';--x:'+x.toFixed(1)+'px;--y:'+y.toFixed(1)+'px;--rot:'+(i*33)+'deg;--delay:'+(-i*.19)+'s">'+content+'</div>';
 }).join('');
 return '<section class="ritual-shuffle ritual-phase-'+phase+'">'+
  eyebrow('02 / '+t('THE SHUFFLE RITUAL','洗牌仪式'))+
  '<h1>'+t(isCollapse?'Gathering the constellation…':ready?'The deck is ready.':'Shuffling… Please meditate on your question',isCollapse?'星辰正在汇聚……':ready?'牌组已经准备好。':'洗牌中……请冥想你的问题')+'</h1>'+
  '<p class="ritual-shuffle-sub">'+h(t('Let the cards move while you hold your question in mind.','请把问题放在心中，静静感受牌阵的流转。'))+'</p>'+
  description()+
  '<div class="ritual-shuffle-scene" aria-label="'+h(t('Tarot cards gather into a floating deck','塔罗牌汇聚成漂浮牌组'))+'">'+
    '<div class="ritual-halo"></div><div class="ritual-swirl">'+cardVisuals+'</div>'+
    '<div class="ritual-finished-deck" aria-hidden="true">'+Array.from({length:7},(_,i)=>'<div style="--stack:'+i+'">'+cardBack()+'</div>').join('')+'</div>'+
  '</div>'+
  '<div class="ritual-status" role="status" aria-live="polite">'+(ready?t('✧ Your deck has formed','✧ 塔罗牌组已成形'):t('✧ Each card has an equal chance to appear','✧ 每张牌都有同样的出现概率'))+'</div>'+
  '<div class="cta-row centered">'+btn('finish-shuffle',t('Finish Shuffling →','完成洗牌 →'),'',!ready)+'</div>'+
  '<p class="fine-print centered-text">'+h(t('No AI reading is generated before you confirm your three cards.','确认三张牌之前，不会提前生成完整的 AI 解读。'))+'</p>'+
  '</section>';
}
