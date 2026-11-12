/* Debug fixture uses the exact production renderers and no API. */
import {DECK,BY_ID} from '../../../src/deck.mjs';
import {buildDemoReading} from '../../../src/demo-reading.mjs';
import {renderReadingStage,assetUrl} from '../reading-stage.mjs';
import {renderSynthesisChat,demoSynthesis} from '../SynthesisChat.mjs';
import {SYNTHESIS_ART} from '../ArtemisSynthesisAssets.mjs';
const question='What do these cards suggest about the path I am considering?';
const chosen=[DECK[0],DECK[10],DECK[38]];
const choices=chosen.map((card,i)=>({id:card.id,orientation:i===1?'reversed':'upright'}));
const demo=buildDemoReading({question,picks:choices.map(c=>({card:BY_ID.get(c.id),orientation:c.orientation})),spread:'insight',lens:'western',lang:'en',options:['','']});
const response=demoSynthesis({question,reading:demo});
const guidance={id:DECK[53].id,name:DECK[53].name,orientation:'upright',meaning:DECK[53].upright};
const history=[
 {question:'How might I approach the next step?',answer:'Consider which action is practical and within your control. The cards invite you to observe what changes when you act with care, rather than treating the reading as a fixed prediction.'},
 {question:'What should I pay attention to?',answer:'Notice recurring patterns, relationships, and the difference between uncertainty and evidence. Set aside a moment to reflect on what feels meaningful, and revisit the question when you have more information.'}
];
export function createLayoutPreview(mode='reading',onChange=()=>{}){
 const el=document.createElement('div');el.className='ps-world layout-tuner-fixture';el.dataset.layoutFixture='true';el.setAttribute('aria-label','Debug scripted layout fixture — no live AI');
 let chapter=-1;
 function render(next){
  mode=next;el.innerHTML=renderReadingStage({choices,cardsById:BY_ID,demo,chapter,question});
  const scene=el.querySelector('.scene-artemis-reading');scene.classList.add('is-synthesis-remake');
  if(mode!=='reading'){
   scene.dataset.phase='chat';
   scene.dataset.synthesisPortrait='fallback';
   for(const s of ['.reading-art-spread','.reading-art-table-surface','.reading-art-card-glow','.reading-art-reading-glow']){const node=scene.querySelector(s);if(node){node.hidden=true;node.setAttribute('aria-hidden','true')}}
   const img=document.createElement('img');img.className='artemis-focused-chat-art';img.alt='';img.src=SYNTHESIS_ART.focused;
   img.addEventListener('load',()=>{scene.dataset.synthesisPortrait='focused';onChange()},{once:true});
   img.addEventListener('error',()=>{img.remove();scene.dataset.synthesisPortrait='fallback';onChange()},{once:true});
   scene.querySelector('.reading-art-hero').append(img);
   const state=mode==='thinking'?'generating':mode==='long'?'followup-ready':'ready';
   const container=document.createElement('div');container.innerHTML=renderSynthesisChat({question,status:state,response:mode==='thinking'?'':response,guidance:mode==='long'?guidance:null,history:mode==='long'?history:[],mode:'scripted-demo'});
   scene.querySelector('.reading-art-panel').replaceWith(container.firstElementChild);
   for(const a of scene.querySelectorAll('.synthesis-avatar')){a.addEventListener('error',()=>{const stage=Number(a.dataset.fallbackStage||0);if(stage===0){a.dataset.fallbackStage='1';a.src=a.getAttribute('src').replace('/avatar_artemis_face_','/avatar_artemis_')}else if(stage===1&&assetUrl('warmWelcome')){a.dataset.fallbackStage='2';a.src=assetUrl('warmWelcome')}},{})}
  }
  onChange();
 }
 el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||mode!=='reading')return;if(b.dataset.readingChapter!=null){chapter=Number(b.dataset.readingChapter);render('reading')}else if(b.dataset.action==='reading-prev'){chapter=Math.max(-1,chapter-1);render('reading')}else if(b.dataset.action==='reading-next'){if(chapter===3)render('chat');else{chapter++;render('reading')}}});
 el.addEventListener('submit',e=>{if(e.target.matches('.synthesis-followup-form')){e.preventDefault();render('long')}});
 render(mode);return el;
}
