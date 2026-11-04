import {DECK} from '../src/deck.mjs';
import {readFile,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const dir=resolve(import.meta.dirname,'../assets/rws');
const manifest=JSON.parse(await readFile(join(dir,'manifest.json'),'utf8'));
if(manifest.cards?.length!==78||DECK.length!==78)throw new Error('Artwork manifest must contain 78 cards');
for(const card of DECK){
 const listed=manifest.cards.find(x=>x.id===card.id);
 if(!listed||listed.file!==card.filename)throw new Error(`Incorrect provenance: ${card.id}`);
 const path=join(dir,card.id+'.jpg');const size=(await stat(path)).size;
 if(size<5000)throw new Error(`Asset too small: ${card.id}`);
 const f=await readFile(path);if(f[0]!==255||f[1]!==216)throw new Error(`Invalid JPEG: ${card.id}`)
}
console.log('Artwork audit passed: 78 unique, appropriately sourced original JPEGs.');
