/** Phase 8.2: pure Artemis invitation and immutable three-card tabletop.
 * Character portrait is an explicitly provisional moon sigil, not final art.
 */
export function renderArtemisInvitation({state,t,h,btn,eyebrow,cardFace,description,roleNames}){
 if(state.picks.length!==3||!state.revealedCards.every(Boolean))throw Error('Three revealed cards required');
 const labels=roleNames();
 return '<section class="artemis-stage" aria-label="'+t('Meet your Tarot reader','认识你的塔罗解读者')+'">'+
 eyebrow('05 / '+t('THE READER ARRIVES','解读者登场'))+
 '<h1>'+t('The cards are <em>ready to speak.</em>','三张牌已准备好<em>诉说它们的故事。</em>')+'</h1>'+description()+
 '<div class="artemis-scene"><div class="artemis-moon" aria-hidden="true"></div>'+
 '<div class="artemis-portrait-placeholder"><div class="artemis-sigil">☾</div><span>ARTEMIS · '+t('READER','解读者')+'</span></div>'+
 '<div class="artemis-tabletop"><div class="artemis-table-smoke" aria-hidden="true"></div>'+
 state.picks.map((p,i)=>'<div class="artemis-table-card"><div class="artemis-table-face">'+cardFace(p.card,p.orientation,true)+'</div><span>'+h(labels[i])+'</span></div>').join('')+
 '</div></div><div class="artemis-invitation">'+
 '<p>'+t('I am Artemis. These are your choices. Let us explore their symbols together, without treating them as a fixed future.','我是阿尔忒弥斯。这三张牌是你亲自选的。让我们一起解读其中的象征，而不把它们当作注定的未来。')+'</p>'+
 '<div class="artemis-source-note">'+t('Scripted demonstration · No AI request','脚本演示 · 不会发送 AI 请求')+'</div>'+
 btn('invite-reader',t('Begin with Artemis ✧','与阿尔忒弥斯开始解读 ✧'))+'</div></section>';
}
export function renderArtemisTable({state,t,h,cardFace,roleNames}){
 if(state.picks.length!==3)return '';
 const labels=roleNames();
 return '<div class="artemis-reading-table" aria-label="'+t('Artemis reading table','阿尔忒弥斯解读桌')+'">'+
 '<header>☾ ARTEMIS · '+t('THE READING TABLE','塔罗解读桌')+' <small>'+t('Scripted demo','脚本演示')+'</small></header>'+
 '<div class="artemis-reading-cards">'+state.picks.map((p,i)=>
 '<div class="artemis-reading-card">'+cardFace(p.card,p.orientation,true)+'<strong>'+h(labels[i])+'</strong></div>').join('')+'</div></div>';
}
