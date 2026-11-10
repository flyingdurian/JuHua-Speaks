/**
 * Review-only reproducible handoff for the Gate C selection shortcut.
 * The real ritual uses the private shuffled order and never calls this path.
 */
import {DECK} from '../../src/deck.mjs';
export function reviewDeckOrder(seed=2165840022){
 if(!Number.isSafeInteger(seed)||seed<0)throw new RangeError('Review seed must be a nonnegative safe integer');
 const ids=DECK.map(c=>c.id),seen=new Set(ids);
 if(ids.length!==78||seen.size!==78)throw Error('Review deck requires 78 unique Tarot cards');
 let state=seed>>>0;
 const next=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296};
 for(let i=ids.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
 return ids;
}
export function selectionReviewRequested(query=''){
 return new URLSearchParams(query).get('skip')==='selection';
}
