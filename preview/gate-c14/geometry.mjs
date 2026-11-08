/** Gate C 01–04 immutable 78-card geometry and selection contract. */
const TAU=Math.PI*2;
export const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export function sphereLayout(n=78){
 if(n!==78)throw new Error('Exactly 78 cards required');
 return Array.from({length:n},(_,i)=>{const lat=Math.asin(1-2*(i+.5)/n),lon=(i*2.399963229728653)%TAU;return {lat,lon,vector:[Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat)]}});
}
export function projectCard(point,yawDeg,pitchDeg,width,height){
 if(width<=0||height<=0)return null;const [x,y,z]=point.vector,ry=yawDeg*Math.PI/180,rx=pitchDeg*Math.PI/180;
 const X=x*Math.cos(ry)+z*Math.sin(ry),Z=-x*Math.sin(ry)+z*Math.cos(ry),Y=y*Math.cos(rx)-Z*Math.sin(rx),D=y*Math.sin(rx)+Z*Math.cos(rx);
 if(D>=-.17)return null;const f=height*.36,px=width*.5+f*X/-D,py=height*.48-f*Y/-D;
 if(px<-210||px>width+210||py<-300||py>height+300)return null;
 const w=clamp(.97*f/(-D*6.25),42,108);
 return {x:px,y:py,w,h:w*1.643,angle:clamp(Math.atan2(X,-D)*180/Math.PI*.26,-24,24),alpha:clamp(.52+.48*(-D),.52,1),depth:-D};
}
export function validateDeck(deck){if(!Array.isArray(deck)||deck.length!==78||new Set(deck).size!==78||deck.some(x=>typeof x!=='string'))throw Error('Exactly 78 unique IDs required');return [...deck]}
export function addChoice(choices,id,orientation,deck){
 validateDeck(deck);if(!deck.includes(id))throw Error('Unknown card');if(!['upright','reversed'].includes(orientation))throw Error('Invalid orientation');
 if(choices.length>=3||choices.some(x=>x.id===id))return choices;return [...choices,{id,orientation}];
}
export function removeChoice(choices,id){return choices.filter(x=>x.id!==id)}
export function assertSelection(choices,deck){const ids=choices.map(x=>x.id);if(ids.length>3||new Set(ids).size!==ids.length||ids.some(x=>!deck.includes(x)))throw Error('Invalid selection');return true}
