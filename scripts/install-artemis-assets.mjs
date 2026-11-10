/**
 * Install the original, owner-approved 31 PNGs. Never invent missing artwork,
 * rescale original pixels, or silently mark an absent file "ready".
 *
 * Usage:
 *   npm run assets:artemis -- "/path/to/Artemis_Asset_Candidates"
 *
 * The source directory may be either the extracted root or its parent.
 * Git must commit BOTH assets/artemis/*.png and the generated ready manifest
 * before the all-art-ready state can be reviewed on another machine.
 */
import {readFileSync,existsSync,mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {basename,dirname,join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {ARTEMIS_SOURCE_FILES,ARTEMIS_SOURCE_COUNT} from '../preview/post-shuffle/artemis-art-catalog.mjs';

const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const SIGNATURE=Buffer.from([137,80,78,71,13,10,26,10]);
function locateSource(root){
 const bases=[resolve(root),resolve(root,'Artemis_Asset_Candidates')];
 return bases.find(base=>existsSync(join(base,ARTEMIS_SOURCE_FILES.idle)))||null;
}
export function inspectArtemisPng(buffer,label,group=''){
 if(!Buffer.isBuffer(buffer)||buffer.length<32||!buffer.subarray(0,8).equals(SIGNATURE)
   ||buffer.toString('ascii',12,16)!=='IHDR')throw Error('Not an authentic PNG container: '+label);
 const width=buffer.readUInt32BE(16),height=buffer.readUInt32BE(20),depth=buffer[24],type=buffer[25];
 if(!width||!height||width>8192||height>8192||depth!==8)throw Error('Unexpected PNG pixel geometry: '+label);
 if(group==='portraits'&&(type!==6&&type!==4))throw Error('Artemis portrait must preserve transparency: '+label);
 if(group==='portraits'&&(width<768||height<1152))throw Error('Portrait too small for preview: '+label);
 return {width,height,bitDepth:depth,colorType:type};
}
export function verifyArtemisSource(source){
 const root=locateSource(source);
 if(!root)throw Error('Source must be extracted Artemis_Asset_Candidates containing portraits/artemis_idle.png');
 const records=[];
 for(const [slot,relative] of Object.entries(ARTEMIS_SOURCE_FILES)){
  const path=join(root,relative);
  if(!existsSync(path))throw Error('Missing required original art: '+relative);
  const content=readFileSync(path);
  const geometry=inspectArtemisPng(content,relative,relative.split('/')[0]);
  if(content.length<4096)throw Error('Suspiciously small source asset: '+relative);
  records.push({slot,source:path,target:basename(relative),bytes:content.length,
   sha256:createHash('sha256').update(content).digest('hex'),...geometry});
 }
 if(records.length!==ARTEMIS_SOURCE_COUNT)throw Error('Expected 31 distinct Artemis art files');
 if(new Set(records.map(r=>r.target)).size!==ARTEMIS_SOURCE_COUNT)throw Error('Asset filename collision');
 return records;
}
export function installArtemisAssets(source,{root=project}={}){
 // All 31 are inspected before the first repository write.
 const records=verifyArtemisSource(source);
 const folder=join(root,'assets','artemis');
 mkdirSync(folder,{recursive:true});
 const imported={};
 for(const record of records){
  copyFileSync(record.source,join(folder,record.target));
  imported[record.slot]=record.target;
 }
 writeFileSync(join(folder,'asset-provenance.json'),JSON.stringify({
  source:'Artemis_Asset_Candidates — owner-approved V1 preview',
  status:'candidate-art; original dimensions preserved; cutout QA pending',
  imageCount:records.length,
  images:records.map(({slot,target,bytes,sha256,width,height,colorType})=>({slot,target,bytes,sha256,width,height,colorType}))
 },null,2)+'\n');
 const registration=join(root,'preview','post-shuffle','artemis-assets-ready.mjs');
 writeFileSync(registration,'/** Generated after all 31 source images were verified. Commit with matching PNG assets. */\n'
  +'export const ARTEMIS_IMPORTED_FILES=Object.freeze('+JSON.stringify(imported,null,2)+');\n');
 return {installed:records.length,bytes:records.reduce((sum,r)=>sum+r.bytes,0),directory:folder,registration};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const source=process.argv[2];
 if(!source){console.error('Usage: npm run assets:artemis -- "/path/to/extracted/Artemis_Asset_Candidates"');process.exitCode=2}
 else try{
  const result=installArtemisAssets(source);
  console.log('Registered '+result.installed+' verified original PNGs ('+Math.round(result.bytes/1024/1024)+' MiB).');
  console.log('Commit assets/artemis/*.png, asset-provenance.json and preview/post-shuffle/artemis-assets-ready.mjs together.');
 }catch(error){console.error('Artemis art import FAILED:',error.message);process.exitCode=1}
}
