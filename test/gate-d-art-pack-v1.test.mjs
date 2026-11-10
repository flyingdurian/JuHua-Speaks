import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readFileSync,writeFileSync,mkdtempSync,mkdirSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {ARTEMIS_PORTRAIT_SLOTS,ARTEMIS_SOURCE_FILES,ARTEMIS_SOURCE_COUNT}
 from '../preview/post-shuffle/artemis-art-catalog.mjs';
import {ARTEMIS_IMPORTED_FILES} from '../preview/post-shuffle/artemis-assets-ready.mjs';
import {
 ARTEMIS_PROVISIONAL_READY_SLOTS,ARTEMIS_READY_PORTRAIT_SLOTS,
 ARTEMIS_ART_DIRECTOR_FILES,assetUrl,portraitSlotForChapter,
 renderReadingStage,renderReadingPanel,renderReadingHandoff,READING_CHAPTERS
} from '../preview/post-shuffle/reading-stage.mjs';
import {inspectArtemisPng,verifyArtemisSource,installArtemisAssets}
 from '../scripts/install-artemis-assets.mjs';
import {DECK,BY_ID} from '../src/deck.mjs';
import {buildDemoReading} from '../src/demo-reading.mjs';

const picks=[
 {id:DECK[0].id,orientation:'upright'},
 {id:DECK[1].id,orientation:'reversed'},
 {id:DECK[2].id,orientation:'upright'}
];
const reading=buildDemoReading({question:'Can I face the uncertainty ahead?',
 picks:picks.map(p=>({card:BY_ID.get(p.id),orientation:p.orientation})),
 spread:'insight',lens:'western',lang:'en',options:['','']});

