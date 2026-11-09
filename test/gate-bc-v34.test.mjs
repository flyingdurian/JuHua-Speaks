import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities} from '../src/ritual-world/OrbitalField.mjs';
import {deckPose} from '../src/ritual-world/ShuffleChoreography.mjs';
import {ART_OVERLAY_STYLES,ART_OVERLAY_LABELS,overlayBackground} from '../preview/post-shuffle/ArtOverlays.mjs';
import {gateBToGateCInstance,HANDOFF_CAMERA_Z,perspectiveFocal,GATE_B_VERTICAL_FOV_DEG} from '../preview/post-shuffle/geometry.mjs';
import {deckInstanceLayout} from '../src/ritual-world/InstancedDeck.mjs';
import {nextArtOverlayStyle,FOIL_FINISHES,cardBrief} from '../preview/post-shuffle/TarotTableau.mjs';
import {HANDOFF_DURATION_MS,HANDOFF_SETTLE_MS,handoffAnchor,handoffFrames} from '../preview/post-shuffle/SelectionHandoff.mjs';

test('v3.4: suspended physical 78-card deck continues slow yaw',()=>{
 const cards=makeLandingCardEntities(DECK,2165840022);
 const a=deckPose(cards[0],24),b=deckPose(cards[0],37);
 assert.ok(Math.hypot(...a.attitude.normal.map((v,i)=>v-b.attitude.normal[i]))>.08);
 assert.ok(Math.hypot(...a.attitude.normal.map((v,i)=>v-b.attitude.normal[i]))<.45);
});
test('v3.4: four literal mystical art overlays, no chromatic hologram categories',()=>{
 assert.deepEqual(ART_OVERLAY_STYLES,[
  'celestial-lattice','constellation-map','alchemical-glyphs','scroll-texture'
 ]);
 assert.deepEqual(FOIL_FINISHES,ART_OVERLAY_STYLES);
 assert.equal(nextArtOverlayStyle('scroll-texture',1),'celestial-lattice');
 assert.equal(nextArtOverlayStyle('celestial-lattice',-1),'scroll-texture');
 for(const style of ART_OVERLAY_STYLES)assert.ok(ART_OVERLAY_LABELS[style]);
 assert.match(cardBrief('major-17'),/Hope/);
});
test('v3.4: selected-card handoff destinations use finite actual projected corners',()=>{
 const card={
  corners:[{x:210,y:180},{x:272,y:180},{x:272,y:286},{x:210,y:286}]
 };
 const from=handoffAnchor(card,{width:1280,height:720});
 assert.equal(from.x,210);assert.equal(from.y,180);
 assert.equal(from.width,62);assert.equal(from.height,106);
 const fallback=handoffAnchor(null,{width:1280,height:720},2);
 assert.ok(fallback.x>0&&fallback.y>0);
 const to={x:460,y:145,width:184,height:322};
 const f=handoffFrames(from,to);
 assert.equal(f.length,4);assert.ok(f.every(frame=>frame.transform.startsWith('translate(')));
 assert.equal(f[0].opacity,1);assert.equal(f.at(-1).opacity,0);
 assert.ok(HANDOFF_DURATION_MS>HANDOFF_SETTLE_MS,'tableau surfaces should appear before travelling ghosts disappear');
});
test('v3.4: no stage blink or second-deck resampling in three-pick transition',async()=>{
 const scene=await readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8');
 const tableau=await readFile(new URL('../preview/post-shuffle/TarotTableau.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/post-shuffle/post-shuffle.css',import.meta.url),'utf8');
 const art=await readFile(new URL('../preview/post-shuffle/ArtOverlays.mjs',import.meta.url),'utf8');
 assert.match(scene,/pickAnchors\.set\(candidate\.id/);
 assert.match(scene,/createSelectionHandoff\(\{world,picks:choices/);
 assert.match(scene,/tableau\.prepareHandoff\(\)/);
 assert.match(scene,/tableau\?\.finishHandoff\(\)/);
 assert.match(scene,/performance\.now\(\)-lockAt>=HANDOFF_SETTLE_MS/);
 assert.match(tableau,/prepareHandoff\(\)/);assert.match(tableau,/finishHandoff\(\)/);
 assert.match(css,/\.ps-tableau\.ps-handoff-prepared/);
 assert.match(css,/\.ps-handoff-card/);
 assert.match(css,/\.ps-vapor-cloud\.ps-vapor-near\{opacity:\.71/);
 assert.match(css,/\.ps-overlay-celestial-lattice/);
 assert.match(css,/\.ps-overlay-scroll-texture/);
 assert.match(art,/clearRect\(0,0,width,height\)/);
 assert.doesNotMatch(tableau,/ps-card-hologram ps-card-foil/);
 assert.match(tableau,/assets\/rws\//);
});

test('BC fix: 78 exact suspended-card projections remain pixel-aligned across the camera handoff',()=>{
 const cards=makeLandingCardEntities(DECK,2165840022);
 const instances=deckInstanceLayout(cards,49,1);
 assert.equal(instances.length,78);
 const viewport={w:1280,h:720};
 const sourceFocal=perspectiveFocal(GATE_B_VERTICAL_FOV_DEG)*viewport.h/2;
 const destFocal=perspectiveFocal()*viewport.h/2;
 for(const raw of instances){
  const converted=gateBToGateCInstance(raw);
  const depth=HANDOFF_CAMERA_Z-converted.position[2];
  assert.ok(depth>0);
  const expectedX=viewport.w/2+sourceFocal*raw.position[0]/(-raw.position[2]);
  const expectedY=viewport.h/2-sourceFocal*raw.position[1]/(-raw.position[2]);
  const receivedX=viewport.w/2+destFocal*converted.position[0]/depth;
  const receivedY=viewport.h/2-destFocal*converted.position[1]/depth;
  assert.ok(Math.abs(expectedX-receivedX)<1e-8,'same screen X');
  assert.ok(Math.abs(expectedY-receivedY)<1e-8,'same screen Y');
  // Source and destination must agree at *all four projected corners*
  // even when the physically tilted cardstock crosses multiple depths.
  for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
   const original=raw.position.map((v,j)=>v+sx*.64*raw.scale*raw.right[j]+sy*1.06*raw.scale*raw.up[j]);
   const mapped=converted.position.map((v,j)=>v+sx*converted.halfWidth*converted.right[j]+sy*converted.halfHeight*converted.up[j]);
   const zOriginal=-original[2],zMapped=HANDOFF_CAMERA_Z-mapped[2];
   assert.ok(Math.abs((sourceFocal*original[0]/zOriginal)-(destFocal*mapped[0]/zMapped))<1e-8,'card corner X');
   assert.ok(Math.abs((sourceFocal*original[1]/zOriginal)-(destFocal*mapped[1]/zMapped))<1e-8,'card corner Y');
  }
 }
 assert.throws(()=>gateBToGateCInstance({}),/handoff/);
});
test('BC fix: all four overlay options always have a visible asset or fallback',async()=>{
 const css=await readFile(new URL('../preview/post-shuffle/post-shuffle.css',import.meta.url),'utf8');
 const tableau=await readFile(new URL('../preview/post-shuffle/TarotTableau.mjs',import.meta.url),'utf8');
 const engine=await readFile(new URL('../preview/post-shuffle/ArtOverlays.mjs',import.meta.url),'utf8');
 for(const style of ART_OVERLAY_STYLES){
  const background=overlayBackground({},style);
  assert.ok(background.length>50,'CSS must contain a nonempty visible fallback for '+style);
  assert.match(background,/gradient/);
  assert.equal(overlayBackground({[style]:'data:image/png;base64,XYZ'},style),'url("data:image/png;base64,XYZ")');
 }
 assert.match(css,/\.ps-card-front \.ps-card-art-overlay\{/);
 assert.match(css,/mix-blend-mode:normal!important/);
 assert.match(tableau,/layer\.dataset\.overlayStyle=activeStyle/);
 assert.match(tableau,/foilLayer\.dataset\.overlayStyle=activeStyle/);
 assert.match(tableau,/overlayBackground\(overlayTiles,activeStyle\)/);
 assert.match(engine,/if\(!ctx\)throw new Error\('Canvas 2D unavailable'\)/);
});
test('BC fix: Finish Shuffling transfers the live renderer snapshot, not a second synthetic deck',async()=>{
 const gate=await readFile(new URL('../preview/gate-b/gate-b.mjs',import.meta.url),'utf8');
 const post=await readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8');
 assert.match(gate,/deckInstanceLayout\(world\.cards,elapsed,eased\)/);
 assert.match(gate,/mountPostShuffle\(\{/);
 assert.match(gate,/deckIds:selectionOrder,handoffDeck/);
 assert.match(post,/sourceDeck=new Map\(handoffDeck\.map/);
 assert.match(post,/gateBToGateCInstance\(c\)/);
 assert.match(post,/sourceDeck\?\.get\(id\)/);
 assert.match(post,/const emerge=smooth\(\(t-\.18\)\/1\.35\)/);
});
