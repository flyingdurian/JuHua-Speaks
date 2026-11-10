import test from 'node:test';
import assert from 'node:assert/strict';
import {DECK} from '../src/deck.mjs';
import {STAGES,beginSelection,advanceStage,chooseCard,collapseIds,peekGeometry,dragPeek,updatePeek,EXPRESSION_STATES,ACTION_STATES,readerStateForBeat} from '../src/ritual-v2/flow.mjs';
test('eight concept-sheet gates remain ordered and cannot skip a stage',()=>{
 assert.equal(STAGES.length,8);let s=beginSelection(DECK.map(c=>c.id));
 assert.throws(()=>advanceStage(s,'peek'),/Illegal/);
 s=advanceStage(s,'enter');s=advanceStage(s,'inside');
 s=chooseCard(s,DECK[0].id);s=chooseCard(s,DECK[1].id);s=chooseCard(s,DECK[2].id);
 assert.equal(s.stage,'selection');
 assert.equal(collapseIds(s).length,75);
 assert.deepEqual(new Set([...collapseIds(s),...s.selected.map(x=>x.id)]),new Set(DECK.map(x=>x.id)));
 assert.throws(()=>advanceStage(s,'artemis'),/Illegal/);
 s=advanceStage(s,'collapse');s=advanceStage(s,'tableau');s=advanceStage(s,'peek');
 assert.throws(()=>advanceStage(s,'artemis'),/Complete/);
 for(let i=0;i<3;i++)s=updatePeek(s,i,1,['left','corner','bottom'][i]);
 s=advanceStage(s,'artemis');assert.equal(s.stage,'artemis');
});
test('selection stays immutable; cannot invent fourth card or lose order',()=>{
 let s=beginSelection(DECK.map(c=>c.id));s=advanceStage(advanceStage(s,'enter'),'inside');
 const start=s;s=chooseCard(s,DECK[7].id);s=chooseCard(s,DECK[4].id);s=chooseCard(s,DECK[3].id);
 assert.equal(start.selected.length,0);
 assert.deepEqual(s.selected.map(x=>x.id),[DECK[7].id,DECK[4].id,DECK[3].id]);
 assert.equal(chooseCard(s,DECK[5].id),s);
 assert.deepEqual(chooseCard(s,DECK[4].id).selected.map(x=>x.id),[DECK[7].id,DECK[3].id]);
});
test('peeling exposes genuine underlying face progressively in four modes, not a flip',()=>{
 for(const mode of ['left','right','corner','bottom']){
  assert.equal(peekGeometry(0,mode).complete,false);
  assert.equal(peekGeometry(.52,mode).complete,false);
  assert.equal(peekGeometry(1,mode).complete,true);
  assert.notEqual(peekGeometry(.52,mode).clipPath,peekGeometry(.12,mode).clipPath);
 }
 assert.equal(dragPeek(.4,500,0,150,200,'left'),1);
 assert.equal(dragPeek(.5,0,-500,150,200,'bottom'),1);
 assert.equal(dragPeek(.5,0,100,150,200,'bottom'),0);
});
test('Artemis state library has eight expressions and eight actions, no cartoon path',()=>{
 assert.equal(EXPRESSION_STATES.length,8);assert.equal(ACTION_STATES.length,8);
 for(let i=0;i<5;i++){const state=readerStateForBeat(i);assert.ok(EXPRESSION_STATES.includes(state.expression));assert.ok(ACTION_STATES.includes(state.action));}
});
