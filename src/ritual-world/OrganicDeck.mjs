/**
 * Canonical organic physical sheet layout, shared by the pre-sphere deck,
 * three-pile shuffle, consolidation and suspended GPU-instanced deck.
 * All offsets are planar: the normal-axis gap stays positive for every sheet.
 */
export const ORGANIC_STEP=.0170;
export const ORGANIC_THICKNESS=.0092;
export const ORGANIC_GAP=ORGANIC_STEP-ORGANIC_THICKNESS;
const fract=x=>x-Math.floor(x);
const hash=n=>fract(Math.sin(n*127.1+19.7)*43758.5453);
export function organicSheetOffset(rank,{count=78,group=0}={}){
 if(!Number.isInteger(rank)||rank<0||!Number.isInteger(count)||count<1||rank>=count||!Number.isInteger(group))
  throw new RangeError('Invalid shuffle XYZ geometry: organic sheet address');
 const cluster=Math.floor(rank/5);
 const staggerX=(hash(cluster+group*107)-.5)*.029+(hash(rank+group*199)-.5)*.009;
 const staggerY=(hash(cluster+group*71)-.5)*.023+(hash(rank+group*307)-.5)*.008;
 const bow=.016*Math.sin(Math.PI*(rank+.5)/count);
 return {x:staggerX,y:staggerY+bow,depth:(rank-(count-1)/2)*ORGANIC_STEP,cluster};
}
export function positionOrganicSheet(center,basis,rank,opts={}){
 const o=organicSheetOffset(rank,opts);
 return center.map((v,i)=>v+basis.normal[i]*o.depth+basis.right[i]*o.x+basis.up[i]*o.y);
}
