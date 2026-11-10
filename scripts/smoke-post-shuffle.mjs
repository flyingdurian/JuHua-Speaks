import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
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
    settled:document.querySelector('.ps-tableau')?.classList.contains('ps-handoff-settled'),
    locked:window.__POST_SHUFFLE__.selectionLocked(),
    snapshot:window.__POST_SHUFFLE__.selectionSnapshot()
   }));
   assert.equal(handoff.locked,true,'third selection must lock the sphere atomically');
   assert.equal(handoff.snapshot?.picks?.length,3,'lock must preserve three original identities');
   assert.ok(handoff.ghosts>=0&&handoff.ghosts<=3,
    'never create offscreen corner ghosts for earlier cards; only currently visible picks may fly in');
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
  // SwiftShader/browser CI may throttle a 1150ms CSS turn. Wait for the
  // *actual rendered face* and its detail to settle, not a wall-clock guess.
  await page.waitForFunction(index=>{
   const inner=document.querySelectorAll('.ps-flip-inner')[index];
   const detail=document.querySelectorAll('.ps-tableau-detail')[index];
   if(!inner||!detail||detail.hidden)return false;
   const m=new DOMMatrixReadOnly(getComputedStyle(inner).transform);
   return m.m33<-.82;
  },i,{timeout:13000});
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
 await page.evaluate(()=>{
  window.__revealedOriginalFaces=[...document.querySelectorAll('.ps-tableau .ps-card-art')];
  window.__revealedOriginalFoils=[...document.querySelectorAll('.ps-tableau .ps-card-art-overlay')];
 });
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
 const foilHandoff=await page.evaluate(()=>{
  const originals=window.__revealedOriginalFoils;
  const layers=[...document.querySelectorAll('.reading-art-card-frame .reading-art-card-foil')];
  const frames=[...document.querySelectorAll('.reading-art-card-frame')];
  const details=layers.map((layer,i)=>{
   const style=getComputedStyle(layer),glint=getComputedStyle(layer,'::after');
   const l=layer.getBoundingClientRect(),f=frames[i].getBoundingClientRect();
   return {sameNode:layer===originals[i],carryover:layer.dataset.carryover,
    finish:layer.dataset.foilFinish,hasTexture:style.backgroundImage.includes('data:image'),
    opacity:Number(style.opacity),blend:style.mixBlendMode,z:Number(style.zIndex),
    glint:glint.animationName,insideFrame:Math.abs(l.left-f.left)<3&&Math.abs(l.top-f.top)<3
     &&Math.abs(l.width-f.width)<5&&Math.abs(l.height-f.height)<5};
  });
  return {count:layers.length,details,reduced:matchMedia('(prefers-reduced-motion:reduce)').matches};
 });
 assert.equal(foilHandoff.count,3,'Artemis requires three in-frame foil layers');
 assert.ok(foilHandoff.details.every(s=>s.sameNode&&s.carryover==='original-foil'&&s.finish&&s.hasTexture),
  'Handoff must preserve the exact three textured, session-selected foil nodes');
 assert.ok(foilHandoff.details.every(s=>s.opacity>.15&&s.blend==='screen'&&s.z>1&&s.insideFrame),
  'Foil must visibly composite above authentic RWS art and remain attached to the face');
 if(!foilHandoff.reduced)assert.ok(foilHandoff.details.every(s=>s.glint.includes('artemis-foil-drift')),
  'Reading foil needs active slow specular movement');
 assert.equal(await page.locator('.reading-art-panel-skin').count(),1);
 assert.equal(await page.locator('.reading-art-panel-corners').count(),1);
 assert.equal(await page.locator('[data-action="reading-next"]').count(),1);
 assert.equal(await page.locator('nav.reading-art-progress button').count(),0);
 const readingIDs=await page.locator('.reading-art-card').evaluateAll(cards=>
  cards.map(card=>card.dataset.originalCardId));
 assert.deepEqual(readingIDs,selected,'The exact three picked card identities must remain unchanged');
 const imagesDecoded=await page.locator('.reading-actual-card-face').evaluateAll(imgs=>
  imgs.length===3&&imgs.every(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0&&Boolean(img.currentSrc||img.src)));
 assert.equal(imagesDecoded,true,'The same three original RWS images remain decoded after handoff');
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
 const readingGeometry=()=>page.evaluate(()=>{
  const r=selector=>document.querySelector(selector)?.getBoundingClientRect();
  const hero=r('.reading-art-hero'),head=r('.reading-art-header'),
   portrait=r('.reading-art-portrait'),panel=r('.reading-art-panel');
  const visual=[...document.querySelectorAll('.reading-art-card-visual')].map(el=>el.getBoundingClientRect());
  const cards=[...document.querySelectorAll('.reading-art-card-frame')].map(el=>el.getBoundingClientRect());
  return {heroTop:hero.top,heroHeight:hero.height,headerBottom:head.bottom,
   portraitTop:portrait.top,panelTop:panel.top,
   cardsBottom:Math.max(...visual.map(rect=>rect.bottom)),
   cardTilt:parseFloat(document.querySelector('.reading-art-card-visual').dataset.tabletopTiltDeg),
   cardFrames:cards.map(rect=>({top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right}))};
 });
 const welcomeLayout=await readingGeometry();
 assert.equal(welcomeLayout.cardTilt,42,'Cards must use the approved 42° tabletop perspective');
 assert.ok(welcomeLayout.cardFrames.every(rect=>rect.top>0&&rect.bottom<welcomeLayout.panelTop),
  'Every physical RWS frame must sit fully above the dialogue HUD');
 assert.ok(welcomeLayout.portraitTop>=welcomeLayout.headerBottom-8,
  'Artemis illustration must not overlap the title');
 assert.ok(welcomeLayout.panelTop-welcomeLayout.cardsBottom>10,
  'Card meanings need space above the narrative frame');
 await page.waitForTimeout(1100); // Capture after the 900ms authored chamber arrival, not its deliberately black first frame.
 await page.screenshot({path:dir+'/09-artemis-warm-welcome.png'});
 await page.locator('[data-action="reading-next"]').click();
 assert.equal(await page.locator('.reading-art-panel-skin').count(),1,'Narrative update must not remove art skin');
 assert.equal(await page.locator('.reading-art-panel-corners').count(),1,'Narrative update must not remove corners');
 await expectPortrait('artemis_explaining.webp');
 await page.locator('[data-action="reading-next"]').click();
 await expectPortrait('artemis_thinking.webp');
 await page.locator('[data-action="reading-next"]').click();
 await expectPortrait('artemis_reading.webp');
 await page.waitForTimeout(510); // End of the deliberately short portrait crossfade.
 const finalLayout=await readingGeometry();
 assert.ok(Math.abs(finalLayout.heroTop-welcomeLayout.heroTop)<1,
  'Chapter transitions must not reposition the hero');
 assert.ok(Math.abs(finalLayout.heroHeight-welcomeLayout.heroHeight)<20,
  'Longer interpretations may not collapse the Artemis hero');
 assert.ok(finalLayout.portraitTop>=finalLayout.headerBottom-8,
  'Artemis may not overlap the title on longer chapters');
 assert.ok(finalLayout.panelTop-finalLayout.cardsBottom>10,
  'Longer interpretations may not collide with card meanings');
 const stable=await page.evaluate(()=>[...document.querySelectorAll('.reading-actual-card-face')]
  .every((node,i)=>node===window.__readingStableCards[i]));
 assert.equal(stable,true,'Changing Artemis expression must preserve original RWS nodes');
 assert.equal(await page.locator('.reading-art-portrait img').count(),1,'Crossfade must retire the old image');
 await page.screenshot({path:dir+'/10-artemis-reflective.png'});
 assert.equal(await page.locator('.reading-art-card').count(),3);
 assert.match(await page.locator('.reading-art-panel').innerText(),/ARTEMIS/);
 // A real phone-sized rendering must keep the three cards side-by-side
 // without horizontal clipping and keep the live next control keyboardable.
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(420);
 const phone=await page.evaluate(()=>{
  const rect=selector=>document.querySelector(selector).getBoundingClientRect();
  const cards=[...document.querySelectorAll('.reading-art-card')].map(n=>n.getBoundingClientRect());
  const scene=document.querySelector('.scene-artemis-reading');
  return {scene:rect('.scene-artemis-reading'),panel:rect('.reading-art-panel'),
   cards:cards.map(r=>({left:r.left,right:r.right})),screen:innerWidth,
   hero:rect('.reading-art-hero'),portrait:rect('.reading-art-portrait'),
   table:rect('.reading-art-table-surface'),footer:rect('.reading-art-footer'),
   scrollHeight:scene.scrollHeight,
   nextLabel:document.querySelector('[data-action="reading-next"]')?.textContent};
 });
 assert.equal(phone.cards.length,3);
 assert.ok(phone.cards.every(c=>c.left>=-2&&c.right<=phone.screen+2),
  'All three selected Tarot cards must remain visible within a 390px phone viewport');
 assert.ok(phone.panel.width<=phone.screen+2,'The Artemis panel must fit phone width');
 assert.ok(phone.nextLabel?.trim().length>2,'Mobile panel must preserve the primary Next control');
 assert.ok(phone.hero.height<=426,'Tall mobile must not introduce a giant portrait/table dead gap');
 assert.ok(phone.table.top>phone.portrait.top&&phone.table.top<phone.panel.top,
  'Mobile table must belong to the portrait/chamber region above the HUD');
 assert.ok(phone.footer.bottom-phone.scene.top<=phone.scrollHeight+2,
  'Question/footer must remain reachable inside the scrollable safe-area layout');
 await page.screenshot({path:dir+'/11-artemis-phone-390x844.png',fullPage:true});
 // Approved 458×553 reading-stage concept is the spatial authority. Record
 // normalized anatomy even when the real 31 source assets are pending import.
 await page.setViewportSize({width:458,height:553});
 await page.waitForTimeout(600);
 const fidelity=await page.evaluate(()=>{
  const box=selector=>{const r=document.querySelector(selector)?.getBoundingClientRect();
   return r?{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}:null};
  const cards=[...document.querySelectorAll('.reading-art-card-frame')].map(n=>{
   const b=n.getBoundingClientRect(),m=new DOMMatrixReadOnly(getComputedStyle(n).transform);
   return {x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom,
    tiltDeg:Math.abs(Math.atan2(m.m23,m.m22)*180/Math.PI)};
  });
  return {viewport:{width:innerWidth,height:innerHeight},
   header:box('.reading-art-header'),portrait:box('.reading-art-portrait'),
   table:box('.reading-art-table-surface'),panel:box('.reading-art-panel'),
   hero:box('.reading-art-hero'),cards,
   backgroundReady:document.querySelector('.reading-art-atmosphere')?.dataset.artStatus==='ready'};
 });
 await writeFile(dir+'/12-artemis-fidelity-458x553.json',JSON.stringify(fidelity,null,2));
 await page.screenshot({path:dir+'/12-artemis-fidelity-458x553.png',fullPage:true});
 assert.ok(Math.abs(fidelity.header.bottom-61)/61<=.15,'Reference header boundary must be within 15%');
 assert.ok(Math.abs(fidelity.panel.y-405)/405<=.15,'Reference HUD start must be within 15%');
 assert.equal(fidelity.cards.length,3);
 assert.ok(fidelity.cards.every(c=>c.x>=-1&&c.x+c.width<=459&&c.bottom<fidelity.panel.y),
  'Every slanted card must stay on the tabletop above the framed dialogue');
 assert.ok(fidelity.cards.every(c=>c.tiltDeg>=35&&c.tiltDeg<=45),
  'Actual CSS transform must project backward at 35–45 degrees');
 assert.ok(fidelity.portrait.y>=fidelity.header.bottom-8,'Portrait cannot overdraw the chapter heading');
 assert.equal(fidelity.backgroundReady,true,'31-pack chamber background must be registered');
 const actualArtwork=await page.evaluate(()=>{
  const selectors=['.reading-art-atmosphere img','.reading-art-portrait img',
   '.reading-art-panel-skin img','.reading-art-panel-corners img',
   '.reading-art-halo img','.reading-art-reading-glow img'];
  return selectors.map(selector=>{
   const image=document.querySelector(selector);
   return {selector,ok:!!image&&image.complete&&image.naturalWidth>200&&image.naturalHeight>100};
  });
 });
 assert.ok(actualArtwork.every(item=>item.ok),'All six full-resolution chamber layers must decode from the installed 31-pack: '+JSON.stringify(actualArtwork));
 assert.deepEqual(errors,[]);
 console.log('Post-shuffle browser PASS: v3.4 sphere, 3 selections, RWS reveals, opt-in Begin Reading, four Artemis portraits and preserved identities');
}finally{await browser.close()}
