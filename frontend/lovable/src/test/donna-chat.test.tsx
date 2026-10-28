import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {useDonnaChat} from '@/components/workspace/useDonnaChat';
import {AgentMessages} from '@/components/workspace/AgentMessages';
import {admissionMessage} from '@/lib/donna-chat';
import {makeDraft} from '@/lib/donna-intake';
import {initialWorkspace} from '@/lib/donna-workspace';
import {SessionProvider,useDonnaSession} from '@/components/workspace/SessionProvider';
function Probe(){const chat=useDonnaChat();return <><button onClick={()=>void chat.send('Consulta técnica')}>Send</button><AgentMessages chat={chat}/></>;}
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('shows waiting only on real request, explicit retry and a single reply without fake fallback',async()=>{
 let release:(r:Response)=>void=()=>{};
 const fetcher=vi.fn().mockImplementationOnce(()=>new Promise<Response>(resolve=>{release=resolve;})).mockResolvedValueOnce(Response.json({reply:'Respuesta del agente <script>unsafe</script>'}));vi.stubGlobal('fetch',fetcher);render(<Probe/>);fireEvent.click(screen.getByText('Send'));expect(screen.getByRole('status')).toHaveTextContent('Esperando');fireEvent.click(screen.getByText('Send'));expect(fetcher).toHaveBeenCalledTimes(1);release(Response.json({error:'Servicio ocupado'},{status:503}));await screen.findByRole('alert');expect(screen.queryByRole('status')).toBeNull();expect(screen.queryByText('Donna', {exact:true})).toBeNull();fireEvent.click(screen.getByText('Reintentar mensaje'));await screen.findByText('Respuesta del agente <script>unsafe</script>');expect(screen.getAllByText('Consulta técnica')).toHaveLength(1);expect(document.querySelector('script')).toBeNull();expect(fetcher).toHaveBeenCalledTimes(2);
});
it('delimits admission data within 4000 without including contact or authorizing sharing',()=>{const s=initialWorkspace();s.profile.description='"'.repeat(5000);const d=makeDraft(s,'x');d.person='Private';d.email='private@example.com';const m=admissionMessage(d);expect(m.length).toBeLessThanOrEqual(4000);expect(m).toContain('<datos_contexto>');expect(m).not.toContain('private@example.com');expect(d.authorized).toBe(false);});
function Both(){const s=useDonnaSession();return <button onClick={()=>{void s.mainChat.send('Main');void s.admissionChat.send('Admission');}}>Both</button>;}
it('permits only one outstanding request across consultation and admission',()=>{const fetcher=vi.fn(()=>new Promise(()=>{}));vi.stubGlobal('fetch',fetcher);render(<SessionProvider><Both/></SessionProvider>);fireEvent.click(screen.getByText('Both'));expect(fetcher).toHaveBeenCalledTimes(1);});
