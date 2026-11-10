/**
 * Gate D synthesis HUD. View-only template; all inputs are escaped and the
 * active scene owns the state, single network request and follow-up lifecycle.
 * This is NOT a second Tarot deck and never reselects the original 3 cards.
 */
export const SYNTHESIS_STATES=Object.freeze(['generating','ready','error','guidance','followup-generating','followup-ready']);
const h=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const trim=(x,max)=>String(x??'').trim().slice(0,max);
const message=(body,label='Artemis')=>
 '<article class="synthesis-message" role="article" aria-label="'+h(label)+' message">'+
 '<span class="synthesis-message-icon" aria-hidden="true">✧</span>'+
 '<div class="synthesis-message-body"><strong>'+h(label)+'</strong><p>'+h(body)+'</p></div></article>';
export function demoSynthesis({question,reading}){
 if(!reading||!Array.isArray(reading.cards)||reading.cards.length!==3)throw Error('Three locked card meanings are required');
 const [past,present,future]=reading.cards;
 return 'A meaningful question. ✦ Your '+past.position.toLowerCase()+' card, '+past.name+
  ', invites you to reflect on '+past.meaning+'. '+present.name+
  ' brings attention to '+present.meaning+', while '+future.name+
  ' suggests '+future.meaning+'. Together, they offer a place to explore your question — “'+
  trim(question,600)+'” — rather than a fixed prediction. '+reading.reflection;
}
export function demoGuidance({card,orientation,question,reading}){
 if(!card||!['upright','reversed'].includes(orientation)||!reading)throw Error('Guidance card is required');
 return 'For your follow-up, “'+trim(question,280)+'”, '+card.name+' ('+orientation+
  ') invites reflection on '+card[orientation]+'. Consider that alongside the three cards you have already chosen. '+
  'What practical observation could confirm or challenge this theme?';
}
export function renderSynthesisChat({question,mode='scripted-demo',status='generating',
 response='',error='',avatar='',guidance=null,history=[]}={}){
 if(!SYNTHESIS_STATES.includes(status))throw new RangeError('Unknown synthesis state');
 const busy=status==='generating'||status==='followup-generating';
 const complete=status==='ready'||status==='guidance'||status==='followup-ready';
 const demo=mode!=='exodia-local';
 const guidanceCard=guidance?
  '<div class="synthesis-guidance-card" role="group" aria-label="Newly drawn guidance card">'+
  '<img src="../../assets/rws/'+h(guidance.id)+'.jpg" alt="'+h(guidance.name)+' '+h(guidance.orientation)+' guidance card" class="'+(guidance.orientation==='reversed'?'is-reversed':'')+'"/>'+
  '<div><span>✦ GUIDANCE · ONE NEW CARD</span><strong>'+h(guidance.name)+'</strong>'+
  '<small>'+h(guidance.orientation.toUpperCase())+' · '+h(guidance.meaning)+'</small></div></div>':'';
 const log=history.map(turn=>
  '<div class="synthesis-user-followup"><span>YOU</span><p>'+h(turn.question)+'</p></div>'+
  message(turn.answer)).join('');
 const form=guidance&&status!=='followup-generating'?
  '<form class="synthesis-followup-form" data-action="guidance-followup-form">'+
   '<label for="synthesis-followup-question">Ask Artemis a follow-up</label>'+
   '<div class="synthesis-followup-row"><input id="synthesis-followup-question" name="question" maxlength="280" minlength="2" required placeholder="What should I consider next?" autocomplete="off"/>'+
   '<button type="submit" class="synthesis-followup-send">ASK ✦</button></div></form>':'';
 const progress=busy?
  '<div class="synthesis-progress" role="status" aria-label="Analyzing and synthesizing">'+
  '<span class="synthesis-progress-icon">✧</span><div><span>Analyzing &amp; Synthesis…</span>'+
  '<div class="synthesis-progress-track"><i></i></div></div></div>':'';
 return '<section class="reading-chat-hud" aria-label="Unified Tarot reading chat" data-chat-state="'+h(status)+'">'+
  '<header class="synthesis-chat-heading"><span>✦</span><div><h2 tabindex="-1" id="synthesis-title">Unified Reading</h2>'+
  '<small>SYNTHESIZED INTERPRETATION · '+(demo?'SCRIPTED PREVIEW':'LOCAL AI')+'</small></div></header>'+
  '<div class="synthesis-chat-scroll" role="log" aria-live="polite" aria-relevant="additions text">'+
  '<div class="synthesis-question"><span class="synthesis-question-title">✧ Your Question</span>'+
  '<p>'+h(question)+'</p></div>'+
  '<div class="synthesis-reader-head">'+(avatar?'<img src="'+h(avatar)+'" alt="" />':'<span>✧</span>')+
  '<span>Artemis</span></div>'+
  (response?message(response):'')+
  (status==='error'?'<div class="synthesis-error" role="alert">'+h(error||'The local AI service is unavailable.')+'</div>'+
   '<button type="button" class="synthesis-demo-fallback" data-action="synthesis-demo">VIEW SCRIPTED PREVIEW</button>':'')+
  guidanceCard+log+
  (status==='followup-generating'?'<div class="synthesis-followup-loading">Artemis is considering your guidance card…</div>':'')+
  form+'</div>'+
  '<div class="synthesis-chat-actions">'+progress+
  (complete&&!guidance?'<button class="synthesis-guidance-cta" data-action="draw-guidance" type="button">'+
   'Draw Guidance Card &amp; Ask Follow-up <span>✦</span></button>':'')+
  (guidance?'<span class="synthesis-guidance-confirmed">One guidance card drawn · Original three preserved</span>':'')+
  '</div></section>';
}
