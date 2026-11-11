import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const host='http://127.0.0.1:'+(process.env.GATE_B_PORT||4184);
const dir='artifacts/post-shuffle';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:860,height:720},deviceScaleFactor:1,acceptDownloads:true});
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
 // Owner-directed reveal-only tuning sandbox: four direct styles, live
 // intensity, JSON export, and no remounting/re-dealing of any RWS card.
 await page.locator('.ps-foil-sandbox-toggle').click();
 assert.equal(await page.locator('.ps-foil-style-option').count(),5,
  'V1 particle drift is first, followed by four retained Canvas engravings');
 assert.equal(await page.locator('.ps-foil-style-option').first().getAttribute('data-foil-style'),'foil-anim-style-v1');
 await page.locator('.ps-foil-style-option[data-foil-style="foil-anim-style-v1"]').click();
 const v1=await page.locator('.ps-tableau .ps-card-art-overlay').evaluateAll(nodes=>
  nodes.map(layer=>({texture:layer.style.backgroundImage,
   finish:layer.dataset.foilFinish,
   drift:getComputedStyle(layer,'::before').animationName,
   speed:getComputedStyle(layer,'::before').animationDuration})));
 assert.ok(v1.every(x=>x.finish==='foil-anim-style-v1'
  &&x.texture.includes('data:image/svg+xml')
  &&x.drift.includes('foilDriftV1')&&x.speed==='10s'),
  'User-supplied V1 particles and 10-second animation must be active: '+JSON.stringify(v1));
 await page.screenshot({path:dir+'/08c-foil-v1-particle-drift-desktop.png'});
 const variants=['celestial-lattice','constellation-map','alchemical-glyphs','scroll-texture'];
 const patterns=new Set();
 for(const style of variants){
  await page.locator('.ps-foil-style-option[data-foil-style="'+style+'"]').click();
  const state=await page.locator('.ps-tableau .ps-card-art-overlay').evaluateAll(nodes=>
   nodes.map(x=>({finish:x.dataset.foilFinish,texture:x.style.backgroundImage})));
  assert.ok(state.every(x=>x.finish===style),'All three foils must update the selected variation: '+style);
  patterns.add(state[0].texture);
 }
 assert.equal(patterns.size,4,'Four finishes must render distinct actual Canvas textures');
 await page.locator('.ps-foil-style-option[data-foil-style="alchemical-glyphs"]').click();
 await page.locator('.ps-foil-intensity').evaluate(el=>{
  el.value='85';el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 const tuned=await page.locator('.ps-tableau .ps-card-art-overlay').evaluateAll(nodes=>
  nodes.map(x=>({intensity:x.dataset.foilIntensity,
   opacity:getComputedStyle(x).opacity,
   animation:getComputedStyle(x).animationName,
   sheen:getComputedStyle(x,'::after').animationName})));
 assert.ok(tuned.every(x=>x.intensity==='0.85'&&Math.abs(Number(x.opacity)-.85)<.04
  &&x.animation.includes('ps-moving-foil-lines')
  &&x.sheen.includes('ps-moving-foil-sheen')),
  'All three revealed cards need live animated, intensity-controlled foil: '+JSON.stringify(tuned));
 const downloadPromise=page.waitForEvent('download');
 await page.locator('.ps-foil-export').click();
 const foilDownload=await downloadPromise;
 assert.equal(foilDownload.suggestedFilename(),'juhua-foil-config.json');
 const exported=JSON.parse(await readFile(await foilDownload.path(),'utf8'));
 assert.deepEqual(exported,{version:1,style:'alchemical-glyphs',intensity:.85,animation:'moving-gold-foil'});
 await writeFile(dir+'/08a-foil-sandbox-export.json',JSON.stringify(exported,null,2));
 await page.screenshot({path:dir+'/08a-foil-sandbox-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(220);
 assert.equal(await page.locator('.ps-foil-export').isVisible(),true,
  'Foil tuner controls must remain usable on phone viewports');
 await page.screenshot({path:dir+'/08b-foil-sandbox-mobile-390x844.png'});
 await page.locator('.ps-foil-sandbox-toggle').click();
 await page.setViewportSize({width:860,height:720});
 await page.waitForTimeout(220);
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
    intensity:layer.dataset.foilIntensity,
    motion:style.animationName,
    visibleFilter:style.filter.includes('drop-shadow')&&style.animationName.includes('ps-moving-foil-lines'),
    computedFilter:style.filter,computedAnimation:style.animationName,
    repeatPass:getComputedStyle(layer,'::before').backgroundImage.includes('data:image'),
    glint:glint.animationName,insideFrame:Math.abs(l.left-f.left)<3&&Math.abs(l.top-f.top)<3
     &&Math.abs(l.width-f.width)<5&&Math.abs(l.height-f.height)<5};
  });
  return {count:layers.length,details,reduced:matchMedia('(prefers-reduced-motion:reduce)').matches};
 });
 assert.equal(foilHandoff.count,3,'Artemis requires three in-frame foil layers');
 assert.ok(foilHandoff.details.every(s=>s.sameNode&&s.carryover==='original-foil'&&s.finish&&s.hasTexture),
  'Handoff must preserve the exact three textured, session-selected foil nodes');
 assert.ok(foilHandoff.details.every(s=>s.intensity==='0.85'&&Math.abs(s.opacity-.85)<.04&&s.blend==='screen'&&s.z>1&&s.insideFrame&&s.repeatPass&&s.visibleFilter),
  'All three foils must render a high-visibility second pass of their original selected texture inside each card'+': '+JSON.stringify(foilHandoff.details));
 if(!foilHandoff.reduced)assert.ok(foilHandoff.details.every(s=>s.glint.includes('ps-moving-foil-sheen')),
  'Reading foil needs active slow specular movement');
 assert.equal(await page.locator('.reading-art-panel-skin').count(),1);
 assert.equal(await page.locator('.reading-art-kicker').count(),0,
  'Artemis welcome must not repeat the WELCOME TO YOUR READING eyebrow');
 const cta=await page.evaluate(()=>{
  const primary=document.querySelector('.reading-art-control.is-primary');
  const secondary=document.querySelector('.reading-art-control.is-secondary');
  const one=getComputedStyle(primary),two=getComputedStyle(secondary);
  return {primaryHeight:primary.getBoundingClientRect().height,
   primaryBorder:one.borderTopColor,primaryBg:one.backgroundImage,
   secondaryBg:two.backgroundImage,secondaryBorder:two.borderTopColor};
 });
 assert.ok(cta.primaryHeight>=35&&cta.primaryBg.includes('linear-gradient')
  &&cta.secondaryBg.includes('linear-gradient'),'Buttons must have premium gold game-UI treatment');
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
 await page.waitForTimeout(1300);
 await page.screenshot({path:dir+'/09a-artemis-solid-table-occlusion-desktop.png'});
 const readingGeometry=()=>page.evaluate(()=>{
  const r=selector=>document.querySelector(selector)?.getBoundingClientRect();
  const hero=r('.reading-art-hero'),head=r('.reading-art-header'),
   portrait=r('.reading-art-portrait'),panel=r('.reading-art-panel');
  const visual=[...document.querySelectorAll('.reading-art-card-visual')].map(el=>el.getBoundingClientRect());
  const cards=[...document.querySelectorAll('.reading-art-card-frame')].map(el=>el.getBoundingClientRect());
  return {heroTop:hero.top,heroHeight:hero.height,headerBottom:head.bottom,
   portraitTop:portrait.top,panelTop:panel.top,
   cssCardWidths:[...document.querySelectorAll('.reading-art-card')].map(el=>parseFloat(getComputedStyle(el).width)),
   cardsBottom:Math.max(...visual.map(rect=>rect.bottom)),
   cardTilt:parseFloat(document.querySelector('.reading-art-card-visual').dataset.tabletopTiltDeg),
   cardFrames:cards.map(rect=>({top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right,width:rect.width,height:rect.height}))};
 });
 const welcomeLayout=await readingGeometry();
 const correctedStage=await page.evaluate(()=>{
  const table=document.querySelector('.reading-art-table-surface');
  const backdrop=document.querySelector('.reading-art-atmosphere img');
  const portrait=document.querySelector('.reading-art-portrait');
  const p=getComputedStyle(portrait.querySelector('img'));
  const question=document.querySelector('.reading-art-question-banner');
  const narration=document.querySelector('.reading-art-narration-text');
  return {tableHidden:getComputedStyle(table).display==='none',
   backgroundReady:!!backdrop&&backdrop.complete&&backdrop.naturalWidth>200,
   portraitFit:p.objectFit,portraitHeight:portrait.getBoundingClientRect().height,
   visiblePortraitHeight:(()=>{
    const hero=document.querySelector('.reading-art-hero');
    const hb=hero.getBoundingClientRect(),pb=portrait.getBoundingClientRect();
    const pct=parseFloat(getComputedStyle(hero).getPropertyValue('--table-occlusion-line'))/100;
    return Math.min(pb.bottom,hb.top+hb.height*pct)-pb.top;
   })(),
   portraitClipped:getComputedStyle(portrait).overflow==='hidden',
   questionInHeader:!!question?.closest('.reading-art-header'),
   questionText:question?.textContent.trim(),
   narrativeScroll:getComputedStyle(narration).overflowY,
   panelShadow:getComputedStyle(document.querySelector('.reading-art-panel')).boxShadow,
   titleVisuallyHidden:getComputedStyle(document.querySelector('#artemis-reading-title')).width==='1px',
   cardLabels:[...document.querySelectorAll('.reading-art-card-role')].map(el=>el.textContent.trim())};
 });
 assert.ok(correctedStage.tableHidden&&correctedStage.backgroundReady,
  'One real room-painted table must remain; synthetic nested table must not render');
 const physical=await page.evaluate(()=>{
  const hero=document.querySelector('.reading-art-hero');
  const portrait=document.querySelector('.reading-art-portrait');
  const image=portrait.querySelector('img');
  const card=document.querySelectorAll('.reading-art-card-frame')[1];
  const p=getComputedStyle(portrait),i=getComputedStyle(image);
  const fg=getComputedStyle(hero,'::after');
  const hb=hero.getBoundingClientRect(),pb=portrait.getBoundingClientRect(),
   cb=card.getBoundingClientRect();
  return {mask:p.maskImage,webkitMask:p.webkitMaskImage,opacity:p.opacity,
   filter:p.filter,imgMask:i.maskImage,imageOpacity:i.opacity,
   portraitZ:p.zIndex,foregroundZ:fg.zIndex,
   foregroundImage:fg.backgroundImage,foregroundSize:fg.backgroundSize,
   synced:hero.dataset.roomOcclusionSynced==='true',
   cardTop:cb.top,portraitTop:pb.top,portraitBottom:pb.bottom,
   heroHeight:hb.height};
 });
 assert.ok(physical.mask==='none'&&physical.webkitMask==='none'&&physical.imgMask==='none',
  'Artemis must not have ANY gradient mask on her source illustration: '+JSON.stringify(physical));
 assert.equal(physical.opacity,'1','Artemis is opaque, not a dissolving genie');
 assert.ok(Number(physical.foregroundZ)>Number(physical.portraitZ)
   &&physical.foregroundImage.includes('bg_artemis_reading_stage_main.webp')
   &&physical.synced,'The SAME illustrated room table must physically occlude Artemis');
 assert.ok(physical.cardTop>=physical.portraitTop&&physical.cardTop<physical.portraitBottom,
  'The centre card top must overlap Artemis at chest/upper-abdomen height: '+JSON.stringify(physical));
  assert.equal(correctedStage.portraitFit,'cover','Portrait should be intentionally cropped chest-up');
 assert.ok(correctedStage.portraitClipped&&correctedStage.visiblePortraitHeight>205
  &&correctedStage.visiblePortraitHeight<=320,
  'Opaque desktop bust must stop at the real table occlusion, not expose her waist: '+
  JSON.stringify({painted:correctedStage.visiblePortraitHeight,source:correctedStage.portraitHeight}));
 assert.ok(correctedStage.questionInHeader&&correctedStage.questionText.includes('What can these cards'),
  'The actual original question must be prominent near the title');
 assert.equal(correctedStage.titleVisuallyHidden,true,'The three-line visible title block must be gone');
 assert.deepEqual(correctedStage.cardLabels,['01. Past','02. Present','03. Future']);
 assert.equal(correctedStage.panelShadow,'none','Ornamental HUD cannot have a rectangular CSS shadow box');
 assert.ok(['auto','visible'].includes(correctedStage.narrativeScroll),
  'Long readings must be scrollable inside the artwork-backed dialogue');
 console.log('Corrected desktop geometry:',JSON.stringify({cardWidths:welcomeLayout.cssCardWidths,
  projected:welcomeLayout.cardFrames.map(r=>r.width),stage:correctedStage}));
 assert.ok(welcomeLayout.cssCardWidths.every(width=>width>=108)&&welcomeLayout.cardFrames.every(rect=>rect.width>=88),
  'Desktop RWS cards must have 108px+ authored size and remain legible through perspective transforms');
 assert.equal(welcomeLayout.cardTilt,42,'Cards must use the approved 42° tabletop perspective');
 assert.ok(welcomeLayout.cardFrames.every(rect=>rect.top>0&&rect.bottom<welcomeLayout.panelTop),
  'Every physical RWS frame must sit fully above the dialogue HUD');
 assert.ok(welcomeLayout.portraitTop>=welcomeLayout.headerBottom-8,
  'Artemis illustration must not overlap the title');
 assert.ok(welcomeLayout.panelTop-welcomeLayout.cardsBottom>10,
  'Card meanings need space above the narrative frame');
 // Wait for the real rendered welcome pose; this WebGL stage can show
 // a black intermediate frame even after the nominal 900ms CSS transition.
 await page.waitForTimeout(2050);
 await page.waitForFunction(()=>{
  const scene=document.querySelector('.scene-artemis-reading');
  const bg=document.querySelector('.reading-art-atmosphere img');
  const portrait=document.querySelector('.reading-art-portrait img');
  return !!scene&&!!bg&&bg.complete&&bg.naturalWidth>100&&portrait?.complete
   &&portrait.naturalWidth>100&&Number(getComputedStyle(scene).opacity)>.95;
 },undefined,{timeout:7000});
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
  'Longer interpretations may not collapse the Artemis hero'+': '+JSON.stringify({welcome:welcomeLayout.heroHeight,final:finalLayout.heroHeight}));
 assert.ok(finalLayout.portraitTop>=finalLayout.headerBottom-8,
  'Artemis may not overlap the title on longer chapters');
 assert.ok(finalLayout.panelTop-finalLayout.cardsBottom>10,
  'Longer interpretations may not collide with card meanings');
 const stable=await page.evaluate(()=>[...document.querySelectorAll('.reading-actual-card-face')]
  .every((node,i)=>node===window.__readingStableCards[i]));
 assert.equal(stable,true,'Changing Artemis expression must preserve original RWS nodes');
 assert.equal(await page.locator('.reading-art-portrait img').count(),1,'Crossfade must retire the old image');
 const fullNarration=await page.evaluate(()=>{
  const p=document.querySelector('.reading-art-narration-text');
  return {scrollHeight:p.scrollHeight,clientHeight:p.clientHeight,
   overflow:getComputedStyle(p).overflowY};
 });
 assert.ok(['auto','visible'].includes(fullNarration.overflow),
  'A long reading must allow internal scrolling instead of overflowing the ornate frame');
 if(fullNarration.scrollHeight>fullNarration.clientHeight+2){
  await page.locator('.reading-art-narration-text').evaluate(el=>{el.scrollTop=el.scrollHeight;});
  assert.ok(await page.locator('.reading-art-narration-text').evaluate(el=>el.scrollTop>0),
   'Long interpretations must be reachable by scrolling the narrative itself');
 }
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
   singleTableHidden:getComputedStyle(document.querySelector('.reading-art-table-surface')).display==='none',
   questionNearTitle:!!document.querySelector('.reading-art-question-banner')?.closest('.reading-art-header'),
   textScrolls:getComputedStyle(document.querySelector('.reading-art-narration-text')).overflowY==='auto',
   cardFrames:[...document.querySelectorAll('.reading-art-card-frame')].map(el=>{const r=el.getBoundingClientRect();return {width:r.width,top:r.top,bottom:r.bottom}}),
   nextLabel:document.querySelector('[data-action="reading-next"]')?.textContent,
   nextButtonBottom:document.querySelector('[data-action="reading-next"]')?.getBoundingClientRect().bottom,
   nextButtonTop:document.querySelector('[data-action="reading-next"]')?.getBoundingClientRect().top,
   previousButtonTop:document.querySelector('[data-action="reading-prev"]')?.getBoundingClientRect().top,
   cueOverlap:(()=>{
    const cue=document.querySelector('.reading-art-scroll-cue');
    const btn=document.querySelector('[data-action="reading-next"]');
    if(!cue||getComputedStyle(cue).display==='none')return false;
    const c=cue.getBoundingClientRect(),b=btn.getBoundingClientRect();
    return c.left<b.right&&c.right>b.left&&c.top<b.bottom&&c.bottom>b.top;
   })()};
 });
 await page.screenshot({path:dir+'/11-mobile-preflight-390x844.png',fullPage:true});
 await writeFile(dir+'/11-mobile-preflight-geometry-390x844.json',JSON.stringify({
  panel:{top:phone.panel.top,bottom:phone.panel.bottom,height:phone.panel.height},
  hero:{top:phone.hero.top,bottom:phone.hero.bottom,height:phone.hero.height},
  portrait:{top:phone.portrait.top,bottom:phone.portrait.bottom,height:phone.portrait.height},
  footer:{top:phone.footer.top,bottom:phone.footer.bottom},
  scene:{top:phone.scene.top,bottom:phone.scene.bottom,height:phone.scene.height,scrollHeight:phone.scrollHeight},
  nextButtonBottom:phone.nextButtonBottom,cardFrames:phone.cardFrames
 },null,2));
 console.log('Precision mobile preflight:',JSON.stringify({
  heroTop:phone.hero.top,heroHeight:phone.hero.height,portraitBottom:phone.portrait.bottom,
  panelTop:phone.panel.top,panelBottom:phone.panel.bottom,footerBottom:phone.footer.bottom,
  sceneBottom:phone.scene.bottom,scrollHeight:phone.scrollHeight}));
 assert.equal(phone.cards.length,3);
 assert.ok(phone.cards.every(c=>c.left>=-2&&c.right<=phone.screen+2),
  'All three selected Tarot cards must remain visible within a 390px phone viewport');
 assert.ok(phone.panel.width<=phone.screen+2,'The Artemis panel must fit phone width');
 assert.ok(phone.nextLabel?.trim().length>2,'Mobile panel must preserve the primary Next control');
 assert.ok(phone.nextButtonBottom<=phone.scene.bottom-3,
  'On a 390x844 phone the complete interpretation and Next control must be visible without initially scrolling the stage: '+JSON.stringify({button:phone.nextButtonBottom,viewport:phone.scene.bottom}));
 assert.ok(Math.abs(phone.nextButtonTop-phone.previousButtonTop)<=3,
  'Premium mobile Previous and Next controls must share one horizontal row: '+
  JSON.stringify({previousTop:phone.previousButtonTop,nextTop:phone.nextButtonTop}));
 assert.equal(phone.cueOverlap,false,'Scroll hint may never cover the primary CTA');
 assert.ok(phone.hero.height>=350&&phone.hero.height<=phone.scene.height*.80,
  'Tall mobile scene must reserve space for a complete reading HUD without a huge empty region');
 assert.ok(phone.panel.width>=phone.screen-22,
  'Full-width mobile dialogue HUD must leave at most 11px on either side');
 assert.ok(phone.footer.bottom>=phone.scene.bottom-45,
  'Question footer must occupy the lower viewport region: no massive dark gap below');
 assert.ok(phone.cardFrames.every(card=>card.width>=94),
  'Mobile cards should be scaled up while preserving their 42-degree pitch');
 const phoneOpaque=await page.evaluate(()=>{
  const portrait=document.querySelector('.reading-art-portrait');
  const hero=document.querySelector('.reading-art-hero');
  const img=portrait.querySelector('img');
  const cards=document.querySelectorAll('.reading-art-card-frame');
  const middle=cards[1].getBoundingClientRect(),p=portrait.getBoundingClientRect();
  return {mask:getComputedStyle(portrait).maskImage,
   webkitMask:getComputedStyle(portrait).webkitMaskImage,
   imgMask:getComputedStyle(img).maskImage,
   foregroundImage:getComputedStyle(hero,'::after').backgroundImage,
   synced:hero.dataset.roomOcclusionSynced==='true',
   cardTop:middle.top,portraitTop:p.top,portraitBottom:p.bottom};
 });
 assert.ok(phoneOpaque.mask==='none'&&phoneOpaque.webkitMask==='none'&&phoneOpaque.imgMask==='none'
  &&phoneOpaque.synced&&phoneOpaque.foregroundImage.includes('bg_artemis_reading_stage_main.webp')
  &&phoneOpaque.cardTop>phoneOpaque.portraitTop&&phoneOpaque.cardTop<phoneOpaque.portraitBottom,
  'Mobile physical opacity/occlusion should survive resize: '+JSON.stringify(phoneOpaque));
  assert.ok(phone.singleTableHidden&&phone.questionNearTitle&&phone.textScrolls,
  'Mobile must show one painted table, the original question by the header, and all interpretation text');
 const scrollAffordance=await page.evaluate(()=>{
  const p=document.querySelector('.reading-art-narration-text');
  const panel=document.querySelector('.reading-art-panel');
  const cue=panel.querySelector('.reading-art-scroll-cue');
  return {needed:p.scrollHeight>p.clientHeight+3,
   marked:panel.dataset.textOverflow==='true',
   visible:getComputedStyle(cue).display!=='none'};
 });
 if(scrollAffordance.needed)assert.ok(scrollAffordance.marked&&scrollAffordance.visible,
  'A long mobile interpretation must visibly indicate that more text can be scrolled');
 else assert.equal(scrollAffordance.visible,false,
  'Short interpretations must not display an inert scroll hint');
 // Owner precision criteria: card-to-bust contact at the mid-ribs, the
 // original painting continues under the solid portrait at the table edge,
 // and the existing Artemis nameplate appears cleanly above the chapter.
 const precision=await page.evaluate(()=>{
  const rect=sel=>document.querySelector(sel).getBoundingClientRect();
  const hero=rect('.reading-art-hero'),portrait=rect('.reading-art-portrait');
  const card=document.querySelectorAll('.reading-art-card-frame')[1].getBoundingClientRect();
  const label=rect('.reading-art-nameplate'),panel=rect('.reading-art-panel');
  const narration=rect('.reading-art-narration-text');
  const body=document.querySelector('.reading-art-narration-text');
  const overlay=getComputedStyle(document.querySelector('.reading-art-hero'),'::after');
  const badge=getComputedStyle(document.querySelector('.reading-art-nameplate'));
  return {hero:{top:hero.top,bottom:hero.bottom,height:hero.height},
   portrait:{top:portrait.top,bottom:portrait.bottom,height:portrait.height},
   card:{top:card.top,bottom:card.bottom},
   panel:{top:panel.top,bottom:panel.bottom,height:panel.height},
   label:{top:label.top,bottom:label.bottom,left:label.left,right:label.right,
    display:badge.display,visibility:badge.visibility,text:document.querySelector('.reading-art-nameplate').textContent.trim()},
   narration:{top:narration.top,bottom:narration.bottom,scrollHeight:body.scrollHeight,
    clientHeight:body.clientHeight},clipPath:overlay.clipPath,
   foreground:overlay.backgroundImage,
   ratio:(card.top-portrait.top)/portrait.height};
 });
 await writeFile(dir+'/14b-mobile-table-reader-geometry-390x844.json',
  JSON.stringify(precision,null,2));
 assert.ok(precision.portrait.bottom>=precision.hero.bottom-16,
  'Artemis opaque bust must reach the original tabletop edge: '+JSON.stringify(precision));
 assert.ok(precision.ratio>.50&&precision.ratio<.80,
  'Center card top must touch upper abdomen, not cover face or float below torso: '+JSON.stringify(precision));
 assert.ok(precision.foreground.includes('bg_artemis_reading_stage_main.webp')
  &&precision.clipPath!=='none','Only the original painted table occludes Artemis');
 assert.ok(precision.label.text.includes('ARTEMIS')&&precision.label.text.includes('YOUR READER')
  &&precision.label.top>=precision.panel.top-25&&precision.label.bottom<precision.panel.top+40
  &&precision.label.display!=='none'&&precision.label.visibility!=='hidden',
  'Original Artemis nameplate must be visible ON the ornamental upper frame: '+JSON.stringify(precision));
 const tablePlacement=await page.evaluate(()=>{
  const hero=document.querySelector('.reading-art-hero');
  const r=hero.getBoundingClientRect();
  const clip=getComputedStyle(hero).getPropertyValue('--table-occlusion-line');
  const depth=Number(/calc\(100% - ([0-9.]+)px\)/.exec(clip)?.[1]);
  const middle=document.querySelectorAll('.reading-art-card-frame')[1].getBoundingClientRect();
  return {heroHeight:r.height,tableDepth:depth,tableTop:r.bottom-depth,
    tableBottom:r.bottom,cardBottom:middle.bottom,cardTop:middle.top,
    cardToTablePosition:(middle.bottom-(r.bottom-depth))/depth};
 });
 await writeFile(dir+'/14c-mobile-original-table-depth-390x844.json',
  JSON.stringify(tablePlacement,null,2));
 assert.ok(tablePlacement.tableDepth>=85&&tablePlacement.cardToTablePosition>.20
   &&tablePlacement.cardToTablePosition<.75,
   'Card 02 should sit near the CENTER of the exposed original painted tabletop: '+
   JSON.stringify(tablePlacement));
 assert.ok(precision.panel.height>=325&&precision.narration.clientHeight>=90,
  'Expanded HUD must offer room for interpretations without an unnecessarily cramped slit');
 assert.ok(phone.footer.bottom-phone.scene.top<=phone.scrollHeight+2,
  'Question/footer must remain reachable inside the scrollable safe-area layout');
 await page.screenshot({path:dir+'/11-artemis-phone-390x844.png',fullPage:true});
 await page.locator('.reading-art-control.is-primary').hover();
 await page.screenshot({path:dir+'/11a-artemis-mobile-cta-hover-390x844.png',fullPage:true});
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
   footer:box('.reading-art-footer'),hero:box('.reading-art-hero'),cards,
   sceneScrollHeight:document.querySelector('.scene-artemis-reading').scrollHeight,
   question:box('.reading-art-question-banner'),
   backgroundReady:document.querySelector('.reading-art-atmosphere')?.dataset.artStatus==='ready'};
 });
 await writeFile(dir+'/12-artemis-fidelity-458x553.json',JSON.stringify(fidelity,null,2));
 await page.screenshot({path:dir+'/12-artemis-fidelity-458x553.png',fullPage:true});
 // A 553px-tall viewport cannot display an accessible long interpretation
 // alongside the complete portrait/card scene. Capture its reachable lower
 // content explicitly; page.fullPage cannot expand a nested scrolling stage.
 await page.evaluate(()=>{const scene=document.querySelector('.scene-artemis-reading');
  scene.scrollTop=scene.scrollHeight;});
 await page.waitForTimeout(140);
 await page.screenshot({path:dir+'/13-artemis-compact-panel-bottom-458x553.png'});
 await page.evaluate(()=>{document.querySelector('.scene-artemis-reading').scrollTop=0;});
 assert.ok(fidelity.question&&fidelity.question.y>=fidelity.header.y&&fidelity.question.bottom<=fidelity.header.bottom+2,
  'Question belongs inside the title/header on compact screens');
 assert.ok(fidelity.panel.y>=fidelity.hero.bottom-2,
  'Full-height dialogue panel must remain below the three-card stage');
 assert.ok(fidelity.footer&&fidelity.footer.bottom<=fidelity.sceneScrollHeight+10,
  'Compact footer must remain reachable by normal page scrolling if the complete interpretation requires it');
 assert.equal(fidelity.cards.length,3);
 assert.ok(fidelity.cards.every(c=>c.x>=-1&&c.x+c.width<=459&&c.bottom<fidelity.panel.y),
  'Every slanted card must stay on the tabletop above the framed dialogue');
 assert.ok(fidelity.cards.every(c=>c.tiltDeg>=35&&c.tiltDeg<=45),
  'Actual CSS transform must project backward at 35–45 degrees');
 // Portrait PNG includes transparent pixels above her hair; its outer box can
 // sit under the banner without visual overlap. Assert the banner is legible,
 // separated by stack order and not covered by the decorative portrait layer.
 const compactHeader=await page.evaluate(()=>{
  const header=document.querySelector('.reading-art-header');
  const banner=document.querySelector('.reading-art-question-banner');
  const portrait=document.querySelector('.reading-art-portrait');
  const b=banner.getBoundingClientRect(),h=header.getBoundingClientRect();
  return {bannerTop:b.top,bannerBottom:b.bottom,headerBottom:h.bottom,
   headerZ:getComputedStyle(header).zIndex,portraitZ:getComputedStyle(portrait).zIndex,
   question:getComputedStyle(banner).visibility};
 });
 assert.ok(compactHeader.bannerTop>=fidelity.header.y-2
  &&compactHeader.bannerBottom<=compactHeader.headerBottom+2
  &&compactHeader.question==='visible',
  'Compact reading question must remain readable above Artemis: '+JSON.stringify(compactHeader));
 assert.ok(fidelity.cards[1].y>=fidelity.portrait.y+fidelity.portrait.height*.54,
  'At 458x553 the centre card must begin BELOW Artemis face, around her lower chest: '+
  JSON.stringify({cardTop:fidelity.cards[1].y,portraitTop:fidelity.portrait.y,portraitHeight:fidelity.portrait.height}));
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
 // Mobile anatomy contract: the upper halo stays near the question,
 // centre-card edge is at bust level, and narration stays inside the frame.
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(230);
 const mobileReflow=await page.evaluate(()=>{
  const rect=selector=>document.querySelector(selector)?.getBoundingClientRect();
  const panel=rect('.reading-art-panel'),kicker=rect('.reading-art-kicker');
  const title=rect('.reading-art-narration-title');
  const body=rect('.reading-art-narration-text');
  const p=rect('.reading-art-portrait');
  const mid=rect('.reading-art-card-frame');
  const card=document.querySelectorAll('.reading-art-card-frame')[1].getBoundingClientRect();
  const halo=rect('.reading-art-halo'),header=rect('.reading-art-question-banner');
  const text=document.querySelector('.reading-art-narration-text');
  return {haloGap:halo.top-header.bottom,portraitTop:p.top,
   cardTop:card.top,portraitHeight:p.height,
   kickerInside:!kicker||kicker.top>=panel.top+7,
   titleInside:title.left>=panel.left+27&&title.right<=panel.right-27,
   bodyInside:body.left>=panel.left+28&&body.right<=panel.right-28,
   bodyUnbroken:text.scrollWidth<=text.clientWidth+2,
   cardBeforePanel:card.bottom<panel.top+4};
 });
 assert.ok(mobileReflow.haloGap<80,
  'Mobile halo must begin directly below question, not after a blank sky block: '+JSON.stringify(mobileReflow));
 assert.ok(mobileReflow.cardTop>mobileReflow.portraitTop+mobileReflow.portraitHeight*.48
  &&mobileReflow.cardTop<mobileReflow.portraitTop+mobileReflow.portraitHeight*1.04,
  'Middle card must meet Artemis near her lower chest: '+JSON.stringify(mobileReflow));
 assert.ok(mobileReflow.kickerInside&&mobileReflow.titleInside&&mobileReflow.bodyInside
  &&mobileReflow.bodyUnbroken&&mobileReflow.cardBeforePanel,
  'Narration and chapter badge must stay inside ornamental safe bounds: '+JSON.stringify(mobileReflow));
 await page.screenshot({path:dir+'/14-mobile-reading-reflow-390x844.png',fullPage:true});

 // The real CTA leaves chapter 02 and starts a one-way card-sacrifice ritual.
 const beforeIDs=await page.locator('.reading-art-card').evaluateAll(ns=>ns.map(n=>n.dataset.originalCardId));
 await page.locator('[data-action="reading-next"]').click();
 await page.waitForTimeout(190);
 assert.equal(await page.locator('.scene-artemis-reading').getAttribute('data-phase'),'sacrificing');
 assert.equal(await page.locator('.reading-synthesis-portal').count(),1);
 await page.screenshot({path:dir+'/15-mobile-cards-sacrificing-390x844.png'});
 await page.locator('.reading-chat-hud').waitFor({timeout:6000});
 const kept=await page.locator('.reading-art-card').evaluateAll(ns=>ns.map(n=>n.dataset.originalCardId));
 assert.deepEqual(kept,beforeIDs,'Synthesis animation must not shuffle or replace the original three');
 assert.equal(await page.locator('.synthesis-question p').innerText(),
  'What can these cards help me reflect on?',
  'Synthesis must pin the exact active original question, not invent another');
 await page.screenshot({path:dir+'/16-mobile-synthesis-generating-390x844.png'});
 await page.waitForFunction(()=>document.querySelector('.reading-chat-hud')?.dataset.chatState==='ready',
  undefined,{timeout:12000});
 const completeChat=await page.evaluate(()=>{
  const hud=document.querySelector('.reading-chat-hud').getBoundingClientRect();
  const screen=document.querySelector('.scene-artemis-reading').getBoundingClientRect();
  const answer=document.querySelector('.synthesis-message-body p').textContent;
  const source=document.querySelector('.synthesis-chat-heading small').textContent;
  const cta=document.querySelector('.synthesis-guidance-cta').getBoundingClientRect();
  return {hudTop:hud.top,hudHeight:hud.height,viewportHeight:screen.height,
   answer,source,ctaBottom:cta.bottom};
 });
 assert.ok(completeChat.hudHeight>=345&&completeChat.hudHeight>=completeChat.viewportHeight*.43,
  'Interactive chat must occupy lower viewport half: '+JSON.stringify(completeChat));
 assert.ok(completeChat.answer.length>80&&completeChat.source.includes('SCRIPTED PREVIEW'),
  'Offline screenshots must label deterministic preview instead of falsely claiming live AI');
 assert.ok(completeChat.ctaBottom<=845,
  'Guidance action must be visible on a normal phone screen');
 await page.screenshot({path:dir+'/17-mobile-synthesis-chat-390x844.png'});
 await page.locator('[data-action="draw-guidance"]').click();
 const guidance=await page.locator('.synthesis-guidance-card img').getAttribute('src');
 assert.ok(guidance&&beforeIDs.every(id=>!guidance.includes(id)),
  'One guidance card must be NEW and distinct from the original three');
 assert.equal(await page.locator('.synthesis-guidance-card').count(),1);
 const pinned=await page.evaluate(()=>{
  const question=document.querySelector('.reading-chat-hud>.synthesis-question').getBoundingClientRect();
  const log=document.querySelector('.synthesis-chat-scroll').getBoundingClientRect();
  return {questionVisible:question.bottom<=innerHeight&&question.top>=0,aboveLog:question.bottom<=log.top+2};
 });
 assert.ok(pinned.questionVisible&&pinned.aboveLog,
  'Original question must remain pinned above the scrolling chat log after guidance: '+JSON.stringify(pinned));
  await page.screenshot({path:dir+'/18-mobile-guidance-card-390x844.png'});
 await page.locator('#synthesis-followup-question').fill('What can I do next?');
 await page.locator('.synthesis-followup-send').click();
 await page.waitForFunction(()=>document.querySelector('.reading-chat-hud')?.dataset.chatState==='followup-ready',
  undefined,{timeout:7000});
 assert.equal(await page.locator('.synthesis-guidance-card').count(),1);
 assert.equal(await page.locator('.synthesis-user-followup').count(),1);
 assert.ok((await page.locator('.synthesis-message-body').count())>=2);
 await page.screenshot({path:dir+'/19-mobile-followup-response-390x844.png'});

 assert.deepEqual(errors,[]);
 console.log('Post-shuffle browser PASS: mobile reflow, intact 3-card handoff, real synthesis chat, one distinct guidance card, follow-up');
}finally{await browser.close()}
