const MAX_BODY=24*1024;
export const MAX_MESSAGE=4000;
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
async function readBounded(request:Request):Promise<string> {
 if(Number(request.headers.get('content-length')||0)>MAX_BODY)throw new Error('size');
 const reader=request.body?.getReader();if(!reader)return '';
 let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BODY){await reader.cancel();throw new Error('size');}chunks.push(value);}}finally{reader.releaseLock();}
 const joined=new Uint8Array(size);let pos=0;for(const c of chunks){joined.set(c,pos);pos+=c.byteLength;}
 return new TextDecoder('utf-8',{fatal:true}).decode(joined);
}
export async function proxyDonna(request:Request,options:{origin:string;fetcher?:typeof fetch;timeoutMs?:number}):Promise<Response> {
 const origin=request.headers.get('origin');
 if(!origin || origin!==new URL(request.url).origin || request.headers.get('sec-fetch-site')==='cross-site')return publicError(403,'Esta solicitud debe iniciarse desde Donna.');
 if(request.headers.get('content-type')?.split(';')[0]?.trim()!=='application/json')return publicError(415,'Envía un mensaje en formato JSON.');
 let body:unknown;
 try{body=JSON.parse(await readBounded(request));}catch(e){return publicError(e instanceof Error&&e.message==='size'?413:400,'El mensaje no es válido o supera el tamaño permitido.');}
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==1||!('message' in body)||typeof body.message!=='string')return publicError(400,'Solo se admite un mensaje de texto.');
 const message=body.message.trim();
 if(!message||message.length>MAX_MESSAGE)return publicError(400,'Escribe un mensaje de entre 1 y 4000 caracteres.');
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
