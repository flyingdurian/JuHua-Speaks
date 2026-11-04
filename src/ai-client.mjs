import {normalizeReadingRequest,validateAiReading} from './reading-contract.mjs';
/** Only a fixed, developer-configured HTTPS endpoint is accepted. */
export function configuredAiEndpoint(doc=globalThis.document){
 const value=doc?.querySelector('meta[name="juhua-reading-endpoint"]')?.content?.trim();
 if(!value)return null;
 try{const url=new URL(value);return url.protocol==='https:'&&url.pathname.endsWith('/api/reading')?url.href:null}catch{return null}
}
export async function requestAiReading(endpoint,input,{fetcher=fetch,signal}={}){
 const validated=normalizeReadingRequest(input);
 if(!endpoint||new URL(endpoint).protocol!=='https:')throw new Error('Private AI endpoint is not configured');
 const response=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:validated.question,options:validated.options,spread:validated.spread,lens:validated.lens,locale:validated.locale,deckId:validated.deckId,picks:validated.cards.map(c=>({id:c.id,orientation:c.orientation}))}),cache:'no-store',signal});
 if(!response.ok)throw new Error('The AI reading service is currently unavailable');
 const data=await response.json();return validateAiReading(data.reading,validated);
}
