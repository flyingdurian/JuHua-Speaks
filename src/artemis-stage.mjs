/** Artemis Phase 8.2: one consistent character with 8 expressions and 8 actions.
 * Reading gestures react to deterministic chapter events, not model guesses.
 */
import {ARTEMIS_IDENTITY,ARTEMIS_EXPRESSIONS,ARTEMIS_ACTIONS,resolveArtemisPose,readingArtemisPose,renderArtemisPortrait} from './artemis-character.mjs';
export {ARTEMIS_IDENTITY,ARTEMIS_EXPRESSIONS,ARTEMIS_ACTIONS,readingArtemisPose};
const DIALOGUE={
 neutral:['I am listening. We can explore these cards together.','我在倾听。让我们一起探索这三张牌。'],
 welcome:['Welcome. You have chosen three cards; their meanings belong to your story.','欢迎。这是你亲自选择的三张牌，解读属于你的故事。'],
 focus:['Let us look closely at what these symbols show.','让我们仔细观察这些象征。'],
 thoughtful:['A symbol can have more than one useful interpretation.','同一个象征可能有不止一种有用的解读。'],
 intrigued:['That contrast is interesting. Let us examine it gently.','这个对照很有趣。我们温柔地细看。'],
 reassuring:['The cards suggest reflection, not a fixed destiny.','卡牌提供思考的方向，而非注定的命运。'],
 confident:['I will guide you through the past, present and future.','我将带你探索过去、现在与未来。'],
 mystical:['Let the light draw attention to the cards you chose.','让微光照亮你亲自选择的卡牌。']
};
function choices(items,key,current,t,h){
 return '<div class="artemis-state-picker" role="group" aria-label="'+(key==='artemis-expression'?t('Expressions','表情'):t('Gestures','动作'))+'">'+items.map(item=>
  '<button type="button" data-'+key+'="'+item.id+'" aria-pressed="'+(current===item.id)+'" class="'+(current===item.id?'active':'')+'">'+h(t(item.label,item.zh))+'</button>'
 ).join('')+'</div>';
}
export function renderArtemisInvitation({state,t,h,btn,eyebrow,cardFace,description,roleNames}){
 if(state.picks.length!==3||!state.revealedCards.every(Boolean))throw Error('Three revealed cards required');
 const pose=resolveArtemisPose({expression:state.artemisExpression||'welcome',action:state.artemisAction||'welcome'});
 const labels=roleNames();
 const line=DIALOGUE[pose.expression];
 return '<section class="artemis-stage artemis-stage-immersive artemis-final-design" aria-label="'+t('Meet your Tarot reader','认识你的塔罗解读者')+'">'+
 eyebrow('05 / '+t('ARTEMIS · YOUR TAROT READER','阿尔忒弥斯 · 你的塔罗解读者'))+
 '<h1>'+t('The cards have found <em>their storyteller.</em>','卡牌找到了<em>讲述它们故事的人。</em>')+'</h1>'+description()+
 '<div class="artemis-scene artemis-scene-final">'+
 '<div class="artemis-moon" aria-hidden="true"></div>'+
 '<div class="artemis-avatar-mount">'+renderArtemisPortrait(pose)+'</div>'+
 '<div class="artemis-tabletop"><div class="artemis-table-smoke" aria-hidden="true"></div>'+
 state.picks.map((p,i)=>'<div class="artemis-table-card"><div class="artemis-table-face">'+cardFace(p.card,p.orientation,true)+'</div><span>'+h(labels[i])+'</span></div>').join('')+
 '</div></div>'+
 '<div class="artemis-invitation"><p aria-live="polite">'+h(t(line[0],line[1]))+'</p>'+
 '<div class="artemis-source-note">'+h(ARTEMIS_IDENTITY.label)+' · '+t('Scripted demonstration · Character artwork in review','脚本演示 · 角色美术审核中')+'</div>'+
 btn('invite-reader',t('Begin with Artemis ✧','与阿尔忒弥斯开始解读 ✧'))+'</div>'+
 '<details class="artemis-expression-studio"><summary>'+t('Explore Artemis expressions and gestures (art review)','预览阿尔忒弥斯表情与动作（美术审核）')+'</summary>'+
 '<div class="artemis-studio-heading">'+t('Eight expressions','八种表情')+'</div>'+
 choices(ARTEMIS_EXPRESSIONS,'artemis-expression',pose.expression,t,h)+
 '<div class="artemis-studio-heading">'+t('Eight actions','八种动作')+'</div>'+
 choices(ARTEMIS_ACTIONS,'artemis-action',pose.action,t,h)+
 '</details></section>';
}
export function renderArtemisTable({state,t,h,cardFace,roleNames}){
 if(state.picks.length!==3)return '';
 const labels=roleNames();
 const pose=readingArtemisPose(state.readingBeat);
 return '<div class="artemis-reading-table artemis-reading-character" aria-label="'+t('Artemis reading table','阿尔忒弥斯解读桌')+'">'+
 '<div class="artemis-reading-figure">'+renderArtemisPortrait(pose,'artemis-reading-avatar')+'</div>'+
 '<div class="artemis-reading-content"><header>☾ ARTEMIS · '+t('THE READING TABLE','塔罗解读桌')+' <small>'+t('Scripted demo · Expression responds to chapter','脚本演示 · 表情随章节变化')+'</small></header>'+
 '<div class="artemis-reading-cards">'+state.picks.map((p,i)=>
 '<div class="artemis-reading-card">'+cardFace(p.card,p.orientation,true)+'<strong>'+h(labels[i])+'</strong></div>').join('')+'</div></div></div>';
}
