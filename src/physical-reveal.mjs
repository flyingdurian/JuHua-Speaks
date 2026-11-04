/**
 * Physical card reveal: transform a two-sided card, not a horizontal image wipe.
 * Every card can be turned in any order, by click, keyboard, or edge/corner drag.
 */
export const clampPeek=n=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
export function peekOrigin(x,y,w,h){
 if(w<=0||h<=0)throw new RangeError('Card dimensions must be positive');
 const px=clampPeek(x/w),py=clampPeek(y/h);
 const nearX=Math.min(px,1-px)<.24,nearY=Math.min(py,1-py)<.24;
 const signX=px<.5?1:-1,signY=py<.5?1:-1;
 const corner=nearX&&nearY;
 const ax=corner?signY*.61:nearY?signY:0;
 const ay=corner?signX*.79:nearY?0:signX;
 return {ax,ay,signX,signY,corner,mode:corner?'corner':nearY?'edge-y':'edge-x'};
}
export function peekProgress(start,dx,dy,w,h,origin){
 if(!origin||w<=0||h<=0)throw new TypeError('Expected origin and positive dimensions');
 const projected=origin.corner?(dx*origin.signX/w+dy*origin.signY/h)*.6:
   origin.mode==='edge-y'?dy*origin.signY/h:dx*origin.signX/w;
 return clampPeek(start+projected*1.35);
}
export function revealFace(p,progress,axis){
 const value=clampPeek(progress),x=axis?.ax??0,y=axis?.ay??1;
 return {progress:value,axisX:x,axisY:y,angle:180*value,faceVisible:value>.5,complete:value>=.985};
}
export function renderPhysicalReveal({state,t,h,btn,eyebrow,cardBack,cardFace,description,roleNames}){
 const names=roleNames(),done=state.revealedCards.every(Boolean);
 return '<section class="physical-reveal" aria-label="'+t('Your three Tarot cards','你的三张塔罗牌')+'">'+
  eyebrow('04 / '+t('THE THREE-CARD REVEAL','三张牌揭晓'))+
  '<h1>'+t('The stars have <em>chosen a story.</em>','星辰之间，<em>故事即将揭晓。</em>')+'</h1>'+
  '<p class="intro">'+t('Tap a card to turn it over, or gently pull its edge or corner to peek. Drag farther to fully reveal it.','点击卡牌即可翻面；也可以拉住边缘或角落，像扑克牌一样慢慢偷看，再继续翻开。')+'</p>'+
  description()+
  '<div class="physical-card-row" role="group" aria-label="'+t('Reveal the Past, Present and Future cards in any order','按任意顺序揭开过去、现在、未来三张牌')+'">'+
  state.picks.map((entry,i)=>{
   const revealed=state.revealedCards[i],p=revealed?1:(state.peekProgress?.[i]||0),axis=state.peekAxes?.[i]||{ax:0,ay:1};
   const rank=String(i+1).padStart(2,'0'),side=entry.orientation==='reversed'?t('Reversed','逆位'):t('Upright','正位');
   const name=state.locale==='zh'?entry.card.zh:entry.card.name;
   const trait=entry.orientation==='reversed'?entry.card.reversed:entry.card.upright;
   return '<article class="physical-card-entry '+(revealed?'has-revealed':'')+'" data-card-index="'+i+'">'+
    '<div class="physical-card-aura"></div>'+
    '<button type="button" class="physical-card" data-peek-card="'+i+'" aria-label="'+t('Reveal card','揭开卡牌')+' '+rank+' '+h(names[i])+'" aria-pressed="'+revealed+'" style="--p:'+p+';--ax:'+axis.ax+';--ay:'+axis.ay+'">'+
     '<span class="physical-card-rotator">'+
      '<span class="physical-side physical-back">'+cardBack()+'</span>'+
      '<span class="physical-side physical-front">'+cardFace(entry.card,entry.orientation,true)+'</span>'+
     '</span></button>'+
    '<div class="physical-card-meta"><span>'+rank+' · '+h(names[i])+'</span>'+
    (revealed?'<strong>'+h(name)+'</strong><small>'+side+'</small><p>'+h(trait)+'</p>':
      '<span class="physical-waiting">'+t('Tap · drag to peek','点击 · 拖动偷看')+'</span>')+
    '</div></article>';
  }).join('')+
  '</div>'+
  '<p class="physical-reveal-progress" role="status">'+(done?t('All three cards revealed','三张牌都已经揭晓'):t('Cards revealed','已揭开的牌')+' · '+state.revealedCards.filter(Boolean).length+' / 3')+'</p>'+
  '<div class="cta-row centered">'+btn('next-reveal',t('Continue to your reading →','继续查看牌阵解读 →'),'',!done)+'</div>'+
  '<p class="fine-print centered-text">'+t('Keyboard: focus a card and press Enter or Space for an instant flip.','键盘：选中卡牌，按 Enter 或空格即可完整翻面。')+'</p>'+
  '</section>';
}
