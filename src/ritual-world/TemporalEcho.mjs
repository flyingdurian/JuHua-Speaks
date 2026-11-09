/**
 * Gate B Sequence 1 | material-accurate temporal card echoes.
 *
 * Replays the EXISTING 78 card identities at previous physical poses. No
 * additional draw cards, no state mutation, and no fallback to painted ghost
 * textures. All values are pure deterministic functions of simulation age.
 */
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
// Not all cards get trails. Only five recognizable high-speed accents MAY
// exhibit a short ghost, never the entire cyclone. Does not create new cards.
export const ACTIVE_ECHO_CARD_SLOTS=Object.freeze([3,16,31,54,71]);
export const CARD_ECHO_HISTORY=Object.freeze([
 Object.freeze({lag:.125,opacity:.11}),
 Object.freeze({lag:.052,opacity:.19})
]);
export function shouldEchoCard(card,age){
 const slot=card?.orbitSlot;
 return ACTIVE_ECHO_CARD_SLOTS.includes(slot) &&
  age>1.65+ACTIVE_ECHO_CARD_SLOTS.indexOf(slot)*.11 && age<4.94;
}
export function sequenceOneEchoEnvelope(age){
 return smooth((age-1.37)/.38)*(1-smooth((age-5.08)/.32));
}
export function projectedCardSpeed(now,previous,delta,canvasHeight=720){
 const focal=canvasHeight/(2*Math.tan(58*Math.PI/360));
 const project=p=>{
  const depth=-p[2];
  if(depth<=.5||!Number.isFinite(depth))return null;
  return [focal*p[0]/depth,focal*p[1]/depth];
 };
 const a=project(now),b=project(previous);
 if(!a||!b||delta<=0)return 0;
 return Math.hypot(a[0]-b[0],a[1]-b[1])/delta;
}
export function velocityEchoWeight(speed){
 // Each echo has a meaningful minimum physical apparent velocity, then
 // reaches full opacity when sheets clearly accelerate on screen.
 return smooth((speed-18)/130);
}
export function cardEchoOpacity(age,lag,speed){
 const step=CARD_ECHO_HISTORY.find(x=>Math.abs(x.lag-lag)<.00001);
 if(!step||age-lag<1.10)return 0;
 return Math.min(.19,step.opacity*sequenceOneEchoEnvelope(age)*velocityEchoWeight(speed));
}
