/**
 * Gate C -> D: three chosen original cards float into a centered back-facing
 * tableau; each original RWS front can reveal with one of four switchable
 * holographic overlays. No replacement illustration or fake card flap.
 */
import {BY_ID,commonsThumbnailUrl,secureRandomInt} from '../../src/deck.mjs';
import {paintCelestialBack} from '../../src/ritual-world/EngravedBack.mjs';
import {createCardVapor} from './CardVapor.mjs';

export const HOLOGRAM_STYLES=Object.freeze([
 'prismatic','aurora','starfield','glass-spectrum'
]);
// Compatibility with earlier gate contracts; these are holograms, not foil finishes.
export const FOIL_FINISHES=HOLOGRAM_STYLES;
export const SPREAD_ROLES=Object.freeze(['Past','Present','Future']);
export function chooseFoilFinish(random=secureRandomInt){
 const n=random(HOLOGRAM_STYLES.length);
 if(!Number.isInteger(n)||n<0||n>=HOLOGRAM_STYLES.length)throw new RangeError('Invalid hologram style');
 return HOLOGRAM_STYLES[n];
}
export function nextHologramStyle(current,direction=1){
 const index=HOLOGRAM_STYLES.indexOf(current);
 if(index<0||!Number.isInteger(direction))throw new RangeError('Invalid hologram cycle');
 return HOLOGRAM_STYLES[((index+direction)%HOLOGRAM_STYLES.length+HOLOGRAM_STYLES.length)%HOLOGRAM_STYLES.length];
}
const labelStyle=s=>s.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');
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
 if(!HOLOGRAM_STYLES.includes(foil))throw new Error('Invalid hologram style');
 const backUrl=paintBackDataUrl();
 const vapor=createCardVapor({reduceMotion:window.matchMedia?.('(prefers-reduced-motion:reduce)').matches??false});
 let revealed=0,disposed=false,activeStyle=foil;
 const section=node('section','ps-tableau ps-holo-'+activeStyle);
 section.setAttribute('aria-label','Your three Tarot cards: Past, Present, Future');
 section.setAttribute('aria-live','polite');
 section.hidden=true;
 const heading=node('h2','ps-tableau-heading','Your cards are ready');
 const help=node('p','ps-tableau-help','Select a card to reveal its meaning');
 const styles=node('div','ps-hologram-controls');
 styles.setAttribute('role','group');styles.setAttribute('aria-label','Hologram style selection');
 const prevStyle=node('button','ps-hologram-prev','‹');
 prevStyle.type='button';prevStyle.setAttribute('aria-label','Previous hologram style');
 const styleName=node('span','ps-hologram-name','Hologram · '+labelStyle(activeStyle));
 styleName.setAttribute('aria-live','polite');
 const nextStyle=node('button','ps-hologram-next','›');
 nextStyle.type='button';nextStyle.setAttribute('aria-label','Next hologram style');
 function setHologramStyle(next){
  if(disposed||!HOLOGRAM_STYLES.includes(next))throw new RangeError('Unknown hologram style');
  section.classList.remove('ps-holo-'+activeStyle);
  activeStyle=next;section.classList.add('ps-holo-'+activeStyle);
  styleName.textContent='Hologram · '+labelStyle(activeStyle);
  return activeStyle;
 }
 prevStyle.addEventListener('click',()=>setHologramStyle(nextHologramStyle(activeStyle,-1)));
 nextStyle.addEventListener('click',()=>setHologramStyle(nextHologramStyle(activeStyle,1)));
 styles.append(prevStyle,styleName,nextStyle);
 const spread=node('div','ps-tableau-spread');
 section.append(heading,help,styles,spread);
 const faceImages=[];
 const controls=picks.map((pick,i)=>{
  const card=BY_ID.get(pick.id);
  if(!card)throw new Error('Unrecognized Tarot card identity');
  const item=node('article','ps-tableau-item');
  const role=node('h3','ps-tableau-role',String(i+1).padStart(2,'0')+'. '+SPREAD_ROLES[i]);
  const button=node('button','ps-flip-button');
  button.type='button';button.disabled=true; // Never reveal unloaded artwork
  button.setAttribute('aria-label','Reveal '+SPREAD_ROLES[i]+' card');
  const flip=node('div','ps-flip-inner');
  const back=node('div','ps-card-side ps-card-back');
  back.style.backgroundImage='url("'+backUrl+'")';
  vapor.attach(back);
  const backWarning=node('span','ps-back-asset-warning','Original RWS artwork unavailable — run npm run assets:sync');
  backWarning.hidden=true;back.append(backWarning);
  const face=node('div','ps-card-side ps-card-front');
  const image=node('img','ps-card-art');
  image.alt=card.name+' Rider–Waite–Smith illustration';
  image.decoding='async';
  image.style.transform=pick.orientation==='reversed'?'rotate(180deg)':'none';
  const foilLayer=node('div','ps-card-hologram ps-card-foil');
  foilLayer.setAttribute('aria-hidden','true');
  const artifactNote=node('div','ps-card-art-unavailable','RWS artwork unavailable');
  artifactNote.hidden=true;
  image.onload=()=>{
   if(disposed)return;
   if(image.naturalWidth>0&&image.naturalHeight>0){
    image.hidden=false;artifactNote.hidden=true;backWarning.hidden=true;
    button.disabled=false;button.dataset.artLoaded='true';
   }
  };
  image.onerror=()=>{
   if(disposed)return;
   if(!image.dataset.triedCommons){
    image.dataset.triedCommons='true';image.src=commonsThumbnailUrl(card);
   }else{
    artifactNote.hidden=false;image.hidden=true;
    backWarning.hidden=false;button.disabled=true;
    button.dataset.artLoaded='false';
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
   // The original RWS scan stays intact; holographic diffraction is overlay-only.
   let settled=false;
   const settle=()=>{
    if(disposed||settled)return;
    settled=true;detail.hidden=false;item.classList.add('ps-landed');revealed++;
    if(revealed===3)vapor.stop();
    onRevealed({index:i,id:pick.id,allRevealed:revealed===3,hologram:activeStyle});
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
  get foil(){return activeStyle},get hologram(){return activeStyle},setHologramStyle,
  cycleHologram(direction=1){return setHologramStyle(nextHologramStyle(activeStyle,direction))},
  element:section,picks:picks.map(p=>({...p})),
  show(){if(disposed)return;section.hidden=false;vapor.start();requestAnimationFrame(()=>section.classList.add('ps-tableau-visible'));},
  hide(){vapor.stop();section.classList.remove('ps-tableau-visible');section.hidden=true},
  get revealed(){return revealed},
  controls,
  get vaporFrames(){return vapor.frames},
  dispose(){disposed=true;vapor.dispose();for(const img of faceImages){img.onload=null;img.onerror=null;img.src='';}section.remove();}
 };
}
