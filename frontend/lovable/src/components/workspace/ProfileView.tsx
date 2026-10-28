import { useEffect, useState, type Dispatch } from 'react';
import { STAGES, emptyProfile, type WorkspaceState, type Action, type Profile, type Stage } from '@/lib/donna-workspace';
import { AppButton, fieldClass } from './primitives';
export function ProfileView({ state, dispatch }: { state: WorkspaceState; dispatch: Dispatch<Action> }) {
  const [draft, setDraft] = useState<Profile>(emptyProfile);
  const [feedback, setFeedback] = useState('');
  useEffect(() => { setDraft(state.profile); }, [state.profile]);
  function update(key: keyof Profile, value: string) { setDraft(p => ({ ...p, [key]: value })); setFeedback(''); }
  return <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8"><h1 className="font-sans text-2xl font-semibold">Mi negocio</h1><p className="mt-2 text-muted-foreground">Solo lo que sabes. Lo que aún no sabes queda pendiente.</p><form className="mt-8 space-y-6" onSubmit={e => { e.preventDefault(); if (!Object.values(draft).some(v => v.trim())) { setFeedback('Añade al menos un dato para guardar tu contexto.'); return; } dispatch({ type:'save', profile:draft }); setFeedback('Guardado. Tu expediente y tu resumen están actualizados.'); }}>
    <label className="block text-sm font-semibold">Nombre del negocio o proyecto<input className={`${fieldClass} mt-2`} value={draft.name} maxLength={200} onChange={e => update('name', e.target.value)} autoComplete="off" /></label>
    <label className="block text-sm font-semibold">Qué construyes y para quién<textarea className={`${fieldClass} mt-2 resize-y font-normal`} rows={4} maxLength={5000} value={draft.description} onChange={e => update('description', e.target.value)} /></label>
    <label className="block text-sm font-semibold">Etapa<select className={`${fieldClass} mt-2`} value={draft.stage} onChange={e => update('stage', e.target.value as Stage)}><option value="">Pendiente de responder</option>{STAGES.map(s => <option key={s}>{s}</option>)}</select></label>
    <label className="block text-sm font-semibold">Cómo cobras o qué quieres revisar<textarea className={`${fieldClass} mt-2 resize-y font-normal`} rows={3} maxLength={5000} value={draft.topics} onChange={e => update('topics', e.target.value)} /></label>
    <p className="text-sm text-muted-foreground">No necesitas RFC, contraseñas ni datos sensibles.</p><AppButton type="submit">Guardar contexto</AppButton><p role="status" className="text-sm text-primary">{feedback}</p>
  </form></div>;
}
