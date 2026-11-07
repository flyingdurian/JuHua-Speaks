/**
 * Gate B Sequence 1 | material-accurate temporal card echoes.
 *
 * Replays the EXISTING 78 card identities at previous physical poses. No
 * additional draw cards, no state mutation, and no fallback to painted ghost
 * textures. All values are pure deterministic functions of simulation age.
 */
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
export const CARD_ECHO_HISTORY=Object.freeze([
 Object.freeze({lag:.19,opacity:.13}),
 Object.freeze({lag:.115,opacity:.23}),
 Object.freeze({lag:.054,opacity:.34})
]);
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
 return step.opacity*sequenceOneEchoEnvelope(age)*velocityEchoWeight(speed);
}
