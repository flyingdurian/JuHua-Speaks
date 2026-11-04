import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {DECK,BY_ID,MAJORS,RANKS,SUITS,DECKS,shuffleDeck,secureRandomInt,drawOrientation,commonsFileUrl,localCardUrl} from '../src/deck.mjs';
import {readingPreview} from '../src/reading.mjs';

test('78 authentic illustrations (22 major, 56 minor) with unique IDs and source filenames',()=>{
 assert.equal(DECK.length,78);assert.equal(MAJORS.length,22);assert.equal(RANKS.length,14);assert.equal(SUITS.length,4);
 assert.equal(DECK.filter(c=>c.suit==='major').length,22);
 assert.equal(new Set(DECK.map(c=>c.id)).size,78);
 assert.equal(new Set(DECK.map(c=>c.filename)).size,78);
 assert.equal(DECK[0].filename,'RWS Tarot 00 Fool.jpg');
 assert.equal(DECK[21].filename,'RWS Tarot 21 World.jpg');
 assert.equal(BY_ID.get('pentacles-14').filename,'Pents14.jpg');
 assert.equal(BY_ID.get('cups-11').name,'Page of Cups');
 for(const c of DECK){assert.ok(c.name&&c.zh&&c.upright&&c.reversed);assert.match(c.filename,/\.jpg$/);assert.match(commonsFileUrl(c),/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);assert.match(localCardUrl(c),/assets\/rws\/.+\.jpg$/)}
});
test('shuffles are permutations and original deck is not mutated',()=>{
 const initial=[...DECK];for(let i=0;i<30;i++){const shuffled=shuffleDeck(DECK,max=>secureRandomInt(max,webcrypto));assert.equal(shuffled.length,78);assert.equal(new Set(shuffled.map(x=>x.id)).size,78);assert.deepEqual(new Set(shuffled.map(x=>x.id)),new Set(DECK.map(x=>x.id)));}assert.deepEqual(DECK,initial)
});
test('random int validates range and can reject biased samples',()=>{
 assert.throws(()=>secureRandomInt(0,webcrypto));assert.throws(()=>secureRandomInt(-1,webcrypto));
 const values=[4294967295,6];let i=0;
 const mock={getRandomValues(a){a[0]=values[i++];return a}};
 assert.equal(secureRandomInt(10,mock),6);
 assert.equal(i,2);
 assert.ok(['upright','reversed'].includes(drawOrientation(()=>0)));
 assert.equal(drawOrientation(()=>0),'reversed');assert.equal(drawOrientation(()=>1),'upright');
});
test('readings incorporate exact question, role and card symbolism without claiming AI',()=>{
 const cards=[{card:DECK[0],orientation:'upright'},{card:DECK[1],orientation:'reversed'},{card:DECK[2],orientation:'upright'}];
 const en=readingPreview({question:'Should I change jobs?',picks:cards,options:['Move','Stay'],lang:'en'});
 assert.match(en.synthesis,/Should I change jobs/);
 assert.match(en.cards[0].position,/Move/);
 assert.match(en.cards[1].text,/untapped skills/);
 assert.match(en.reflection,/working conditions/);
 assert.equal(en.mode,'local-preview');
 const zh=readingPreview({question:'我应该换工作吗？',picks:cards,lens:'chinese',lang:'zh'});
 assert.match(zh.synthesis,/我应该换工作吗/);
 assert.match(zh.synthesis,/《易经》/);
 assert.throws(()=>readingPreview({question:'',picks:cards}));
 assert.throws(()=>readingPreview({question:'test',picks:[cards[0]]}));
});
test('Chinese illustrated deck remains restricted until usage rights are secured',()=>{
 assert.equal(DECKS.find(d=>d.id==='rws').status,'ready');
 assert.equal(DECKS.find(d=>d.id==='chinese-tarot').status,'license-required');
});
