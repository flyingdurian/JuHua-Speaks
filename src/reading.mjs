/** Reflective, local-only preview. Does NOT claim live AI or predict outcomes. */
export const LENSES={
  western:{en:'Consider what these symbols reveal about your priorities and habitual choices.',zh:'思考这些象征与你的优先事项和惯常选择有什么联系。'},
  chinese:{en:'Consider continuity, relationships and responsibilities that matter to you. This remains Tarot, not the I Ching.',zh:'也可考虑自己看重的延续性、人际关系与责任。这仍是塔罗，并非《易经》占卜。'},
  universal:{en:'Compare observable facts and practical tradeoffs without assuming a supernatural cause.',zh:'不预设超自然原因，着重比较可观察的事实与现实得失。'}
};
const THEMES=[
  {re:/job|career|work|offer|employment|company|工作|职业|跳槽|职位|公司|升职|事业/i,en:'working conditions, future opportunities and concrete terms',zh:'实际工作条件、未来机会与具体条款'},
  {re:/love|relationship|marriage|dating|partner|breakup|感情|恋爱|婚姻|伴侣|分手|关系/i,en:'communication, trust and everyone’s needs',zh:'沟通、信任与双方真实的需要'},
  {re:/finance|money|saving|salary|debt|investment|财务|投资|收入|工资|债务|存款/i,en:'resources, risk and realistic commitments',zh:'资源、风险与现实责任'},
  {re:/family|parent|child|home|家庭|父母|孩子|家人/i,en:'care, boundaries and responsibilities',zh:'关怀、边界与责任'}
];
export function readingPreview({question,picks,spread='crossroads',lens='western',options=['',''],lang='en'}){
  if(!question?.trim())throw new Error('A question is required');
  if(!Array.isArray(picks)||picks.length!==3||picks.some(p=>!p.card||!['upright','reversed'].includes(p.orientation)))throw new Error('Three valid cards required');
  const locale=lang==='zh'?'zh':'en';
  const th=THEMES.find(t=>t.re.test(question))||{en:'your priorities, wellbeing and available choices',zh:'你的优先事项、身心状态和可选道路'};
  const positions=spread==='crossroads'
    ?[locale==='zh'?`方向 A：${options[0]||'第一种选择'}`:`Path A: ${options[0]||'first option'}`,locale==='zh'?`方向 B：${options[1]||'第二种选择'}`:`Path B: ${options[1]||'second option'}`,locale==='zh'?'整合建议':'Guidance']
    :locale==='zh'?['当前处境','潜在影响','下一步']:['Current situation','Hidden influence','Next step'];
  const cards=picks.map((p,i)=>{
    const c=p.card,meaning=c[p.orientation],name=locale==='zh'?c.zh:c.name;
    return {id:c.id,name,position:positions[i],orientation:p.orientation,meaning,
      text:locale==='zh'?`${name}在「${positions[i]}」位置，提示你留意「${meaning}」的主题。结合你提到的${th.zh}，哪些真实信息支持或反驳这种理解？`:`In “${positions[i]},” ${name} highlights ${meaning}. For your question about ${th.en}, what real-world evidence supports or challenges that interpretation?`};
  });
  const lensText=(LENSES[lens]||LENSES.western)[locale];
  const synthesis=locale==='zh'?`你问的是：「${question}」。${cards[0].name}、${cards[1].name}与${cards[2].name}分别提供不同观察角度。可以把它们作为梳理${th.zh}的提示，而不是对结果的保证。${lensText}`:`You asked: “${question}”. ${cards[0].name}, ${cards[1].name} and ${cards[2].name} suggest three different ways to examine ${th.en}. These are prompts for reflection, not guarantees of a future outcome. ${lensText}`;
  const reflection=locale==='zh'?`为了更清楚了解${th.zh}，你这周可以确认哪一项具体事实？`:`What one concrete fact about ${th.en} could you check this week?`;
  return {cards,synthesis,reflection,lens,mode:'local-preview',question};
}
