import { describe, expect, it } from 'vitest';
import { createSummary, initialWorkspace, MAX_FILE_BYTES, pendingItems, validateAttachment, workspaceReducer as reduce } from '@/lib/donna-workspace';
describe('Donna guided workspace', () => {
 it('waits for user responses through all steps', () => {
  let s = reduce(initialWorkspace(), { type:'start', topic:'Entender mi negocio' });
  expect(s.step).toBe('name');
  s=reduce(s,{ type:'send',text:'Mi proyecto' }); expect(s.step).toBe('description');
  s=reduce(s,{ type:'send',text:'Software para equipos' }); expect(s.step).toBe('stage');
  s=reduce(s,{ type:'stage',stage:'Ya tengo clientes' }); expect(s.step).toBe('topics');
  s=reduce(s,{ type:'send',text:'Cobro por proyecto' }); expect(s.step).toBe('review'); expect(s.profile.topics).toBe('Cobro por proyecto');
  expect(reduce(s,{type:'send',text:'Cobro por proyecto'})).toBe(s);
 });
 it('never converts uncertainty or unstructured context into a fiscal fact', () => {
  let s=reduce(initialWorkspace(),{type:'send',text:'Creo que ya tengo clientes y necesito impuestos'});
  expect(s.profile.stage).toBe('');
  s=reduce(s,{type:'send',text:'Mi proyecto'});
  s=reduce(s,{type:'stage',stage:'No estoy seguro'});
  expect(pendingItems(s).some(i=>i.id==='stage')).toBe(true);
  expect(createSummary(s)).not.toContain('Etapa indicada: No estoy seguro');
 });
 it('keeps profile, dossier and summary synchronized after editing', () => {
  const s=reduce(initialWorkspace(),{type:'save',profile:{name:'Producto propio',description:'Herramientas de diseño',stage:'Estoy desarrollando',topics:'Contratos'}});
  expect(s.profile.name).toBe('Producto propio'); expect(pendingItems(s).some(i=>i.id==='name')).toBe(false);
  expect(createSummary(s)).toContain('Nombre: Producto propio'); expect(createSummary(s)).toContain('Contratos');
 });
 it('cancel reset retains work; confirm clears the entire session', () => {
  const s=reduce(initialWorkspace(),{type:'send',text:'Mi descripción'});
  const requested=reduce(s,{type:'requestReset'}); expect(requested.resetRequested).toBe(true);
  expect(reduce(requested,{type:'cancelReset'})).toEqual(s);
  expect(reduce(requested,{type:'confirmReset'})).toEqual(initialWorkspace());
 });
 it('accepts PDF/text exactly at 10 MB and rejects files beyond 10 MB', () => {
  expect(MAX_FILE_BYTES).toBe(10*1024*1024);
  expect(validateAttachment({name:'documento.pdf',type:'application/pdf',size:MAX_FILE_BYTES})).toBeNull();
  expect(validateAttachment({name:'documento.pdf',type:'application/pdf',size:MAX_FILE_BYTES+1})).not.toBeNull();
 });
 it('rejects unsupported and empty files, keeping existing context', () => {
  expect(validateAttachment({name:'imagen.png',type:'image/png',size:100})).not.toBeNull();
  expect(validateAttachment({name:'notas.txt',type:'text/plain',size:0})).not.toBeNull();
  expect(validateAttachment({name:'notas.txt',type:'text/plain',size:100})).toBeNull();
 });
 it('stores only metadata, deduplicates attachments and labels them unread', () => {
  const attachment={id:'a',name:'contrato.pdf',size:500,type:'application/pdf'};
  const s=reduce(initialWorkspace(),{type:'attach',attachment});
  expect(reduce(s,{type:'attach',attachment}).attachments).toHaveLength(1);
  expect(createSummary(s)).toContain('contrato.pdf'); expect(createSummary(s)).toContain('Pendiente de lectura');
  expect(reduce(s,{type:'remove',id:'a'}).attachments).toHaveLength(0);
 });
 it('does not generate an empty invented report',()=>expect(createSummary(initialWorkspace())).toBeNull());
 it('checking a pending task does not confirm the profile', () => {
  const s=reduce(initialWorkspace(),{type:'check',id:'stage'}); expect(s.profile.stage).toBe('');
  expect(pendingItems(s).some(i=>i.id==='stage')).toBe(true);
  expect(reduce(s,{type:'check',id:'stage'}).checked).toEqual([]);
 });
});
