/**
 * Explicit artwork importer. Fetches 78 historic Wikimedia Commons TaionWC scans
 * with license verification and writes only scanned JPEGs, never generated art.
 * Requires network access (GitHub CI or developer machine). No copyrighted Chinese images.
 */
import {DECK} from '../src/deck.mjs';
import {mkdir,writeFile,rename,unlink} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const dir=resolve(import.meta.dirname,'../assets/rws');
const API='https://commons.wikimedia.org/w/api.php';
const agent='JuHuaSpeaksArtworkImporter/0.3 (public-domain scans; https://github.com/flyingdurian/JuHua-Speaks)';
const headers={'User-Agent':agent,'Accept':'application/json'};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function get(url,accept='image/jpeg'){
 for(let attempt=0;attempt<5;attempt++){
  const response=await fetch(url,{headers:{'User-Agent':agent,'Accept':accept},signal:AbortSignal.timeout(25000)});
  if(response.status===429||response.status>=500){await sleep((attempt+1)*1200);continue}
  if(!response.ok)throw new Error(`${response.status} GET ${url}`);
  return response;
 }
 throw new Error(`Too many transient request failures: ${url}`)
}
async function metadata(group){
 const p=new URLSearchParams({action:'query',format:'json',formatversion:'2',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'540',titles:group.map(c=>'File:'+c.filename).join('|')});
 const response=await get(`${API}?${p}`,'application/json');
 const body=await response.json();
 if(body.error)throw new Error(JSON.stringify(body.error));
 const result=new Map();
 for(const page of body.query?.pages||[]){
  if(page.missing||!page.imageinfo?.[0])throw new Error('Missing Wikimedia file: '+page.title);
  const info=page.imageinfo[0];
  const license=String(info.extmetadata?.LicenseShortName?.value||'');
  const copyright=String(info.extmetadata?.Copyrighted?.value||'');
  const usage=String(info.extmetadata?.UsageTerms?.value||'');
  if(copyright.toLowerCase()==='true'||!(/public domain|^pd\b/i.test(license)||/public domain/i.test(usage)))throw new Error(`License gate rejected ${page.title}: ${license} / ${usage} / copyrighted=${copyright}`);
  const file=page.title.replace(/^File:/,'').replaceAll('_',' ');
  const url=info.thumburl||info.url;
  if(!url||!url.startsWith('https://'))throw new Error('No HTTPS image URL: '+page.title);
  result.set(file,{url,license,copyright,file,pageUrl:info.descriptionurl});
 }
 return result;
}
await mkdir(dir,{recursive:true});
const catalog=new Map();
for(let i=0;i<DECK.length;i+=20){const group=DECK.slice(i,i+20);const items=await metadata(group);for(const c of group){const v=items.get(c.filename);if(!v)throw new Error(`Asset not returned: ${c.filename}`);catalog.set(c.id,v)}}
let next=0;const errors=[];const validated=[];
async function worker(){while(next<DECK.length){const card=DECK[next++],entry=catalog.get(card.id),path=join(dir,card.id+'.jpg'),tmp=path+'.tmp';try{
 const response=await get(entry.url);const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length<5000||bytes[0]!==0xff||bytes[1]!==0xd8)throw new Error(`Invalid JPEG bytes for ${card.filename} (${bytes.length})`);
 await writeFile(tmp,bytes);await rename(tmp,path);
 validated.push({id:card.id,file:card.filename,source:entry.pageUrl,license:entry.license,size:bytes.length});
 console.log(`✓ ${card.id} — ${bytes.length} bytes`)
 }catch(error){await unlink(tmp).catch(()=>{});errors.push(`${card.id}: ${error.message}`)}}}
await Promise.all(Array.from({length:4},worker));
if(errors.length)throw new Error(`Artwork import failed:\n${errors.join('\n')}`);
if(validated.length!==78)throw new Error(`Expected 78 JPEGs; got ${validated.length}`);
await writeFile(join(dir,'manifest.json'),JSON.stringify({artist:'Pamela Colman Smith',published:1909,sourceCategory:'https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)',cards:validated.sort((a,b)=>a.id.localeCompare(b.id))},null,2));
console.log('Completed: 78 authentic RWS scanned JPEGs, metadata checked.');
