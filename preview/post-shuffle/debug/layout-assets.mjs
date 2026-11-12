/* Local-only asset workshop. PNG/JPEG/WebP/GIF; no executable SVG/HTML. */
export const SLOTS=[
 ['reading-portrait','Artemis reading portrait (all chapters)'],['focused','Artemis focused synthesis portrait'],['conjuring','Artemis ritual conjuring pose'],
 ['reading-frame','Reading frame'],['chat-frame','Synthesis frame (responsive)'],['chat-frame-desktop','Synthesis desktop frame'],['chat-frame-mobile','Synthesis mobile frame'],
 ['chamber','Celestial chamber'],['halo','Reading halo'],['glow','Reading/card glow'],['mist','Chat mist overlay'],['nameplate','Reader nameplate'],
 ['next','Next / Ask Artemis button art'],['previous','Previous button art'],['ask','Chat ASK button art'],['input','Chat input art'],['avatar','All chat avatars'],
 ['avatar-neutral','Avatar neutral'],['avatar-warm_welcome','Avatar warm welcome'],['avatar-focused_observation','Avatar focused'],['avatar-thoughtful','Avatar thoughtful'],['avatar-surprised','Avatar surprised'],['avatar-reassuring','Avatar reassuring'],['avatar-confident','Avatar confident'],['avatar-mystical','Avatar mystical']
];
const slotIds=new Set(SLOTS.map(x=>x[0]));
const MIME={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'};
const MAX=20*1024*1024;
const DB='juhua-layout-assets-v2';
function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('assets');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function transaction(mode,fn){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('assets',mode),s=t.objectStore('assets');let result;try{result=fn(s)}catch(e){reject(e);d.close();return}t.oncomplete=()=>{d.close();resolve(result?.result)};t.onerror=()=>{d.close();reject(t.error)};t.onabort=()=>{d.close();reject(t.error)}})}
async function verifyImage(file){if(!MIME[file.type]||file.size>MAX||!file.size)throw Error('Choose PNG, JPG, WEBP or GIF, max 20 MB.');const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();if(!img.naturalWidth||!img.naturalHeight)throw Error('Invalid image');return {width:img.naturalWidth,height:img.naturalHeight}}finally{URL.revokeObjectURL(url)}}
const enc=new TextEncoder(),dec=new TextDecoder();
const crcTable=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0});
function crc(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0}
function header(size,fields){const b=new Uint8Array(size),d=new DataView(b.buffer);for(const [off,v,n] of fields)n===2?d.setUint16(off,v,true):d.setUint32(off,v,true);return b}
export async function makeZip(files){
 const chunks=[],central=[];let offset=0,centralSize=0;
 for(const [name,data] of files){const nm=enc.encode(name),bytes=typeof data==='string'?enc.encode(data):new Uint8Array(await data.arrayBuffer()),c=crc(bytes);
 const local=header(30,[[0,0x04034b50,4],[4,20,2],[6,0x800,2],[14,c,4],[18,bytes.length,4],[22,bytes.length,4],[26,nm.length,2]]);
 chunks.push(local,nm,bytes);
 const cd=header(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x800,2],[16,c,4],[20,bytes.length,4],[24,bytes.length,4],[28,nm.length,2],[42,offset,4]]);
 central.push(cd,nm);centralSize+=cd.length+nm.length;offset+=local.length+nm.length+bytes.length;
 }
 const end=header(22,[[0,0x06054b50,4],[8,files.length,2],[10,files.length,2],[12,centralSize,4],[16,offset,4]]);
 return new Blob([...chunks,...central,end],{type:'application/zip'});
}
export async function readZip(file){
 if(file.size>250*1024*1024)throw Error('Package exceeds 250 MB.');
 const b=new Uint8Array(await file.arrayBuffer()),d=new DataView(b.buffer),out=new Map();let i=0;
 while(i+30<=b.length&&d.getUint32(i,true)===0x04034b50){
  const flags=d.getUint16(i+6,true),method=d.getUint16(i+8,true),checksum=d.getUint32(i+14,true),size=d.getUint32(i+18,true),nameLen=d.getUint16(i+26,true),extra=d.getUint16(i+28,true),start=i+30+nameLen+extra;
  if(method!==0||flags&8||size>MAX+2*1024*1024||start+size>b.length)throw Error('Only unmodified tuner ZIP packages are supported.');
  const name=dec.decode(b.slice(i+30,i+30+nameLen));if(!/^[a-zA-Z0-9_./-]+$/.test(name)||name.includes('..')||name.startsWith('/')||out.has(name))throw Error('Invalid package path');
  const bytes=b.slice(start,start+size);if(crc(bytes)!==checksum)throw Error('Package checksum mismatch: '+name);
  out.set(name,bytes);i=start+size;if(out.size>80)throw Error('Too many files');
 }
 return out;
}
export function createAssetWorkshop({status,onChange}){
 const records=new Map(),urls=new Map(),root=document.documentElement;
 function apply(){
  root.dataset.vltAssets=[...records.keys()].join(' ');
  for(const [slot,url] of urls)root.style.setProperty('--vlt-asset-'+slot,'url("'+url+'")');
  onChange();
 }
 async function load(){try{const all=await transaction('readonly',s=>s.getAll());for(const r of all||[]){if(slotIds.has(r.slot)&&r.blob instanceof Blob){records.set(r.slot,r);urls.set(r.slot,URL.createObjectURL(r.blob))}}apply()}catch(e){status('Asset storage unavailable: '+e.message)}}
 async function put(slot,file){if(!slotIds.has(slot))throw Error('Unknown asset slot');const dimensions=await verifyImage(file);const record={slot,name:file.name||slot+'.'+MIME[file.type],type:file.type,blob:file,...dimensions};
  try{await transaction('readwrite',s=>s.put(record,slot))}catch(e){status('Asset applied for this session; local storage failed. Export your package.')}
  if(urls.has(slot))URL.revokeObjectURL(urls.get(slot));records.set(slot,record);urls.set(slot,URL.createObjectURL(file));apply();return record}
 async function reset(slot){try{await transaction('readwrite',s=>s.delete(slot))}catch{}if(urls.has(slot))URL.revokeObjectURL(urls.get(slot));urls.delete(slot);records.delete(slot);root.style.removeProperty('--vlt-asset-'+slot);apply()}
 async function exportPackage(profiles,css,consumerCSS,assetCSS,base){
  const list=[],files=[];for(const r of records.values()){const path='assets/'+r.slot+'.'+MIME[r.type];list.push({slot:r.slot,path,originalName:r.name,type:r.type,width:r.width,height:r.height,bytes:r.blob.size});files.push([path,r.blob])}
  const manifest={format:'juhua-visual-layout-package',version:2,base,createdAt:new Date().toISOString(),profiles,assets:list};
  files.push(['manifest.json',JSON.stringify(manifest,null,2)],['theme-layout-variables.css',css],['layout-overrides.css',consumerCSS],['asset-overrides.css',assetCSS],
   ['README.md','# JuHua visual layout package\n\nBase: '+base+'\n\nThe package includes only deliberate layout edits, responsive profile values, and original uploaded asset bytes. The asset CSS uses relative package paths; update paths when integrating into the production repo. Do not merge the debug overlay. Apply approved variable declarations and matching consumer rules, verify responsive geometry, and install approved assets into their corresponding production slots. Original Tarot card art and gameplay are unchanged. Mobile frame artwork may contain baked CTA graphics; swap the frame art if those pixels need removal.\n']);
  return makeZip(files);
 }
 async function importPackage(file){
  const entries=await readZip(file),raw=entries.get('manifest.json');if(!raw)throw Error('Missing manifest.json');
  const m=JSON.parse(dec.decode(raw));if(m.format!=='juhua-visual-layout-package'||m.version!==2||!Array.isArray(m.assets)||!m.profiles)throw Error('Unsupported package');
  // Validate all payloads before changing local state.
  const prepared=[];
  for(const r of m.assets){if(!slotIds.has(r.slot)||!MIME[r.type]||!entries.has(r.path))throw Error('Invalid asset entry');const f=new File([entries.get(r.path)],r.originalName||r.slot+'.'+MIME[r.type],{type:r.type});await verifyImage(f);prepared.push([r.slot,f])}
  for(const slot of [...records.keys()])await reset(slot);for(const [slot,f] of prepared)await put(slot,f);
  return m.profiles;
 }
 return {load,put,reset,records,exportPackage,importPackage};
}
