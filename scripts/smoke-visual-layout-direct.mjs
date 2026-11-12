import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const host='http://127.0.0.1:'+(process.env.GATE_B_PORT||4184);
const dir='.artifacts/visual-layout-tuner';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true,reducedMotion:'reduce'});
const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));
const script='/preview/post-shuffle/debug/layout-preview.mjs';
const select=()=>p.evaluate(async path=>{const m=await import(path);const el=m.createLayoutPreview('reading');document.body.append(el);},script);
const geometry=()=>p.evaluate(()=>{
 const s=document.querySelector('.layout-tuner-fixture .scene-artemis-reading');
 return Object.fromEntries(['.reading-art-hero','.reading-art-portrait','.reading-art-spread','.reading-art-card','.reading-art-panel','.reading-art-controls'].map(q=>{const e=s.querySelector(q),r=e.getBoundingClientRect(),c=getComputedStyle(e);return[q,[r.x,r.y,r.width,r.height,c.transform,c.opacity,c.display].map(x=>typeof x==='number'?Math.round(x*10)/10:x)]}))
});
async function openRoute(route,w,h){
 await p.setViewportSize({width:w,height:h});await p.goto(host+route,{waitUntil:'domcontentloaded'});
 await p.evaluate(()=>localStorage.removeItem('juhua.visual-layout-tuner.v2'));
 await p.reload({waitUntil:'domcontentloaded'});
 await p.keyboard.press('Shift+D');await p.locator('#visual-layout-tuner').waitFor({state:'visible'});
 await p.getByRole('button',{name:'Reading',exact:true}).click();
 await p.locator('.layout-tuner-fixture .reading-art-panel').waitFor();
 await p.evaluate(()=>{for(const a of document.querySelector('.layout-tuner-fixture').getAnimations({subtree:true})){const timing=a.effect?.getComputedTiming();if(timing&&Number.isFinite(timing.endTime)){try{a.finish()}catch{}}else a.pause()}});
 await p.waitForTimeout(150);
 return geometry();
}
try{
 for(const [w,h] of [[1440,900],[3059,1066],[390,844],[458,553]]){
  const g=await openRoute('/preview/gate-b/',w,h);
  const s=await openRoute('/preview/post-shuffle/',w,h);
  for(const key of Object.keys(g))assert.deepEqual(s[key],g[key],'Same geometry '+key+' at '+w+'×'+h);
  assert.equal(await p.evaluate(()=>document.documentElement.dataset.vltEdits),'','Opening tuner applies zero layout edits');
 }
 await openRoute('/preview/gate-b/',1440,900);
 await p.getByRole('button',{name:'Inspect element',exact:true}).click();
 const portrait=p.locator('.layout-tuner-fixture .reading-art-portrait');
 const r=await portrait.boundingBox();
 // Artwork can be pointer-events:none, but geometric picking must select it.
 await p.mouse.click(r.x+r.width*.5,r.y+r.height*.24);
 assert.equal(await p.evaluate(()=>window.__VISUAL_LAYOUT_TUNER__.selected()),'reading-portrait');
 assert.ok(await p.locator('[data-variable="--layout-reading-art-x"]').isVisible());
 assert.ok(await p.locator('[data-variable="--layout-chat-ask-x"]').isHidden());
 const handle=p.locator('.vlt-selection-move');const hb=await handle.boundingBox();
 await p.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2);await p.mouse.down();await p.mouse.move(hb.x+hb.width/2+32,hb.y+hb.height/2+20,{steps:6});await p.mouse.up();
 const moved=await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--layout-reading-art-x').trim());assert.notEqual(moved,'0px');
 await p.locator('select[aria-label="Scene layer"]').selectOption('card-1');
 assert.ok(await p.locator('[data-variable="--layout-card-1-scale"]').isVisible());
 await p.evaluate(()=>window.__VISUAL_LAYOUT_TUNER__.set('--layout-card-1-x','24px'));
 assert.equal(await p.locator('.layout-tuner-fixture .reading-art-card').first().evaluate(e=>getComputedStyle(e).translate),'24px');
 await p.locator('select[aria-label="Scene layer"]').selectOption('reading-frame');
 // Real PNG bytes generated in the browser, not a dummy filename.
 await p.evaluate(async()=>{const c=document.createElement('canvas');c.width=80;c.height=60;const x=c.getContext('2d');x.fillStyle='#f3c856';x.fillRect(0,0,80,60);const b=await new Promise(r=>c.toBlob(r,'image/png'));await window.__VISUAL_LAYOUT_TUNER__.assetPut('reading-frame',new File([b],'owner-frame.png',{type:'image/png'}));});
 assert.equal(await p.evaluate(()=>window.__VISUAL_LAYOUT_TUNER__.assetCount()),1);
 assert.match(await p.locator('.layout-tuner-fixture .reading-art-panel').evaluate(e=>getComputedStyle(e).borderImageSource),/blob:/);
 await p.getByRole('button',{name:'Stop inspecting',exact:true}).click();
 await p.getByRole('button',{name:'Chat ready',exact:true}).click();
 await p.locator('.layout-tuner-fixture .synthesis-followup-send').waitFor();
 await p.evaluate(async()=>{const c=document.createElement('canvas');c.width=90;c.height=50;const x=c.getContext('2d');x.fillStyle='#6633aa';x.fillRect(0,0,90,50);const b=await new Promise(r=>c.toBlob(r,'image/png'));await window.__VISUAL_LAYOUT_TUNER__.assetPut('chat-frame-desktop',new File([b],'owner-chat.png',{type:'image/png'}));});
 assert.match(await p.locator('.layout-tuner-fixture .reading-chat-hud').evaluate(e=>getComputedStyle(e).borderImageSource),/blob:/);
 await p.locator('select[aria-label="Scene layer"]').selectOption('ask');
 assert.ok(await p.locator('[data-variable="--layout-chat-ask-x"]').isVisible());
 await p.getByRole('button',{name:'Stop inspecting',exact:true}).click();
 const dlPromise=p.waitForEvent('download');await p.getByRole('button',{name:'Save Package ZIP'}).click();const dl=await dlPromise;
 const zip=await dl.path();assert.ok(zip);await dl.saveAs(dir+'/owner-layout-test-package.zip');
 await p.evaluate(()=>window.__VISUAL_LAYOUT_TUNER__.assetReset('reading-frame'));
 await p.evaluate(()=>window.__VISUAL_LAYOUT_TUNER__.assetReset('chat-frame-desktop'));
 await p.getByRole('button',{name:'Reset profile',exact:true}).click();
 const input=p.locator('input[type=file][accept*=".zip"]');await input.setInputFiles(zip);
 await p.waitForFunction(()=>window.__VISUAL_LAYOUT_TUNER__.assetCount()===2);
 assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--layout-card-1-x').trim()),'24px');
 await p.screenshot({path:dir+'/direct-editor-package-restored.png'});
 await p.reload({waitUntil:'domcontentloaded'});await p.keyboard.press('Shift+D');await p.locator('#visual-layout-tuner').waitFor();
 await p.waitForFunction(()=>window.__VISUAL_LAYOUT_TUNER__.assetCount()===2);
 assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--layout-card-1-x').trim()),'24px');
 assert.deepEqual(errors,[],'No browser exceptions');
 console.log('PASS route parity (four viewports), direct picking/dragging, individual cards, asset swap, ZIP roundtrip and persistence');
}finally{await browser.close()}
