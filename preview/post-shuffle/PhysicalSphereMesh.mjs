/**
 * WebGL2 3D tarot sheets in the interior universe, not flat billboards.
 * Each card includes a true front, true back and four chamfer-like paper
 * edges; geometry clips correctly during camera fly-through.
 * Format per vertex: xyz,uv,atlasSlot,faceSide,selectAmount,opacity.
 */
import {clipCardNearPlane} from './geometry.mjs';
export const SPHERE_SHEET_THICKNESS=.046;
export const SPHERE_VERTEX_STRIDE=9;
const norm=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l)};
export function extrudedCardVertices({corners,normal,cameraZ,slot,selected=0,alpha=1,thickness=SPHERE_SHEET_THICKNESS}={}){
 if(!Array.isArray(corners)||corners.length!==4||corners.some(x=>!Array.isArray(x)||x.length!==3))
  throw new RangeError('Card needs four XYZ corners');
 if(!Array.isArray(normal)||normal.length!==3||!(thickness>0)||!Number.isFinite(cameraZ))
  throw new RangeError('Invalid physical card basis');
 const n=norm(normal),verts=[];
 const shifted=sign=>corners.map(c=>c.map((v,i)=>v+n[i]*sign*thickness*.5));
 const push=(v,side,atlas=slot)=>{
  const p=v.position;verts.push(p[0],p[1],p[2]-cameraZ,v.uv[0],v.uv[1],atlas,side,selected,alpha);
 };
 const face=(sign,side)=>{
  const polygon=clipCardNearPlane(shifted(sign),cameraZ);
  for(let i=1;i<polygon.length-1;i++){
   push(polygon[0],side);push(polygon[i],side);push(polygon[i+1],side);
  }
 };
 face(-1,0);face(1,1);
 const outer=shifted(1),inner=shifted(-1);
 const uvs=[[0,0],[1,0],[1,1],[0,1]];
 for(let i=0;i<4;i++){
  const j=(i+1)%4;
  const quad=[outer[i],inner[i],inner[j],outer[j]];
  const mapping=[[0,0],[0,1],[1,1],[1,0]];
  const poly=clipPolygon(quad,mapping,cameraZ);
  for(let k=1;k<poly.length-1;k++){
   // Negative slot paints pearl-ink paper edges, never a front illustration.
   push(poly[0],0,-1);push(poly[k],0,-1);push(poly[k+1],0,-1);
  }
 }
 return verts;
}
function clipPolygon(corners,uvs,cameraZ,near=.075){
 const vertices=corners.map((position,i)=>({position,uv:uvs[i]}));
 const result=[];let prev=vertices.at(-1);
 for(const v of vertices){
  const pz=cameraZ-prev.position[2],z=cameraZ-v.position[2];
  const a=pz>=near,b=z>=near;
  if(a!==b){
   const f=(near-pz)/(z-pz);
   result.push({
    position:prev.position.map((p,j)=>p+(v.position[j]-p)*f),
    uv:prev.uv.map((p,j)=>p+(v.uv[j]-p)*f)
   });
  }
  if(b)result.push(v);
  prev=v;
 }
 return result;
}
