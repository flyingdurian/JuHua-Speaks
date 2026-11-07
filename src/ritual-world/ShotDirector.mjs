/**
 * Sequence 1 visual direction.
 *
 * Roles remain stable for each real 78-card identity, with time-local hero
 * moments. Density is organised into temporary overlapping card currents,
 * rather than evenly distributed orbital beads. Pure/deterministic: this
 * never creates or removes a Tarot card, or touches approved Sequence 2.
 */
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const TAU=2*Math.PI;
export const HERO_SLOTS=Object.freeze([3,11,19,28,36,45,53,62,70,75]);
export const SUPPORT_SLOTS=Object.freeze([7,16,25,33,41,49,58,66,73]);
export const HERO_TRAIL_SLOTS=Object.freeze([3,11,19,28,36,45,53,62,70,75]);
export const STAGE_ONE_LIMITS=Object.freeze({maxHeroCards:10,maxMotionTrails:10,maxConcurrentHeroEchoes:5});
export function cardRole(k){
 if(HERO_SLOTS.includes(k))return 'hero';
 if(SUPPORT_SLOTS.includes(k))return 'support';
 return 'background';
}
export function cardPacket(k){
 const lane=k<40?0:k<64?1:2;
 const offset=lane===0?0:lane===1?40:64;
 const count=[40,24,14][lane],packets=[4,3,2][lane];
 const local=(k-offset+.5)/count;
 const packet=Math.min(packets-1,Math.floor(local*packets));
 const inside=local*packets-packet;
 return {lane,packet,packets,inside,local};
}
export function stagedOrbitFraction(k,seed,t){
 const p=cardPacket(k);
 // Stable current packets with breathable dark gaps between each packet.
 // The packet density relaxes slightly as the vortex accelerates, but never
 // returns to equally spaced concentric circles.
 const widen=smooth((t-2.7)/1.15);
 const width=(.14+.035*widen);
 const center=(p.packet+.5)/p.packets;
 const q=center+(p.inside-.5)*width+
  .005*Math.sin(k*1.613+seed*.000011+t*.48);
 return clamp(q,.005,.995);
}
export function heroAccent(k,t){
 if(cardRole(k)!=='hero')return 0;
 const ix=HERO_SLOTS.indexOf(k);
 // Brief overlapping hero cues, staggered along the temporal eye path.
 const center=2.36+(.22*(ix%5))+(.74*Math.floor(ix/5));
 const dist=(t-center)/.66;
 return Math.exp(-3.4*dist*dist)*smooth((t-1.42)/.44)*(1-smooth((t-4.94)/.39));
}
export function heroEchoStrength(k,t){
 if(cardRole(k)!=='hero')return 0;
 const strength=heroAccent(k,t);
 if(strength<.18)return 0;
 // Never more than five simultaneous hero afterimage events.
 const stronger=HERO_SLOTS.filter(i=>heroAccent(i,t)>strength+1e-9).length;
 return stronger<STAGE_ONE_LIMITS.maxConcurrentHeroEchoes?strength:0;
}
export function trailStrength(k,t){
 if(!HERO_TRAIL_SLOTS.includes(k))return 0;
 // A tail is a single exceptional *event*, not an always-on ornament.
 return heroEchoStrength(k,t)*(.70+.25*Math.sin(k*.711)**2);
}
export function localCurrentBias(k,t){
 const p=cardPacket(k);
 const trigger=3.36+.13*p.lane+.16*(p.packet%3);
 const pull=smooth((t-trigger)/.95);
 return {radius:1-.10*pull,depth:-1.35*pull,
  phaseOffset:.045*Math.sin(t*1.7+p.packet*1.9+p.lane*.73)};
}
