/**
 * An opt-in, private SESSION-ONLY image import. No scanned copyrighted deck
 * assets are transmitted, uploaded, committed, cached in a backend, or copied.
 * Users must supply authorized images they have permission to use locally.
 */
const ALLOWED=/\.(jpg|jpeg|png|webp)$/i;
const MAX_BYTES=12*1024*1024;
export function validatePrivateDeckFiles(files,cards){
 const supplied=Array.from(files||[]);
 if(supplied.length!==cards.length)throw new Error(`Expected ${cards.length} images, got ${supplied.length}`);
 const expected=new Set(cards.map(c=>c.id));
 const used=new Map();
 for(const file of supplied){
  const name=String(file.name||'');if(!ALLOWED.test(name))throw new Error(`Not a supported image: ${name}`);
  if(!(file.size>0&&file.size<=MAX_BYTES))throw new Error(`Invalid size: ${name}`);
  if(file.type&&!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error(`Invalid image MIME type: ${name}`);
  const key=name.replace(ALLOWED,'').toLowerCase();
  if(!expected.has(key))throw new Error(`Unknown card filename: ${name}. See the mapping guide.`);
  if(used.has(key))throw new Error(`Duplicate card: ${key}`);
  used.set(key,file);
 }
 if(used.size!==expected.size)throw new Error('Not all 78 different cards were included');
 return used;
}
export function deckFileNameGuide(cards){return cards.map(c=>`${c.id}.jpg  —  ${c.name} / ${c.zh}`).join('\n')}
