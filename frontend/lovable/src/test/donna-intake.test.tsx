import { describe,it,expect } from 'vitest';
import { render, act, screen, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { initialWorkspace } from '@/lib/donna-workspace';
import { freshSession, makeDraft, intakeReducer, initialIntakeSession, validEmail, validPhone, DESTINATION, LEAD_STATUS } from '@/lib/donna-intake';
import { SessionProvider, useDonnaSession } from '@/components/workspace/SessionProvider';
const workspace=()=>({...initialWorkspace(),profile:{name:'Circuito',description:'Software para equipos',stage:'No estoy seguro' as const,topics:'Cobros'},context:['¿Qué documentos llevo?'],attachments:[{id:'1',name:'contrato.pdf',size:12,type:'application/pdf'}]});
const draft=()=>({...makeDraft(workspace(),'id-1'),person:'Ana',email:'ana@example.com',step:'review' as const,authorized:true});
const at='2026-10-28T22:32:00.000Z';
describe('Donna local intake',()=>{
 it('copies every supplied context field and document names only',()=>{const d=makeDraft(workspace(),'x');expect(d.context).toEqual({startup:'Circuito',description:'Software para equipos',stage:'No estoy seguro',topics:'Cobros',notes:['¿Qué documentos llevo?'],documents:['contrato.pdf']});expect(d.need).toBe('');expect(d.urgency).toBe('');});
 it('never registers without explicit consent',()=>{const s={...initialIntakeSession(),draft:{...draft(),authorized:false}};expect(intakeReducer(s,{type:'register',at}).leads).toHaveLength(0);});
 it('requires a valid contact channel',()=>{for(const contact of [{email:'',phone:''},{email:'wrong',phone:''},{email:'',phone:'123'}]){const s={...initialIntakeSession(),draft:{...draft(),...contact}};expect(intakeReducer(s,{type:'register',at}).leads).toHaveLength(0);}});
 it('validates email and telephone',()=>{expect(validEmail('ana@example.com')).toBe(true);expect(validEmail('ana@')).toBe(false);expect(validPhone('+52 55 1234 5678')).toBe(true);expect(validPhone('123')).toBe(false);expect(validPhone('abc5512345678')).toBe(false);});
 it('accepts telephone without email',()=>{expect(intakeReducer({draft:{...draft(),email:'',phone:'5512345678'},leads:[]},{type:'register',at}).leads).toHaveLength(1);});
 it('preserves uncertainty and does not infer needs or urgency',()=>{const l=intakeReducer({draft:draft(),leads:[]},{type:'register',at}).leads[0];if(!l) throw new Error('Expected registered prospect');expect(l.context.stage).toBe('No estoy seguro');expect(l.need).toBe('');expect(l.urgency).toBe('');expect(l.status).toBe(LEAD_STATUS);expect(l.destination).toBe(DESTINATION);expect(l.consent).toEqual({authorized:true,destination:DESTINATION,at});});
 it('is idempotent on double submit',()=>{const s=intakeReducer({draft:draft(),leads:[]},{type:'register',at});expect(intakeReducer(s,{type:'register',at}).leads).toHaveLength(1);});
 it('snapshot is immutable and independent from subsequent business and draft edits',()=>{const w=workspace();const d={...draft(),context:makeDraft(w,'x').context};const s=intakeReducer({draft:d,leads:[]},{type:'register',at});const lead=s.leads[0];if(!lead) throw new Error('Expected registered prospect');w.profile.name='Changed';d.context.notes.push('Changed');expect(lead.context.startup).toBe('Circuito');expect(lead.context.notes).toEqual(['¿Qué documentos llevo?']);expect(Object.isFrozen(lead.context.notes)).toBe(true);});
 it('cancel creates no row; new workspace does not remove authorized rows',()=>{expect(intakeReducer({draft:draft(),leads:[]},{type:'cancel'}).leads).toEqual([]);const s=intakeReducer({draft:draft(),leads:[]},{type:'register',at});expect(intakeReducer(s,{type:'open',workspace:initialWorkspace(),id:'new'}).leads).toHaveLength(1);});
 it('fresh sessions share no data',()=>{const a=freshSession(),b=freshSession();a.workspace.context.push('Private');expect(b.workspace.context).toEqual([]);expect(a.intake.leads).not.toBe(b.intake.leads);});
});
afterEach(cleanup);
function Probe({name}:{name:string}){const s=useDonnaSession();return <div><span data-testid={name}>{s.workspace.profile.name||'empty'}:{s.intake.leads.length}</span><button onClick={()=>s.dispatch({type:'save',profile:workspace().profile})}>Change {name}</button></div>;}
it('provider instances and SSR requests isolate session data',()=>{render(<><SessionProvider><Probe name="a"/></SessionProvider><SessionProvider><Probe name="b"/></SessionProvider></>);act(()=>screen.getByText('Change a').click());expect(screen.getByTestId('a')).toHaveTextContent('Circuito:0');expect(screen.getByTestId('b')).toHaveTextContent('empty:0');expect(renderToString(<SessionProvider><Probe name="ssr"/></SessionProvider>)).toContain('empty');});
