import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {APP_VERSION} from '../src/version.mjs';
import {sphereLayout,SPHERE_RADIUS,CARD_WIDTH,CARD_HEIGHT,projectPoint,pickSphereCard,rotatePoint,cardAxes} from '../src/webgl-sphere.mjs';
import {clampReveal,progressFromCardDrag,progressFromPinch,nextRevealProgress,allCardsRevealed} from '../src/reveal-interaction.mjs';
import {validatePrivateDeckFiles,deckFileNameGuide} from '../src/private-deck.mjs';

test('version badge corresponds to deployed package version',async()=>{
 const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
 assert.equal(APP_VERSION,pkg.version);
});
test('78 orderly inward-facing cards on concentric interior bands, no duplicate locations',()=>{
 const layout=sphereLayout();assert.equal(layout.length,78);
 assert.equal(new Set(layout.map(p=>p.row)).size,6);
 assert.equal(new Set(layout.map(p=>p.column)).size,13);
 assert.equal(new Set(layout.map(p=>p.center.map(x=>x.toFixed(5)).join(','))).size,78);
 for(const p of layout){assert.ok(Math.abs(Math.hypot(...p.center)-SPHERE_RADIUS)<1e-7);assert.ok(Math.abs(Math.hypot(...p.normal)-1)<1e-7);assert.equal(p.column>=0&&p.column<13,true)}
 assert.equal(projectPoint([0,0,2],800,420),null,'Back-of-head card is never drawn');
 const near=projectPoint([0,0,-SPHERE_RADIUS],800,420);assert.equal(near.x,400);assert.equal(near.y,210);
 assert.equal(CARD_WIDTH>0&&CARD_HEIGHT>0,true);
});
test('ray-plane hit testing selects only cards visible from INSIDE the dome',()=>{
 const cards=sphereLayout(),ids=cards.map((_,i)=>String(i)),rect={w:900,h:540};
 const visible=cards.map((p,i)=>({p,i,s:projectPoint(p.center,rect.w,rect.h)})).filter(x=>x.s&&x.s.x>=0&&x.s.x<=rect.w&&x.s.y>=0&&x.s.y<=rect.h);
 assert.ok(visible.length>=5);
 const best=visible.find(x=>pickSphereCard(cards,ids,new Set(),0,0,x.s.x,x.s.y,rect.w,rect.h)===ids[x.i]);
 assert.ok(best,'At least one card should be individually selectable');
 const all=new Set(ids);assert.equal(pickSphereCard(cards,ids,all,0,0,best.s.x,best.s.y,rect.w,rect.h),null);
 assert.ok(cardAxes(best.p).right.every(Number.isFinite));
 assert.ok(rotatePoint([1,0,0],0,Math.PI/2)[2]<-.99);
});
test('slow reveal is reversible, clamped, and progression requires all three cards',()=>{
 assert.equal(progressFromCardDrag(0,300,200,400),.25);
 assert.equal(progressFromCardDrag(.5,200,300,400),.25);
 assert.equal(progressFromCardDrag(.8,300,-200,100),1);
 assert.equal(progressFromPinch(0,220,120,200),.5);
 assert.equal(progressFromPinch(.3,100,180,200),0);
 assert.equal(clampReveal(Infinity),0);
 assert.equal(nextRevealProgress(.9,.2),1);
 assert.equal(allCardsRevealed([true,true,false]),false);
 assert.equal(allCardsRevealed([true,true,true]),true);
});
test('private Chinese deck requires exactly 78 correctly mapped local images',()=>{
 const files=DECK.map(c=>({name:`${c.id}.jpg`,size:104857,type:'image/jpeg'}));
 const mapped=validatePrivateDeckFiles(files,DECK);assert.equal(mapped.size,78);
 assert.match(deckFileNameGuide(DECK),/major-00/);
 assert.throws(()=>validatePrivateDeckFiles(files.slice(0,-1),DECK),/Expected/);
 const bad=files.map(x=>({...x}));bad[7].name=bad[6].name;
 assert.throws(()=>validatePrivateDeckFiles(bad,DECK),/Duplicate/);
 const wrong=files.map(x=>({...x}));wrong[7].name='random-card.jpg';
 assert.throws(()=>validatePrivateDeckFiles(wrong,DECK),/Unknown/);
});
