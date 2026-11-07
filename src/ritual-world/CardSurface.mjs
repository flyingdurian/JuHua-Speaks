/** Gate A v4: thin 3D stone/paper card with true rounded silhouette, subtle bevel and separate historical face/back materials. */
export const EDGE_THICKNESS=.011;
export const CORNER_SEGMENTS=5;
const points=[];
for(const [cx,cy,start,end] of [[.855,.855,Math.PI/2,0],[.855,-.855,0,-Math.PI/2],[-.855,-.855,-Math.PI/2,-Math.PI],[-.855,.855,Math.PI,Math.PI/2]]){
 for(let i=0;i<=CORNER_SEGMENTS;i++){const a=start+(end-start)*i/CORNER_SEGMENTS;points.push([cx+Math.cos(a)*.145,cy+Math.sin(a)*.145])}
}
export const CARD_PERIMETER=Object.freeze(points.map(p=>Object.freeze(p)));
export function appendPremiumCard(out,card,position,attitude,scale,brightness,slotUv,{backSlot=78,edgeSlot=79}={}){
 const {right,up,normal}=attitude,W=card.width*.5*scale,H=card.height*.5*scale,dep=card.thickness ?? (EDGE_THICKNESS*card.width);
 const point=(u,v,z,shrink=1)=>({pos:[0,1,2].map(i=>position[i]+right[i]*u*W*shrink+up[i]*v*H*shrink+normal[i]*z*dep),u:(u+1)/2,v:(1-v)/2});
 function tri(a,b,c,slot,light){for(const v of [a,b,c]){const tex=slotUv(slot,v.u,v.v);out.push(...v.pos,tex[0],tex[1],light)}}
 const cf=point(0,0,1),cb=point(0,0,-1),n=CARD_PERIMETER.length;
 for(let j=0;j<n;j++){
  const [u,v]=CARD_PERIMETER[j],[u2,v2]=CARD_PERIMETER[(j+1)%n];
  const fi=point(u,v,.96,.982),fn=point(u2,v2,.96,.982);
  const bi=point(u,v,-.96,.982),bn=point(u2,v2,-.96,.982);
  const o=point(u,v,0),on=point(u2,v2,0);
  tri(cf,fi,fn,card.index,brightness);
  tri(cb,bn,bi,backSlot,brightness*.86);
  tri(fi,o,on,edgeSlot,brightness*.79);tri(fi,on,fn,edgeSlot,brightness*.79);
  tri(o,bi,bn,edgeSlot,brightness*.61);tri(o,bn,on,edgeSlot,brightness*.61);
  tri(fi,bi,o,edgeSlot,brightness*.74);tri(fn,on,bn,edgeSlot,brightness*.74);
 }
}