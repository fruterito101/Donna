import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useRef, useState } from 'react';
import { SimulatedCall } from '@/components/intake/SimulatedCall';
import { SessionProvider, useDonnaSession } from '@/components/workspace/SessionProvider';

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
function Harness({ onContinue = () => {} }: { onContinue?: () => void }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const session = useDonnaSession();
  return <>
    <button ref={trigger} type="button" onClick={() => setOpen(true)}>Contactar a un Profesional</button>
    <output data-testid="session">{session.intake.draft === null ? 'no draft' : 'draft'}:{session.intake.leads.length}:{session.workspace.profile.name || 'empty'}:{session.mainChat.state.messages.length}</output>
    <SimulatedCall open={open} onOpenChange={setOpen} onContinue={onContinue} returnFocus={() => trigger.current?.focus()} />
  </>;
}
const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

it('simulates 2s dialing and 3s connecting then counts mm:ss without network or session changes; reopening resets', () => {
  vi.useFakeTimers(); const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  render(<SessionProvider><Harness /></SessionProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Contactar a un Profesional' }));
  expect(screen.getByRole('status')).toHaveTextContent('Marcando…');
  advance(1999); expect(screen.getByRole('status')).toHaveTextContent('Marcando…');
  advance(1); expect(screen.getByRole('status')).toHaveTextContent('Conectando con el despacho…');
  advance(2999); expect(screen.getByRole('status')).toHaveTextContent('Conectando');
  advance(1); expect(screen.getByRole('status')).toHaveTextContent('Llamada simulada en curso');
  expect(screen.getByLabelText('Duración de la llamada simulada')).toHaveTextContent('00:00');
  advance(65000); expect(screen.getByLabelText('Duración de la llamada simulada')).toHaveTextContent('01:05');
  expect(screen.getByRole('status')).not.toHaveTextContent('01:05');
  fireEvent.click(screen.getByRole('button', { name: 'Colgar' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  advance(0);
  expect(screen.getByRole('button', { name: 'Contactar a un Profesional' })).toHaveFocus();
  expect(vi.getTimerCount()).toBe(0);
  expect(screen.getByTestId('session')).toHaveTextContent('no draft:0:empty:0');
  fireEvent.click(screen.getByRole('button', { name: 'Contactar a un Profesional' }));
  expect(screen.getByRole('status')).toHaveTextContent('Marcando…');
  advance(5000); expect(screen.getByLabelText('Duración de la llamada simulada')).toHaveTextContent('00:00');
  expect(fetcher).not.toHaveBeenCalled();
  cleanup(); advance(0); expect(vi.getTimerCount()).toBe(0);
});

it.each(['escape', 'close', 'text'])('cleans timers on %s without creating records', method => {
  vi.useFakeTimers(); const onContinue = vi.fn(); const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  render(<SessionProvider><Harness onContinue={onContinue} /></SessionProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Contactar a un Profesional' }));
  advance(2000);
  if (method === 'escape') fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  else fireEvent.click(screen.getByRole('button', { name: method === 'text' ? 'Continuar por texto' : 'Cerrar simulación de llamada' }));
  advance(0); expect(vi.getTimerCount()).toBe(0);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(onContinue).toHaveBeenCalledTimes(method === 'text' ? 1 : 0);
  expect(screen.getByTestId('session')).toHaveTextContent('no draft:0:empty:0');
  expect(fetcher).not.toHaveBeenCalled();
});