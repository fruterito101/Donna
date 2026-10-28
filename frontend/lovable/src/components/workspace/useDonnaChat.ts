import { useReducer,useRef,useEffect, type RefObject } from 'react';
import { chatReducer,emptyChat,requestDonna } from '@/lib/donna-chat';
export function useDonnaChat(sharedLock?:RefObject<boolean>){
 const [state,dispatch]=useReducer(chatReducer,undefined,emptyChat);
 const pending=useRef(false);const controller=useRef<AbortController|null>(null);const epoch=useRef(0);
 useEffect(()=>()=>{epoch.current++;controller.current?.abort();},[]);
 async function send(raw:string,retry=false){const message=raw.trim();if(!message||message.length>4000||pending.current||sharedLock?.current)return false;pending.current=true;if(sharedLock)sharedLock.current=true;const current=epoch.current;controller.current=new AbortController();dispatch({type:'begin',message,retry});
 try{const reply=await requestDonna(message,controller.current.signal);if(epoch.current===current)dispatch({type:'reply',reply});}
 catch(e){if(epoch.current===current)dispatch({type:'error',error:e instanceof Error?e.message:'No fue posible conectar con Donna.'});}
 finally{if(epoch.current===current){pending.current=false;if(sharedLock)sharedLock.current=false;}}return true;
 }
 function reset(){epoch.current++;controller.current?.abort();if(pending.current&&sharedLock)sharedLock.current=false;pending.current=false;dispatch({type:'reset'});}
 return {state,send,reset};
}
export type DonnaChat=ReturnType<typeof useDonnaChat>;
