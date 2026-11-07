/**
 * Gate C: immersive, full-viewport sphere presentation.
 * This is a view of the same 78 immutable cards, not a new draw.
 * No backend, reader model or randomization lives in the presentation.
 */
export function gateSelectionMarkup({state,t,h,cardBack,roleNames,btn}){
 const labels=roleNames();
 const slots=labels.map((label,index)=>{
  const picked=state.picks[index];
  const card=picked?picked.card:null;
  return '<div class="gate-slot '+(card?'is-chosen':'')+'" data-gate-slot="'+index+'">'+
    '<div class="gate-slot-card">'+(card?cardBack():'<span>'+String(index+1).padStart(2,'0')+'</span>')+'</div>'+
    '<div class="gate-slot-label">'+h(label)+'</div>'+
    (card?'<button class="gate-slot-undo" data-unselect="'+h(card.id)+'" aria-label="'+t('Unselect','取消选择')+' '+h(label)+'">'+t('Undo','取消')+'</button>':'')+
   '</div>';
 }).join('');
 return '<div class="gate-selection-grid" role="group" aria-label="'+t('Your three selected cards','你选择的三张牌')+'">'+slots+'</div>'+
  '<p class="gate-selection-count" role="status" aria-live="polite">'+
    state.picks.length+' / 3 · '+(state.picks.length===3?t('Ready to seal the spread','可以确认三张牌'):t('Touch a glowing card to select or unselect','轻触卡牌选择，再次轻触取消'))+'</p>'+
  '<div class="gate-commit-actions">'+btn('random',t('Choose for me','随机选取'),'secondary',state.picks.length===3)+
  btn('confirm-cards',t('Confirm three cards ✧','确认三张牌 ✧'),'primary',state.picks.length!==3)+'</div>';
}
export function renderGateSphere({state,t,h,btn,cardBack,roleNames,flatCardTable}){
 const gpu=state.sphereMode==='gpu';
 return '<section class="gate-sphere" aria-label="'+t('Inside the Tarot universe','塔罗星辰宇宙内部')+'">'+
  (gpu?'<div class="gate-cosmos sphere-scene inside-dome" id="sphere-scene" aria-label="'+t('A full-screen sphere of 78 floating tarot cards','78 张漂浮塔罗牌组成的全屏球体')+'">'+
    '<div class="gate-starfield" aria-hidden="true"></div><div class="gate-nebula" aria-hidden="true"></div>'+
    '<div class="gate-vortex-core" aria-hidden="true"></div>'+
    '<div class="gate-reticle" aria-hidden="true">✧</div></div>':
    '<div class="gate-cosmos gate-flat-cosmos">'+flatCardTable()+'</div>')+
  '<div class="gate-sphere-header"><span class="gate-eyebrow">'+t('GATE C · WITHIN THE UNIVERSE','第三道门 · 置身宇宙')+'</span>'+
    '<h1>'+t('The stars are <em>all around you.</em>','星辰在<em>你的四周流转。</em>')+'</h1>'+
    '<p>'+t('Look around. Choose three cards from the living constellation.','环顾星空，从流动的星座中选择三张牌。')+'</p></div>'+
  '<div class="gate-interaction-rail">'+
   (gpu?'<button data-action="rotate-left" aria-label="'+t('Look left','向左转')+'">←</button>'+
     '<span>'+t('DRAG TO LOOK · TAP TO DRAW','拖动环顾 · 轻触选牌')+'</span>'+
     '<button data-action="rotate-right" aria-label="'+t('Look right','向右转')+'">→</button>'+
     '<button class="gate-orbit-toggle" data-action="toggle-orbit" aria-pressed="'+state.orbitPaused+'">'+
     (state.orbitPaused?t('Resume motion','继续旋转'):t('Pause motion','暂停旋转'))+'</button>':
     '<span>'+t('FULL DECK · ACCESSIBLE 2D SELECTION','完整牌组 · 无障碍 2D 选牌')+'</span>')+
   '<button class="gate-switch" data-action="sphere-mode">'+(gpu?t('2D mode','2D 模式'):t('Enter 3D','进入 3D'))+'</button>'+
   '</div>'+
  '<div class="gate-selection-area" id="gate-selection-area">'+
   gateSelectionMarkup({state,t,h,cardBack,roleNames,btn})+'</div>'+
  '</section>';
}