import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {SYNTHESIS_TRANSITION_MS,ARTEMIS_CHAT_AVATARS,SYNTHESIS_ART}
 from '../preview/post-shuffle/ArtemisSynthesisAssets.mjs';

const host='http://127.0.0.1:'+(process.env.GATE_B_PORT||4184);
const path='artifacts/artemis-synthesis-remake';
await mkdir(path,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
try{
 await page.goto(host+'/preview/post-shuffle/?skip=selection',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__POST_SHUFFLE__?.ready(),null,{timeout:20000});
 const chosen=[];
 for(let i=0;i<3;i++){
  let success=false;
  for(let j=0;j<55&&!success;j++){
   const pick=await page.evaluate((attempt)=>{
    const candidates=window.__POST_SHUFFLE__.visible().filter(c=>
     c.side===0&&!c.selected&&c.x>25&&c.x<innerWidth-25&&c.y>75&&c.y<innerHeight-70);
    candidates.sort((a,b)=>a.depth-b.depth);
    return candidates[(attempt*3)%Math.max(1,candidates.length)]||null;
   },j);
   if(!pick)throw Error('No card to select');
   await page.mouse.click(pick.x,pick.y);await page.waitForTimeout(65);
   success=(await page.evaluate(()=>window.__POST_SHUFFLE__.selected().length))===i+1;
  }
  assert.ok(success,'Select exactly three distinct cards: '+i);
  chosen.push((await page.evaluate(()=>window.__POST_SHUFFLE__.selected())).at(-1).id);
 }
 await page.waitForFunction(()=>document.querySelectorAll('.ps-flip-button').length===3,null,{timeout:15000});
 await page.waitForFunction(()=>[...document.querySelectorAll('.ps-card-art')].length===3&&
  [...document.querySelectorAll('.ps-card-art')].every(el=>el.complete&&el.naturalWidth>0),null,{timeout:18000});
 await page.waitForTimeout(850);
 for(let i=0;i<3;i++){
  await page.locator('.ps-flip-button').nth(i).click();
  await page.waitForFunction(index=>{
   const d=document.querySelectorAll('.ps-tableau-detail')[index];
   return d&&!d.hidden;
  },i,{timeout:14000});
 }
 await page.locator('.ps-begin-reading').waitFor({state:'visible',timeout:15000});
 const former=await page.locator('.ps-card-art').evaluateAll(nodes=>nodes.map(n=>n.src));
 await page.screenshot({path:path+'/01-three-original-cards-mobile.png'});
 assert.ok((await page.locator('.ps-begin-reading').textContent()).includes('BEGIN INTERPRETATION'));
 await page.locator('.ps-begin-reading').click();
 await page.locator('.reading-art-panel').waitFor({timeout:9000});
 assert.equal(await page.locator('.reading-art-narration-title').innerText(),'The cards are ready to speak.');
 await page.screenshot({path:path+'/01b-scripted-welcome-mobile.png',fullPage:true});
 for(let chapter=0;chapter<=3;chapter++){
  await page.locator('[data-action="reading-next"]').click();
  await page.waitForFunction(c=>window.__POST_SHUFFLE__?.readingChapter?.()===c,
    chapter,{timeout:7000});
  assert.ok((await page.locator('.reading-art-narration-text').innerText()).trim().length>30);
 }
 assert.match(await page.locator('[data-action="reading-next"]').innerText(),/Ask Artemis/);
 await page.screenshot({path:path+'/01c-scripted-final-ask-mobile.png',fullPage:true});
 await page.setViewportSize({width:860,height:720});
 await page.waitForTimeout(180);
 await page.screenshot({path:path+'/01d-scripted-reading-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(180);
 await page.locator('[data-action="reading-next"]').click();
 await page.locator('.artemis-synthesis-ritual').waitFor({timeout:5000});
 const ritual=await page.evaluate(()=>{
  const stage=document.querySelector('.scene-artemis-reading');
  const tokens=[...stage.querySelectorAll('.artemis-synthesis-card-token')];
  const src=[...stage.querySelectorAll('.reading-art-card .reading-actual-card-face')].map(x=>x.src);
  const foils=[...stage.querySelectorAll('.reading-art-card .reading-art-card-foil')];
  return {phase:stage.dataset.phase,tokens:tokens.length,
   tokenIDs:tokens.map(x=>x.dataset.originalCardId),
   src,foilCount:foils.length,
   ritualDuration:Number(stage.querySelector('.artemis-synthesis-ritual').dataset.ritualDuration),
   conjuringSrc:stage.querySelector('.artemis-conjuring-art')?.getAttribute('src')};
 });
 assert.equal(ritual.phase,'sacrificing');
 assert.equal(ritual.tokens,3);
 assert.deepEqual(ritual.tokenIDs,chosen);
 assert.equal(ritual.foilCount,3);
 assert.deepEqual(ritual.src,former);
 assert.equal(ritual.ritualDuration,SYNTHESIS_TRANSITION_MS);
 const delays=await page.locator('.artemis-synthesis-card-token').evaluateAll(nodes=>
  nodes.map(n=>({index:n.dataset.cardIndex,delay:getComputedStyle(n).animationDelay,
   duration:getComputedStyle(n).animationDuration})));
 assert.deepEqual(delays.map(x=>x.index),['0','1','2']);
 assert.deepEqual(delays.map(x=>x.delay),['0.15s','0.55s','0.95s'],
  'Cards must enter the glowing circle sequentially, not simultaneously');
 assert.ok(delays.every(x=>x.duration==='1.55s'),'Each drop lasts 1.55 seconds');
 assert.ok(ritual.conjuringSrc?.includes('artemis_conjuring_transition.png'));
 await page.waitForTimeout(550);
 await page.screenshot({path:path+'/02-conjuring-card-drop-mobile.png'});
 await page.locator('.reading-chat-hud').waitFor({timeout:6000});
 // On slow SwiftShader screenshots the 3.3s scripted thinking beat may
 // finish before the screenshot driver returns. Accept either state, while
 // source tests enforce the animated dots and avatar in the generating state.
 await page.waitForFunction(()=>{
  const chat=document.querySelector('.reading-chat-hud');
  return !!chat&&(!!chat.querySelector('.synthesis-typing-dots')
   ||chat.dataset.chatState==='ready');
 },null,{timeout:9000});
 const dots=await page.locator('.synthesis-typing-dots i').count();
 if(dots)assert.equal(dots,3,'Thinking has three animated stars');
 else console.warn('Thinking beat finished before slow-frame screenshot observation');
 assert.equal(await page.locator('.synthesis-avatar').count(),1);
 await page.screenshot({path:path+'/03-chat-thinking-or-ready-mobile.png'});
 await page.waitForFunction(()=>document.querySelector('.reading-chat-hud')?.dataset.chatState==='ready',null,{timeout:13000});
 assert.equal(await page.locator('.synthesis-typing-dots').count(),0);
 assert.ok((await page.locator('.synthesis-message-body p').first().textContent()).length>80);
 assert.equal(await page.locator('.synthesis-avatar').count(),1);
 const mobile=await page.evaluate(()=>{
  const bounds=sel=>{const el=document.querySelector(sel),r=el.getBoundingClientRect();
   return {top:r.top,bottom:r.bottom,height:r.height,width:r.width}};
  return {hero:bounds('.reading-art-hero'),hud:bounds('.reading-chat-hud'),
   heading:bounds('.synthesis-chat-heading h2'),
   question:bounds('.synthesis-question'),chat:bounds('.synthesis-chat-scroll'),
   frame:getComputedStyle(document.querySelector('.reading-chat-hud')).borderImageSource,
   focused:document.querySelector('.artemis-focused-chat-art')?.getAttribute('src'),
   avatar:document.querySelector('.synthesis-avatar')?.getAttribute('src')};
 });
 assert.ok(mobile.question.bottom<=mobile.chat.top+4,'Question pinned above scrolling chat log');
 assert.ok(mobile.heading.top>=mobile.hud.top-1
  &&mobile.heading.bottom<=mobile.question.top,
  'Unified Reading heading must be visibly framed above question on mobile: '+JSON.stringify(mobile));
 assert.ok(mobile.hud.height>=320,'Mobile chat should occupy lower viewport');
 const actionGeometry=await page.evaluate(()=>{
  const rect=selector=>document.querySelector(selector).getBoundingClientRect();
  const footer=rect('.synthesis-chat-actions'),cta=rect('.synthesis-guidance-cta');
  const scroll=rect('.synthesis-chat-scroll'),hud=rect('.reading-chat-hud');
  const label=document.querySelector('.synthesis-guidance-label-mobile');
  return {scrollBottom:scroll.bottom,actionsTop:footer.top,ctaTop:cta.top,
   ctaBottom:cta.bottom,hudBottom:hud.bottom,
   labelVisible:getComputedStyle(label).display!=='none',
   buttonOverflows:cta.scrollWidth>cta.clientWidth+3,
   text:label.textContent.trim()};
 });
 assert.ok(actionGeometry.labelVisible&&actionGeometry.text==='Draw Guidance',
  'Mobile CTA uses a concise label within the painted right-hand button slot');
 assert.ok(actionGeometry.scrollBottom<=actionGeometry.actionsTop-3,
  'Scrolling transcript must stop before the two prepainted mobile footer slots: '+JSON.stringify(actionGeometry));
 assert.ok(actionGeometry.ctaTop>=actionGeometry.scrollBottom+1
  &&actionGeometry.ctaBottom<=actionGeometry.hudBottom-50
  &&!actionGeometry.buttonOverflows,
  'Draw Guidance CTA must fit without overlapping painted footer/corner ornaments: '+JSON.stringify(actionGeometry));
 assert.ok(mobile.frame.includes('ui_reading_frame_panel_mobile.png'),'9-slice owner mobile panel selected');
 const avatarMood=await page.locator('.synthesis-message[data-artemis-mood]').first().getAttribute('data-artemis-mood');
 assert.ok(avatarMood,'Each response must choose an Artemis expression');
 if(mobile.avatar?.includes('/avatar_artemis_face_')){
  assert.ok(mobile.avatar.endsWith('.png'),'Owner face-closeup portrait is displayed');
 }else console.warn('VISUAL ASSET PENDING: avatar fell back to older registered portrait');
 // In CI the owner-supplied binary ZIP may not yet have been installed.
 // Assert the dedicated focus slot in source, but report any missing pixels
 // explicitly instead of treating a fallback portrait as art sign-off.
 assert.ok(SYNTHESIS_ART.focused.includes('artemis_synthesis_focused.png'));
 if(!mobile.focused)console.warn('VISUAL ASSET PENDING: focused Artemis PNG absent from repo checkout');
 assert.ok(Object.keys(ARTEMIS_CHAT_AVATARS).length===8);
 await page.screenshot({path:path+'/04-chat-synthesis-ready-mobile.png',fullPage:true});
 await page.locator('[data-action="draw-guidance"]').click();
 assert.equal(await page.locator('.synthesis-guidance-card').count(),1);
 const guidance=await page.locator('.synthesis-guidance-card img').getAttribute('src');
 assert.ok(chosen.every(id=>!guidance.includes(id)));
 await page.screenshot({path:path+'/05-guidance-mobile.png',fullPage:true});
 await page.locator('#synthesis-followup-question').fill('How should I act on this insight?');
 await page.locator('.synthesis-followup-send').click();
 await page.waitForFunction(()=>document.querySelector('.reading-chat-hud')?.dataset.chatState==='followup-ready',null,{timeout:9000});
 assert.equal(await page.locator('.synthesis-user-followup').count(),1);
 assert.equal(await page.locator('.synthesis-message').count(),2);
 const inputGeometry=await page.evaluate(()=>{
  const hud=document.querySelector('.reading-chat-hud').getBoundingClientRect();
  const actions=document.querySelector('.synthesis-chat-actions').getBoundingClientRect();
  const input=document.querySelector('#synthesis-followup-question').getBoundingClientRect();
  const button=document.querySelector('.synthesis-followup-send').getBoundingClientRect();
  const scroll=document.querySelector('.synthesis-chat-scroll').getBoundingClientRect();
  return {hud:{top:hud.top,bottom:hud.bottom},actions:{top:actions.top,bottom:actions.bottom},
   input:{left:input.left,right:input.right,top:input.top,bottom:input.bottom},
   button:{left:button.left,right:button.right,top:button.top,bottom:button.bottom},
   scrollBottom:scroll.bottom};
 });
 assert.ok(inputGeometry.input.left<inputGeometry.button.left
  &&inputGeometry.input.right<inputGeometry.button.left
  &&inputGeometry.actions.top>=inputGeometry.scrollBottom-2,
  'Pinned follow-up input must not overlap the ASK CTA or the message transcript: '+
  JSON.stringify(inputGeometry));
 assert.ok(inputGeometry.input.bottom<inputGeometry.hud.bottom-19,
  'Input must remain above the ornamental bottom frame artwork: '+JSON.stringify(inputGeometry));
 await page.screenshot({path:path+'/06-chat-followup-mobile.png',fullPage:true});
 await page.setViewportSize({width:860,height:720});
 await page.waitForTimeout(350);
 await page.screenshot({path:path+'/07-chat-synthesis-desktop.png',fullPage:true});
 const desktop=await page.evaluate(()=>{
  const panel=document.querySelector('.reading-chat-hud'),skin=getComputedStyle(panel).borderImageSource;
  const desktopLabel=document.querySelector('.synthesis-guidance-label-desktop');
  const hero=document.querySelector('.reading-art-hero').getBoundingClientRect();
  return {skin,desktopLabelVisible:desktopLabel?getComputedStyle(desktopLabel).display!=='none':false,
   heroHeight:hero.height};
 });
 assert.ok(desktop.skin.includes('ui_reading_frame_panel.png')
   &&!desktop.skin.includes('ui_reading_frame_panel_mobile.png'),
   'Desktop chat must render the dedicated original desktop frame PNG: '+JSON.stringify(desktop));
 assert.deepEqual(errors,[]);
 console.log('ARTEMIS REMAKE SMOKE PASS',JSON.stringify({chosen,mobile}));
}finally{await browser.close()}
