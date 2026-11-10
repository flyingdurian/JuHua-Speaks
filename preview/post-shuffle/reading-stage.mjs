/**
 * Gate D — composited Artemis Reading Stage V1.
 *
 * 31 owner-approved original illustrations live in Artemis_Asset_Candidates.
 * Only a source-verified, actually installed file is considered available.
 * Four prior WebP previews provide a safe fallback until the 31 originals are
 * committed; neither geometric human puppets nor fabricated Tarot faces exist.
 *
 * The three physical RWS cards/identities come from Gate C and never change.
 */
import {ARTEMIS_IMPORTED_FILES} from './artemis-assets-ready.mjs';
import {ARTEMIS_PORTRAIT_SLOTS,ARTEMIS_SOURCE_FILES} from './artemis-art-catalog.mjs';

export const ARTEMIS_ASSET_ROOT='../../assets/artemis/';
export const ARTEMIS_ASSET_READY=true;
export const ARTEMIS_PROVISIONAL_READY_SLOTS=Object.freeze([
 'warmWelcome','welcomingGesture','thinking','reflective'
]);
const PROVISIONAL_FILES=Object.freeze({
 warmWelcome:'artemis_warm_welcome.webp',
 welcomingGesture:'artemis_welcoming_gesture.webp',
 thinking:'artemis_thinking.webp',
 reflective:'artemis_reflective.webp'
});
// Preserve the public V3.4 filenames used by older preview regression tests.
// Source-package overrides use Artemis_Asset_Candidates/*.png, registered
// separately by the importer, and take precedence over those four previews.
export const ARTEMIS_ART_DIRECTOR_FILES=Object.freeze({
 portrait:'artemis_idle.png',
 ...Object.fromEntries(Object.entries(ARTEMIS_SOURCE_FILES).map(([slot,path])=>[slot,path.split('/').pop()])),
 ...PROVISIONAL_FILES
});
export const ARTEMIS_READY_PORTRAIT_SLOTS=Object.freeze(
 ARTEMIS_PORTRAIT_SLOTS.filter(slot=>{
  const src=ARTEMIS_SOURCE_FILES[slot]?.split('/').pop();
  return (src&&ARTEMIS_IMPORTED_FILES[slot]===src)||Object.hasOwn(PROVISIONAL_FILES,slot);
 })
);
const clamp=n=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
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
 const original=ARTEMIS_SOURCE_FILES[slot]?.split('/').pop();
 // The generated registration and the actual filename must agree. This is
 // also a path traversal guard: never concatenate an arbitrary manifest path.
 if(original&&ARTEMIS_IMPORTED_FILES[slot]===original)return ARTEMIS_ASSET_ROOT+original;
 const fallback=PROVISIONAL_FILES[slot];
 return fallback?ARTEMIS_ASSET_ROOT+fallback:null;
}
export function portraitSlotForChapter(chapter){
 if(!READING_CHAPTERS.includes(chapter))throw new RangeError('Invalid Artemis reading chapter');
 const intended=chapter===-1?'warmWelcome':chapter===0?'explaining':
  chapter===1?'thinking':chapter===2?'reading':'reflective';
 if(assetUrl(intended))return intended;
 // Prior-stage preview remains functional while the new originals are staged.
 return chapter===-1?'warmWelcome':chapter===0?'welcomingGesture':
  chapter===1?'thinking':'reflective';
}
function artSlot(slot,classes,fallback=''){
 const uri=assetUrl(slot),file=uri?.split('/').pop()||ARTEMIS_ART_DIRECTOR_FILES[slot];
 return '<div class="'+esc(classes)+'" data-art-slot="'+esc(slot)+
  '" data-art-filename="'+esc(file)+'" data-art-status="'+(uri?'ready':'pending')+'" aria-hidden="true">'+
  (uri?'<img src="'+esc(uri)+'" alt="" loading="eager" decoding="async" draggable="false">':fallback)+'</div>';
}
const face=(choice,cardsById)=>{
 const card=cardsById.get(choice.id);
 if(!card)throw new RangeError('Unknown selected Tarot card: '+choice.id);
 const reversed=choice.orientation==='reversed';
 return '<img class="reading-actual-card-face '+(reversed?'is-reversed':'')+
  '" src="../../assets/rws/'+esc(choice.id)+'.jpg" alt="'+esc(card.name)+
  (reversed?' reversed':' upright')+' original Rider–Waite–Smith card art" draggable="false">';
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
 return {eyebrow:part.position+' · '+(part.orientation==='reversed'?'REVERSED':'UPRIGHT'),
  title:part.name,text:part.text};
}
export function renderReadingHandoff(){
 return '<div class="reading-handoff-veil" role="status" aria-live="polite">'+
  artSlot('transition','reading-handoff-backdrop')+
  artSlot('sigils','reading-handoff-sigils')+
  artSlot('goldParticles','reading-handoff-gold')+
  '<div class="reading-handoff-aura" aria-hidden="true"><span>✧</span></div>'+
  '<p>THE CARDS ARE READY TO SPEAK</p></div>';
}
export function renderReadingPanel(demo,chapter){
 if(!demo||!Array.isArray(demo.cards)||demo.cards.length!==3)throw new Error('Reading panel needs three interpretations');
 const current=chapterText(demo,chapter);
 const lead=chapter===-1?'Begin the interpretation':chapter<2?'Continue the reading':
  chapter===2?'Bring the cards together':'Return to the first card';
 const step=READING_CHAPTERS.indexOf(chapter)+1;
 return '<div class="reading-art-panel-inner">'+
  artSlot('nameplate','reading-art-nameplate-art')+
  '<span class="reading-art-nameplate">ARTEMIS <span>· YOUR READER</span></span>'+
  '<p class="reading-art-kicker">'+esc(current.eyebrow)+'</p>'+
  '<h2 class="reading-art-narration-title" id="artemis-chapter-title" tabindex="-1">'+esc(current.title)+'</h2>'+
  '<p class="reading-art-narration-text">'+esc(current.text)+'</p>'+
  '<div class="reading-art-controls">'+
  '<button type="button" class="reading-art-control is-secondary" data-action="reading-prev" '+
   (chapter===-1?'disabled':'')+' aria-label="Previous chapter">← Previous</button>'+
  '<button type="button" class="reading-art-control is-primary" data-action="reading-next" aria-label="'+esc(lead)+'">'+
   '<span>'+esc(lead)+'</span>'+artSlot('arrow','reading-art-control-arrow')+
   '<span class="reading-art-control-arrow-fallback" aria-hidden="true">➜</span></button>'+
  '</div><p class="reading-art-progress" aria-label="Reading chapter '+step+' of 5">'+
   String(step).padStart(2,'0')+' <span>/</span> 05</p></div>';
}
function cardBrief(demo,card,choice,index){
 // Real, established deck interpretations (never AI-invented keywords).
 const meaning=demo.cards?.[index]?.meaning||
  (choice.orientation==='reversed'?card.reversed:card.upright);
 const oneLine=String(meaning).replace(/\s+/g,' ').trim();
 return oneLine.length>72?oneLine.slice(0,69).replace(/\s+\S*$/,'')+'…':oneLine;
}
export function renderReadingStage({choices,cardsById,demo,chapter=-1,question=''}){
 if(!Array.isArray(choices)||choices.length!==3||new Set(choices.map(c=>c?.id)).size!==3)throw Error('Reading stage requires exactly three distinct selected cards');
 for(const choice of choices)if(!['upright','reversed'].includes(choice.orientation))throw Error('Missing card orientation');
 if(!READING_CHAPTERS.includes(chapter))throw Error('Invalid reading chapter');
 if(!demo||!Array.isArray(demo.cards)||demo.cards.length!==3)throw Error('Reading stage requires its three actual interpretations');
 const roles=['Past','Present','Future'];
 return '<section class="scene scene-artemis-reading" aria-label="Your Reading with Artemis">'+
  artSlot('background','reading-art-atmosphere')+
  '<div class="reading-art-stars" aria-hidden="true"></div>'+
  artSlot('sigils','reading-art-fx reading-art-fx-sigils')+
  artSlot('violetParticles','reading-art-fx reading-art-fx-violet')+
  artSlot('goldParticles','reading-art-fx reading-art-fx-gold')+
  '<div class="reading-art-layout">'+
  '<header class="reading-art-header">'+artSlot('title','reading-art-title-art')+
  '<span class="reading-art-eyebrow">JUHUA SPEAKS · CELESTIAL TAROT</span>'+
  '<h1 tabindex="-1" id="artemis-reading-title">Your Reading</h1>'+
  '<p class="reading-art-subtitle">THREE CARDS · ONE STORY</p></header>'+
  '<div class="reading-art-hero" aria-label="Artemis and the three cards chosen during the ritual">'+
   artSlot('halo','reading-art-halo')+
   artSlot('readingGlow','reading-art-reading-glow')+
   artSlot(portraitSlotForChapter(chapter),'reading-art-portrait',
    '<div class="reading-portrait-pending"><strong>ARTEMIS</strong><span>ARTWORK UNAVAILABLE</span></div>')+
   '<div class="reading-art-table-surface" aria-hidden="true"></div>'+
   artSlot('cardGlow','reading-art-card-glow')+
   '<div class="reading-art-spread" role="group" aria-label="The original Past, Present and Future Tarot cards">'+
   choices.map((choice,i)=>{
    const card=cardsById.get(choice.id);
    if(!card)throw Error('Selected card not found');
    const orientation=choice.orientation==='reversed'?'Reversed':'Upright';
    return '<button type="button" class="reading-art-card '+(chapter===i?'is-focused':'')+
      '" data-reading-chapter="'+i+'" aria-label="'+roles[i]+': '+esc(card.name)+', '+choice.orientation+
      '" aria-pressed="'+(chapter===i)+'" data-original-card-id="'+esc(choice.id)+'" data-orientation="'+esc(choice.orientation)+'">'+
      '<span class="reading-art-card-frame">'+face(choice,cardsById)+'</span>'+
      '<span class="reading-art-connector" aria-hidden="true"></span>'+
      '<span class="reading-art-card-role">'+String(i+1).padStart(2,'0')+' · '+roles[i]+'</span>'+
      '<span class="reading-art-card-meaning">'+orientation+' · '+esc(cardBrief(demo,card,choice,i))+'</span></button>';
   }).join('')+
   '</div></div>'+
  '<div class="reading-art-panel" data-art-slot="panel" data-art-filename="'+
   esc(assetUrl('panel')?.split('/').pop()||ARTEMIS_ART_DIRECTOR_FILES.panel)+
   '" data-art-status="'+(assetUrl('panel')?'ready':'pending')+'">'+
   artSlot('panel','reading-art-panel-skin')+
   artSlot('corners','reading-art-panel-corners')+
   renderReadingPanel(demo,chapter)+'</div>'+
  '<footer class="reading-art-footer"><p class="reading-art-question">'+
   (question?'YOUR QUESTION · '+esc(question):'PAST · PRESENT · FUTURE')+'</p>'+
   '<p class="reading-art-demo">SCRIPTED DEMONSTRATION · NO LIVE AI REQUEST</p></footer>'+
  '</div></section>';
}
