/* Debug-only browser overlay. Real CSS variables, no dependencies. */
import {GROUPS,CONTROLS,NAMES,profileFor,formatCSS} from './layout-controls.mjs';
const STORE='juhua.visual-layout-tuner.v2';
const root=document.documentElement;
const params=new URLSearchParams(location.search);
const original=new Map(NAMES.map(n=>[n,[root.style.getPropertyValue(n),root.style.getPropertyPriority(n)]]));
let enabled=false, panel=null, body=null, launcher=null, fixture=null, controls=new Map();
let profile=profileFor(innerWidth,innerHeight), profiles={}, guides=false, scheduled=0, lastFocus=null, observer=null;
let targetStatus=null, cssOutput=null, search=null, exportStatus=null, profileLabel=null, statusLine=null;
let exportScoped=false, focusButton=null, dock='right-top';
try{const saved=JSON.parse(localStorage.getItem(STORE)||'{}');if(saved&&typeof saved==='object')profiles=saved;}catch{}
const validValue=(n,v)=>{
 const c=CONTROLS.find(x=>x[0]===n);if(!c||typeof v!=='string'||v.length>80)return false;
 if(c[2]==='select')return c[3].includes(v);
 const unit=c[2], number=Number(v.slice(0,unit?v.length-unit.length:undefined));
 return (!unit||v.endsWith(unit))&&v.trim()!==''&&Number.isFinite(number)&&number>=c[3]&&number<=c[4];
};
function save(){try{localStorage.setItem(STORE,JSON.stringify(profiles));}catch{}}
function values(){const out={};for(const [n,v] of Object.entries(profiles[profile]||{}))if(validValue(n,v))out[n]=v;return out}
function setVar(n,v){
 if(!validValue(n,v))return;
 (profiles[profile]||(profiles[profile]={}))[n]=v;
 root.style.setProperty(n,v);syncEdited();save();schedule();
}
function restore(n){const [v,p]=original.get(n)||['',''];if(v)root.style.setProperty(n,v,p);else root.style.removeProperty(n);}
function syncEdited(){root.dataset.vltEdits=Object.keys(values()).join(' ')}
function applyProfile(){
 for(const n of NAMES)restore(n);
 for(const [n,v] of Object.entries(values()))root.style.setProperty(n,v);
 if(profileLabel)profileLabel.textContent=profile.toUpperCase()+' · '+innerWidth+'×'+innerHeight;
 syncEdited();syncControls();schedule();
}
function computed(n){return getComputedStyle(root).getPropertyValue(n).trim();}
function numeric(raw,c){
 const unit=c[2];if(unit==='select')return raw;
 const simple=raw.match(/^(-?(?:\d+\.?\d*|\.\d+))(px|%|deg)?$/);
 if(simple&&(!unit||simple[2]===unit))return Number(simple[1]);
 if(unit==='px'&&raw&&raw!=='none'&&raw!=='auto'){
  const probe=document.createElement('div');probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;left:0;top:0;margin:0;padding:0;border:0;box-sizing:border-box;max-width:none;min-width:0;height:0;';
  probe.style.width=raw;document.body.append(probe);const px=probe.getBoundingClientRect().width;probe.remove();if(px>0)return px;
 }
 if(raw==='none'||raw==='auto')return c[4];
 return Math.max(c[3],Math.min(c[4],parseFloat(raw)||c[3]));
}
function make(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el}
function btn(text,fn,cls=''){const b=make('button',cls,text);b.type='button';b.addEventListener('click',fn);return b}
function select(options,label,fn){const s=make('select');s.setAttribute('aria-label',label);for(const [v,t] of options){const o=make('option','',t);o.value=v;s.append(o)}s.addEventListener('change',()=>fn(s.value));return s}
function syncControls(){
 for(const [n,obj] of controls){
  const raw=computed(n),c=obj.c;
  obj.value.textContent=raw||'unset';
  obj.row.classList.toggle('is-edited',Object.hasOwn(values(),n));
  if(c[2]==='select'){obj.range.value=raw;continue}
  const x=Math.max(c[3],Math.min(c[4],numeric(raw,c)));
  const rounded=Number(x.toFixed(2));
  if(document.activeElement!==obj.range)obj.range.value=String(rounded);
  if(document.activeElement!==obj.number)obj.number.value=String(rounded);
 }
}
function rowFor(c){
 const [n,label,unit,min,max,step]=c;
 const row=make('div','vlt-control');row.dataset.variable=n;row.dataset.search=(label+' '+n).toLowerCase();
 const title=make('div','vlt-control-title');const l=make('label','',label);const raw=make('code','vlt-raw');
 title.append(l,raw);row.append(title);
 let range,number;
 if(unit==='select'){
  range=select(min.map(x=>[x,n==='--layout-legacy-cta-display'?(x==='none'?'HIDE — safe':'INSPECT — reveal if present'):x]),label,v=>{setVar(n,v);syncControls()});
  row.append(range);
 }else{
  const line=make('div','vlt-range-row');
  range=make('input');range.type='range';range.min=min;range.max=max;range.step=step;range.setAttribute('aria-label',label);range.id='vlt-'+n.slice(2);
  l.htmlFor=range.id;
  number=make('input');number.type='number';number.min=min;number.max=max;number.step=step;number.setAttribute('aria-label',label+' exact value');number.className='vlt-number';
  const update=x=>{if(x===''||!Number.isFinite(Number(x)))return;const v=Math.min(max,Math.max(min,Number(x)));setVar(n,String(Number(v.toFixed(3)))+unit);raw.textContent=computed(n);range.value=String(v);number.value=String(v);row.classList.add('is-edited')};
  range.addEventListener('input',()=>update(range.value));number.addEventListener('change',()=>update(number.value));
  line.append(range,number,make('span','vlt-unit',unit||'×'));row.append(line);
 }
 const meta=make('div','vlt-meta');meta.append(make('code','',n),btn('Focus',()=>focusControl(row),'vlt-reset'),btn('Reset',()=>{delete (profiles[profile]||{})[n];restore(n);syncEdited();save();syncControls();schedule()},'vlt-reset'));row.append(meta);
 controls.set(n,{c,row,range,number,value:raw});return row;
}
function snapshot(){return Object.fromEntries(NAMES.map(n=>[n,computed(n)]).filter(([,v])=>v));}
function exportText(scoped=false){return formatCSS(values(),scoped?profile:'root')}
async function copy(scoped=false){
 exportScoped=scoped;const text=exportText(scoped);cssOutput.value=text;cssOutput.hidden=false;
 try{await navigator.clipboard.writeText(text);exportStatus.textContent='Copied '+(scoped?profile+' breakpoint':'exact :root block')+' to clipboard.'}
 catch{cssOutput.focus();cssOutput.select();let ok=false;try{ok=document.execCommand('copy')}catch{}exportStatus.textContent=ok?'Copied CSS.':'Clipboard unavailable. CSS selected; Ctrl/Cmd+C.'}
}
function resetProfile(){profiles[profile]={};save();applyProfile();exportStatus.textContent='Current viewport profile reset to CSS defaults.'}
function target(){return fixture?.querySelector('.scene-artemis-reading')||document.querySelector('#post-shuffle-mount .scene-artemis-reading')}
function rect(el){if(!el||!el.getClientRects().length||getComputedStyle(el).display==='none')return null;return el.getBoundingClientRect()}
function intersect(a,b){return !!(a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)}
function diagnose(){
 if(!targetStatus)return;
 const scene=target();if(!scene){targetStatus.textContent='Live app: shuffle / select cards, or use a quick preview above.';return}
 const chat=scene.dataset.phase==='chat', q=s=>scene.querySelector(s);
 const hero=rect(q('.reading-art-hero')), portrait=rect(q(chat?'.artemis-focused-chat-art':'.reading-art-portrait'))||rect(q('.reading-art-portrait')), panelRect=rect(q(chat?'.reading-chat-hud':'.reading-art-panel'));
 const legacy=[...scene.querySelectorAll('.synthesis-reading-complete,.synthesis-guidance-cta,.ps-reading-entry,.ps-reading-entry-complete,[data-action="draw-guidance"],.reading-art-controls')].filter(e=>rect(e));
 const art=chat?q('.artemis-focused-chat-art'):q('.reading-art-portrait img');
 let out=[(fixture?'SCRIPTED FIXTURE':'LIVE APP')+' · '+(chat?'AI SYNTHESIS':'READING')+' · '+innerWidth+'×'+innerHeight,
  'Hero: '+(hero?Math.round(hero.height)+'px':'—')+' | Panel: '+(panelRect?Math.round(panelRect.height)+'px':'—')+' | Portrait: '+(portrait?Math.round(portrait.width)+'×'+Math.round(portrait.height):'—'),
  'Artwork: '+(art?.complete&&art?.naturalWidth?'loaded':chat?'fallback / missing owner art':'loading or missing')];
 if(chat){
  const t=q('.synthesis-chat-scroll'), f=rect(q('.synthesis-chat-actions')), tr=rect(t), h=rect(q('.synthesis-chat-heading')), question=rect(q('.synthesis-question'));
  out.push('Transcript: '+(t?Math.round(t.clientHeight)+' / '+t.scrollHeight+'px':'—')+' | Footer: '+(f?Math.round(f.top)+'px':'—'));
  out.push('Legacy visible: '+legacy.length+' | Transcript/footer overlap: '+(intersect(tr,f)?'YES':'no')+' | Header/question overlap: '+(intersect(h,question)?'YES':'no'));
 }else{
  const table=rect(q('.reading-art-table-surface')),cards=[...scene.querySelectorAll('.reading-art-card-frame')].map(rect).filter(Boolean);
  out.push('Table: '+(table?'visible':'painted matte only')+' | Cards: '+cards.length+' | Hero/panel overlap: '+(intersect(hero,panelRect)?'YES':'no'));
 }
 targetStatus.textContent=out.join('\n');
}
function schedule(){
 cancelAnimationFrame(scheduled);scheduled=requestAnimationFrame(()=>{
  if(!enabled)return;
  diagnose();
  // Existing scene measures the painted-room pixel alignment on resize.
  // CSS-only changes to the pan/hero need the same exact measurement.
  const s=target(), h=s?.querySelector('.reading-art-hero'),img=s?.querySelector('.reading-art-atmosphere img');
  if(s?.dataset.phase!=='chat'&&h&&img?.complete&&img.naturalWidth){
   const r=img.getBoundingClientRect(),b=h.getBoundingClientRect(),scale=Math.max(r.width/img.naturalWidth,r.height/img.naturalHeight);
   const w=img.naturalWidth*scale,ht=img.naturalHeight*scale,pos=getComputedStyle(img).objectPosition.trim().split(/\s+/);
   const fraction=(v,d)=>v==='left'||v==='top'?0:v==='right'||v==='bottom'?1:v==='center'?.5:v?.endsWith('%')?parseFloat(v)/100:d;
   h.style.setProperty('--room-cover-size',w+'px '+ht+'px');
   h.style.setProperty('--room-cover-position',((r.width-w)*fraction(pos[0],.5)+r.left-b.left)+'px '+((r.height-ht)*fraction(pos[1],.48)+r.top-b.top)+'px');
   h.dataset.roomOcclusionSynced='true';
  }
  if(cssOutput&&!cssOutput.hidden&&document.activeElement!==cssOutput)cssOutput.value=exportText(exportScoped);
 });
}
async function showPreview(mode){
 const mod=await import('./layout-preview.mjs');
 if(!enabled)return;
 fixture?.remove();fixture=mod.createLayoutPreview(mode,()=>schedule());document.body.append(fixture);
 schedule();statusLine.textContent='Quick preview: '+mode+' · actual renderer / no live AI';
}
function returnLive(){fixture?.remove();fixture=null;statusLine.textContent='Live app · continue the original ritual normally';schedule()}
function toggleGuides(){guides=!guides;document.body.classList.toggle('vlt-guides',guides);schedule()}
function drag(header){
 let moving=false,startX=0,startY=0,x=0,y=0;
 header.addEventListener('pointerdown',e=>{if(e.target.closest('button,select,input'))return;moving=true;const r=panel.getBoundingClientRect();x=r.left;y=r.top;startX=e.clientX;startY=e.clientY;header.setPointerCapture(e.pointerId)});
 header.addEventListener('pointermove',e=>{if(!moving)return;panel.style.right='auto';panel.style.bottom='auto';panel.style.left=Math.max(0,Math.min(innerWidth-panel.offsetWidth,x+e.clientX-startX))+'px';panel.style.top=Math.max(0,Math.min(innerHeight-50,y+e.clientY-startY))+'px'});
 const end=()=>{moving=false};header.addEventListener('pointerup',end);header.addEventListener('pointercancel',end);
}
function focusControl(row){
 for(const e of body.querySelectorAll('.vlt-focused,.vlt-focused-group'))e.classList.remove('vlt-focused','vlt-focused-group');
 row.classList.add('vlt-focused');const group=row.closest('details');group.classList.add('vlt-focused-group');group.open=true;
 panel.classList.add('is-focus-mode');focusButton.hidden=false;
 dockPanel('right-bottom');row.scrollIntoView({block:'nearest'});
}
function exitFocus(){panel.classList.remove('is-focus-mode');focusButton.hidden=true;for(const e of body.querySelectorAll('.vlt-focused,.vlt-focused-group'))e.classList.remove('vlt-focused','vlt-focused-group')}
function dockPanel(next){
 dock=next;panel.style.left=next.startsWith('left')?'8px':'auto';panel.style.right=next.startsWith('right')?'8px':'auto';
 panel.style.top=next.endsWith('top')?'8px':'auto';panel.style.bottom=next.endsWith('bottom')?'8px':'auto';
}
function cycleDock(){const positions=['right-top','right-bottom','left-bottom','left-top'];dockPanel(positions[(positions.indexOf(dock)+1)%positions.length])}
function collapse(){panel.hidden=true;launcher.hidden=false;launcher.focus({preventScroll:true})}
function reopen(){panel.hidden=false;launcher.hidden=true;syncControls();schedule()}
function build(){
 panel=make('aside','vlt-panel');panel.id='visual-layout-tuner';panel.setAttribute('aria-label','Visual Layout Tuner');panel.setAttribute('role','region');
 const header=make('header','vlt-header'), heading=make('div');heading.append(make('strong','','VISUAL LAYOUT TUNER'),make('small','','Debug branch · Shift+D'));const headerActions=make('div','vlt-header-actions');focusButton=btn('Full',exitFocus);focusButton.hidden=true;headerActions.append(focusButton,btn('Dock',cycleDock),btn('−',collapse,'vlt-icon'));header.append(heading,headerActions);panel.append(header);drag(header);
 const top=make('div','vlt-top');profileLabel=make('span','vlt-profile');statusLine=make('small','vlt-status','Live app · choose quick preview or enter reading');top.append(profileLabel,statusLine);
 const quick=make('div','vlt-quick');quick.append(btn('Reading',()=>showPreview('reading')),btn('Chat ready',()=>showPreview('chat')),btn('Long chat',()=>showPreview('long')),btn('Thinking',()=>showPreview('thinking')),btn('Live app',returnLive),btn('Guides',toggleGuides));top.append(quick);
 const note=make('small','vlt-note','Quick previews use real app templates, not live AI. Resize your actual browser / DevTools for independent desktop, phone and compact settings. Changes auto-save locally per viewport.');
 top.append(note);targetStatus=make('pre','vlt-diagnostics');top.append(targetStatus);
 search=make('input','vlt-search');search.type='search';search.placeholder='Filter controls or CSS variables…';search.setAttribute('aria-label','Search layout controls');top.append(search);panel.append(top);
 body=make('div','vlt-body');
 for(const [title,desc,list] of GROUPS){
  const detail=make('details','vlt-group');const summary=make('summary','',title);detail.append(summary,make('p','vlt-group-note',desc));
  const reset=btn('Reset group',()=>{for(const c of list){delete (profiles[profile]||{})[c[0]];restore(c[0])}syncEdited();save();syncControls();schedule()},'vlt-group-reset');detail.append(reset);
  for(const c of list)detail.append(rowFor(c));body.append(detail);
 }
 search.addEventListener('input',()=>{const query=search.value.toLowerCase().trim();for(const d of body.querySelectorAll('details')){let count=0;for(const r of d.querySelectorAll('.vlt-control')){r.hidden=!!query&&!r.dataset.search.includes(query);if(!r.hidden)count++}d.hidden=count===0;if(query&&count)d.open=true}});
 panel.append(body);
 const footer=make('footer','vlt-footer');const buttons=make('div','vlt-copy-row');buttons.append(btn('Copy CSS Variables',()=>copy(false),'vlt-primary'),btn('Copy breakpoint CSS',()=>copy(true)),btn('Reset profile',resetProfile));footer.append(buttons);
 exportStatus=make('small','vlt-export-status','Exports explicit edits only. Save Package includes the matching consumer rules and assets.');footer.append(exportStatus);
 cssOutput=make('textarea','vlt-export');cssOutput.readOnly=true;cssOutput.hidden=true;cssOutput.setAttribute('aria-label','Exported CSS variables');footer.append(cssOutput);panel.append(footer);
 launcher=btn('LAYOUT TUNER · Shift+D',reopen,'vlt-launcher');launcher.hidden=true;document.body.append(panel,launcher);
 applyProfile();
}
function activate(){
 if(enabled){panel.hidden?reopen():collapse();return}
 enabled=true;lastFocus=document.activeElement;
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./visual-layout-tuner.css',import.meta.url).href;document.head.append(link);
 build();
 observer=new MutationObserver(records=>{if(records.some(r=>!r.target.closest?.('.vlt-panel,.vlt-launcher,.vlt-inspector-layer')&&(r.type==='attributes'||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(!n.closest?.('.vlt-panel')&&(n.matches?.('.scene-artemis-reading,.ps-mount,.ps-world,.reading-chat-hud')||n.querySelector?.('.scene-artemis-reading,.reading-chat-hud')||r.target.closest?.('.scene-artemis-reading'))))))schedule()});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-phase','data-chat-state','data-synthesis-portrait','data-beat']});
 window.addEventListener('resize',()=>{const r=panel.getBoundingClientRect();if(!panel.hidden&&(r.right>innerWidth||r.left<0||r.top<0||r.bottom>innerHeight))dockPanel(dock);const next=profileFor(innerWidth,innerHeight);if(next!==profile){profile=next;applyProfile()}else{profileLabel.textContent=profile.toUpperCase()+' · '+innerWidth+'×'+innerHeight;syncControls();schedule()}});
 window.addEventListener('load',schedule,true);document.addEventListener('scroll',schedule,true);
 window.__VISUAL_LAYOUT_TUNER__={set:setVar,reset:resetProfile,snapshot,exportCSS:exportText,preview:showPreview,live:returnLive,profile:()=>profile,diagnose};
 if(['reading','chat','long','thinking'].includes(params.get('layoutPreview')))showPreview(params.get('layoutPreview'));
}
document.addEventListener('keydown',e=>{if(e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&e.code==='KeyD'&&!e.repeat&&!e.target.closest('input,textarea,select,[contenteditable="true"]')){e.preventDefault();activate()}});
if(params.get('debug')==='1')activate();
