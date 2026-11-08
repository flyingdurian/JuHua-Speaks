/** Gate C v2: stable 78-card interior, tuned to the owner's 37.5s ChatARot comparison.
 * Uniform identity distribution; slight deterministic depth/tilt variation is purely visual.
 */
const TAU=Math.PI*2;
export const STEPS=Object.freeze(['gate','cube','sphere','select']);
export const clamp=(n,low,high)=>Math.max(low,Math.min(high,n));
const mix=(a,b,t)=>a+(b-a)*t;
const hash=i=>{const s=Math.sin(i*127.1+71.19)*43758.5453;return s-Math.floor(s)};
export function sphereLayout(count=78){
 if(count!==78)throw new Error('Gate C sphere requires exactly 78 cards');
 return Array.from({length:count},(_,i)=>{
  // Fibonacci sphere prevents the unnatural fixed rows seen in rejected v1.
  const lat=Math.asin(1-2*(i+.5)/count);
  const lon=(i*2.399963229728653+.17*(hash(i+37)-.5))%TAU;
  const radius=5.05+1.35*hash(i+11),twist=(hash(i+8)-.5)*24;
  const vector=[Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat)];
  return {i,lat,lon,radius,twist,vector};
 });
}
/** Perspective from the center, toward -Z, with a real near/far size gradient. */
export function projectCard(point,yawDeg,pitchDeg,width,height){
 if(width<=0||height<=0)return null;
 const [x,y,z]=point.vector,ry=yawDeg*Math.PI/180,rx=pitchDeg*Math.PI/180;
 const X=x*Math.cos(ry)+z*Math.sin(ry),Z=-x*Math.sin(ry)+z*Math.cos(ry);
 const Y=y*Math.cos(rx)-Z*Math.sin(rx),D=y*Math.sin(rx)+Z*Math.cos(rx);
 if(D>=-.20)return null;
 // Wide interior FOV: ~20–25 visible cards at 1440×900, matching the video rather than a giant-card wall.
 const focal=height*.48,px=width*.5+focal*X/-D,py=height*.515-focal*Y/-D;
 if(px < -180||px > width+180||py < -245||py > height+245)return null;
 const depth=-D,w=clamp(.94*focal/(point.radius*depth),31,172);
 return {x:px,y:py,width:w,height:w*1.64,angle:clamp(point.twist+Math.atan2(X,depth)*9,-29,29),yaw:clamp(Math.atan2(X,depth)*24,-39,39),depth,opacity:clamp(.45+depth*.55,.50,1),radius:point.radius};
}
export function validateDeck(deck){
 if(!Array.isArray(deck)||deck.length!==78||new Set(deck).size!==78||deck.some(x=>typeof x!=='string'))throw new Error('Exactly 78 unique card identities required');
 return [...deck];
}
export function addChoice(choices,id,orientation,deck){
 validateDeck(deck);
 if(!deck.includes(id))throw new Error('Unknown card');
 if(!['upright','reversed'].includes(orientation))throw new Error('Invalid orientation');
 if(choices.some(p=>p.id===id)||choices.length>=3)return choices;
 return [...choices,{id,orientation}];
}
export function removeChoice(choices,id){return choices.filter(p=>p.id!==id)}
export function assertSelection(choices,deck){
 validateDeck(deck);const ids=choices.map(x=>x.id);
 if(ids.length>3||new Set(ids).size!==ids.length||ids.some(id=>!deck.includes(id)))throw new Error('Invalid three-card selection');
 return true;
}
export function gateStageAfterSelect(selectedCount){return selectedCount>0?'select':'sphere'}
export function entryProgress(ms,reduced=false){
 if(reduced)return 1;
 const t=clamp(ms/2200,0,1);return t*t*(3-2*t);
}
export function entryProjection(projected,progress,viewW,viewH){
 if(!projected)return null;
 const k=clamp(progress,0,1);
 return {...projected,
  x:mix(viewW*.5,projected.x,k),y:mix(viewH*.5,projected.y,k),
  width:mix(projected.width*.17,projected.width,k),
  height:mix(projected.height*.17,projected.height,k),
  opacity:mix(.06,projected.opacity,k)};
}
