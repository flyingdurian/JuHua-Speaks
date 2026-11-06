/** Gate A requires all 78 verified historical JPEG faces before opening the preview.
 * Missing local art is fetched ONLY from the existing license-gated Wikimedia importer.
 * The tracked manifest is preserved to avoid accidental GitHub Desktop conflicts.
 */
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
function run(script,env=process.env){
 return spawnSync(process.execPath,[resolve(root,script)],{cwd:root,env,stdio:'inherit'}).status===0;
}
if(run('scripts/audit-assets.mjs')){
 console.log('Gate A: all 78 authentic RWS card JPEGs are present and validated.');
}else{
 console.log('\nGate A: missing or invalid RWS images. Importing 78 verified public-domain originals...');
 console.log('This initial download needs internet access and may take several minutes.');
 const imported=run('scripts/sync-rws-assets.mjs',{...process.env,RWS_SKIP_MANIFEST_WRITE:'1'});
 if(!imported||!run('scripts/audit-assets.mjs')){
  console.error('\nGate A cannot show real illustrations. Check internet connectivity and run: npm run assets:sync');
  process.exitCode=1;
 }else console.log('Gate A: original artwork ready; starting visual preview.');
}
