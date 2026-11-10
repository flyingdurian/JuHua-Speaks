import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const host='http://127.0.0.1:'+(process.env.GATE_B_PORT||4184);
const dir='artifacts/post-shuffle';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:860,height:720},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
try{
 await page.goto(host+'/preview/post-shuffle/',{waitUntil:'domcontentloaded'});
 await page.click('#finish-shuffle');await page.waitForFunction(()=>Boolean(window.__POST_SHUFFLE__));
 const deck=await page.evaluate(()=>window.__POST_SHUFFLE__.deck());assert.equal(deck.length,78);assert.equal(new Set(deck).size,78);
 await page.waitForTimeout(350);await page.screenshot({path:dir+'/01-deck-launched.png'});
 await page.waitForTimeout(1850);await page.screenshot({path:dir+'/02-sphere-distribution.png'});
 await page.waitForTimeout(2200);await page.screenshot({path:dir+'/03-fast-orbit.png'});
 await page.waitForTimeout(2650);await page.screenshot({path:dir+'/04-inside-sphere.png'});
 assert.equal(await page.evaluate(()=>window.__POST_SHUFFLE__.ready()),true);
 assert.equal(await page.evaluate(()=>window.__POST_SHUFFLE__.stage()),'inside');
 const selected=[];
 for(let i=0;i<3;i++){
  let newlySelected=false;
  for(let tries=0;tries<45&&!newlySelected;tries++){
   const pick=await page.evaluate((attempt)=>{
    const v=window.__POST_SHUFFLE__.visible().filter(c=>c.side===0&&!c.selected&&c.x>30&&c.x<innerWidth-30&&c.y>76&&c.y<innerHeight-90).sort((a,b)=>a.depth-b.depth);
    return v[(attempt*3)%Math.max(1,v.length)]||null;
   },tries);
   if(!pick)throw Error('No visible inward-facing cards available');
   await page.mouse.click(pick.x,pick.y);await page.waitForTimeout(75);
   const count=await page.evaluate(()=>window.__POST_SHUFFLE__.selected().length);
   if(count===i+1)newlySelected=true;
  }
  assert.ok(newlySelected,'A real screen click must select card '+(i+1));
  const choices=await page.evaluate(()=>window.__POST_SHUFFLE__.selected());
  assert.equal(choices.length,i+1);selected.push(choices.at(-1).id);
  if(i===2){
   // A real intermediate frame must exist: three chosen back surfaces are
   // still travelling from sphere coordinates into the prepared tableau.
   const handoff=await page.evaluate(()=>({
    ghosts:document.querySelectorAll('.ps-handoff-card').length,
    prepared:document.querySelector('.ps-tableau')?.classList.contains('ps-handoff-prepared'),
    settled:document.querySelector('.ps-tableau')?.classList.contains('ps-handoff-settled')
   }));
   assert.equal(handoff.ghosts,3,'third pick must create three physical-card transition surfaces');
   assert.equal(handoff.prepared,true,'reveal destinations must exist before stage handoff');
   // Do not assert an animation timestamp after a Chromium mouse click: SwiftShader
   // can spend longer than the 1.53-second settle duration processing the event.
   // The three real pick-origin ghosts and prepared destination surfaces already
   // establish continuous handoff without a fake scene replacement.
   await page.screenshot({path:dir+'/06-seamless-three-card-handoff.png'});
  }
  await page.screenshot({path:dir+'/05-selected-'+(i+1)+'.png'});
 }
 assert.deepEqual(await page.evaluate(()=>window.__POST_SHUFFLE__.selected().map(c=>c.id)),selected);
 await page.waitForFunction(()=>window.__POST_SHUFFLE__?.tableau()?.active===true,{timeout:10000});
 assert.equal(await page.locator('.ps-tableau').isVisible(),true,'Three-card tableau must appear in-world');
 assert.equal(await page.locator('.ps-flip-button').count(),3);
 // Historic artwork is a blocking reveal prerequisite, not an optional
 // decorative image tag: all 3 visible faces must decode to real pixels.
 await page.waitForFunction(()=>{
  const imgs=[...document.querySelectorAll('.ps-tableau .ps-card-art')];
  return imgs.length===3&&imgs.every(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0);
 },{timeout:18000});
 assert.equal(await page.locator('.ps-flip-button:disabled').count(),0);
 assert.equal(await page.locator('.ps-begin-reading:visible').count(),0,'Artemis must not auto-open or offer Begin Reading before reveals');
 const composed=await page.evaluate(()=>{
  const inner=document.querySelector('.ps-flip-inner');
  return {filter:getComputedStyle(inner).filter,transform:getComputedStyle(inner).transform};
 });
 assert.equal(composed.filter,'none','flip parent must not flatten 3D faces');
 assert.match(composed.transform,/matrix3d/,'unrevealed card should be slightly tilted in 3D');
 const artOverlay=await page.evaluate(()=>window.__POST_SHUFFLE__.artOverlay());
 assert.ok(['celestial-lattice','constellation-map','alchemical-glyphs','scroll-texture'].includes(artOverlay));
 const previewStyles=new Set();
 for(let j=0;j<4;j++){
  previewStyles.add(await page.locator('.ps-overlay-name').textContent());
  await page.locator('.ps-overlay-next').click();
 }
 assert.equal(previewStyles.size,4,'all four art overlays can be cycled without re-dealing');
 await page.screenshot({path:dir+'/07-three-selected-backs.png',timeout:60000});
 // Let the tableau entrance finish before measuring structural layout stability.
 await page.waitForTimeout(1050);
 const stableCardBoxes=await page.locator('.ps-flip-button').evaluateAll(nodes=>nodes.map(n=>{
  const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};
 }));
 // No fake click targets or old HUD should intrude into the interior.
 assert.equal(await page.locator('.ps-selections').isVisible(),false);
 const vapor=await page.locator('.ps-card-back').first().evaluate(el=>getComputedStyle(el,'::after').display);
 assert.equal(vapor,'none','static smoke pseudo-element must be suppressed');
 await page.waitForTimeout(180);
 const vaporPixels=await page.locator('.ps-vapor-cloud').first().evaluate(node=>{
  const ctx=node.getContext('2d'),p=ctx.getImageData(0,0,node.width,node.height).data;
  let count=0;for(let i=3;i<p.length;i+=4)if(p[i]>5)count++;
  return count;
 });
 assert.ok(vaporPixels>400,'procedural fluid noise must paint substantial translucent pixels');
 const cardTextGap=await page.evaluate(()=>{
  const a=document.querySelector('.ps-flip-button').getBoundingClientRect();
  const b=document.querySelector('.ps-tableau-detail').getBoundingClientRect();
  return b.top-a.bottom;
 });
 assert.ok(cardTextGap>=0&&cardTextGap<29,'reading must sit directly beneath its own card');
 for(let i=0;i<3;i++){
  await page.locator('.ps-flip-button').nth(i).click();
  await page.waitForTimeout(1320);
  assert.equal(await page.locator('.ps-tableau-detail').nth(i).isVisible(),true,'Revealed card must show its meaning');
  if(i<2)assert.equal(await page.locator('.ps-begin-reading:visible').count(),0,'Begin Reading must remain gated until all 3 reveals');
  const facing=await page.locator('.ps-flip-inner').nth(i).evaluate(node=>{
   const m=new DOMMatrixReadOnly(getComputedStyle(node).transform);
   return {z:m.m33,filter:getComputedStyle(node).filter};
  });
  assert.ok(facing.z<-.82,'actual 3D front must face camera after flip');
  assert.equal(facing.filter,'none','no hidden flattening post flip');
  const after=await page.locator('.ps-flip-button').evaluateAll(nodes=>nodes.map(n=>{
   const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};
  }));
  for(let j=0;j<3;j++)for(const k of ['x','y','width','height'])
   assert.ok(Math.abs(after[j][k]-stableCardBoxes[j][k])<1.6,'reveal may not reflow '+j+'.'+k);
 }
 assert.equal(await page.evaluate(()=>window.__POST_SHUFFLE__.tableau().revealed),3);
 assert.equal(await page.locator('.ps-card-art').count(),3,'RWS front images must stay in the reveal');
 await page.screenshot({path:dir+'/08-three-art-overlay-reveals.png',timeout:60000});
 assert.equal(await page.locator('.ps-begin-reading:visible').count(),1,'Explicit Begin Reading appears after third original card reveal');
 assert.equal(await page.locator('.ps-begin-reading').isEnabled(),true);
 assert.equal(await page.evaluate(()=>window.__POST_SHUFFLE__.stage()),'tableau');
 await page.evaluate(()=>{window.__revealedOriginalFaces=[...document.querySelectorAll('.ps-tableau .ps-card-art')]});
 await page.locator('.ps-begin-reading').click();
 await page.waitForFunction(()=>window.__POST_SHUFFLE__?.stage()==='reading',undefined,{timeout:7000});
 assert.equal(page.url(),host+'/preview/post-shuffle/','No navigation during reader handoff');
 assert.equal(await page.locator('.scene-artemis-reading').count(),1);
 assert.equal(await page.locator('.reading-art-card').count(),3);
 assert.equal(await page.evaluate(()=>{
  const now=[...document.querySelectorAll('.reading-actual-card-face')];
  return now.length===3&&now.every((img,i)=>img===window.__revealedOriginalFaces[i]
   &&img.dataset.carryover==='original-rws');
 }),true,'Reading stage must reuse the exact three revealed RWS DOM image nodes');
 assert.equal(await page.locator('.reading-art-panel-skin').count(),1);
 assert.equal(await page.locator('.reading-art-panel-corners').count(),1);
 assert.equal(await page.locator('[data-action="reading-next"]').count(),1);
 assert.equal(await page.locator('nav.reading-art-progress button').count(),0);
 const readingIDs=await page.locator('.reading-actual-card-face').evaluateAll(imgs=>
  imgs.map(i=>i.getAttribute('src')?.split('/').at(-1)?.replace('.jpg','')));
 assert.deepEqual(readingIDs,selected,'The exact three picked cards must remain unchanged');
 // The three original Tarot card nodes, the stage, and original RWS art never
 // remount during a chapter change (previously caused portrait blank frames).
 await page.evaluate(()=>{window.__readingStableCards=[...document.querySelectorAll('.reading-actual-card-face')]});
 async function expectPortrait(filename){
  await page.waitForFunction(name=>{
   const imgs=[...document.querySelectorAll('.reading-art-portrait img')],current=imgs.at(-1);
   return Boolean(current&&current.src.endsWith(name)&&current.complete
    &&current.naturalWidth>=700&&current.naturalHeight>=1000
    &&getComputedStyle(current).opacity!=='0');
  },filename,{timeout:11000});
 }
 await expectPortrait('artemis_warm_welcome.webp');
 await page.screenshot({path:dir+'/09-artemis-warm-welcome.png'});
 await page.locator('[data-action="reading-next"]').click();
 assert.equal(await page.locator('.reading-art-panel-skin').count(),1,'Narrative update must not remove art skin');
 assert.equal(await page.locator('.reading-art-panel-corners').count(),1,'Narrative update must not remove corners');
 await expectPortrait('artemis_welcoming_gesture.webp');
 await page.locator('[data-action="reading-next"]').click();
 await expectPortrait('artemis_thinking.webp');
 await page.locator('[data-action="reading-next"]').click();
 await expectPortrait('artemis_reflective.webp');
 await page.waitForTimeout(510); // End of the deliberately short portrait crossfade.
 const stable=await page.evaluate(()=>[...document.querySelectorAll('.reading-actual-card-face')]
  .every((node,i)=>node===window.__readingStableCards[i]));
 assert.equal(stable,true,'Changing Artemis expression must preserve original RWS nodes');
 assert.equal(await page.locator('.reading-art-portrait img').count(),1,'Crossfade must retire the old image');
 await page.screenshot({path:dir+'/10-artemis-reflective.png'});
 assert.equal(await page.locator('.reading-art-card').count(),3);
 assert.match(await page.locator('.reading-art-panel').innerText(),/ARTEMIS/);
 assert.deepEqual(errors,[]);
 console.log('Post-shuffle browser PASS: v3.4 sphere, 3 selections, RWS reveals, opt-in Begin Reading, four Artemis portraits and preserved identities');
}finally{await browser.close()}
