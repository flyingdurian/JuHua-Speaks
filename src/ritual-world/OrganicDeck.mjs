/**
 * Canonical organic 78-sheet card stock.
 * Every condensed state (first compact deck, three piles, consolidation,
 * suspended deck and post-Finish launch) uses this one coordinate contract.
 * Individual sheets retain microscopic positive air gaps; macro packet slits
 * are expressly forbidden. The final side silhouette is cohesive cardstock.
 */
export const ORGANIC_STEP=.0108;
export const ORGANIC_THICKNESS=.0092;
export const ORGANIC_GAP=ORGANIC_STEP-ORGANIC_THICKNESS;
// A submillimeter-in-scene tonal break; formerly .023 (= visible concrete slabs).
export const PACKET_SEAM_EXTRA=.0007;
export const DEFAULT_PACKET_COUNT=7;
const fract=x=>x-Math.floor(x);
const hash=n=>fract(Math.sin(n*127.1+19.7)*43758.5453);
export function packetCount(count=78){
 if(!Number.isInteger(count)||count<1)throw new RangeError('Invalid count of physical sheets');
 return count>=65?7:count>=20?6:Math.max(1,Math.min(6,Math.ceil(count/4)));
}
export function packetOf(rank,count=78){
 if(!Number.isInteger(rank)||rank<0||rank>=count)throw new RangeError('Invalid packet sheet rank');
 const groups=packetCount(count);
 return Math.min(groups-1,Math.floor(rank*groups/count));
}
export function organicSheetOffset(rank,{count=78,group=0}={}){
 if(!Number.isInteger(rank)||rank<0||!Number.isInteger(count)||count<1||rank>=count||!Number.isInteger(group))
  throw new RangeError('Invalid shuffle XYZ geometry: organic sheet address');
 const packet=packetOf(rank,count),groups=packetCount(count);
 const cluster=Math.floor(rank/5);
 // Cluster and packet displacements are lateral only; they cannot flatten
 // cardstock, cross neighbouring normal-depth layers or cause z-fighting.
 const packetX=(hash(packet+group*107)-.5)*.032;
 const packetY=(hash(packet+group*71)-.5)*.028;
 const staggerX=(hash(cluster+group*107)-.5)*.011+(hash(rank+group*199)-.5)*.004;
 const staggerY=(hash(cluster+group*71)-.5)*.010+(hash(rank+group*307)-.5)*.004;
 const bow=.015*Math.sin(Math.PI*(rank+.5)/count);
 // Keep micro-layer spacing positive with only a near-invisible depth shift.
 // Never introduce an independently visible space between groups of sheets.
 const depth=(rank-(count-1)/2)*ORGANIC_STEP+
  (packet-(groups-1)/2)*PACKET_SEAM_EXTRA;
 return {x:packetX+staggerX,y:packetY+staggerY+bow,depth,packet,cluster};
}
export function positionOrganicSheet(center,basis,rank,opts={}){
 const o=organicSheetOffset(rank,opts);
 return center.map((v,i)=>v+basis.normal[i]*o.depth+basis.right[i]*o.x+basis.up[i]*o.y);
}
