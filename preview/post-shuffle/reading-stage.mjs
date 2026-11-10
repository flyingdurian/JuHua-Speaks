/**
 * Gate D — Artemis "Your Reading" stage.
 * Production art has NOT arrived. No vector, procedurally drawn human, or
 * improvised character substitute is used. Each slot maps to an Art Director
 * PNG and stays explicitly marked PENDING until the asset pack is integrated.
 * All cards are immutable original RWS images chosen in Gate C.
 */
export const ARTEMIS_ASSET_ROOT='../../assets/artemis/';
export const ARTEMIS_ASSET_READY=false; // Four artworks approved for provisional use; PNG bytes are NOT in GitHub yet.
// Flip only after the corresponding verified art package is present on this branch.
export const ARTEMIS_ART_DIRECTOR_FILES=Object.freeze({
 background:'bg_artemis_reading_stage_main.png',
 transition:'bg_artemis_transition_gate.png',
 portrait:'artemis_idle.png',
 warmWelcome:'artemis_warm_welcome.png',
 welcomingGesture:'artemis_welcoming_gesture.png',
 thinking:'artemis_thinking.png',
 explaining:'artemis_explaining.png',
 reflective:'artemis_reflective.png',
 focused:'artemis_focused.png',
 halo:'fx_artemis_halo_ring.png',
 sigils:'fx_artemis_sigils_soft.png',
 goldParticles:'fx_artemis_particles_gold.png',
 violetParticles:'fx_artemis_particles_violet.png',
 readingGlow:'fx_reading_glow_base.png',
 cardGlow:'fx_card_spread_glow.png',
 panel:'ui_reading_frame_panel.png',
 nameplate:'ui_artemis_nameplate.png',
 title:'ui_your_reading_titleplate.png',
 begin:'ui_begin_reading_button.png',
 continue:'ui_continue_button.png'
});
const clamp=(n)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
const esc=(x)=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
export const READING_CHAPTERS=Object.freeze([-1,0,1,2,3]);
export function canBeginReading(choices,peel){
 return Array.isArray(choices)&&choices.length===3
  &&new Set(choices.map(c=>c?.id)).size===3
  &&choices.every(c=>c&&['upright','reversed'].includes(c.orientation))
  &&Array.isArray(peel)&&peel.length===3&&peel.every(p=>clamp(p?.progress)>=.985);
}
export function handoffDuration(reducedMotion=false){return reducedMotion?0:1850;}
export function assetUrl(slot){
 if(!Object.hasOwn(ARTEMIS_ART_DIRECTOR_FILES,slot))throw new RangeError('Unknown Artemis art slot: '+slot);
 return ARTEMIS_ASSET_READY?ARTEMIS_ASSET_ROOT+ARTEMIS_ART_DIRECTOR_FILES[slot]:null;
}
export function portraitSlotForChapter(chapter){
 if(!READING_CHAPTERS.includes(chapter))throw new RangeError('Invalid Artemis reading chapter');
 return chapter===-1?'warmWelcome':chapter===0?'welcomingGesture':chapter===1?'thinking':'reflective';
}
function artSlot(slot,classes,content=''){
 const uri=assetUrl(slot),file=ARTEMIS_ART_DIRECTOR_FILES[slot];
 return '<div class="'+esc(classes)+'" data-art-slot="'+esc(slot)+'" data-art-filename="'+esc(file)+'" data-art-status="'+(uri?'ready':'pending')+'">'+
 (uri?'<img src="'+esc(uri)+'" alt="" decoding="async" aria-hidden="true">':content)+'</div>';
}
const face=(choice,cardsById)=> {
 const card=cardsById.get(choice.id);
 if(!card)throw new RangeError('Unknown selected Tarot card: '+choice.id);
 const reversed=choice.orientation==='reversed';
 return '<img class="reading-actual-card-face '+(reversed?'is-reversed':'')+'" src="../../assets/rws/'+esc(choice.id)+'.jpg" alt="'+esc(card.name)+(reversed?' reversed':' upright')+' original Rider–Waite–Smith card art" draggable="false">';
};
function chapterText(demo,chapter){
 if(!READING_CHAPTERS.includes(chapter))throw new RangeError('Unknown reading chapter');
 if(chapter===-1)return {
  eyebrow:'WELCOME TO YOUR READING',title:'The cards are ready to speak.',
  text:'I am Artemis. These are your three chosen cards, each with a different place in your story. We can read them with curiosity, not as a fixed prediction.'
 };
 if(chapter===3)return {
  eyebrow:'THE THREAD BETWEEN THE CARDS',title:'Your story, seen together.',
  text:demo.summary
 };
 const part=demo.cards[chapter];
 return {
  eyebrow:part.position+' · '+(part.orientation==='reversed'?'REVERSED':'UPRIGHT'),
  title:part.name,text:part.text
 };
}
export function renderReadingPanel(demo,chapter){
 if(!demo||!Array.isArray(demo.cards)||demo.cards.length!==3)throw new Error('Reading panel needs three interpretations');
 const current=chapterText(demo,chapter);
 const lead=chapter===-1?'Begin the interpretation ✧':chapter<2?'Continue the reading →':chapter===2?'Bring the three cards together →':'Return to the first card';
 return '<div class="reading-art-panel-inner">'+
 '<span class="reading-art-nameplate">✦ ARTEMIS <span>· YOUR READER</span></span>'+
 '<p class="reading-art-kicker">'+esc(current.eyebrow)+'</p>'+
 '<h2 class="reading-art-narration-title" id="artemis-chapter-title" tabindex="-1">'+esc(current.title)+'</h2>'+
 '<p class="reading-art-narration-text">'+esc(current.text)+'</p>'+
 '<div class="reading-art-controls">'+
 '<button type="button" class="reading-art-control is-secondary" data-action="reading-prev" '+(chapter===-1?'disabled':'')+'>← Previous</button>'+
 '<button type="button" class="reading-art-control" data-action="reading-next">'+esc(lead)+'</button>'+
 '</div><nav class="reading-art-progress" aria-label="Reading chapters">'+
 READING_CHAPTERS.map((value,index)=>'<button type="button" data-reading-chapter="'+value+'" class="'+(chapter===value?'is-active':'')+'" aria-current="'+(chapter===value?'step':'false')+'" aria-label="Reading chapter '+(index+1)+'">'+String(index+1).padStart(2,'0')+'</button>').join('')+
 '</nav></div>';
}
export function renderReadingStage({choices,cardsById,demo,chapter=-1,question=''}){
 if(!Array.isArray(choices)||choices.length!==3||new Set(choices.map(c=>c?.id)).size!==3)throw new Error('Reading stage requires exactly three distinct selected cards');
 for(const choice of choices){if(!['upright','reversed'].includes(choice.orientation))throw new Error('Missing card orientation');}
 if(!READING_CHAPTERS.includes(chapter))throw new Error('Invalid reading chapter');
 const roles=['Past','Present','Future'];
 const bg=assetUrl('background');
 return '<section class="scene scene-artemis-reading" aria-label="Your Reading with Artemis">'+
 '<div class="reading-art-atmosphere"'+(bg?' style="background-image:url('+esc(bg)+')"':'')+' aria-hidden="true"></div>'+
 '<div class="reading-art-stars" aria-hidden="true"></div>'+
 '<div class="reading-art-layout">'+
 '<header class="reading-art-header">'+
 artSlot('title','reading-art-title-art')+
 '<span class="reading-art-eyebrow">JUHUA SPEAKS · CELESTIAL TAROT</span>'+
 '<h1 tabindex="-1" id="artemis-reading-title">Your Reading</h1>'+
 '<p class="reading-art-subtitle">THREE CARDS · ONE STORY</p>'+
 '</header>'+
 '<div class="reading-art-hero" aria-label="Artemis illustration and your three selected cards">'+
 artSlot('halo','reading-art-halo')+
 artSlot(portraitSlotForChapter(chapter),'reading-art-portrait','<div class="reading-portrait-pending"><strong>ARTEMIS</strong><span>ILLUSTRATED ART INTEGRATION PENDING</span><small>Four provisional portraits ready for review · art package not yet committed</small></div>')+
 '<div class="reading-art-spread" role="group" aria-label="Your three selected Tarot cards">'+
 choices.map((c,i)=>{
  const card=cardsById.get(c.id);
  if(!card)throw new Error('Selected card not found');
  return '<button type="button" class="reading-art-card '+(chapter===i?'is-focused':'')+'" data-reading-chapter="'+i+'" aria-label="'+roles[i]+': '+esc(card.name)+', '+c.orientation+'" aria-pressed="'+(chapter===i)+'">'+
  '<span class="reading-art-card-frame">'+face(c,cardsById)+'</span>'+
  '<span class="reading-art-card-role">'+roles[i]+'</span></button>';
 }).join('')+
 '</div></div>'+
 '<div class="reading-art-panel" data-art-slot="panel" data-art-filename="ui_reading_frame_panel.png" data-art-status="'+(ARTEMIS_ASSET_READY?'ready':'pending')+'">'+renderReadingPanel(demo,chapter)+'</div>'+
 '<footer class="reading-art-footer"><p class="reading-art-question">'+(question?'YOUR QUESTION · '+esc(question):'PAST · PRESENT · FUTURE')+'</p>'+
 '<p class="reading-art-demo">SCRIPTED DEMONSTRATION · NO LIVE AI REQUEST</p></footer>'+
 '</div></section>';
}
