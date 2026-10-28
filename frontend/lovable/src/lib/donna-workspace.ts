export const STAGES = ['Estoy desarrollando', 'Ya tengo clientes', 'No estoy seguro'] as const;
export type Stage = '' | (typeof STAGES)[number];
export const STARTERS = ['Entender mi negocio', 'Preparar la reunión con mi contador', 'Ordenar documentos para mi abogado'] as const;
export interface Profile { name: string; description: string; stage: Stage; topics: string }
export interface Attachment { id: string; name: string; size: number; type: string }
export interface Message { role: 'user' | 'donna'; text: string }
export type Step = 'idle' | 'name' | 'description' | 'stage' | 'topics' | 'review';
export interface WorkspaceState { profile: Profile; topic: string; step: Step; messages: Message[]; attachments: Attachment[]; checked: string[]; context: string[]; resetRequested: boolean }
export const emptyProfile = (): Profile => ({ name: '', description: '', stage: '', topics: '' });
export const initialWorkspace = (): WorkspaceState => ({ profile: emptyProfile(), topic: '', step: 'idle', messages: [], attachments: [], checked: [], context: [], resetRequested: false });
export type Action = { type: 'start'; topic: string } | { type: 'send'; text: string } | { type: 'stage'; stage: Exclude<Stage, ''> } | { type: 'save'; profile: Profile } | { type: 'attach'; attachment: Attachment } | { type: 'remove'; id: string } | { type: 'check'; id: string } | { type: 'requestReset' | 'cancelReset' | 'confirmReset' };
export function hasWork(s: WorkspaceState) { return s.messages.length > 0 || s.attachments.length > 0 || Object.values(s.profile).some(Boolean); }
const question = (step: Step) => ({ idle: '', name: '¿Cómo se llama tu negocio o proyecto?', description: '¿Qué construyes y para quién?', stage: '¿En qué etapa está tu negocio?', topics: '¿Cómo cobras o qué tema quieres revisar con tu contador o abogado?', review: 'El contexto está en tu expediente. Revísalo y completa lo que falte; después puedes crear el resumen para tu contador o abogado.' })[step];
const afterProfile = (p: Profile): Step => !p.name ? 'name' : !p.description ? 'description' : !p.stage ? 'stage' : !p.topics ? 'topics' : 'review';
function respond(s: WorkspaceState, text: string, profile: Profile, step: Step, reply?: string): WorkspaceState {
  return { ...s, profile, step, messages: [...s.messages, { role: 'user', text }, { role: 'donna', text: reply ?? question(step) }] };
}
export function workspaceReducer(s: WorkspaceState, a: Action): WorkspaceState {
  switch (a.type) {
    case 'start': {
      if (s.step !== 'idle') return s;
      const step = afterProfile(s.profile);
      return { ...s, topic: a.topic, step, messages: [{ role: 'user', text: a.topic }, { role: 'donna', text: `Vamos a preparar el contexto para ${a.topic.toLowerCase()}. ${question(step)}` }] };
    }
    case 'send': {
      const text = a.text.trim();
      if (!text || [...s.messages].reverse().find(m => m.role === 'user')?.text === text) return s;
      const p = { ...s.profile };
      if (s.step === 'idle') { p.description = text; return respond({ ...s, topic: 'Mi consulta' }, text, p, afterProfile(p), `Guardé tu descripción, sin inferir datos fiscales. ${question(afterProfile(p))}`); }
      if (s.step === 'name') p.name = text;
      else if (s.step === 'description') p.description = text;
      else if (s.step === 'topics') p.topics = text;
      else if (s.step === 'stage') {
        const stage = STAGES.find(v => v === text);
        if (stage) p.stage = stage;
        else return respond({ ...s, context: [...s.context, text] }, text, p, 'stage', 'Añadí tu nota al contexto. No asumiré la etapa: elige una de las opciones o “No estoy seguro”.');
      } else return respond({ ...s, context: [...s.context, text] }, text, p, 'review', 'Añadí tu pregunta al contexto. Puedes editar Mi negocio o revisar los pendientes antes de crear tu resumen.');
      return respond(s, text, p, afterProfile(p));
    }
    case 'stage': {
      if (s.step !== 'stage') return s;
      const p = { ...s.profile, stage: a.stage };
      return respond(s, a.stage, p, afterProfile(p), a.stage === 'No estoy seguro' ? `La etapa queda por confirmar. ${question(afterProfile(p))}` : question(afterProfile(p)));
    }
    case 'save': {
      const profile = { name: a.profile.name.trim(), description: a.profile.description.trim(), stage: a.profile.stage, topics: a.profile.topics.trim() };
      return { ...s, profile, step: s.step === 'idle' ? 'idle' : afterProfile(profile) };
    }
    case 'attach': return s.attachments.some(f => f.id === a.attachment.id) ? s : { ...s, attachments: [...s.attachments, a.attachment] };
    case 'remove': return { ...s, attachments: s.attachments.filter(f => f.id !== a.id) };
    case 'check': return { ...s, checked: s.checked.includes(a.id) ? s.checked.filter(id => id !== a.id) : [...s.checked, a.id] };
    case 'requestReset': return hasWork(s) ? { ...s, resetRequested: true } : initialWorkspace();
    case 'cancelReset': return { ...s, resetRequested: false };
    case 'confirmReset': return initialWorkspace();
  }
}
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export function validateAttachment(f: { name: string; size: number; type: string }): string | null {
  if (f.size > MAX_FILE_BYTES) return 'El archivo supera 10 MB. Selecciona uno más pequeño.';
  if (!f.size) return 'El archivo está vacío. Selecciona otro archivo.';
  const ext = f.name.split('.').pop()?.toLowerCase();
  const pdf = ext === 'pdf' && (f.type === 'application/pdf' || !f.type);
  const text = (ext === 'txt' || ext === 'md') && (f.type.startsWith('text/') || !f.type);
  return pdf || text ? null : 'Selecciona un PDF o archivo de texto (.txt o .md).';
}
export function pendingItems(s: WorkspaceState) {
  return [
    ...(!s.profile.name ? [{ id: 'name', text: 'Indicar el nombre del negocio o proyecto' }] : []),
    ...(!s.profile.description ? [{ id: 'description', text: 'Describir qué construyes y para quién' }] : []),
    ...(!s.profile.stage || s.profile.stage === 'No estoy seguro' ? [{ id: 'stage', text: 'Confirmar la etapa del negocio' }] : []),
    ...(!s.profile.topics ? [{ id: 'topics', text: 'Precisar cómo cobras o qué quieres revisar' }] : []),
    { id: 'meeting', text: 'Preparar las preguntas para el contador o abogado' },
    { id: 'documents', text: 'Reunir los documentos para la reunión' },
    { id: 'review', text: 'Revisar el contexto con tu contador o abogado' },
  ];
}
export function canCreateSummary(s: WorkspaceState) { return Object.values(s.profile).some(Boolean) || s.context.length > 0 || s.attachments.length > 0; }
export function createSummary(s: WorkspaceState): string | null {
  if (!canCreateSummary(s)) return null;
  const p = s.profile;
  const lines = ['# Resumen para tu contador o abogado', '', 'Guía de trabajo — para revisión profesional', '', '## Contexto aportado por ti'];
  if (p.name) lines.push(`Nombre: ${p.name}`);
  if (p.description) lines.push(`Descripción: ${p.description}`);
  if (p.stage && p.stage !== 'No estoy seguro') lines.push(`Etapa indicada: ${p.stage}`);
  if (p.topics) lines.push(`Temas o forma de cobro: ${p.topics}`);
  if (s.context.length) lines.push('', 'Notas y preguntas adicionales:', ...s.context.map(t => `- ${t}`));
  lines.push('', '## Documentos pendientes de lectura');
  lines.push(...(s.attachments.length ? s.attachments.map(f => `- ${f.name} (${formatSize(f.size)}) — Pendiente de lectura`) : ['No se han seleccionado documentos.']));
  lines.push('', '## Preguntas pendientes', ...pendingItems(s).filter(i => ['name', 'description', 'stage', 'topics'].includes(i.id)).map(i => `- ${i.text}`), '- ¿Qué información adicional necesita tu contador o abogado?', '- ¿Qué documentos conviene llevar a la reunión?', '', 'Las tareas marcadas no acreditan cumplimiento legal. No hay fuentes verificadas incorporadas.');
  return lines.join('\n');
}
export function formatSize(size: number) { return size < 1024 * 1024 ? `${Math.ceil(size / 1024)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`; }
