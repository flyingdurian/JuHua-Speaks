import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FOIL_FINISHES,HOLOGRAM_STYLES,nextArtOverlayStyle,chooseFoilFinish} from '../preview/post-shuffle/TarotTableau.mjs';
import {ART_OVERLAY_STYLES,paintArtOverlay} from '../preview/post-shuffle/ArtOverlays.mjs';
import {sampleVapor} from '../preview/post-shuffle/CardVapor.mjs';

test('four switchable engraved art overlays; deterministic wrap in both directions',()=>{
 assert.deepEqual(HOLOGRAM_STYLES,['celestial-lattice','constellation-map','alchemical-glyphs','scroll-texture']);
 assert.equal(FOIL_FINISHES,HOLOGRAM_STYLES);
 assert.equal(FOIL_FINISHES,ART_OVERLAY_STYLES);
 assert.equal(chooseFoilFinish(()=>0),'celestial-lattice');
 assert.equal(chooseFoilFinish(()=>3),'scroll-texture');
 assert.equal(nextArtOverlayStyle('celestial-lattice',1),'constellation-map');
 assert.equal(nextArtOverlayStyle('scroll-texture',1),'celestial-lattice');
 assert.equal(nextArtOverlayStyle('celestial-lattice',-1),'scroll-texture');
 assert.throws(()=>nextArtOverlayStyle('foil'),/Invalid/);
});
test('reveal no longer renders a detached white flap; artwork is always original RWS',async()=>{
 const css=await readFile(new URL('../preview/post-shuffle/post-shuffle.css',import.meta.url),'utf8');
 const scene=await readFile(new URL('../preview/post-shuffle/TarotTableau.mjs',import.meta.url),'utf8');
 assert.match(css,/\.ps-flip-inner::before\{content:none!important;display:none!important\}/);
 assert.match(css,/\.ps-card-back\{transform:translateZ\(\.65px\)!important\}/);
 assert.match(css,/\.ps-card-front\{transform:rotateY\(180deg\) translateZ\(\.65px\)!important\}/);
 assert.match(scene,/assets\/rws\//);
 assert.match(scene,/commonsThumbnailUrl/);
 assert.match(scene,/ps-overlay-controls/);
 assert.match(scene,/setArtOverlayStyle/);
 assert.match(scene,/aria-live/);
 assert.match(scene,/ps-card-art-overlay/);
 for(const style of ART_OVERLAY_STYLES)assert.ok(css.includes('.ps-overlay-'+style+' .ps-card-art-overlay'));
});
test('card-back ethereal veil uses bounded translucent curl-advection only',async()=>{
 const css=await readFile(new URL('../preview/post-shuffle/post-shuffle.css',import.meta.url),'utf8');
 const vapor=await readFile(new URL('../preview/post-shuffle/CardVapor.mjs',import.meta.url),'utf8');
 assert.match(css,/\.ps-card-back::after\{content:none!important;display:none!important\}/);
 assert.match(css,/\.ps-vapor-cloud\.ps-vapor-near\{opacity:\.71/);
 assert.match(vapor,/const eddy=/);
 for(const t of [0,1.3,7.8,36.5]){
  for(const layer of [0,1]){
   const q=sampleVapor(.35,.57,t,layer);
   assert.ok(Number.isFinite(q)&&q>=0&&q<=.68);
  }
 }
});

test('four original-art preservation overlays are alpha-only canvas tiles',async()=>{
 const art=await readFile(new URL('../preview/post-shuffle/ArtOverlays.mjs',import.meta.url),'utf8');
 const scene=await readFile(new URL('../preview/post-shuffle/TarotTableau.mjs',import.meta.url),'utf8');
 assert.equal(ART_OVERLAY_STYLES.length,4);
 assert.match(art,/clearRect\(0,0,width,height\)/);
 assert.match(art,/paintArtOverlay\(ctx,style\)/);
 assert.match(art,/if\(!ctx\)throw new Error\('Canvas 2D unavailable'\)/);
 assert.match(scene,/face\.append\(image,foilLayer,artifactNote\)/);
 assert.doesNotMatch(scene,/ps-card-hologram ps-card-foil/);
 assert.ok(typeof paintArtOverlay==='function');
});