test('owner-approved package contract enumerates exactly 16 portraits, 2 backgrounds, 6 FX and 7 UI PNGs',()=>{
 assert.equal(ARTEMIS_SOURCE_COUNT,31);
 assert.equal(ARTEMIS_PORTRAIT_SLOTS.length,16);
 assert.equal(Object.keys(ARTEMIS_SOURCE_FILES).length,31);
 assert.equal(new Set(Object.values(ARTEMIS_SOURCE_FILES)).size,31);
 assert.equal(Object.values(ARTEMIS_SOURCE_FILES).filter(path=>path.startsWith('portraits/')).length,16);
 assert.equal(Object.values(ARTEMIS_SOURCE_FILES).filter(path=>path.startsWith('backgrounds/')).length,2);
 assert.equal(Object.values(ARTEMIS_SOURCE_FILES).filter(path=>path.startsWith('fx/')).length,6);
 assert.equal(Object.values(ARTEMIS_SOURCE_FILES).filter(path=>path.startsWith('ui/')).length,7);
 for(const [slot,path] of Object.entries(ARTEMIS_SOURCE_FILES)){
  assert.match(path,/^(portraits|backgrounds|fx|ui)\/[a-z0-9_]+\.png$/);
  assert.ok(Object.hasOwn(ARTEMIS_ART_DIRECTOR_FILES,slot));
  if(Object.hasOwn(ARTEMIS_IMPORTED_FILES,slot))assert.equal(ARTEMIS_IMPORTED_FILES[slot],basename(path));
 }
});
test('never claim missing or unregistered PNGs are shipped; fallback stays on 4 real WebP previews',()=>{
 assert.deepEqual(ARTEMIS_PROVISIONAL_READY_SLOTS,['warmWelcome','welcomingGesture','thinking','reflective']);
 for(const slot of ARTEMIS_READY_PORTRAIT_SLOTS)assert.ok(assetUrl(slot)?.startsWith('../../assets/artemis/'));
 for(const slot of Object.keys(ARTEMIS_SOURCE_FILES)){
  const source=basename(ARTEMIS_SOURCE_FILES[slot]);
  const url=assetUrl(slot);
  if(!Object.hasOwn(ARTEMIS_IMPORTED_FILES,slot)&&!ARTEMIS_PROVISIONAL_READY_SLOTS.includes(slot))
   assert.equal(url,null,'Unshipped art must remain pending: '+slot);
  if(Object.hasOwn(ARTEMIS_IMPORTED_FILES,slot))assert.equal(url,'../../assets/artemis/'+source);
 }
 assert.throws(()=>assetUrl('../../secrets'),RangeError);
 assert.equal(assetUrl('portrait'),null);
});
test('five chapters prefer approved art state when installed, with existing four safe before import',()=>{
 assert.deepEqual(READING_CHAPTERS,[-1,0,1,2,3]);
 for(const chapter of READING_CHAPTERS){
  const slot=portraitSlotForChapter(chapter);
  assert.ok(ARTEMIS_PORTRAIT_SLOTS.includes(slot));
  assert.ok(assetUrl(slot));
 }
 assert.equal(portraitSlotForChapter(-1),'warmWelcome');
 assert.equal(portraitSlotForChapter(1),'thinking');
 if(!ARTEMIS_IMPORTED_FILES.explaining)assert.equal(portraitSlotForChapter(0),'welcomingGesture');
 else assert.equal(portraitSlotForChapter(0),'explaining');
 if(ARTEMIS_IMPORTED_FILES.reading)assert.equal(portraitSlotForChapter(2),'reading');
});
test('reading chamber is one cohesive composition with original RWS images and authored keywords',()=>{
 const html=renderReadingStage({choices:picks,cardsById:BY_ID,demo:reading,chapter:1,
  question:'Do <we> really know "the answer"?'});
 assert.equal((html.match(/class="reading-actual-card-face/g)||[]).length,3);
 for(let i=0;i<3;i++){
  assert.ok(html.includes('data-original-card-id="'+picks[i].id+'"'));
  assert.ok(html.includes('data-orientation="'+picks[i].orientation+'"'));
  assert.ok(html.includes('../../assets/rws/'+picks[i].id+'.jpg'));
  assert.ok(html.includes(reading.cards[i].meaning.slice(0,12)));
 }
 assert.match(html,/reading-art-atmosphere/);
 assert.match(html,/reading-art-fx-sigils/);
 assert.match(html,/reading-art-fx-violet/);
 assert.match(html,/reading-art-fx-gold/);
 assert.match(html,/reading-art-table-surface/);
 assert.match(html,/reading-art-card-glow/);
 assert.match(html,/reading-art-panel-skin/);
 assert.match(html,/reading-art-panel-corners/);
 assert.match(html,/reading-art-nameplate-art/);
 assert.match(html,/reading-art-title-art/);
 assert.match(html,/SCRIPTED DEMONSTRATION/);
 assert.ok(html.includes('Do &lt;we&gt; really know &quot;the answer&quot;?'));
 assert.ok(!html.includes('Do <we>'));
 assert.ok(!html.includes('<canvas'));
});
test('narrative UI has exactly one primary next control and no dot navigation',()=>{
 for(const chapter of READING_CHAPTERS){
  const panel=renderReadingPanel(reading,chapter);
  assert.equal((panel.match(/data-action="reading-next"/g)||[]).length,1);
  assert.equal((panel.match(/data-action="reading-prev"/g)||[]).length,1);
  assert.equal((panel.match(/class="reading-art-progress"/g)||[]).length,1);
  assert.ok(!panel.includes('data-reading-chapter='));
  assert.match(panel,/reading-art-nameplate/);
  assert.match(panel,/reading-art-control-arrow/);
 }
 assert.equal((renderReadingHandoff().match(/reading-handoff-veil/g)||[]).length,1);
 assert.match(renderReadingHandoff(),/data-art-slot="transition"/);
});
test('reveal to reading reuses the three existing DOM image nodes, while chapters retain decor',async()=>{
 const source=await import('node:fs/promises').then(m=>m.readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8'));
 assert.match(source,/querySelectorAll\('\.ps-card-art'\)/);
 assert.match(source,/img\.dataset\.carryover='original-rws'/);
 assert.match(source,/sockets\[i\]\.replaceWith\(img\)/);
 assert.match(source,/panelInner\.outerHTML=renderReadingPanel/);
 assert.doesNotMatch(source,/panel\.innerHTML=renderReadingPanel/);
});
test('PNG importer detects wrong containers and malformed dimensions before touching repository',()=>{
 assert.throws(()=>inspectArtemisPng(Buffer.from('not a png'),'broken'));
 const buffer=Buffer.alloc(4096);
 Buffer.from([137,80,78,71,13,10,26,10]).copy(buffer,0);
 buffer.write('IHDR',12,'ascii');
 buffer.writeUInt32BE(1024,16);buffer.writeUInt32BE(1536,20);
 buffer[24]=8;buffer[25]=6;
 assert.deepEqual(inspectArtemisPng(buffer,'portrait','portraits'),
  {width:1024,height:1536,bitDepth:8,colorType:6});
 buffer[25]=2;
 assert.throws(()=>inspectArtemisPng(buffer,'portrait','portraits'),/transparency/);
});
test('source installer verifies 31 images, preserves bytes and emits an explicit 31-file registration',()=>{
 const tmp=mkdtempSync(join(tmpdir(),'juhua-artemis-'));
 try{
  const source=join(tmp,'Artemis_Asset_Candidates');
  const repo=join(tmp,'repo');
  mkdirSync(join(repo,'preview','post-shuffle'),{recursive:true});
  for(const [slot,relative] of Object.entries(ARTEMIS_SOURCE_FILES)){
   const png=Buffer.alloc(4096,0);
   Buffer.from([137,80,78,71,13,10,26,10]).copy(png);
   png.write('IHDR',12,'ascii');
   png.writeUInt32BE(slot==='background'?1672:1024,16);
   png.writeUInt32BE(1536,20);
   png[24]=8;png[25]=relative.startsWith('backgrounds/')?2:6;
   const file=join(source,relative);
   mkdirSync(dirname(file),{recursive:true});writeFileSync(file,png);
  }
  assert.equal(verifyArtemisSource(tmp).length,31);
  const result=installArtemisAssets(tmp,{root:repo});
  assert.equal(result.installed,31);
  const ready=readFileSync(join(repo,'preview/post-shuffle/artemis-assets-ready.mjs'),'utf8');
  assert.match(ready,/"background": "bg_artemis_reading_stage_main.png"/);
  assert.match(ready,/"warmWelcome": "artemis_warm_welcome.png"/);
  assert.ok(existsSync(join(repo,'assets/artemis/artemis_warm_welcome.png')));
  const manifest=JSON.parse(readFileSync(join(repo,'assets/artemis/asset-provenance.json'),'utf8'));
  assert.equal(manifest.imageCount,31);
  assert.equal(manifest.images.length,31);
  rmSync(join(source,'fx/fx_card_spread_glow.png'));
  assert.throws(()=>installArtemisAssets(tmp,{root:repo}),/Missing required original art/);
 }finally{rmSync(tmp,{recursive:true,force:true})}
});
