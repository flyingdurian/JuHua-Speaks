import {DECK} from '../../src/deck.mjs';
import {ARTEMIS_PORTRAITS} from './ArtemisMachine.mjs';
import {mountArtemisStage} from './ArtemisStage.mjs';
const qs=new URLSearchParams(location.search);
const locale=qs.get('lang')==='zh'?'zh':'en';
const root=document.getElementById('artemis-preview-root');
const select=document.getElementById('portrait-review');
const showcaseCards=[DECK[17],DECK[18],DECK[19]];
select.append(...ARTEMIS_PORTRAITS.map(id=>{
 const option=document.createElement('option');option.value=id;option.textContent=id.replaceAll('_',' ');return option;
}));
let stage=null;
function start(){
 stage?.dispose();
 stage=mountArtemisStage({mount:root,locale,question:locale==='zh'?'我现在应该如何面对新的决定？':'How can I find clarity about a new decision?',
  picks:showcaseCards.map(card=>({id:card.id,orientation:'upright'}))});
 select.value='idle';
 window.__ARTEMIS_STAGE__=stage;
}
select.addEventListener('change',()=>stage.setPortrait(select.value));
document.getElementById('reset-artemis').addEventListener('click',start);
start();