import { useReducer, useRef, useState } from 'react';
import { Link, useBlocker } from '@tanstack/react-router';
import { BriefcaseBusiness, FileText, FolderOpen, Menu, MessageSquare, Plus } from 'lucide-react';
import { hasWork, initialWorkspace, validateAttachment, workspaceReducer } from '@/lib/donna-workspace';
import { AppButton, Confirmation, Panel } from './primitives';
import { Conversation } from './Conversation';
import { ProfileView } from './ProfileView';
import { DocumentsView } from './DocumentsView';
import { Dossier } from './Dossier';
import { cn } from '@/lib/utils';
type View = 'Conversación' | 'Mi negocio' | 'Documentos';
const views = [{ name:'Conversación' as const, icon:MessageSquare }, { name:'Mi negocio' as const, icon:BriefcaseBusiness }, { name:'Documentos' as const, icon:FileText }];
export function Workspace() {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, initialWorkspace);
  const [view, setView] = useState<View>('Conversación');
  const [navigation, setNavigation] = useState(false);
  const [dossier, setDossier] = useState(false);
  const [fileError, setFileError] = useState('');
  const files = useRef<HTMLInputElement>(null);
  const newButton = useRef<HTMLButtonElement>(null);
  const blocker = useBlocker({ shouldBlockFn: () => hasWork(state), withResolver:true, enableBeforeUnload:hasWork(state) });
  function navigate(v: View) { setView(v); setNavigation(false); }
  function attach() { files.current?.click(); }
  function edit() { setDossier(false); setView('Mi negocio'); }
  function newQuery() { newButton.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null; dispatch({ type:'requestReset' }); }
  function reset() { dispatch({ type:'confirmReset' }); setView('Conversación'); setFileError(''); setNavigation(false); setDossier(false); }
  function sidebar(mobile = false) { return <div className="flex h-full flex-col bg-muted px-4 py-5"><Link to="/" className="mb-7 flex min-h-11 w-fit items-center px-2 font-serif text-[30px] text-foreground">Donna<span className="sr-only"> · Volver al inicio</span></Link><AppButton ref={undefined} variant="outline" onClick={newQuery} className="w-full justify-start bg-card"><Plus aria-hidden />Nueva consulta</AppButton><nav aria-label="Vistas de Donna" className="mt-7 space-y-1">{views.map(v => <AppButton key={v.name} variant="ghost" aria-current={view === v.name ? 'page' : undefined} className={cn('w-full justify-start px-3 text-base', view === v.name ? 'bg-accent text-primary' : 'text-muted-foreground')} onClick={() => navigate(v.name)}><v.icon aria-hidden />{v.name}</AppButton>)}</nav>{hasWork(state) && <div className="mt-8 border-t border-border px-2 pt-5"><p className="text-xs font-semibold text-muted-foreground">Esta consulta</p><AppButton variant="ghost" className="mt-2 h-auto w-full justify-start break-words px-0 py-2 text-left" onClick={() => navigate('Conversación')}>{state.profile.name || state.topic || 'Mi consulta'}</AppButton></div>}<p className="mt-auto px-2 pt-8 text-xs text-muted-foreground">Preparar con claridad.<br />Decidir con tu profesional.</p>{mobile && <span className="sr-only">Navegación móvil</span>}</div>; }
  const expediente = <Dossier state={state} dispatch={dispatch} onEdit={edit} />;
  return <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-background text-foreground">
    <aside className="hidden w-[232px] shrink-0 border-r border-border md:block" aria-label="Navegación de Donna">{sidebar()}</aside>
    <main className="flex min-h-0 min-w-0 flex-1 flex-col" aria-label="Espacio de trabajo"><header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3 sm:px-6"><div className="md:hidden"><Panel open={navigation} onOpenChange={setNavigation} title="Navegación" side="left" trigger={<AppButton variant="ghost" className="size-11 p-0" aria-label="Abrir navegación"><Menu aria-hidden /></AppButton>}>{sidebar(true)}</Panel></div><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold sm:text-base">{state.profile.name || state.topic || 'Nueva consulta'}</p><p className="mt-0.5 text-xs text-muted-foreground">Recorrido guiado · sin conexión a Donna</p></div><div className="min-[1200px]:hidden"><Panel open={dossier} onOpenChange={setDossier} title="Tu expediente" trigger={<AppButton variant="ghost" className="size-11 p-0" aria-label="Ver expediente" title="Ver expediente"><FolderOpen aria-hidden /></AppButton>}>{expediente}</Panel></div></header>
    <input ref={files} type="file" accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown" multiple className="hidden" aria-label="Seleccionar archivos" onChange={e => { const list = Array.from(e.target.files ?? []); const errors: string[] = []; list.forEach(f => { const error = validateAttachment(f); if (error) errors.push(`${f.name}: ${error}`); else dispatch({ type:'attach', attachment:{ id:`${f.name}:${f.size}:${f.lastModified}`, name:f.name, size:f.size, type:f.type } }); }); setFileError(errors.join(' ')); e.target.value=''; }} />
    {fileError && <div role="alert" className="max-h-32 shrink-0 overflow-y-auto break-words border-b border-border bg-destructive-bg px-5 py-3 text-sm text-destructive">{fileError}<AppButton variant="ghost" className="ml-2" onClick={() => setFileError('')}>Cerrar aviso</AppButton></div>}
    <div className={cn('min-h-0 flex-1 flex-col', view === 'Conversación' ? 'flex' : 'hidden')}><Conversation active={view === 'Conversación'} state={state} dispatch={dispatch} onAttach={attach} onReview={() => { if (window.matchMedia('(min-width: 1200px)').matches) { document.getElementById('desktop-expediente')?.focus(); } else setDossier(true); }} /></div>
    <div className={cn('min-h-0 flex-1 overflow-y-auto', view !== 'Mi negocio' && 'hidden')}><ProfileView state={state} dispatch={dispatch} /></div>
    <div className={cn('min-h-0 flex-1 overflow-y-auto', view !== 'Documentos' && 'hidden')}><DocumentsView key={state.messages.length === 0 && !hasWork(state) ? 'empty' : 'working'} state={state} onAttach={attach} onRemove={id => dispatch({ type:'remove', id })} /></div>
    </main><aside id="desktop-expediente" tabIndex={-1} className="hidden h-full w-[360px] shrink-0 border-l border-border bg-card min-[1200px]:block" aria-label="Expediente de la consulta">{expediente}</aside>
    <Confirmation open={state.resetRequested} onCancel={() => dispatch({ type:'cancelReset' })} onConfirm={reset} title="¿Empezar una nueva consulta?" confirm="Descartar y empezar" returnFocus={() => { newButton.current?.focus(); }} />
    <Confirmation open={blocker.status === 'blocked'} onCancel={() => blocker.reset?.()} onConfirm={() => blocker.proceed?.()} title="¿Salir de esta consulta?" confirm="Descartar y salir" />
  </div>;
}
