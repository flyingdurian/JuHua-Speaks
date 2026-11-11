/** Local Node proxy only. Never contact Exodia's port 8765 from browser JS. */
export function isLocalJuHua(loc=globalThis.location){
 return loc?.protocol==='http:'&&['127.0.0.1','localhost'].includes(loc.hostname)&&(!loc.port||loc.port==='4173'||loc.port==='4184');
}
export async function discoverLocalExodia({fetcher=globalThis.fetch,loc=globalThis.location}={}){
 if(!isLocalJuHua(loc))return null;
 try{
  const r=await fetcher('/api/local-exodia/status',{cache:'no-store'});
  if(!r.ok)return null;
  const value=await r.json();
  return value?.available===true&&value.service==='local-only'?value:null;
 }catch{return null;}
}
export async function sendLocalExodia(payload,{fetcher=globalThis.fetch,loc=globalThis.location}={}){
 if(!isLocalJuHua(loc))throw new Error('Local Exodia is only available in the local JuHua app or Gate B review server');
 const response=await fetcher('/api/local-exodia/reading',{
  method:'POST',
  headers:{'Content-Type':'application/json','X-JuHua-Local-Client':'1'},
  body:JSON.stringify(payload),
  cache:'no-store',
  credentials:'same-origin'
 });
 let value;
 try{value=await response.json();}catch{throw new Error('Local Exodia returned an invalid response');}
 if(!response.ok)throw new Error(String(value?.error||'Local Exodia generation failed').slice(0,250));
 if(value?.mode!=='exodia-local'||typeof value.answer!=='string'||value.answer.length<30)throw new Error('Invalid Exodia response');
 return value;
}
