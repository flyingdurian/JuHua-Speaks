/** Post-shuffle sphere: deterministic card identities + continuous camera flight.
 * Times measured from clicking FINISH SHUFFLING, in seconds.
 */
export const CARD_COUNT=78;
export const BEATS=Object.freeze({launch:[0,1.2],scatter:[1.2,2.8],orbit:[2.8,4.3],camera:[2.55,6.75],interactive:6.9});
export const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const smooth=n=>{const x=clamp(n);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
const fract=n=>n-Math.floor(n);
export const hash=n=>fract(Math.sin(n*127.1+23.17)*43758.5453);
export function sphereLayout(count=78){
 if(count!==CARD_COUNT)throw new Error('78 unique tarot cards are mandatory');
 return Array.from({length:count},(_,i)=>{
  const row=Math.floor(i/13),col=i%13;
  const lat=(-66+row*26.4+(hash(i+21)-.5)*6)*Math.PI/180;
  const lon=(col+(row%2)*.5+(hash(i+111)-.5)*.34)*Math.PI*2/13;
  const radius=5.75+(hash(i+303)-.5)*.43;
  return {i,row,col,radius,roll:(hash(i+404)-.5)*.28,direction:[Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon)]};
 });
}
export function cameraDistance(time){
 // Independent measured beats: the globe swells into the frame BEFORE
 // the camera crosses the shell, rather than remaining a distant dot.
 if(time<=2.55)return 12.6;
 if(time<4.65)return 12.6-(12.6-5.8)*smooth((time-2.55)/2.10);
 return 5.8*(1-smooth((time-4.65)/2.05));
}
export function orbitAngle(time){
 const t=Math.max(0,time);if(t<1.2)return t*.4;
 if(t<=4.1)return .48+4.7*(t-1.2);
 const fade=Math.min(t-4.1,2.8);
 const angle=.48+4.7*2.9+4.7*fade+(0.065-4.7)*(fade*fade)/(2*2.8);
 return angle+Math.max(0,t-6.9)*.065;
}
export function assemblyProgress(time){return smooth((time-1.05)/2.05);}
export function cardWorld(point,time,selected=false){
 const t=Math.max(0,time),s=assemblyProgress(t),d=point.direction;
 const centerZ=t<.75?mix(1.0,0,smooth(t/.75)):0;
 const stack=[(point.i%3-1)*.008,(point.i%5-2)*.008,centerZ+(point.i-39)*.0017];
 const wobble=Math.sin(s*Math.PI)*.36;
 const extent=point.radius*(selected?.83:1);
 return [mix(stack[0],d[0]*extent,s)+wobble*Math.sin(point.i*.73),mix(stack[1],d[1]*extent,s)+wobble*Math.cos(point.i*.91),mix(stack[2],d[2]*extent,s)];
}
export function selectCard(choices,deck,id,orientation='upright'){
 if(!Array.isArray(deck)||deck.length!==78||new Set(deck).size!==78)throw Error('Requires one unique 78-card deck');
 if(!deck.includes(id))throw Error('Unknown card');
 if(!['upright','reversed'].includes(orientation))throw Error('Unknown orientation');
 if(choices.some(c=>c.id===id))return choices.filter(c=>c.id!==id);
 if(choices.length===3)return choices;
 return [...choices,{id,orientation}];
}
export function getStage(time,selectedCount){return time<1.05?'launch':time<3.1?'distribute':time<6.9?'enter':selectedCount>0?'select':'inside'};

/** Screen-space hit test against projected 3D card corners (not a box approximation). */
export function pointInQuad(point,corners){
 const [x,y]=point;
 const inside=(a,b,c)=>{
  const cross=(p,q)=>p[0]*q[1]-p[1]*q[0];
  const v0=[c.x-a.x,c.y-a.y],v1=[b.x-a.x,b.y-a.y],v2=[x-a.x,y-a.y];
  const den=cross(v0,v1);if(Math.abs(den)<1e-9)return false;
  const u=cross(v2,v1)/den,v=cross(v0,v2)/den;
  return u>=-1e-6&&v>=-1e-6&&u+v<=1+1e-6;
 };
 return inside(corners[0],corners[1],corners[2])||inside(corners[0],corners[2],corners[3]);
}
