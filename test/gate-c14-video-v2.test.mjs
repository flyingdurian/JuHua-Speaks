import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sphereLayout,projectCard,entryProgress,entryProjection} from '../preview/gate-c14/geometry.mjs';

test('inside camera is varied three-dimensional 78-card space, never a 2D grid',()=>{
 const points=sphereLayout();
 assert.equal(points.length,78);assert.equal(new Set(points.map(x=>x.vector.map(n=>n.toFixed(6)).join(','))).size,78);
 assert.ok(new Set(points.map(x=>x.radius.toFixed(2))).size>30);
 assert.ok(new Set(points.map(x=>x.twist.toFixed(2))).size>30);
 const visible=points.map(x=>projectCard(x,-14,-9,1440,900)).filter(Boolean);
 assert.ok(visible.length>=12,'viewer should see many cards without a wall of them');
 assert.ok(new Set(visible.map(x=>Math.round(x.width/10))).size>=5,'card depths must produce several on-screen sizes');
 for(const p of visible)assert.ok(['x','y','width','height','angle','yaw','opacity','depth'].every(k=>Number.isFinite(p[k])));
});
test('entry expands from a compact world to the stable interior without changing identities',()=>{
 assert.equal(entryProgress(-50),0);assert.equal(entryProgress(0),0);
 assert.equal(entryProgress(2200),1);assert.equal(entryProgress(10000),1);
 assert.equal(entryProgress(500,true),1);
 const p=sphereLayout().map(x=>projectCard(x,0,0,1440,900)).find(Boolean);
 const tiny=entryProjection(p,0,1440,900),full=entryProjection(p,1,1440,900);
 assert.equal(tiny.x,720);assert.equal(tiny.y,450);
 assert.ok(tiny.width<full.width/4);assert.equal(full.width,p.width);
 assert.equal(full.opacity,p.opacity);
});
test('reference-aligned black stars and selected world cards survive same scene 03→04',async()=>{
 const app=await readFile(new URL('../preview/gate-c14/gate-c14.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/gate-c14/gate-c14.css',import.meta.url),'utf8');
 assert.match(app,/initCelestialSky/);
 assert.match(app,/entryProjection/);
 assert.match(app,/\.classList\.toggle\('is-chosen'/);
 assert.match(app,/function choose\(id\)/);
 assert.match(app,/if\(choices\.some\(x=>x\.id===id\)\)\{undo\(id\);return;/);
 assert.doesNotMatch(app,/if\(selected\.has\(id\)\)\{b\.hidden=true/);
 assert.match(css,/\.deep-sky\{/);
 assert.match(css,/\.scene-sphere\{background:#010103/);
 assert.match(css,/\.scene-sphere \.orbit-card\.is-chosen/);
 assert.match(css,/\.scene-sphere \.focus,.scene-sphere \.focus\.active\{display:none/);
});
