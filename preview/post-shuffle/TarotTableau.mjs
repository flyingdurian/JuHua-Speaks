/**
 * Gate C -> D: three chosen original cards float into a centered back-facing
 * tableau, and each flips/lands on click with a single per-session foil finish.
 * Keeps RWS faces authentic; effects are translucent surface overlays only.
 */
import {BY_ID,commonsThumbnailUrl,secureRandomInt} from '../../src/deck.mjs';
import {paintCelestialBack} from '../../src/ritual-world/EngravedBack.mjs';

export const FOIL_FINISHES=Object.freeze([
 'celestial-holographic-wash','chroma-shifting-metallic-sheen',
 'pearlescent-gloss','spectrum-activation-wave'
]);
export const SPREAD_ROLES=Object.freeze(['Past','Present','Future']);
export function chooseFoilFinish(random=secureRandomInt){
 const n=random(FOIL_FINISHES.length);
 if(!Number.isInteger(n)||n<0||n>=FOIL_FINISHES.length)throw new RangeError('Invalid foil selection');
 return FOIL_FINISHES[n];
}
export function cardBrief(id,orientation='upright'){
 const card=BY_ID.get(id);
 if(!card)throw new Error('Unknown Tarot card');
 if(orientation!=='upright'&&orientation!=='reversed')throw new Error('Unknown orientation');
 const s=orientation==='reversed'?card.reversed:card.upright;
 return s[0].toUpperCase()+s.slice(1).replace(/[. ]*$/,'')+'.';
}
export function paintBackDataUrl(){
 const c=document.createElement('canvas');c.width=256;c.height=448;
 paintCelestialBack(c.getContext('2d'),0,0,c.width,c.height);
 return c.toDataURL('image/png');
}
function node(tag,cls,text){
 const el=document.createElement(tag);if(cls)el.className=cls;
 if(text!==undefined)el.textContent=text;return el;
}
export function createTarotTableau({mount,picks,foil=chooseFoilFinish(),onRevealed=()=>{}}={}){
 if(!mount||!Array.isArray(picks)||picks.length!==3||new Set(picks.map(p=>p.id)).size!==3)throw new Error('Exactly three unique cards required');
 if(!FOIL_FINISHES.includes(foil))throw new Error('Invalid session foil');
 const backUrl=paintBackDataUrl();
 let revealed=0,disposed=false;
 const section=node('section','ps-tableau ps-foil-'+foil);
 section.setAttribute('aria-label','Your three Tarot cards: Past, Present, Future');
 section.setAttribute('aria-live','polite');
 section.hidden=true;
 const heading=node('h2','ps-tableau-heading','Your cards are ready');
 const help=node('p','ps-tableau-help','Select a card to reveal its meaning');
 const spread=node('div','ps-tableau-spread');
 section.append(heading,help,spread);
 const faceImages=[];
 const controls=picks.map((pick,i)=>{
  const card=BY_ID.get(pick.id);
  if(!card)throw new Error('Unrecognized Tarot card identity');
  const item=node('article','ps-tableau-item');
  const role=node('h3','ps-tableau-role',String(i+1).padStart(2,'0')+'. '+SPREAD_ROLES[i]);
  const button=node('button','ps-flip-button');
  button.type='button';
  button.setAttribute('aria-label','Reveal '+SPREAD_ROLES[i]+' card');
  const flip=node('div','ps-flip-inner');
  const back=node('div','ps-card-side ps-card-back');
  back.style.backgroundImage='url("'+backUrl+'")';
  const face=node('div','ps-card-side ps-card-front');
  const image=node('img','ps-card-art');
  image.alt=card.name+' Rider–Waite–Smith illustration';
  image.decoding='async';
  image.style.transform=pick.orientation==='reversed'?'rotate(180deg)':'none';
  const foilLayer=node('div','ps-card-foil');
  foilLayer.setAttribute('aria-hidden','true');
  const artifactNote=node('div','ps-card-art-unavailable','RWS artwork unavailable');
  artifactNote.hidden=true;
  image.onerror=()=>{
   if(!image.dataset.triedCommons){
    image.dataset.triedCommons='true';image.src=commonsThumbnailUrl(card);
   }else{
    artifactNote.hidden=false;image.hidden=true;
   }
  };
  image.src=new URL('../../assets/rws/'+pick.id+'.jpg',import.meta.url).href;
  face.append(image,foilLayer,artifactNote);
  flip.append(back,face);button.append(flip);
  const detail=node('div','ps-tableau-detail');
  detail.hidden=true;
  const name=node('p','ps-tableau-card-name',card.name+(pick.orientation==='reversed'?' · Reversed':' · Upright'));
  const brief=node('p','ps-tableau-card-brief',cardBrief(pick.id,pick.orientation));
  detail.append(name,brief);
  item.append(role,button,detail);spread.append(item);
  let used=false;
  button.addEventListener('click',()=>{
   if(used||disposed)return;
   used=true;button.disabled=true;button.classList.add('ps-revealed');
   button.setAttribute('aria-label',SPREAD_ROLES[i]+' card revealed: '+card.name);
   // The front image is authentic RWS art; the selected foil is only an overlay.
   let settled=false;
   const settle=()=>{
    if(disposed||settled)return;
    settled=true;detail.hidden=false;item.classList.add('ps-landed');revealed++;
    onRevealed({index:i,id:pick.id,allRevealed:revealed===3,foil});
   };
   // Disabled buttons do not reliably bubble animationend in Chromium.
   // Observe the animated inner element itself; retain a deterministic
   // one-shot completion fallback for reduced motion and throttled tabs.
   flip.addEventListener('animationend',e=>{
    if(e.target===flip&&e.animationName==='ps-flip-land')settle();
   });
   window.setTimeout(settle,1200);
   if(window.matchMedia?.('(prefers-reduced-motion:reduce)').matches)settle();
  },{once:true});
  faceImages.push(image);
  return button;
 });
 mount.append(section);
 return {
  foil,element:section,picks:picks.map(p=>({...p})),
  show(){if(disposed)return;section.hidden=false;requestAnimationFrame(()=>section.classList.add('ps-tableau-visible'));},
  hide(){section.classList.remove('ps-tableau-visible');section.hidden=true},
  get revealed(){return revealed},
  controls,
  dispose(){disposed=true;for(const img of faceImages){img.onerror=null;img.src='';}section.remove();}
 };
}
