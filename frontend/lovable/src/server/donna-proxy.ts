// Standalone hosting forwards validated requests; the Next deployment uses the same validator locally.
import { readDonnaMessage } from './donna-request';
export { MAX_MESSAGE } from './donna-request';
const publicError=(status:number,error:string)=>Response.json({error},{status,headers:{'Cache-Control':'no-store'}});
export function visitorCookie(raw:string|null):string|undefined {
 const matches=(raw||'').split(';').map(v=>v.trim()).filter(v=>v.startsWith('donna_visitor='));
 if(matches.length!==1)return;
 const value=matches[0]?.slice('donna_visitor='.length);
 if(value && value.length<=4096 && /^[\x21-\x7E]+$/.test(value) && !/[;,\\"]/.test(value))return `donna_visitor=${value}`;
 return undefined;
}
export function visitorSetCookies(headers:Headers):string[] {
 const values=typeof headers.getSetCookie==='function'?headers.getSetCookie():[headers.get('set-cookie')||''];
 return values.flatMap(v=>v.split(/,(?=\s*[A-Za-z0-9_\-]+=)/)).filter(v=>/^\s*donna_visitor=/.test(v)).map(v=>v.trim());
}
export async function proxyDonna(request:Request,options:{origin:string;fetcher?:typeof fetch;timeoutMs?:number}):Promise<Response> {
 const message=await readDonnaMessage(request);
 if(message instanceof Response)return message;
 let target:URL;
 try{target=new URL(options.origin);if(target.protocol!=='https:'||target.username||target.password||target.pathname!=='/'||target.search||target.hash)throw new Error();target.pathname='/api/chat';}catch{return publicError(503,'Donna no está disponible en este momento.');}
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),options.timeoutMs??25000);
 try{
 const headers=new Headers({'Content-Type':'application/json','Cache-Control':'no-store'});const cookie=visitorCookie(request.headers.get('cookie'));if(cookie)headers.set('Cookie',cookie);
 const response=await (options.fetcher??fetch)(target,{method:'POST',headers,body:JSON.stringify({message}),signal:controller.signal,redirect:'manual',cache:'no-store'});
 const outgoing=new Headers({'Cache-Control':'no-store'});for(const c of visitorSetCookies(response.headers))outgoing.append('Set-Cookie',c);
 if(!response.ok){const status=response.status===429?429:response.status===503?503:502;return Response.json({error:status===429?'Donna alcanzó su límite de consultas. Espera antes de reintentar.':status===503?'Donna está temporalmente ocupada. Intenta más tarde.':'Donna no pudo responder. Puedes reintentar cuando estés listo.'},{status,headers:outgoing});}
 let data:unknown;try{data=await response.json();}catch{return publicError(502,'Donna devolvió una respuesta no válida.');}
 if(!data||typeof data!=='object'||!('reply'in data)||typeof data.reply!=='string'||!data.reply.trim())return publicError(502,'Donna devolvió una respuesta no válida.');
 return Response.json({reply:data.reply},{headers:outgoing});
 }catch{return publicError(controller.signal.aborted?504:502,controller.signal.aborted?'Donna tardó demasiado en responder. Puedes reintentar.':'No fue posible conectar con Donna. Tu mensaje se conserva.');}finally{clearTimeout(timer);}
}
