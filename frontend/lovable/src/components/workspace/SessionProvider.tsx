import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react';
import { initialWorkspace, workspaceReducer, hasWork, type WorkspaceState, type Action } from '@/lib/donna-workspace';
import { initialIntakeSession, intakeReducer, type IntakeSession, type IntakeAction } from '@/lib/donna-intake';
import type { Dispatch } from 'react';
import { useDonnaChat, type DonnaChat } from './useDonnaChat';
interface Session { workspace:WorkspaceState; dispatch:Dispatch<Action>; intake:IntakeSession; intakeDispatch:Dispatch<IntakeAction>; mainChat:DonnaChat; admissionChat:DonnaChat }
const SessionContext=createContext<Session | null>(null);
export function SessionProvider({children}:{children:ReactNode}) {
 const [workspace,dispatch]=useReducer(workspaceReducer,undefined,initialWorkspace);
 const [intake,intakeDispatch]=useReducer(intakeReducer,undefined,initialIntakeSession);
 const requestLock=useRef(false);
 const mainChat=useDonnaChat(requestLock);const admissionChat=useDonnaChat(requestLock);
 const dirty=hasWork(workspace)||mainChat.state.messages.length>0||!!intake.draft||intake.leads.length>0;
 useEffect(()=>{if(!dirty)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 return <SessionContext.Provider value={{workspace,dispatch,intake,intakeDispatch,mainChat,admissionChat}}>{children}</SessionContext.Provider>;
}
export function useDonnaSession() { const session=useContext(SessionContext); if(!session) throw new Error('Donna session provider missing'); return session; }
