/**
 * Gate C -> D: three chosen original cards float into a centered back-facing
 * tableau; each original RWS front can reveal with one of four switchable
 * neutral-gold esoteric art overlays. No replacement illustration or fake flap.
 */
import {BY_ID,commonsThumbnailUrl,secureRandomInt} from '../../src/deck.mjs';
import {paintCelestialBack} from '../../src/ritual-world/EngravedBack.mjs';
import {createCardVapor} from './CardVapor.mjs';
import {ART_OVERLAY_STYLES,ART_OVERLAY_LABELS,artOverlayDataUrls} from './ArtOverlays.mjs';

// User-provided Style V1 is an ADDITIONAL reveal-stage comparison option.
// The four historical Canvas engraving finishes remain intact and unchanged.
export const FOIL_ANIM_V1='foil-anim-style-v1';
const SANDBOX_FOIL_STYLES=Object.freeze([FOIL_ANIM_V1,...ART_OVERLAY_STYLES]);
const foilStyleLabel=s=>s===FOIL_ANIM_V1?'Style V1 · Particle Drift':ART_OVERLAY_LABELS[s];
const FOIL_V1_PARTICLES=Object.freeze([
 [15,20,1.2,'#ffffff',.95],[35,45,1.8,'#ffd700',.9],
 [65,25,.8,'#ffffff',.8],[95,35,1.5,'#da70d6',.95],
 [125,15,2.2,'#ffd700',.9],[155,40,1,'#ffffff',.9],
 [180,25,1.6,'#ffd700',.95],[20,90,1.4,'#ffffff',.9],
 [55,75,1.8,'#ffd700',.95],[85,110,1.2,'#da70d6',.85],
 [115,85,2,'#ffffff',.95],[145,105,.9,'#ffd700',.7],
 [175,90,1.6,'#ffffff',.9],[30,150,1.5,'#ffd700',.9],
 [60,135,1.2,'#da70d6',.8],[90,165,2,'#ffffff',.95],
 [130,140,1.6,'#ffd700',.9],[165,160,1.2,'#ffffff',.9],
 [45,185,1.8,'#da70d6',.9],[105,185,1.4,'#ffd700',.95]
]);
// Exact V1 particle sizes, locations, colours and opacity, with URI-safe
// encoding of the supplied SVG rather than the broken Markdown-in-URL text.
export function foilV1ParticleUri(){
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">'+
 FOIL_V1_PARTICLES.map(([cx,cy,r,fill,opacity])=>
  '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" opacity="'+opacity+'"/>').join('')+'</svg>';
 return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
}
export function installFoilV1Style(){
 if(document.getElementById('foil-anim-style-v1'))return;
 const style=document.createElement('style');
 style.id='foil-anim-style-v1';
 // Preserve the supplied 0/50/100%, brightness .7/1.5/.7 and 10s timing.
 // Animate a particle pseudo-layer, not the parent's filter, since the
 // original RWS/foil handoff already has authoritative parent filters.
 style.innerHTML=`
 @keyframes foilDriftV1 {
   0% { background-position: 0px 0px; filter: brightness(0.7); }
   50% { background-position: 80px 100px; filter: brightness(1.5); }
   100% { background-position: 160px 200px; filter: brightness(0.7); }
 }
 .ps-tableau .ps-card-front .ps-card-art-overlay[data-foil-finish="foil-anim-style-v1"]::before,
 .scene-artemis-reading .reading-art-card-frame .reading-art-card-foil[data-foil-finish="foil-anim-style-v1"]::before{
   content:"";position:absolute;inset:0;display:block;
   background-image:inherit;background-size:200px 200px;
   background-repeat:repeat;mix-blend-mode:screen;
   opacity:1;pointer-events:none;
   animation:foilDriftV1 10s linear infinite!important;
 }
 @media(prefers-reduced-motion:reduce){
  .ps-tableau .ps-card-front .ps-card-art-overlay[data-foil-finish="foil-anim-style-v1"]::before,
  .scene-artemis-reading .reading-art-card-foil[data-foil-finish="foil-anim-style-v1"]::before{
   animation:none!important;filter:brightness(1);
  }
 }
 `;
 document.head.appendChild(style);
}
function cycleSandboxFoil(current,direction=1){
 const idx=SANDBOX_FOIL_STYLES.indexOf(current);
 if(idx<0||!Number.isInteger(direction))throw new RangeError('Invalid foil style');
 return SANDBOX_FOIL_STYLES[((idx+direction)%SANDBOX_FOIL_STYLES.length+SANDBOX_FOIL_STYLES.length)%SANDBOX_FOIL_STYLES.length];
}
export const FOIL_FINISHES=ART_OVERLAY_STYLES;
// Legacy public names remain for old preview consumers, but now select art overlays.
export const HOLOGRAM_STYLES=ART_OVERLAY_STYLES;
export const SPREAD_ROLES=Object.freeze(['Past','Present','Future']);
export function chooseFoilFinish(random=secureRandomInt){
 const n=random(HOLOGRAM_STYLES.length);
 if(!Number.isInteger(n)||n<0||n>=ART_OVERLAY_STYLES.length)throw new RangeError('Invalid art overlay style');
 return ART_OVERLAY_STYLES[n];
}
export function nextArtOverlayStyle(current,direction=1){
 const index=ART_OVERLAY_STYLES.indexOf(current);
 if(index<0||!Number.isInteger(direction))throw new RangeError('Invalid overlay cycle');
 return ART_OVERLAY_STYLES[((index+direction)%ART_OVERLAY_STYLES.length+ART_OVERLAY_STYLES.length)%ART_OVERLAY_STYLES.length];
}
export const nextHologramStyle=nextArtOverlayStyle;
const labelStyle=foilStyleLabel;
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
export function createTarotTableau({mount,picks,foil=chooseFoilFinish(),onRevealed=()=>{},onBeginReading=()=>{}}={}){
 if(!mount||!Array.isArray(picks)||picks.length!==3||new Set(picks.map(p=>p.id)).size!==3)throw new Error('Exactly three unique cards required');
 if(!SANDBOX_FOIL_STYLES.includes(foil))throw new Error('Invalid art overlay style');
 const backUrl=paintBackDataUrl();
 installFoilV1Style();
 const overlayTiles=artOverlayDataUrls(),overlayLayers=[];
 overlayTiles[FOIL_ANIM_V1]=foilV1ParticleUri();
 const vapor=createCardVapor({reduceMotion:window.matchMedia?.('(prefers-reduced-motion:reduce)').matches??false});
 let revealed=0,disposed=false,activeStyle=foil,activeIntensity=.70;
 const foilStyleButtons=[];
 const section=node('section','ps-tableau ps-overlay-'+activeStyle);
 section.setAttribute('aria-label','Your three Tarot cards: Past, Present, Future');
 section.setAttribute('aria-live','polite');
 section.hidden=true;
 const heading=node('h2','ps-tableau-heading','Your cards are ready');
 const help=node('p','ps-tableau-help','Select a card to reveal its meaning');
 const styles=node('div','ps-overlay-controls');
 styles.setAttribute('role','group');styles.setAttribute('aria-label','Art overlay style selection');
 const prevStyle=node('button','ps-overlay-prev','‹');
 prevStyle.type='button';prevStyle.setAttribute('aria-label','Previous art overlay');
 const styleName=node('span','ps-overlay-name','Art overlay · '+labelStyle(activeStyle));
 styleName.setAttribute('aria-live','polite');
 const nextStyle=node('button','ps-overlay-next','›');
 nextStyle.type='button';nextStyle.setAttribute('aria-label','Next art overlay');
 function setArtOverlayStyle(next){
  if(disposed||!SANDBOX_FOIL_STYLES.includes(next))throw new RangeError('Unknown art overlay style');
  section.classList.remove('ps-overlay-'+activeStyle);
  activeStyle=next;section.classList.add('ps-overlay-'+activeStyle);
  for(const layer of overlayLayers){
   layer.style.backgroundImage='url("'+overlayTiles[activeStyle]+'")';
   layer.dataset.foilFinish=activeStyle;
  }
  styleName.textContent='Art overlay · '+labelStyle(activeStyle);
  for(const b of foilStyleButtons)b.setAttribute('aria-pressed',String(b.dataset.foilStyle===activeStyle));
  return activeStyle;
 }
 prevStyle.addEventListener('click',()=>setArtOverlayStyle(cycleSandboxFoil(activeStyle,-1)));
 nextStyle.addEventListener('click',()=>setArtOverlayStyle(cycleSandboxFoil(activeStyle,1)));
 styles.append(prevStyle,styleName,nextStyle);
 // Owner-only review tool at Gate C. It never appears in the final reading.
 // The visible foil is the same live Canvas texture subsequently carried to D.
 const sandbox=node('details','ps-foil-sandbox');
 sandbox.setAttribute('aria-label','Foil animation sandbox');
 const toggle=node('summary','ps-foil-sandbox-toggle','FOIL SANDBOX · TUNE');
 const sandboxBody=node('div','ps-foil-sandbox-body');
 const sandboxHeading=node('p','ps-foil-sandbox-heading','LIVE FOIL TUNING · REVEAL STAGE');
 const styleGrid=node('div','ps-foil-style-grid');
 styleGrid.setAttribute('role','group');styleGrid.setAttribute('aria-label','Choose one of four animated foil finishes');
 for(const style of SANDBOX_FOIL_STYLES){
  const b=node('button','ps-foil-style-option',labelStyle(style));
  b.type='button';b.dataset.foilStyle=style;
  b.setAttribute('aria-pressed',String(style===activeStyle));
  b.addEventListener('click',()=>setArtOverlayStyle(style));
  foilStyleButtons.push(b);styleGrid.append(b);
 }
 const intensityRow=node('div','ps-foil-intensity-row');
 const intensityLabel=node('label','ps-foil-intensity-label','Foil intensity');
 intensityLabel.htmlFor='ps-foil-intensity';
 const intensityValue=node('output','ps-foil-intensity-value','70%');
 intensityValue.htmlFor='ps-foil-intensity';
 const intensityInput=node('input','ps-foil-intensity');
 intensityInput.id='ps-foil-intensity';intensityInput.type='range';
 intensityInput.min='0';intensityInput.max='100';intensityInput.step='5';
 intensityInput.value='70';intensityInput.setAttribute('aria-label','Foil intensity percentage');
 function setFoilIntensity(value){
  if(disposed||!Number.isFinite(value)||value<0||value>1)throw new RangeError('Invalid foil intensity');
  activeIntensity=Math.round(value*100)/100;
  for(const layer of overlayLayers){
   layer.style.setProperty('--foil-intensity',String(activeIntensity));
   layer.dataset.foilIntensity=String(activeIntensity);
  }
  intensityInput.value=String(Math.round(activeIntensity*100));
  intensityValue.textContent=Math.round(activeIntensity*100)+'%';
  return activeIntensity;
 }
 intensityInput.addEventListener('input',()=>setFoilIntensity(Number(intensityInput.value)/100));
 intensityRow.append(intensityLabel,intensityInput,intensityValue);
 const exportButton=node('button','ps-foil-export','EXPORT ACTIVE JSON');
 exportButton.type='button';exportButton.setAttribute('aria-label','Export current foil style and intensity as JSON');
 const exportStatus=node('p','ps-foil-export-status','');
 exportStatus.setAttribute('role','status');exportStatus.setAttribute('aria-live','polite');
 const foilConfig=()=>({version:1,style:activeStyle,intensity:activeIntensity,
  animation:activeStyle===FOIL_ANIM_V1?'foilDriftV1':'moving-gold-foil'});
 exportButton.addEventListener('click',()=>{
  if(disposed)return;
  const json=JSON.stringify(foilConfig(),null,2)+'\n';
  const a=document.createElement('a');
  a.href='data:application/json;charset=utf-8,'+encodeURIComponent(json);
  a.download='juhua-foil-config.json';
  section.append(a);a.click();a.remove();
  exportStatus.textContent='Exported '+labelStyle(activeStyle)+' · '+Math.round(activeIntensity*100)+'%';
 });
 sandboxBody.append(sandboxHeading,styleGrid,intensityRow,exportButton,exportStatus);
 sandbox.append(toggle,sandboxBody);
 const spread=node('div','ps-tableau-spread');
 // The reader is an opt-in ritual milestone. The three original cards remain
 // on the table after reveal until the visitor explicitly begins the reading.
 const readingEntry=node('div','ps-reading-entry');
 readingEntry.hidden=true;readingEntry.setAttribute('aria-live','polite');
 const readingComplete=node('p','ps-reading-entry-complete','All three cards revealed · Your story is ready');
 const begin=node('button','ps-begin-reading','BEGIN READING ✧');
 begin.type='button';begin.dataset.action='begin-reading';begin.disabled=true;
 begin.addEventListener('click',()=>{
  if(disposed||revealed!==3||begin.disabled)return;
  begin.disabled=true;onBeginReading({picks:picks.map(p=>({...p})),artOverlay:activeStyle,foilConfiguration:foilConfig()});
 });
 readingEntry.append(readingComplete,begin);
 section.append(heading,help,styles,sandbox,spread,readingEntry);
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
  const foilLayer=node('div','ps-card-art-overlay');
  foilLayer.setAttribute('aria-hidden','true');
  foilLayer.style.backgroundImage='url("'+overlayTiles[activeStyle]+'")';
  foilLayer.dataset.foilFinish=activeStyle;
  foilLayer.dataset.foilIntensity=String(activeIntensity);
  foilLayer.style.setProperty('--foil-intensity',String(activeIntensity));
  overlayLayers.push(foilLayer);
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
   // Authentic RWS pixels remain intact; engraved art is an overlay only.
   let settled=false;
   const settle=()=>{
    if(disposed||settled)return;
    settled=true;detail.hidden=false;item.classList.add('ps-landed');revealed++;
    if(revealed===3){
     vapor.stop();readingEntry.hidden=false;begin.disabled=false;
     help.textContent='You may begin your reading whenever you are ready';
    }
    onRevealed({index:i,id:pick.id,allRevealed:revealed===3,artOverlay:activeStyle});
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
  get foil(){return activeStyle},get artOverlay(){return activeStyle},get hologram(){return activeStyle},
  get foilIntensity(){return activeIntensity},get foilConfiguration(){return foilConfig()},
  get backUrl(){return backUrl},
  get destinations(){return controls},
  prepareHandoff(){if(disposed)return;section.hidden=false;section.classList.add('ps-handoff-prepared');section.classList.add('ps-tableau-visible');},
  finishHandoff(){if(disposed)return;section.classList.add('ps-handoff-settled');vapor.start();},
  setArtOverlayStyle,setHologramStyle:setArtOverlayStyle,setFoilIntensity,
  cycleArtOverlay(direction=1){return setArtOverlayStyle(cycleSandboxFoil(activeStyle,direction))},
  cycleHologram(direction=1){return setArtOverlayStyle(cycleSandboxFoil(activeStyle,direction))},
  element:section,picks:picks.map(p=>({...p})),
  show(){if(disposed)return;section.hidden=false;vapor.start();requestAnimationFrame(()=>section.classList.add('ps-tableau-visible'));},
  hide(){vapor.stop();section.classList.remove('ps-tableau-visible');section.hidden=true},
  get revealed(){return revealed},get beginReadingReady(){return revealed===3&&!disposed},
  controls,
  get vaporFrames(){return vapor.frames},
  dispose(){
   disposed=true;vapor.dispose();
   for(const img of faceImages){
    img.onload=null;img.onerror=null;
    // Only destroy decoded artwork still owned by this tableau. Three revealed
    // physical-card image nodes may have been adopted by Artemis Reading.
    if(section.contains(img))img.removeAttribute('src');
   }
   section.remove();
  }
 };
}
