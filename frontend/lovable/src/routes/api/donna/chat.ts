import { createFileRoute } from '@tanstack/react-router';
export const Route=createFileRoute('/api/donna/chat')({server:{handlers:{POST:async({request})=>{
 const {proxyDonna}=await import('@/server/donna-proxy');
 return proxyDonna(request,{origin:process.env['DONNA_BACKEND_ORIGIN']||'https://donna-mx.vercel.app'});
}}}});
