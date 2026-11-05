/** Gate A: randomized but reproducible *visual* orbit. Never used to determine Tarot draws. */
const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const clamp = (n,a=0,b=1) => Math.max(a,Math.min(b,n));
const smooth = x => {x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,t)=>a+(b-a)*t;
export const ENTRANCE_SECONDS=2.65;
export const ORBIT_SPEED=0.016;
export const ORBIT_CARD_COUNT=78;
/** Hash/PRNG serves appearance only. Drawing shuffles remain independent and secure. */
export function rand01(seed,tag){
 let x=(seed^Math.imul((tag+1)>>>0,0x9e3779b9))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return (x>>>0)/4294967296;
}
export function createVisualSeed(cryptoSource=globalThis.crypto){
 if(cryptoSource?.getRandomValues){const a=new Uint32Array(1);cryptoSource.getRandomValues(a);return a[0];}
 return Math.floor(Math.random()*4294967296)>>>0;
}
function randomizedSlots(seed){
 const slots=Array.from({length:ORBIT_CARD_COUNT},(_,i)=>i);
 for(let i=slots.length-1;i>0;i--){const j=Math.floor(rand01(seed,999+i)* (i+1));[slots[i],slots[j]]=[slots[j],slots[i]];}
 return slots;
}
export function makeLandingCardEntities(deck,seed=2026){
 if(!Array.isArray(deck)||deck.length!==ORBIT_CARD_COUNT||new Set(deck.map(c=>c.id)).size!==ORBIT_CARD_COUNT)
  throw Error('Exactly 78 unique Tarot cards required');
 const slots=randomizedSlots(seed>>>0);
 const accents=Array.from({length:ORBIT_CARD_COUNT},(_,i)=>i).sort((a,b)=>rand01(seed,a+909)-rand01(seed,b+909)).slice(0,5);
 return deck.map((card,i)=>Object.freeze({
  id:card.id,index:i,name:card.name,orbitSlot:slots[i],
  phase:rand01(seed,i+1)*TAU,tilt:(rand01(seed,i+120)-.5)*.34,
  reversed:rand01(seed,i+230)<.27,frontVisible:true,
  width:1.06+rand01(seed,i+335)*.24,height:1.89+rand01(seed,i+435)*.34,
  roll:(rand01(seed,i+540)-.5)*.22,
  light:.8+rand01(seed,i+640)*.19,
  layer:accents.includes(i)?'near':i%3===0?'mid':'far',
  passIndex:accents.indexOf(i),
  jitter:(rand01(seed,i+740)-.5)*.105,
  spawnIndex:slots[i],seed:seed>>>0
 }));
}
export function sphericalPose(card,seconds){
 const slot=card.orbitSlot,v=1-2*(slot+.5)/ORBIT_CARD_COUNT;
 const radial=Math.sqrt(Math.max(0,1-v*v));
 const theta=slot*GOLDEN+card.phase*.40 + (seconds*ORBIT_SPEED);
 const spatial=1+(card.jitter||0);
 // Single slowly rotating, widely spaced ellipsoid, not concentric card-wall lanes.
 let x=Math.cos(theta)*radial*44*spatial;
 let y=v*29+Math.sin(theta*2+card.phase)*1.4;
 let z=-48+Math.sin(theta)*radial*21*spatial;
 // Five seeded close passes, arranged well away from the text box.
 if(card.passIndex>=0){
  const period=53,at=(seconds - 1.8 - card.passIndex*10.1 +period*8)%period;
  if(at>0&&at<9.7){
   const strength=Math.pow(Math.sin(Math.PI*at/9.7),2)*.97;
   const side=card.passIndex%2===0?-1:1;
   const edgeX=side*(6.0+Math.sin(at/9.7*Math.PI)*.9);
   const edgeY=(card.passIndex%3-1)*1.8+Math.sin(at*.4)*.9;
   x=mix(x,edgeX,strength);
   y=mix(y,edgeY,strength);
   z=mix(z,-5.5,strength);
  }
 }
 return [x,y,z];
}
export function sampleLandingPose(card,seconds){
 const t=Math.max(0,Number(seconds)||0);
 const finish=sphericalPose(card,t);
 const delay=card.spawnIndex*.0105;
 const progress=smooth((t-delay)/ (ENTRANCE_SECONDS-delay*.32));
 if(progress>=1)return finish;
 // Cards appear to be expelled from the camera, then form their single celestial shell.
 const startTheta=card.phase+(card.spawnIndex%7)*.32;
 const start=[Math.cos(startTheta)*(.35+card.spawnIndex*.006),Math.sin(startTheta)*(.24+card.spawnIndex*.004),-1.65-card.spawnIndex*.018];
 return [mix(start[0],finish[0],progress),mix(start[1],finish[1],progress),mix(start[2],finish[2],progress)];
}
export function landingOpacity(card,seconds){
 const delay=card.spawnIndex*.0105;
 return smooth(((Number(seconds)||0)-delay)*2.35)*.99;
}
export function orbitDiagnostics(cards,seconds){
 const positions=cards.map(c=>sampleLandingPose(c,seconds));
 const closest=Math.max(...positions.map(p=>p[2]));
 return {count:cards.length,closest,frontFacing:cards.filter(c=>c.frontVisible).length,
  reversed:cards.filter(c=>c.reversed).length,
  farCount:positions.filter(p=>p[2]<-22).length};
}
