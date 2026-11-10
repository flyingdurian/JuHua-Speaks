/**
 * Gate BC v3.4: selected cards do not blink into a new scene. The same three
 * card identities have screen-space continuity from the 3D sphere to the
 * past / present / future physical tableau. Only the visual proxy is cloned;
 * the actual card IDs and RWS artwork are never resampled or replaced.
 */
export const HANDOFF_DURATION_MS=1770;
export const HANDOFF_SETTLE_MS=1530;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function handoffAnchor(projected,viewport,index=0){
 const fallback={
  x:viewport.width*(.35+.15*index),y:viewport.height*.42,
  width:clamp(viewport.width*.10,48,96),height:clamp(viewport.height*.17,76,156)
 };
 if(!projected||!Array.isArray(projected.corners)||projected.corners.length!==4)return {...fallback,skipFlyby:true};
 const c=projected.corners;
 if(c.some(p=>!Number.isFinite(p?.x)||!Number.isFinite(p?.y)))return {...fallback,skipFlyby:true};
 const xs=c.map(p=>p.x),ys=c.map(p=>p.y);
 const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
 // A selection captured earlier may have rotated fully outside the viewport.
 // It must NEVER re-enter as an unrelated corner flash on third pick.
 const onScreen=right>16&&left<viewport.width-16&&bottom>16&&top<viewport.height-16;
 const mostlyVisible=left>=-24&&right<=viewport.width+24&&top>=-24&&bottom<=viewport.height+24;
 if(!onScreen||!mostlyVisible)return {...fallback,skipFlyby:true};
 const width=clamp(right-left,48,Math.min(240,viewport.width*.38));
 const height=clamp(bottom-top,76,Math.min(360,viewport.height*.49));
 // On a panned-out-of-view earlier pick, originate at the visible edge
 // rather than materializing outside the screen on an unrelated side.
 return {
  x:clamp((left+right)/2-width/2,-width*.4,viewport.width-width*.6),
  y:clamp((top+bottom)/2-height/2,-height*.4,viewport.height-height*.6),
  width,height
 };
}
export function handoffFrames(from,to){
 if(!from||!to||![from.x,from.y,from.width,from.height,to.x,to.y,to.width,to.height].every(Number.isFinite))
  throw new RangeError('Finite source and destination card rectangles required');
 const matrix=r=>'translate('+r.x+'px,'+r.y+'px) scale('+r.width/256+','+r.height/448+')';
 return [
  {transform:matrix(from),opacity:1,filter:'brightness(1.18)'},
  {offset:.30,transform:matrix({
    x:from.x+(to.x-from.x)*.28,y:from.y+(to.y-from.y)*.22-from.height*.23,
    width:from.width+(to.width-from.width)*.26,height:from.height+(to.height-from.height)*.26
   }),opacity:1,filter:'brightness(1.31)'},
  {offset:.78,transform:matrix({
    x:from.x+(to.x-from.x)*.91,y:from.y+(to.y-from.y)*.88-to.height*.09,
    width:from.width+(to.width-from.width)*.90,height:from.height+(to.height-from.height)*.90
   }),opacity:1,filter:'brightness(1.1)'},
  {transform:matrix(to),opacity:0,filter:'brightness(1)'}
 ];
}
export function createSelectionHandoff({world,picks,anchors,buttons,backUrl,reducedMotion=false}={}){
 if(!world||!Array.isArray(picks)||picks.length!==3||!Array.isArray(buttons)||buttons.length!==3)
  throw new Error('Exactly three picked cards and three tableau destinations required');
 const ghosts=[],animations=[];
 let disposed=false;
 const viewport={width:window.innerWidth,height:window.innerHeight};
 const dest=buttons.map(b=>{
  const rect=b.getBoundingClientRect();
  return {x:rect.left,y:rect.top,width:rect.width,height:rect.height};
 });
 for(let i=0;i<3;i++){
  const projected=anchors?.get(picks[i].id);
  const from=handoffAnchor(projected,viewport,i),to=dest[i];
  // An offscreen pick has no authentic projected source. The real card
  // settles in its tableau slot; do not fabricate an entering ghost.
  if(from.skipFlyby)continue;
  const frames=handoffFrames(from,to);
  const el=document.createElement('div');el.className='ps-handoff-card';
  el.setAttribute('aria-hidden','true');el.style.backgroundImage='url("'+backUrl+'")';
  // Set a valid initial matrix BEFORE insertion. An untransformed 256×448
  // card would otherwise flash at CSS left:0/top:0 before WAAPI's first tick.
  el.style.transform=frames[0].transform;
  el.style.opacity='1';
  world.append(el);ghosts.push(el);
  if(reducedMotion||typeof el.animate!=='function'){
   el.style.transform=frames.at(-1).transform;el.style.opacity='0';
   continue;
  }
  const animation=el.animate(frames,{
   duration:HANDOFF_DURATION_MS-i*80,
   delay:i*70,fill:'forwards',easing:'cubic-bezier(.21,.76,.24,1)'
  });
  animation.onfinish=()=>{if(!disposed)el.remove()};
  animations.push(animation);
 }
 function dispose(){
  if(disposed)return;
  disposed=true;
  for(const a of animations){a.onfinish=null;a.cancel()};
  for(const el of ghosts)el.remove();
 }
 return {dispose,ghosts,animations};
}
