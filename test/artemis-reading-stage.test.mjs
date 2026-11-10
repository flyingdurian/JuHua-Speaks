import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK,BY_ID} from '../src/deck.mjs';
import {buildDemoReading} from '../src/demo-reading.mjs';
import {
 ARTEMIS_ASSET_READY,ARTEMIS_ART_DIRECTOR_FILES,assetUrl,
 canBeginReading,handoffDuration,READING_CHAPTERS,
 renderReadingPanel,renderReadingStage
} from '../preview/gate-c14/reading-stage.mjs';

const selected=[
 {id:DECK[0].id,orientation:'upright'},
 {id:DECK[1].id,orientation:'reversed'},
 {id:DECK[2].id,orientation:'upright'}
];
const complete=()=>[{mode:'right',progress:1},{mode:'corner',progress:.99},{mode:'bottom',progress:1}];
const demo=buildDemoReading({
 question:'How can I find clarity in the decision ahead?',
 picks:selected.map(s=>({card:BY_ID.get(s.id),orientation:s.orientation})),
 spread:'insight',lens:'western',lang:'en',options:['','']
});

test('no Artemis handoff before all three distinct physical cards are fully revealed',()=>{
 assert.equal(canBeginReading(selected,complete()),true);
 for(let i=0;i<3;i++){
  const p=complete();p[i].progress=.98;
  assert.equal(canBeginReading(selected,p),false,'Card '+i+' is incomplete');
 }
 assert.equal(canBeginReading(selected.slice(0,2),complete()),false);
 assert.equal(canBeginReading([selected[0],selected[0],selected[2]],complete()),false);
 assert.equal(canBeginReading(selected.map(c=>({...c,orientation:'sideways'})),complete()),false);
 assert.equal(canBeginReading(selected,[{progress:1},{progress:1}]),false);
 assert.equal(canBeginReading(selected,[{progress:1},{progress:NaN},{progress:1}]),false);
});

test('cinematic handoff respects reduced motion and never needs generated artwork',()=>{
 assert.equal(handoffDuration(false),1850);
 assert.equal(handoffDuration(true),0);
 assert.equal(ARTEMIS_ASSET_READY,false);
 for(const name of Object.values(ARTEMIS_ART_DIRECTOR_FILES))assert.match(name,/\.png$/);
 assert.ok(Object.keys(ARTEMIS_ART_DIRECTOR_FILES).length>=16);
 assert.equal(assetUrl('portrait'),null);
 assert.throws(()=>assetUrl('unlisted'),RangeError);
});

test('Your Reading always uses the exact three selected IDs, orientation and live text',()=>{
 const html=renderReadingStage({choices:selected,cardsById:BY_ID,demo,chapter:-1,question:'A question with <script>payload</script>'});
 assert.match(html,/Your Reading/);
 assert.match(html,/ARTEMIS/);
 assert.match(html,/ILLUSTRATED PORTRAIT PENDING/);
 assert.match(html,/data-art-status="pending"/);
 assert.doesNotMatch(html,/<script>payload<\/script>/);
 assert.ok(html.includes('&lt;script&gt;payload&lt;/script&gt;'));
 for(const s of selected)assert.ok(html.includes('/'+s.id+'.jpg'),'Missing actual card '+s.id);
 assert.match(html,/reading-actual-card-face is-reversed/);
 assert.equal((html.match(/class="reading-art-card /g)||[]).length,3);
 assert.match(html,/SCRIPTED DEMONSTRATION · NO LIVE AI REQUEST/);
 assert.doesNotMatch(html,/<svg\b/i,'An illustrated human must not be generated as shapes');
 assert.doesNotMatch(html,/src="null"|src="undefined"/);
 assert.deepEqual(READING_CHAPTERS,[-1,0,1,2,3]);
});

test('Artemis narrative chapters show original selected card interpretation',()=>{
 for(const chapter of READING_CHAPTERS){
  const html=renderReadingPanel(demo,chapter);
  assert.match(html,/reading-art-nameplate/);
  assert.match(html,/reading-prev/);
  assert.match(html,/reading-next/);
  if(chapter>=0&&chapter<3)assert.ok(html.includes(demo.cards[chapter].name));
  else if(chapter===3)assert.ok(html.includes('Your story, seen together.'));
 }
 assert.throws(()=>renderReadingPanel(demo,4),RangeError);
 assert.throws(()=>renderReadingStage({choices:selected.slice(0,2),cardsById:BY_ID,demo}),/three/);
});

test('actual Gate C reveal owns the CTA and physically gated transition, not old ritual.html',async()=>{
 const js=await readFile(new URL('../preview/gate-c14/gate-c14.mjs',import.meta.url),'utf8');
 const html=await readFile(new URL('../preview/gate-c14/index.html',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/gate-c14/reading-stage.css',import.meta.url),'utf8');
 assert.match(js,/data-action="begin-reading" disabled/);
 assert.match(js,/if\(stage!=='reveal'\|\|!canBeginReading\(choices,peel\)\)return false/);
 assert.match(js,/stage='reading-transition'/);
 assert.match(js,/stage='reading'/);
 assert.match(js,/renderReadingStage\(\{choices,cardsById:BY_ID/);
 assert.match(js,/handoffDuration\(reduced\(\)\)/);
 assert.match(html,/reading-stage\.css/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/\.scene-artemis-reading/);
 assert.doesNotMatch(js,/window\.location\.assign/);
});
