/**
 * Gate D v11. Ceremonial per-card flip; no dragging, peeling, bending or
 * intermediate reveal of artwork. All three source Tarot illustrations
 * remain the original RWS images from the caller's cardFace renderer.
 */
export function renderPhysicalReveal({state,t,h,btn,eyebrow,cardBack,cardFace,description,roleNames}){
 const names=roleNames(),done=state.revealedCards.every(Boolean);
 return '<section class="physical-reveal gate-d-reveal" aria-label="'+t('Your three Tarot cards','你的三张塔罗牌')+'">'+
  eyebrow('04 / '+t('THE THREE-CARD REVEAL','三张牌揭晓'))+
  '<h1>'+t('Three cards. <em>One unfolding story.</em>','三张牌，<em>一个正在展开的故事。</em>')+'</h1>'+
  '<p class="intro">'+t('Tap each card to turn it over. The stars hold their breath.','轻触每张卡牌，翻开属于你的答案。')+'</p>'+
  description()+
  '<div class="physical-card-row" role="group" aria-label="'+t('Reveal the Past, Present and Future cards in any order','按任意顺序揭开过去、现在、未来三张牌')+'">'+
  state.picks.map((entry,i)=>{
   const revealed=state.revealedCards[i],role=h(names[i]);
   const rank=String(i+1).padStart(2,'0'),side=entry.orientation==='reversed'?t('Reversed','逆位'):t('Upright','正位');
   const name=state.locale==='zh'?entry.card.zh:entry.card.name;
   const trait=entry.orientation==='reversed'?entry.card.reversed:entry.card.upright;
   const summary=trait ? trait.charAt(0).toLocaleUpperCase(state.locale==='zh'?'zh-CN':'en-US')+trait.slice(1) : '';
   return '<article class="physical-card-entry '+(revealed?'has-revealed':'')+'" data-card-index="'+i+'">'+
    '<div class="physical-card-aura"></div>'+
    '<div class="gate-d-role">'+role+'</div>'+
    '<button type="button" class="physical-card gate-d-card '+(revealed?'is-flipped':'')+(revealed&&state.lastFlipIndex===i?' just-flipped':'')+'" data-flip-card="'+i+'" aria-label="'+
    (revealed?t('Revealed','已揭开'):t('Flip','翻开'))+' '+rank+' '+role+'" aria-pressed="'+revealed+'" '+(revealed?'disabled':'')+'>'+
     '<span class="physical-card-rotator">'+
      '<span class="physical-side physical-back">'+cardBack()+'</span>'+
      '<span class="physical-side physical-front">'+cardFace(entry.card,entry.orientation,true)+'</span>'+
     '</span><span class="gate-d-gloss" aria-hidden="true"></span></button>'+
    '<div class="physical-card-meta"><span>'+rank+' · '+role+'</span>'+
     (revealed?'<strong>'+h(name)+'</strong><small>'+side+'</small><p>'+h(summary)+'</p>':
     '<span class="physical-waiting">'+t('Touch to reveal','轻触翻牌')+'</span>')+
    '</div></article>';
  }).join('')+
  '</div>'+
  '<p class="physical-reveal-progress" role="status">'+(done?t('The reading is ready','三张牌已揭晓'):t('Cards revealed','已揭开的牌')+' · '+state.revealedCards.filter(Boolean).length+' / 3')+'</p>'+
  '<div class="cta-row centered">'+btn('next-reveal',t('Meet Artemis ✧','与阿尔忒弥斯相见 ✧'),'',!done)+'</div>'+
  '</section>';
}
