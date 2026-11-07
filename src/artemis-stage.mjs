/**
 * Artemis art-direction audition (three Japanese-inspired identities).
 * Procedural portrait is a *costume and expression blocking study*, not final
 * commissioned character illustration. No user data or generated AI calls.
 */
export const ARTEMIS_STYLES=Object.freeze([
 Object.freeze({id:'shrine',label:'Celestial Shrine Reader',zh:'星月神社占卜师',detail:'Moonlit silk, indigo hair, lacquer red cords, restrained gold celestial embroidery.',zhDetail:'月夜丝绸、靛蓝长发、朱红结绳与克制的金色星纹。'}),
 Object.freeze({id:'modern',label:'Modern Occult Hostess',zh:'现代神秘学主持人',detail:'Japanese fashion-editorial silhouette, tailored black-violet jacket, short flowing hair and silver accents.',zhDetail:'日系时尚廓形、黑紫色剪裁外套、轻盈短发与银饰。'}),
 Object.freeze({id:'storybook',label:'Dreamlike Storybook Diviner',zh:'梦幻绘本星象师',detail:'Pastel moonlight, long wavy lavender hair, layered translucent sleeves and fine star charms.',zhDetail:'粉彩月光、淡紫色波浪长发、半透明叠层袖口与精细星饰。'})
]);
export const ARTEMIS_ACTIONS=Object.freeze([
 Object.freeze({id:'welcome',label:'Welcome',zh:'欢迎',line:'I am here with you. Let us discover what your cards invite you to consider.',zhLine:'我会陪伴你，一起探索这些卡牌带来的启示。'}),
 Object.freeze({id:'observe',label:'Observe',zh:'凝视',line:'I see a thread connecting your past, present, and future.',zhLine:'我看到了过去、现在与未来之间的一条线索。'}),
 Object.freeze({id:'thoughtful',label:'Thoughtful',zh:'思索',line:'There may be more than one meaningful interpretation here.',zhLine:'这些象征也许不只有一种值得思考的解读。'}),
 Object.freeze({id:'surprised',label:'Surprised',zh:'惊讶',line:'An unexpected contrast emerges between these cards.',zhLine:'这些卡牌之间出现了出乎意料的对照。'}),
 Object.freeze({id:'reassure',label:'Reassure',zh:'安慰',line:'We can approach difficult questions gently, without declaring a fixed fate.',zhLine:'面对困难的问题，我们可以温柔地探索，而不预言既定命运。'}),
 Object.freeze({id:'present',label:'Present cards',zh:'展示卡牌',line:'These are the three cards you chose. Let us begin with the first.',zhLine:'这是你亲自选择的三张牌。我们从第一张开始吧。'})
]);
function portrait(style,action){
 return '<div class="artemis-persona artemis-persona-'+style+' artemis-action-'+action+'" role="img" aria-label="Provisional Japanese-inspired Artemis expression and costume motion study">'+
  '<div class="artemis-persona-halo"></div><div class="artemis-persona-hair-back"></div>'+
  '<div class="artemis-persona-body"><div class="artemis-persona-collar"></div><div class="artemis-persona-charm">✦</div></div>'+
  '<div class="artemis-persona-neck"></div><div class="artemis-persona-face">'+
  '<span class="artemis-persona-eye eye-left"></span><span class="artemis-persona-eye eye-right"></span>'+
  '<span class="artemis-persona-mouth"></span><span class="artemis-persona-blush"></span></div>'+
  '<div class="artemis-persona-hair-front"></div>'+
  '<div class="artemis-persona-arm arm-left"></div><div class="artemis-persona-arm arm-right"></div>'+
  '<div class="artemis-persona-spark">✧</div></div>';
}
export function renderArtemisInvitation({state,t,h,btn,eyebrow,cardFace,description,roleNames}){
 if(state.picks.length!==3||!state.revealedCards.every(Boolean))throw Error('Three revealed cards required');
 const labels=roleNames();
 const style=ARTEMIS_STYLES.find(x=>x.id===state.artemisStyle)||ARTEMIS_STYLES[0];
 const action=ARTEMIS_ACTIONS.find(x=>x.id===state.artemisMood)||ARTEMIS_ACTIONS[0];
 return '<section class="artemis-stage artemis-stage-immersive" aria-label="'+t('Meet your Tarot reader','认识你的塔罗解读者')+'">'+
 eyebrow('05 / '+t('THE READER ARRIVES','解读者登场'))+
 '<h1>'+t('Meet <em>Artemis.</em>','认识<em>阿尔忒弥斯。</em>')+'</h1>'+description()+
 '<div class="artemis-design-options" role="group" aria-label="'+t('Choose an Artemis visual direction','选择阿尔忒弥斯视觉风格')+'">'+
 ARTEMIS_STYLES.map((item,i)=>'<button type="button" class="artemis-style-choice '+(style.id===item.id?'active':'')+'" data-artemis-style="'+item.id+'" aria-pressed="'+(style.id===item.id)+'">'+
 '<strong>'+String.fromCharCode(65+i)+' · '+h(t(item.label,item.zh))+'</strong><small>'+h(t(item.detail,item.zhDetail))+'</small></button>').join('')+'</div>'+
 '<div class="artemis-scene artemis-scene-preview"><div class="artemis-moon" aria-hidden="true"></div>'+
 portrait(style.id,action.id)+
 '<div class="artemis-tabletop"><div class="artemis-table-smoke" aria-hidden="true"></div>'+
 state.picks.map((p,i)=>'<div class="artemis-table-card"><div class="artemis-table-face">'+cardFace(p.card,p.orientation,true)+'</div><span>'+h(labels[i])+'</span></div>').join('')+
 '</div></div>'+
 '<div class="artemis-stage-actions" role="group" aria-label="'+t('Preview expressions and gestures','预览表情及动作')+'">'+
 ARTEMIS_ACTIONS.map(item=>'<button type="button" class="'+(action.id===item.id?'active':'')+'" data-artemis-mood="'+item.id+'" aria-pressed="'+(action.id===item.id)+'">'+h(t(item.label,item.zh))+'</button>').join('')+'</div>'+
 '<div class="artemis-invitation"><p aria-live="polite">'+h(t(action.line,action.zhLine))+'</p>'+
 '<div class="artemis-source-note">'+t('Interactive costume / expression blocking study · Final character illustration pending art approval · Scripted demo only','可交互服装与表情动态草案 · 正式角色插画待美术审核 · 仅为脚本演示')+'</div>'+
 btn('invite-reader',t('Begin with Artemis ✧','与阿尔忒弥斯开始解读 ✧'))+'</div></section>';
}
export function renderArtemisTable({state,t,h,cardFace,roleNames}){
 if(state.picks.length!==3)return '';
 const labels=roleNames();
 return '<div class="artemis-reading-table" aria-label="'+t('Artemis reading table','阿尔忒弥斯解读桌')+'">'+
 '<header>☾ ARTEMIS · '+t('THE READING TABLE','塔罗解读桌')+' <small>'+t('Scripted demo','脚本演示')+'</small></header>'+
 '<div class="artemis-reading-cards">'+state.picks.map((p,i)=>'<div class="artemis-reading-card">'+cardFace(p.card,p.orientation,true)+'<strong>'+h(labels[i])+'</strong></div>').join('')+'</div></div>';
}
