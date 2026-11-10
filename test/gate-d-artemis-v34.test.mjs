import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK,BY_ID} from '../src/deck.mjs';
import {buildDemoReading} from '../src/demo-reading.mjs';
import {
 ARTEMIS_ASSET_READY,ARTEMIS_PROVISIONAL_READY_SLOTS,ARTEMIS_ART_DIRECTOR_FILES,
 assetUrl,portraitSlotForChapter,canBeginReading,handoffDuration,
 renderReadingStage,renderReadingPanel,READING_CHAPTERS
} from '../preview/post-shuffle/reading-stage.mjs';

const picks=[
 {id:DECK[0].id,orientation:'upright'},
 {id:DECK[1].id,orientation:'reversed'},
 {id:DECK[2].id,orientation:'upright'}
];
const demo=buildDemoReading({
 question:'How do I approach the decision ahead?',
 picks:picks.map(p=>({card:BY_ID.get(p.id),orientation:p.orientation})),
 spread:'insight',lens:'western',lang:'en',options:['','']
});
test('Four actual transparent Art Director portraits are committed and mapped per performance',async()=>{
 assert.equal(ARTEMIS_ASSET_READY,true);
 assert.deepEqual(ARTEMIS_PROVISIONAL_READY_SLOTS,['warmWelcome','welcomingGesture','thinking','reflective']);
 assert.deepEqual(READING_CHAPTERS,[-1,0,1,2,3]);
 assert.deepEqual(READING_CHAPTERS.map(portraitSlotForChapter),['warmWelcome','welcomingGesture','thinking','reflective','reflective']);
 for(const slot of ARTEMIS_PROVISIONAL_READY_SLOTS){
  const path=assetUrl(slot);
  assert.ok(path.endsWith('.webp'),slot);
  const filename=ARTEMIS_ART_DIRECTOR_FILES[slot];
  assert.ok(path.endsWith(filename),slot);
  const buffer=await readFile(new URL('../assets/artemis/'+filename,import.meta.url));
  assert.ok(buffer.length>100000,'Real portrait must not be a fake tiny placeholder');
  assert.equal(buffer.toString('ascii',0,4),'RIFF');
  assert.equal(buffer.toString('ascii',8,12),'WEBP');
 }
 for(const pending of ['portrait','background','transition','panel','halo']){
  assert.equal(assetUrl(pending),null,'Art Director has not supplied '+pending);
 }
 assert.throws(()=>assetUrl('unlisted'),RangeError);
 assert.equal(handoffDuration(false),1850);
 assert.equal(handoffDuration(true),0);
});
test('Final reading is impossible with fewer than three revealed original cards',()=>{
 const done=[{progress:1},{progress:.99},{progress:1}];
 assert.equal(canBeginReading(picks,done),true);
 assert.equal(canBeginReading(picks.slice(0,2),done),false);
 assert.equal(canBeginReading([picks[0],picks[0],picks[2]],done),false);
 for(let i=0;i<3;i++){
  const notDone=done.map(x=>({...x}));notDone[i].progress=.97;
  assert.equal(canBeginReading(picks,notDone),false);
 }
 assert.equal(canBeginReading(picks,[{progress:1},{progress:NaN},{progress:1}]),false);
});
test('Your Reading retains exactly three original identities, orientations and authentic RWS images',()=>{
 for(const chapter of READING_CHAPTERS){
  const html=renderReadingStage({choices:picks,cardsById:BY_ID,demo,chapter,question:'A <script>hidden</script> question'});
  assert.match(html,/Your Reading/);
  assert.ok(html.includes('assets/artemis/'+ARTEMIS_ART_DIRECTOR_FILES[portraitSlotForChapter(chapter)]));
  assert.equal((html.match(/class="reading-art-card /g)||[]).length,3);
  for(const p of picks)assert.ok(html.includes('/'+p.id+'.jpg'),p.id);
  assert.match(html,/reading-actual-card-face is-reversed/);
  assert.doesNotMatch(html,/<script>/);
  assert.match(html,/SCRIPTED DEMONSTRATION · NO LIVE AI REQUEST/);
  assert.doesNotMatch(html,/<svg\b/i,'Never substitute shape-built Artemis portrait');
  assert.match(renderReadingPanel(demo,chapter),/reading-next/);
 }
 assert.throws(()=>renderReadingStage({choices:picks.slice(0,2),cardsById:BY_ID,demo}),/three distinct/);
});
test('Latest v3.4 Gate BC owns the CTA and cinematic handoff; no old Gate C14 route',async()=>{
 const tableau=await readFile(new URL('../preview/post-shuffle/TarotTableau.mjs',import.meta.url),'utf8');
 const scene=await readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8');
 const gate=await readFile(new URL('../preview/gate-b/gate-b.mjs',import.meta.url),'utf8');
 const style=await readFile(new URL('../preview/post-shuffle/reading-stage.css',import.meta.url),'utf8');
 const gateHtml=await readFile(new URL('../preview/gate-b/index.html',import.meta.url),'utf8');
 assert.match(tableau,/begin\.disabled=true/);
 assert.match(tableau,/if\(revealed===3\)/);
 assert.match(tableau,/onBeginReading\(/);
 assert.match(tableau,/readingEntry\.hidden=false/);
 assert.match(scene,/createTarotTableau\(\{mount:world,picks:lockFrame\.picks,foil:sessionFoil,onBeginReading:beginReading\}\)/);
 assert.match(scene,/if\(dead\|\|lockAt===null\|\|!tableauShown\|\|tableau\?\.revealed!==3/);
 assert.match(scene,/readingTimer=setTimeout/);
 assert.match(scene,/renderReadingStage\(\{choices,cardsById:BY_ID/);
 assert.match(scene,/readingQuestion/);
 assert.match(gate,/mountPostShuffle\(\{mount,deckIds:selectionOrder,question\}\)/);
 assert.doesNotMatch(gate,/gate-c14|ritual\.html/);
 assert.match(gateHtml,/reading-stage\.css/);
 assert.match(style,/prefers-reduced-motion:reduce/);
});
