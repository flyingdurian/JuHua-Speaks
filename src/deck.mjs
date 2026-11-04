/**
 * Source set: Wikimedia Commons, category "Rider-Waite-Smith tarot deck (TaionWC)".
 * 78 genuine Pamela Colman Smith scans, 22 Major + 56 Minor Arcana.
 * Artist/rights/source information: docs/DECK_ARTWORK.md.
 * Do not replace these assets with vector approximations, AI recreations, or modern copyrighted recolorings.
 */
export const MAJORS = [
  ['The Fool','愚者','a beginning that invites curiosity','unprepared risk or fear of beginning','gold','Fool'],
  ['The Magician','魔术师','resourcefulness and deliberate action','untapped skills or scattered effort','ember','Magician'],
  ['The High Priestess','女祭司','intuition and knowledge below the surface','an overlooked intuition or an unanswered question','violet','High Priestess'],
  ['The Empress','皇后','nurturing, creativity and growth','overgiving or neglected needs','jade','Empress'],
  ['The Emperor','皇帝','structure, responsibility and boundaries','rigidity or a struggle over control','gold','Emperor'],
  ['The Hierophant','教皇','shared values, mentors and tradition','questioning convention or unhelpful rules','violet','Hierophant'],
  ['The Lovers','恋人','alignment, connection and meaningful choice','misalignment or unresolved commitments','rose','Lovers'],
  ['The Chariot','战车','determination and focused direction','forcing a direction without agreement','ember','Chariot'],
  ['Strength','力量','patient courage and gentle resilience','self-doubt or emotional fatigue','gold','Strength'],
  ['The Hermit','隐者','reflection and independent insight','isolation or avoiding needed counsel','violet','Hermit'],
  ['Wheel of Fortune','命运之轮','shifting circumstances and cycles','resistance to change or reliance on chance','gold','Wheel of Fortune'],
  ['Justice','正义','fairness, evidence and accountability','unfair terms or evading inconvenient facts','silver','Justice'],
  ['The Hanged Man','倒吊人','a pause that offers a different perspective','unproductive waiting or reluctant sacrifice','violet','Hanged Man'],
  ['Death','死神','a transition that leaves room for renewal','holding on to a chapter that is ending','silver','Death'],
  ['Temperance','节制','balance, patience and integration','incompatible priorities or imbalance','jade','Temperance'],
  ['The Devil','恶魔','attachments and limiting patterns','recognizing and loosening an old pattern','violet','Devil'],
  ['The Tower','高塔','disruption that exposes what is unstable','resisting necessary change or rebuilding carefully','silver','Tower'],
  ['The Star','星星','hope, repair and a guiding vision','discouragement or difficulty trusting progress','blue','Star'],
  ['The Moon','月亮','uncertainty, feelings and incomplete information','anxiety or emerging clarity','violet','Moon'],
  ['The Sun','太阳','clarity, energy and visible progress','delayed joy or unrealistic optimism','gold','Sun'],
  ['Judgement','审判','an honest review and a call to grow','harsh self-judgment or avoiding a decision','silver','Judgement'],
  ['The World','世界','completion, integration and a wider horizon','unfinished business or a delayed transition','jade','World']
];
export const SUITS = [
  {id:'wands', name:'Wands', zh:'权杖', file:'Wands', color:'ember', symbol:'initiative and creative energy', reverse:'blocked momentum or overextension'},
  {id:'cups', name:'Cups', zh:'圣杯', file:'Cups', color:'rose', symbol:'feelings and relationships', reverse:'unspoken feelings or emotional imbalance'},
  {id:'swords', name:'Swords', zh:'宝剑', file:'Swords', color:'silver', symbol:'thought, communication and truth', reverse:'mental strain or disagreement'},
  {id:'pentacles', name:'Pentacles', zh:'星币', file:'Pents', color:'jade', symbol:'resources and practical security', reverse:'resource pressure or neglected logistics'}
];
export const RANKS = [
  ['Ace','一','a new opportunity','a start that needs preparation'],
  ['Two','二','a decision or balance','indecision or competing priorities'],
  ['Three','三','collaboration and early progress','misalignment or delay'],
  ['Four','四','structure and stability','stagnation or overcontrol'],
  ['Five','五','tension requiring attention','unresolved conflict'],
  ['Six','六','support and exchange','imbalanced giving or receiving'],
  ['Seven','七','testing your convictions','doubt or misplaced effort'],
  ['Eight','八','practice and movement','delays or wasted effort'],
  ['Nine','九','persistence toward a goal','fatigue or defensiveness'],
  ['Ten','十','the outcome of accumulated effort','overload or difficulty releasing pressure'],
  ['Page','侍从','curiosity and a fresh message','immaturity or missed signals'],
  ['Knight','骑士','active pursuit','rushing or inconsistent effort'],
  ['Queen','王后','attentive maturity','overgiving or unclear boundaries'],
  ['King','国王','mastery and responsibility','rigidity or misused influence']
];
const pad=n=>String(n).padStart(2,'0');
export const DECK = Object.freeze([
  ...MAJORS.map((r,i)=>Object.freeze({id:`major-${pad(i)}`,number:i,name:r[0],zh:r[1],upright:r[2],reversed:r[3],aura:r[4],suit:'major',filename:`RWS Tarot ${pad(i)} ${r[5]}.jpg`})),
  ...SUITS.flatMap(s=>RANKS.map((r,i)=>Object.freeze({id:`${s.id}-${pad(i+1)}`,number:i+1,name:`${r[0]} of ${s.name}`,zh:`${s.zh}${r[1]}`,upright:`${r[2]} in ${s.symbol}`,reversed:`${r[3]} related to ${s.reverse}`,aura:s.color,suit:s.id,filename:`${s.file}${pad(i+1)}.jpg`})))
]);
export const BY_ID = new Map(DECK.map(c=>[c.id,c]));
export const DECKS = Object.freeze([
  {id:'rws',title:'Rider–Waite–Smith',zh:'经典韦特塔罗',status:'ready',cards:78,artist:'Pamela Colman Smith',year:1909},
  {id:'chinese-tarot',title:'The Chinese Tarot',zh:'中国塔罗',status:'license-required',cards:78,artist:'Jui Guoliang',year:1989,infoUrl:'https://www.usgamesinc.com/the-chinese-tarot.html'}
]);
export const AURAS=Object.freeze({gold:'#f0cb80',ember:'#f0a471',violet:'#c3a5fa',jade:'#96dbba',rose:'#f1a9cb',silver:'#a9d6e7',blue:'#99c6ff'});

/** All 78 cards get identical selection weight. Secure shuffle where available. */
export function secureRandomInt(max,cryptoProvider=globalThis.crypto){
  if(!Number.isSafeInteger(max)||max<=0)throw new RangeError('max must be a positive safe integer');
  if(max>0xffffffff)throw new RangeError('max exceeds supported random range');
  if(!cryptoProvider?.getRandomValues)throw new Error('A secure random source is required');
  const domain=0x100000000;
  const cap=Math.floor(domain/max)*max;
  const data=new Uint32Array(1);
  do{cryptoProvider.getRandomValues(data)}while(data[0]>=cap);
  return data[0]%max;
}
export function shuffleDeck(cards=DECK,random=secureRandomInt){
  const result=[...cards];
  for(let i=result.length-1;i>0;i--){const j=random(i+1);[result[i],result[j]]=[result[j],result[i]]}
  return result;
}
export function drawOrientation(random=secureRandomInt){return random(4)===0?'reversed':'upright'}
export function commonsFileUrl(card){return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(card.filename.replaceAll(' ','_'))}`}
export function commonsThumbnailUrl(card){return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(card.filename)}?width=480`}
export function localCardUrl(card){return new URL(`../assets/rws/${card.id}.jpg`,import.meta.url).href}
