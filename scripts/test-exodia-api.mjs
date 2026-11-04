const baseUrl=(process.env.EXODIA_URL||'http://127.0.0.1:8765').replace(/\/+$/,'');
const cooldownMs=Number(process.env.EXODIA_TEST_INTERVAL_MS||5000);
const timeoutMs=Number(process.env.EXODIA_TEST_TIMEOUT_MS||180000);
const dryRun=process.argv.includes('--dry-run');
let lastFinishedAt=0;

const sleep=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));

async function pacedRequest(path,options={}){
  const remaining=cooldownMs-(Date.now()-lastFinishedAt);
  if(lastFinishedAt&&remaining>0){
    console.log(`Cooling down for ${remaining}ms before the next request...`);
    await sleep(remaining);
  }
  const url=baseUrl+path;
  console.log(`${options.method||'GET'} ${url}`);
  let response;
  try{
    response=await fetch(url,options);
    const text=await response.text();
    lastFinishedAt=Date.now();
    return {response,text,url};
  }catch(error){
    lastFinishedAt=Date.now();
    throw new Error(
      `Could not reach ${url}. Run this probe on the same computer as Exodia `+
      `and confirm Exodia is listening on ${baseUrl}. ${error.message}`
    );
  }
}

function requireStatus(result,expected){
  if(result.response.status!==expected){
    throw new Error(
      `${result.url} returned HTTP ${result.response.status}; expected ${expected}. `+
      result.text.slice(0,500)
    );
  }
}

function parseJson(result){
  try{return JSON.parse(result.text)}
  catch{throw new Error(`${result.url} did not return valid JSON`)}
}

async function main(){
  console.log('JuHua Speaks — Exodia ChatGPT compatibility probe');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Minimum request interval: ${cooldownMs}ms`);

  const docs=await pacedRequest('/api/docs');
  requireStatus(docs,200);
  if(!/swagger ui/i.test(docs.text)){
    throw new Error('/api/docs responded, but it does not look like Swagger UI');
  }
  console.log('✓ Interactive documentation is available');

  const schemaResult=await pacedRequest('/openapi.json');
  requireStatus(schemaResult,200);
  const schema=parseJson(schemaResult);
  const createTask=schema.paths?.['/api/command/tasks']?.post;
  const listTasks=schema.paths?.['/api/command/tasks']?.get;
  if(!createTask||!listTasks){
    throw new Error('Exodia OpenAPI does not expose the required task POST and GET operations');
  }
  console.log('✓ Required asynchronous task operations are documented');

  if(dryRun){
    console.log('✓ Dry run complete; no ChatGPT prompt was submitted');
    return;
  }

  const prompt=[
    'Provide a concise bilingual Tarot reading for reflective entertainment.',
    'Preserve these exact cards and positions:',
    'Path A — The Fool (Upright)',
    'Path B — Two of Cups (Upright)',
    'Guidance — The Hermit (Reversed)',
    'Question: Should I accept a new job offer?',
    'First answer in English, then in Simplified Chinese.',
    'Relate every card to its position and the question.',
    'End each language section with one practical reflection question.',
    'Do not claim certainty, supernatural proof, or professional advice.',
  ].join('\n');

  const createdResult=await pacedRequest('/api/command/tasks',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'X-Exodia-Client':'exodia-dashboard',
    },
    body:JSON.stringify({
      model_choice:'chatgpt',
      agent_id:'kiko',
      prompt,
      web_research:false,
    }),
  });
  requireStatus(createdResult,201);
  const created=parseJson(createdResult);
  if(!created.id)throw new Error('Exodia created a task without an id');
  console.log(`✓ Created task ${created.id}`);

  const deadline=Date.now()+timeoutMs;
  let task;
  while(Date.now()<deadline){
    const listingResult=await pacedRequest('/api/command/tasks');
    requireStatus(listingResult,200);
    const listing=parseJson(listingResult);
    task=listing.tasks?.find(item=>item.id===created.id);
    if(!task)throw new Error('Created task was not present in Exodia recent tasks');
    console.log(`  Task state: ${task.state}`);
    if(task.state==='answered'||task.state==='failed')break;
  }

  if(!task||!['answered','failed'].includes(task.state)){
    throw new Error(
      `Task ${created.id} did not finish within ${Math.round(timeoutMs/1000)} seconds. `+
      'It was not resubmitted because the browser may already have accepted the prompt.'
    );
  }
  if(task.state==='failed')throw new Error(task.error||'Exodia ChatGPT task failed');

  const answer=String(task.answer||'').trim();
  const required=['The Fool','Two of Cups','The Hermit'];
  const missing=required.filter(value=>!answer.includes(value));
  const hasChinese=/[\u3400-\u9fff]/u.test(answer);
  if(!answer)throw new Error('Exodia reported success with an empty answer');
  if(missing.length)throw new Error(`Reading omitted required cards: ${missing.join(', ')}`);
  if(!hasChinese)throw new Error('Reading did not include Simplified Chinese output');

  console.log('✓ ChatGPT returned a non-empty bilingual reading');
  console.log('✓ All three authoritative JuHua cards were preserved');
  console.log(`✓ Completed in ${task.metrics?.total_s??'unknown'} seconds`);
  console.log('Compatibility result: PASS');
  console.log(
    'Follow-up context: CLIENT-MANAGED. Exodia opens an isolated task tab, so JuHua '+
    'must include the prior question, cards, reading, and follow-up in each new prompt.'
  );
}

main().catch(error=>{
  console.error(`Compatibility result: FAIL\n${error.message}`);
  process.exitCode=1;
});
