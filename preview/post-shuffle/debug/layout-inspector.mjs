/* Direct scene selection and manipulation. No app simulation or AI calls. */
const a=(suffix)=>'--layout-'+suffix;
const L=(id,label,selector,vars,move=[],scale=null,asset=null,phase='both')=>({id,label,selector,vars,move,scale,asset,phase});
export const LAYERS=[
 L('reading-portrait','Artemis · reading','.reading-art-portrait',['--artemis-top','--artemis-scale','--artemis-portrait-width','--artemis-portrait-height',a('reading-art-x'),a('reading-art-y'),a('reading-portrait-opacity')],[a('reading-art-x'),a('reading-art-y')],'--artemis-scale','reading-portrait','reading'),
 L('focused','Artemis · synthesis','.artemis-focused-chat-art,.reading-art-portrait',[a('chat-art-x'),a('chat-art-y'),a('chat-art-scale'),a('chat-art-width'),a('chat-art-height'),a('chat-art-opacity'),a('chat-mask-start'),a('chat-mask-mid'),a('chat-mask-end'),a('chat-glow-opacity'),a('chat-glow-radius')],[a('chat-art-x'),a('chat-art-y')],a('chat-art-scale'),'focused','chat'),
 L('reading-title','Reading title','.reading-art-narration-title',[a('reading-title-x'),a('reading-title-y'),a('reading-title-size')],[a('reading-title-x'),a('reading-title-y')],a('reading-title-size'),null,'reading'),
 L('reading-text','Reading text','.reading-art-narration-text',[a('reading-text-x'),a('reading-text-y'),a('reading-text-size')],[a('reading-text-x'),a('reading-text-y')],a('reading-text-size'),null,'reading'),
 L('next','Next / Ask Artemis button','.reading-art-control.is-primary',[a('reading-next-x'),a('reading-next-y'),a('reading-next-scale'),a('reading-next-width')],[a('reading-next-x'),a('reading-next-y')],a('reading-next-scale'),'next','reading'),
 L('previous','Previous button','.reading-art-control.is-secondary',[a('reading-prev-x'),a('reading-prev-y'),a('reading-prev-scale'),a('reading-prev-width')],[a('reading-prev-x'),a('reading-prev-y')],a('reading-prev-scale'),'previous','reading'),
 L('reading-controls','Navigation group','.reading-art-controls',[a('reading-controls-x'),a('reading-controls-y'),a('reading-controls-scale'),a('reading-controls-align'),a('reading-controls-gap')],[a('reading-controls-x'),a('reading-controls-y')],a('reading-controls-scale'),null,'reading'),
 L('nameplate','Reader nameplate','.reading-art-nameplate',[a('reading-nameplate-y')],[null,a('reading-nameplate-y')],null,'nameplate','reading'),
 L('cards','Three-card spread','.reading-art-card,.reading-art-spread',[a('cards-x'),'--cards-y-offset',a('cards-scale'),'--reading-spread-width','--reading-spread-bottom','--reading-spread-gap','--reading-card-width','--reading-card-perspective','--reading-card-tilt',a('card-shadows'),a('card-label-size'),a('card-meaning-size')],[a('cards-x'),'--cards-y-offset'],a('cards-scale'),null,'reading'),
 L('table','Reading table / painted edge','.reading-art-table-surface',[ '--table-top',a('table-x'),a('table-width'),'--reading-table-perspective','--reading-table-tilt',a('table-opacity'),a('table-display')],[a('table-x'),'--table-top'],a('table-width'),null,'reading'),
 L('halo','Artemis halo','.reading-art-halo',[a('reading-halo-x'),a('reading-halo-y'),a('reading-halo-scale'),a('reading-halo')],[a('reading-halo-x'),a('reading-halo-y')],a('reading-halo-scale'),'halo','reading'),
 L('glow','Reading / card glow','.reading-art-reading-glow,.reading-art-card-glow',[a('reading-glow-x'),a('reading-glow-y'),a('reading-glow-scale'),a('reading-glow')],[a('reading-glow-x'),a('reading-glow-y')],a('reading-glow-scale'),'glow','reading'),
 L('reading-frame','Reading frame / dialogue panel','.reading-art-panel',[a('reading-panel-x'),a('reading-panel-y'),a('reading-panel-width'),'--reading-panel-height','--reading-panel-gap',a('reading-panel-top'),a('reading-panel-side'),a('reading-panel-bottom')],[a('reading-panel-x'),a('reading-panel-y')],a('reading-panel-width'),'reading-frame','reading'),
 L('reading-header','Pinned reading question','.reading-art-header',[a('reading-header-x'),a('reading-header-y'),'--reading-header-min-height'],[a('reading-header-x'),a('reading-header-y')],null,null,'reading'),
 L('reading-footer','Reading footer','.reading-art-footer',[a('reading-footer-x'),a('reading-footer-y'),a('reading-footer-size')],[a('reading-footer-x'),a('reading-footer-y')],a('reading-footer-size'),null,'reading'),
 L('heading','Unified Reading heading','.synthesis-chat-heading',[a('chat-heading-x'),a('chat-heading-y'),a('chat-heading-size'),a('chat-heading-gap')],[a('chat-heading-x'),a('chat-heading-y')],a('chat-heading-size'),null,'chat'),
 L('question','Pinned question','.synthesis-question',[a('chat-question-x'),a('chat-question-y'),a('chat-question-height'),a('chat-question-size'),a('chat-question-gap')],[a('chat-question-x'),a('chat-question-y')],a('chat-question-size'),null,'chat'),
 L('avatar','Artemis chat avatar','.synthesis-avatar',[a('chat-avatar-x'),a('chat-avatar-y'),a('chat-avatar-size'),a('chat-message-gap')],[a('chat-avatar-x'),a('chat-avatar-y')],a('chat-avatar-size'),'avatar','chat'),
 L('message','Chat message bubble','.synthesis-message-body',[a('chat-message-x'),a('chat-message-y'),a('chat-message-size'),a('chat-message-spacing'),a('chat-message-gap')],[a('chat-message-x'),a('chat-message-y')],a('chat-message-size'),null,'chat'),
 L('guidance','Guidance card','.synthesis-guidance-card',[a('chat-guidance-x'),a('chat-guidance-y'),a('chat-guidance-scale')],[a('chat-guidance-x'),a('chat-guidance-y')],a('chat-guidance-scale'),null,'chat'),
 L('input','Follow-up input','.synthesis-followup-row input',[a('chat-input-x'),a('chat-input-y'),a('chat-input-height'),a('chat-input-font'),a('chat-input-share'),a('chat-input-scale')],[a('chat-input-x'),a('chat-input-y')],a('chat-input-scale'),'input','chat'),
 L('ask','ASK button','.synthesis-followup-send',[a('chat-ask-x'),a('chat-ask-y'),a('chat-ask-width'),a('chat-ask-font'),a('chat-ask-scale'),a('chat-input-height')],[a('chat-ask-x'),a('chat-ask-y')],a('chat-ask-scale'),'ask','chat'),
 L('composer','Composer / footer','.synthesis-chat-actions',[a('chat-footer-x'),a('chat-footer-y'),a('chat-footer-width'),a('chat-footer-top'),a('chat-footer-bottom'),a('chat-row-gap'),a('chat-row-align'),a('legacy-cta-display')],[a('chat-footer-x'),a('chat-footer-y')],a('chat-footer-width'),null,'chat'),
 L('transcript','Chat transcript','.synthesis-chat-scroll',[a('chat-transcript-x'),a('chat-transcript-y'),a('chat-transcript-max-height'),a('chat-transcript-top'),a('chat-transcript-side'),a('chat-transcript-bottom')],[a('chat-transcript-x'),a('chat-transcript-y')],a('chat-transcript-max-height'),null,'chat'),
 L('chat-frame','Chat ornamental frame','.reading-chat-hud',[a('chat-panel-x'),a('chat-panel-y'),a('chat-panel-width'),a('chat-panel-height'),a('chat-panel-min-height'),a('chat-panel-top'),a('chat-panel-side'),a('chat-panel-bottom'),a('chat-frame-top'),a('chat-frame-side'),a('chat-frame-bottom')],[a('chat-panel-x'),a('chat-panel-y')],a('chat-panel-width'),'chat-frame','chat'),
 L('mist','Celestial mist · pseudo-layer','.reading-art-hero',[a('chat-mist-x'),a('chat-mist-y'),a('chat-mist-width'),'--chat-mist-height',a('chat-mist-opacity'),a('chat-mist-blur')],[a('chat-mist-x'),a('chat-mist-y')],a('chat-mist-width'),'mist','chat'),
 L('hero','Hero container','.reading-art-hero',['--reading-hero-height',a('reading-hero-x'),a('reading-hero-y')],[a('reading-hero-x'),a('reading-hero-y')],'--reading-hero-height',null,'reading'),
 L('chat-hero','Chat hero container','.reading-art-hero',['--chat-hero-height',a('chat-hero-x'),a('chat-hero-y')],[a('chat-hero-x'),a('chat-hero-y')],'--chat-hero-height',null,'chat'),
 L('chamber','Celestial chamber background','.reading-art-atmosphere',['--reading-atmosphere-top','--reading-atmosphere-pan','--reading-atmosphere-overdraw',a('reading-chamber-x'),a('reading-chamber-scale')],[a('reading-chamber-x'),'--reading-atmosphere-pan'],a('reading-chamber-scale'),'chamber','reading'),
 L('chat-chamber','Chat chamber background','.scene-artemis-reading',[a('chat-background-x'),a('chat-background-y')],[a('chat-background-x'),a('chat-background-y')],null,'chamber','chat')
];
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e};
export function mountInspector({target,set,read,controls,onSelect,onClear,onUpdate}){
 let active=false,selected=null,hover=null,drag=null,frame=0;
 const layer=element('div','vlt-inspector-layer');layer.hidden=true;
 const box=element('div','vlt-selection-box');box.hidden=true;
 const label=element('div','vlt-selection-label');
 const move=element('button','vlt-selection-move','MOVE');move.type='button';move.title='Drag to move';
 const resize=element('button','vlt-selection-resize','↘');resize.type='button';resize.title='Drag to scale or resize';
 box.append(label,move,resize);layer.append(box);document.body.append(layer);
 const phase=()=>target()?.dataset.phase==='chat'?'chat':'reading';
 const candidates=()=>LAYERS.filter(l=>l.phase==='both'||l.phase===phase());
 function nodeFor(l){
  const s=target();if(!s||!l)return null;
  if(l.id==='cards')return s.querySelector('.reading-art-spread');
  if(l.id==='focused')return s.querySelector('.artemis-focused-chat-art')||s.querySelector('.reading-art-portrait');
  if(l.selector==='.scene-artemis-reading')return s;
  return s.querySelector(l.selector);
 }
 function bounds(l){
  const s=target(),n=nodeFor(l);if(!n)return null;
  const r=n.getBoundingClientRect();
  if(l.id==='table'&&(!r.width||!r.height)){const h=s.querySelector('.reading-art-hero')?.getBoundingClientRect();if(!h)return null;return {left:h.left,top:h.top+h.height*.7,width:h.width,height:h.height*.3}}
  if(l.id==='mist'){const h=r,css=getComputedStyle(n,'::after'),height=parseFloat(css.height)||70,bottom=parseFloat(css.bottom)||0;return {left:h.left,top:h.bottom-height-bottom,width:h.width,height}}
  return r.width&&r.height?r:null;
 }
 function redraw(){
  if(!active||!target()){box.hidden=true;return}
  const l=selected||hover,r=bounds(l);if(!r){box.hidden=true;return}
  box.hidden=false;box.classList.toggle('is-selected',!!selected);box.style.left=r.left+'px';box.style.top=r.top+'px';box.style.width=r.width+'px';box.style.height=r.height+'px';
  label.textContent=l.label+' · '+Math.round(r.width)+'×'+Math.round(r.height);
  move.hidden=!selected||!l.move.some(Boolean);resize.hidden=!selected||!l.scale;
 }
 function pick(l){if(!l)return;selected=l;hover=null;active=true;layer.hidden=false;onSelect(l);redraw()}
 function clear(){selected=hover=null;onClear();redraw()}
 function toggle(value=!active){active=value;layer.hidden=!active;document.body.classList.toggle('vlt-picking',active);if(!active){selected=hover=null;onClear()}redraw();return active}
 function identify(e){
  const scene=target();if(!scene||!scene.contains(e.target))return null;
  // Most specific matching DOM element wins; nearest ancestor first.
  let n=e.target;while(n&&scene.contains(n)){
   const l=candidates().find(l=>!['mist','hero','chat-hero','chat-chamber'].includes(l.id)&&n.matches?.(l.selector));
   if(l)return l;n=n.parentElement;
  }
  return candidates().find(l=>l.id===(phase()==='chat'?'chat-chamber':'chamber'));
 }
 document.addEventListener('pointermove',e=>{if(!active||drag||e.target.closest?.('.vlt-panel,.vlt-inspector-layer,.vlt-launcher'))return;hover=identify(e);if(!selected)redraw()},true);
 document.addEventListener('click',e=>{if(!active||e.target.closest?.('.vlt-panel,.vlt-inspector-layer,.vlt-launcher'))return;const l=identify(e);if(l){e.preventDefault();e.stopImmediatePropagation();pick(l)}},true);
 // Prevent pointer-driven card activation while selecting; regular interaction returns when Inspect is off.
 document.addEventListener('pointerdown',e=>{if(active&&identify(e)&&!e.target.closest?.('.vlt-panel,.vlt-inspector-layer')){e.preventDefault();e.stopImmediatePropagation()}},true);
 const lookup=n=>controls.find(c=>c[0]===n);
 function numeric(n,el){let v=read(n);const c=lookup(n);if(!c)return 0;let x=parseFloat(v);if(c[2]==='px'&&(!v.endsWith('px')||/calc|clamp|min|max/.test(v))){const r=el?.getBoundingClientRect();x=r?.height||c[3]}return Number.isFinite(x)?x:c[3]}
 function begin(e,kind){if(!selected)return;e.preventDefault();e.stopPropagation();const l=selected,n=nodeFor(l),names=kind==='move'?l.move:[l.scale];drag={kind,l,x:e.clientX,y:e.clientY,values:names.map(k=>k?numeric(k,n):0),rect:bounds(l)};e.currentTarget.setPointerCapture(e.pointerId)}
 function update(e){if(!drag)return;const d=drag,dx=e.clientX-d.x,dy=e.clientY-d.y;const names=d.kind==='move'?d.l.move:[d.l.scale];for(let i=0;i<names.length;i++){const n=names[i],c=lookup(n);if(!c)continue;let delta=d.kind==='move'?(i?dy:dx):Math.hypot(dx,dy)*Math.sign(dx+dy);if(n==='--layout-chat-mist-y')delta=-delta;if(c[2]==='%')delta=delta/(i?Math.max(1,target().clientHeight):Math.max(1,target().clientWidth))*100;if(c[2]==='')delta/=Math.max(100,d.rect?.width||300);const v=Math.max(c[3],Math.min(c[4],d.values[i]+delta));set(n,String(Number(v.toFixed(3)))+c[2]);}onUpdate();redraw()}
 for(const [el,kind] of [[move,'move'],[resize,'scale']]){el.addEventListener('pointerdown',e=>begin(e,kind));el.addEventListener('pointermove',update);el.addEventListener('pointerup',()=>drag=null);el.addEventListener('pointercancel',()=>drag=null)}
 function refresh(){if(selected&&!candidates().some(l=>l.id===selected.id))clear();if(active)redraw()}
 return {toggle,pick:id=>pick(candidates().find(l=>l.id===id)),clear,refresh,active:()=>active,layers:candidates,selected:()=>selected};
}
