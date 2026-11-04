/**
 * JuHua Speaks v0.7 — strictly local, deterministic scripted reading demo.
 * This module never calls a model, fetches a URL, stores conversation text,
 * or promises an outcome. Replace it behind the existing private AI contract later.
 */
const TOPICS = [
  {id:'career',re:/\b(job|career|work|promotion|offer|employment|boss|company|resign|interview)\b|工作|事业|跳槽|升职|面试|公司|辞职|职位/i,
    en:{issue:'work, growth, and the terms of each opportunity',facts:'role expectations, compensation, learning potential, and working conditions',action:'write down the non-negotiable conditions of each path',check:'ask a concrete question about the day-to-day responsibilities'},
    zh:{issue:'工作、成长与不同机会的实际条件',facts:'岗位职责、薪酬、成长空间与工作环境',action:'列出两条道路各自不能妥协的条件',check:'询问工作日常中的一个具体职责'}},
  {id:'relationship',re:/\b(love|relationship|partner|dating|marriage|ex|breakup|friendship|crush)\b|恋爱|感情|关系|婚姻|分手|伴侣|朋友/i,
    en:{issue:'connection, boundaries, and mutual expectations',facts:'what each person has said, how they act, and whether needs are respected',action:'name one boundary or need you have not stated clearly',check:'arrange a respectful conversation rather than guessing someone’s thoughts'},
    zh:{issue:'情感连接、界限与彼此的期待',facts:'双方说过的话、实际行动与需求是否得到尊重',action:'明确一项还没有说清楚的界限或需要',check:'坦诚沟通，而不是猜测对方心思'}},
  {id:'money',re:/\b(money|invest|financial|rent|debt|budget|savings|salary|house|buy|purchase)\b|财务|投资|债务|存款|工资|购房|钱|收入/i,
    en:{issue:'resources, stability, and financial trade-offs',facts:'actual costs, the downside risk, and your available financial buffer',action:'compare realistic best- and worst-case budgets',check:'verify the numbers with a reliable source before committing'},
    zh:{issue:'资源、稳定性与财务取舍',facts:'实际成本、下行风险及可用的资金缓冲',action:'对照最好与最坏情境下的真实预算',check:'在承诺前通过可靠来源核实数字'}},
  {id:'family',re:/\b(family|parent|child|home|sibling|mother|father)\b|家庭|父母|孩子|家人|亲子|兄弟姐妹/i,
    en:{issue:'care, obligations, and healthy boundaries',facts:'who is affected, which commitments are shared, and whose needs are unmet',action:'clarify what you can genuinely offer without overextending',check:'speak with the people affected before deciding for them'},
    zh:{issue:'关怀、责任与健康的界限',facts:'谁会受到影响、责任如何分担及哪些需要尚未满足',action:'确定自己真正能够承担而不过度消耗的部分',check:'先与受影响的人交谈，不替他人做决定'}},
  {id:'study',re:/\b(study|school|university|college|exam|learn|education|course)\b|学习|大学|考试|学业|课程|升学/i,
    en:{issue:'learning, effort, and long-term direction',facts:'time available, feedback, and the skills each choice will build',action:'set a small, measurable learning milestone',check:'ask for feedback from someone who knows the relevant requirements'},
    zh:{issue:'学习投入、反馈与长期方向',facts:'可支配时间、已有反馈与各选择能积累的技能',action:'设立一个小而可衡量的学习目标',check:'向了解要求的人请教具体反馈'}},
  {id:'growth',re:/\b(change|future|purpose|direction|confidence|move|moving|self|growth)\b|未来|方向|改变|成长|自我|搬家|信心/i,
    en:{issue:'personal direction, values, and capacity for change',facts:'your priorities, available support, and the consequences you can control',action:'choose one small experiment instead of demanding certainty',check:'notice what changes in your energy or clarity after that step'},
    zh:{issue:'个人方向、价值观与面对变化的能力',facts:'你的优先顺序、可获得的支持与能够控制的后果',action:'先尝试一项小实验，而不是要求完全确定',check:'留意采取这一步后精力与清晰度有什么变化'}},
];
const GENERAL={id:'general',en:{issue:'your question and the choices within your influence',facts:'what you know, what remains unknown, and what matters most',action:'write the central trade-off in one sentence',check:'confirm one fact that could meaningfully change your view'},zh:{issue:'你的问题以及可以影响的选择',facts:'已经知道的事实、尚不明确的信息与最重要的价值',action:'用一句话写出这次选择真正的取舍',check:'核实一项足以改变判断的重要事实'}};
const LENSES={
 western:{en:'Use the imagery as a mirror of priorities and patterns—not as an external verdict.',zh:'把图像当成映照价值观与行为模式的镜子，而不是外部裁决。'},
 chinese:{en:'You may also consider continuity, reciprocity, and responsibilities meaningful to you. This is Tarot, not I Ching.',zh:'也可以考虑你珍视的延续性、礼尚往来与责任。这仍是塔罗，而非《易经》占卜。'},
 universal:{en:'Ground every insight in observations, trade-offs, and your own agency.',zh:'把每条启示落到观察、取舍和你能采取的行动上。'},
};
const SUITS={
 major:{en:'a larger pattern or turning point',zh:'一个更大的模式或转折点'},
 wands:{en:'initiative, momentum, and motivation',zh:'主动性、势头与内在动力'},
 cups:{en:'feelings, connection, and unspoken needs',zh:'情感、联系与尚未表达的需要'},
 swords:{en:'facts, communication, and difficult clarity',zh:'事实、沟通与不容易面对的清晰认识'},
 pentacles:{en:'practical resources, time, and sustainable effort',zh:'现实资源、时间与可持续的投入'},
};
const MAJOR_ZH=[
 ['勇敢开启新阶段','贸然行动或因恐惧迟迟不开始'],['发挥现有能力与资源','资源分散或潜能未用'],
 ['相信直觉并观察未显现的信息','忽略直觉或信息仍不透明'],['滋养创造力与成长','过度付出而忽略自己'],
 ['建立秩序与清晰边界','规则僵化或控制欲过强'],['尊重传统并寻求指导','不适合自己的惯例需要重新审视'],
 ['价值契合与重要选择','彼此需要尚未协调'],['集中意志朝目标前进','方向失衡或勉强推进'],
 ['温柔而坚定的勇气','自我怀疑或疲惫'],['独处反思与寻找洞察','孤立自己或拒绝帮助'],
 ['环境变化与周期更替','抗拒改变或依赖运气'],['公平、证据与责任','条款不公或回避事实'],
 ['换个角度暂停思考','无效等待或不愿付出'],['告别旧阶段并迎向更新','不愿放下已经结束的篇章'],
 ['平衡、耐心与整合','优先事项冲突或失衡'],['留意束缚与依附','逐渐看清并摆脱旧模式'],
 ['动荡揭示薄弱的基础','抗拒必要转变或小心重建'],['希望、修复与远景','灰心或暂时失去信心'],
 ['不确定的情绪与未明信息','焦虑影响判断或真相渐明'],['清晰、活力与可见进展','喜悦延迟或期望不切实际'],
 ['诚实回顾与成长召唤','过于苛责自己或逃避决定'],['完成、整合与新的视野','还有未竟之事或转变延迟']
];
const MINOR_RANK_ZH={1:['新的机会','尚须准备的开端'],2:['选择与平衡','犹豫和拉扯'],3:['合作与进展','方向不齐或延迟'],4:['稳定与秩序','停滞或控制过度'],5:['需要面对的冲突','尚未解决的摩擦'],6:['支持与交换','付出失衡'],7:['检验信念','怀疑或用力方向不对'],8:['练习与行动','延迟或无效努力'],9:['坚持到最后','疲惫或防卫'],10:['积累的成果与责任','负担过重'],11:['好奇心与消息','不成熟或忽略提示'],12:['主动追求','操之过急'],13:['成熟理解','过度照顾他人'],14:['掌握方向与责任','僵化或滥用影响力']};
const localizedMeaning=(entry,lang)=>{
 const c=entry.card,rev=entry.orientation==='reversed';
 if(lang!=='zh')return rev?c.reversed:c.upright;
 if(c.suit==='major')return MAJOR_ZH[c.number]?.[rev?1:0]||'变化与抉择';
 const rank=MINOR_RANK_ZH[c.number]?.[rev?1:0]||'现实中的选择';
 return `${rank}（${SUITS[c.suit]?.zh||'塔罗象征'}）`;
};
const normalize=lang=>lang==='zh'?'zh':'en';
const cardName=(entry,lang)=>lang==='zh'?entry.card.zh:entry.card.name;
const role=(spread,i,lang,options)=>{
 if(spread!=='crossroads')return (lang==='zh'?['当前处境','潜在影响','下一步']:['Current situation','Underlying influence','Next step'])[i];
 const label=lang==='zh'?['方向 A','方向 B','整合建议']:['Path A','Path B','Guidance'];
 return i===2?label[i]:`${label[i]} · ${options[i]|| (lang==='zh'?`选项 ${i===0?'A':'B'}`:`Option ${i===0?'A':'B'}`)}`;
};
export function classifyQuestion(question){return TOPICS.find(topic=>topic.re.test(String(question||'')))||GENERAL;}
function validate({question,picks,options,lang,spread,lens}){
 if(typeof question!=='string'||question.trim().length<3||question.length>600)throw Error('Question must be 3–600 characters');
 if(!Array.isArray(picks)||picks.length!==3||new Set(picks.map(p=>p.card?.id)).size!==3||picks.some(p=>!p.card||!['upright','reversed'].includes(p.orientation)))throw Error('Three distinct cards and orientations required');
 if(spread!=='crossroads'&&spread!=='insight')throw Error('Invalid spread');
 if(!LENSES[lens])throw Error('Invalid perspective');
 if(!Array.isArray(options)||options.length!==2)throw Error('Expected two option strings');
 return {lang:normalize(lang),topic:classifyQuestion(question),options:options.map(x=>String(x||'').trim().slice(0,120))};
}
export function buildDemoReading({question,picks,options=['',''],lang='en',spread='crossroads',lens='western'}){
 const checked=validate({question,picks,options,lang,spread,lens});
 const locale=checked.lang,topic=checked.topic[locale];
 const cards=picks.map((entry,i)=>{
  const c=entry.card,name=cardName(entry,locale),position=role(spread,i,locale,checked.options);
  const meaning=localizedMeaning(entry,locale);
  const symbolic=SUITS[c.suit]?.[locale]||SUITS.major[locale];
  const text=locale==='zh'
   ?`在「${position}」的位置上，${name}${entry.orientation==='reversed'?'逆位':'正位'}提示你留意「${meaning}」。它把注意力带向${symbolic}。对于你关于${topic.issue}的问题，先用${topic.facts}检验这条线索，而不是把牌义当作必然发生的结果。`
   :`In “${position},” ${name} (${entry.orientation}) suggests ${meaning}. Its imagery emphasizes ${symbolic}. For your question about ${topic.issue}, test that theme against ${topic.facts} rather than treating the card as a forecast.`;
  const evidenceQuestion=locale==='zh'?`哪些具体事实能支持或反驳「${name}」呈现的角度？`:`What observable evidence would support or challenge this angle of ${name}?`;
  return {id:c.id,name,position,orientation:entry.orientation,text,evidenceQuestion,meaning,symbolic};
 });
 const [a,b,g]=cards;
 const contrast=locale==='zh'
  ?`「${a.position}」的${a.name}强调${a.meaning}；「${b.position}」的${b.name}则呈现${b.meaning}。这不是替你给两条路打分，而是把它们各自需要核实的条件放在一起。`
  :`“${a.position}” (${a.name}) brings ${a.meaning} into focus, while “${b.position}” (${b.name}) raises ${b.meaning}. This isn't a scorecard choosing a winner; it gives each path a distinct question to investigate.`;
 const summary=locale==='zh'
  ?`你问的是：「${question.trim()}」。${contrast}${g.name}作为${g.position}，提醒你关注${g.meaning}。${LENSES[lens][locale]}`
  :`You asked: “${question.trim()}” ${contrast}${g.name}, in the ${g.position} position, introduces ${g.meaning}. ${LENSES[lens][locale]}`;
 const reflection=locale==='zh'?`如果你现在必须进一步了解${topic.facts}，哪一项事实最可能改变你的判断？`:`Which single fact about ${topic.facts} could most change your view?`;
 const nextSteps=locale==='zh'?[topic.action+'。',topic.check+'。']:[`${topic.action}.`,`${topic.check}.`];
 const transition=locale==='zh'?`把${a.name}与${b.name}放在一起比较，再看看${g.name}如何连接二者。`:`Notice the tension between ${a.name} and ${b.name}; then let ${g.name} connect the two stories.`;
 return {mode:'simulated-demo',question:question.trim(),topicId:checked.topic.id,cards,summary,contrast,transition,reflection,nextSteps,lens,lang:locale};
}
export const DEMO_FOLLOWUPS={
 en:[['compare','Compare both paths'],['evidence','What should I verify?'],['guidance','Explain the guidance card']],
 zh:[['compare','比较两条道路'],['evidence','我应该核实什么？'],['guidance','解释综合建议牌']],
};
export function answerDemoFollowUp({reading,question,history=[]}){
 if(!reading||reading.mode!=='simulated-demo'||!Array.isArray(reading.cards)||reading.cards.length!==3)throw Error('A valid simulated reading is required');
 if(typeof question!=='string'||question.trim().length<2||question.length>280)throw Error('Follow-up must be 2–280 characters');
 if(!Array.isArray(history)||history.length>=12)throw Error('Too many turns in the demo');
 const text=question.trim(),lang=reading.lang,[a,b,g]=reading.cards;
 const normalized=text.toLocaleLowerCase();
 let intent='reflection';
 if(/compare|difference|both|either|better|which|option|path|选|比较|区别|哪条|两条|哪个/.test(normalized))intent='compare';
 else if(/evidence|verify|fact|real|check|confirm|know|核实|证据|事实|确认|怎么知道/.test(normalized))intent='evidence';
 else if(/guidance|third|final|advice|message|建议|第三|指引|总结/.test(normalized))intent='guidance';
 else if(/reverse|upright|orientation|逆位|正位/.test(normalized))intent='orientation';
 else if(/next|step|action|do|now|tomorrow|week|下一步|行动|现在|怎么办/.test(normalized))intent='next';
 const matched=reading.cards.find(c=>normalized.includes(c.name.toLocaleLowerCase())&&c.name.length>2);
 const cardFocus=matched||g;
 if(matched)intent='card';
 const opening=lang==='zh'?`你接着问：「${text}」。在这段脚本演示中，`:`You followed up: “${text}” In this scripted demo, `;
 const content={
  compare:lang==='zh'?`${a.position}（${a.name}）聚焦${a.meaning}；${b.position}（${b.name}）提醒你注意${b.meaning}。可以各列一条支持与反对的现实理由，再比较。`:`${a.position} (${a.name}) emphasizes ${a.meaning}; ${b.position} (${b.name}) highlights ${b.meaning}. Write down one real-world reason for and against each path before comparing them.`,
  evidence:lang==='zh'?`先问自己：「${reading.reflection}」不要用塔罗推断他人的想法或确定未来。`:`Start with: “${reading.reflection}” The cards cannot establish other people's thoughts or predict the result.`,
  guidance:lang==='zh'?`${g.name}在「${g.position}」提示${g.meaning}。这张牌不是判决，而是邀请你从不同角度重新看待前两张牌。`:`${g.name} in “${g.position}” suggests ${g.meaning}. It is not a verdict; use it to reconsider the questions raised by the other two cards.`,
  orientation:lang==='zh'?`当前牌阵里，${reading.cards.map(c=>`${c.name}${c.orientation==='reversed'?'逆位':'正位'}`).join('、')}。逆位表示不同的解释角度，不代表较差的结果。`:`In this spread, ${reading.cards.map(c=>`${c.name} is ${c.orientation}`).join('; ')}. A reversal adds another interpretive angle; it is not a worse outcome.`,
  next:lang==='zh'?`你可以从这两步开始：${reading.nextSteps.join('；')}。这只是现实行动提示，不是牌面预言。`:`Two practical steps: ${reading.nextSteps.join(' Then ')} These are reflection prompts, not instructions from a predictive system.`,
  reflection:lang==='zh'?`从你的原问题「${reading.question}」出发，可以先看${g.name}所象征的${g.meaning}。然后尝试回答：「${reading.reflection}」`:`Return to your original question, “${reading.question}.” ${g.name} points toward ${g.meaning}. A useful next question is: “${reading.reflection}”`,
  card:lang==='zh'?`${cardFocus.name}处于「${cardFocus.position}」，对应的象征主题是${cardFocus.meaning}。把它与提问时的具体处境联系起来，并寻找现实证据。`:`${cardFocus.name} appears in “${cardFocus.position}” and points toward ${cardFocus.meaning}. Connect that symbol to the situation you described and look for actual evidence.`,
 };
 return {mode:'scripted-demo',intent,question:text,text:opening+content[intent],turn:history.length+1};
}
