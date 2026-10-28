import { initialWorkspace, type WorkspaceState } from './donna-workspace';
export const DESTINATION = 'Despacho Galicia Abogados Fiscales';
export const LEAD_STATUS = 'Pendiente de integración';
export const ROLES = ['CEO', 'COO', 'CTO', 'Founder', 'Otro'] as const;
export const NEEDS = ['Fiscal', 'Contable', 'Legal', 'Cumplimiento'] as const;
export interface IntakeContext { startup: string; description: string; stage: string; topics: string; notes: string[]; documents: string[] }
export interface IntakeDraft { id: string; context: IntakeContext; person: string; role: string; email: string; phone: string; need: string; goal: string; urgency: string; authorized: boolean; step: 'information' | 'review' | 'registered' }
export interface Lead { readonly id: string; readonly context: Readonly<Omit<IntakeContext,'notes'|'documents'> & {notes:readonly string[]; documents:readonly string[]}>; readonly person: string; readonly role: string; readonly email: string; readonly phone: string; readonly need: string; readonly goal: string; readonly urgency: string; readonly destination: string; readonly status: string; readonly createdAt: string; readonly consent: Readonly<{ authorized: true; destination: string; at: string }> }
export interface IntakeSession { draft: IntakeDraft | null; leads: readonly Lead[] }
export const initialIntakeSession = (): IntakeSession => ({ draft: null, leads: [] });
export function copyContext(s: WorkspaceState): IntakeContext { return { startup:s.profile.name, description:s.profile.description, stage:s.profile.stage, topics:s.profile.topics, notes:[...s.context], documents:s.attachments.map(f=>f.name) }; }
export function makeDraft(s: WorkspaceState, id: string): IntakeDraft { return { id, context:copyContext(s), person:'', role:'', email:'', phone:'', need:'', goal:'', urgency:'', authorized:false, step:'information' }; }
export function validEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
export function validPhone(v: string) { return /^\+?[\d\s().-]+$/.test(v.trim()) && v.replace(/\D/g,'').length >= 10 && v.replace(/\D/g,'').length <= 15; }
export function intakeErrors(d: IntakeDraft): string[] {
 const errors: string[]=[];
 if (!d.context.startup.trim()) errors.push('Indica el nombre de la startup.');
 if (!d.person.trim()) errors.push('Indica el nombre de la persona.');
 if (!validEmail(d.email) && !validPhone(d.phone)) errors.push('Añade al menos un email o teléfono válido.');
 if (d.email.trim() && !validEmail(d.email)) errors.push('Revisa el formato del email.');
 if (d.phone.trim() && !validPhone(d.phone)) errors.push('Revisa el teléfono: de 10 a 15 dígitos.');
 if (!d.context.description.trim()) errors.push('Describe el negocio.');
 return errors;
}
export type IntakeAction = { type:'open'; workspace:WorkspaceState; id:string } | { type:'edit'; draft:IntakeDraft } | { type:'cancel' } | { type:'register'; at:string };
export function intakeReducer(s:IntakeSession,a:IntakeAction):IntakeSession {
 if(a.type==='open') return s.draft && s.draft.step!=='registered' ? s : {...s,draft:makeDraft(a.workspace,a.id)};
 if(a.type==='cancel') return {...s,draft:null};
 if(a.type==='edit') return {...s,draft:{...a.draft,authorized:a.draft.step==='information'?false:a.draft.authorized}};
 const d=s.draft;
 if(!d || d.step!=='review' || !d.authorized || intakeErrors(d).length || s.leads.some(l=>l.id===d.id)) return s;
 const context=Object.freeze({...d.context,notes:Object.freeze([...d.context.notes]),documents:Object.freeze([...d.context.documents])});
 const lead:Lead=Object.freeze({id:d.id,context,person:d.person.trim(),role:d.role,email:d.email.trim(),phone:d.phone.trim(),need:d.need,goal:d.goal,urgency:d.urgency,destination:DESTINATION,status:LEAD_STATUS,createdAt:a.at,consent:Object.freeze({authorized:true,destination:DESTINATION,at:a.at})});
 return {draft:{...d,step:'registered'},leads:[...s.leads,lead]};
}
export const freshSession = () => ({ workspace:initialWorkspace(), intake:initialIntakeSession() });
