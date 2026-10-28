import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SessionProvider, useDonnaSession } from '@/components/workspace/SessionProvider';
import { IntakeView } from '@/components/intake/IntakeView';
import { initialWorkspace } from '@/lib/donna-workspace';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function IntakeHarness({ onReturn }: { onReturn: () => void }) {
  const { intake, intakeDispatch } = useDonnaSession();
  return <>
    <button type="button" onClick={() => intakeDispatch({
      type: 'open', id: 'form-regression', workspace: initialWorkspace(),
    })}>Abrir ficha</button>
    <output data-testid="draft-state">{intake.draft?.step ?? 'null'}</output>
    <output data-testid="lead-count">{intake.leads.length}</output>
    <IntakeView onReturn={onReturn} />
  </>;
}

function openValidIntake(onReturn = vi.fn()) {
  render(<SessionProvider><IntakeHarness onReturn={onReturn} /></SessionProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Abrir ficha' }));
  fireEvent.change(screen.getByLabelText('Nombre de la startup *'), { target: { value: 'Circuito' } });
  fireEvent.change(screen.getByLabelText('Nombre de la persona *'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
  fireEvent.change(screen.getByLabelText('Descripción del negocio *'), { target: { value: 'Software para equipos' } });
  return onReturn;
}

it('starting, replying and retrying admission with valid fields never submit the intake; only review advances it', async () => {
  const fetcher = vi.fn()
    .mockResolvedValueOnce(Response.json({ reply: '¿Qué quieres preparar?' }))
    .mockResolvedValueOnce(Response.json({ error: 'Servicio ocupado' }, { status: 503 }))
    .mockResolvedValueOnce(Response.json({ reply: 'Respuesta de admisión recibida' }));
  vi.stubGlobal('fetch', fetcher);
  openValidIntake();
  fireEvent.click(screen.getByRole('checkbox', { name: 'He revisado este contexto y quiero aportarlo a Donna.' }));
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar admisión con Donna' }));
  await screen.findByText('¿Qué quieres preparar?');
  expect(screen.getByTestId('draft-state')).toHaveTextContent('information');

  fireEvent.change(screen.getByLabelText('Mensaje para la admisión'), { target: { value: 'Preparar mis preguntas' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar a Donna' }));
  await screen.findByRole('alert');
  expect(screen.getByTestId('draft-state')).toHaveTextContent('information');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar mensaje' }));
  await screen.findByText('Respuesta de admisión recibida');
  expect(screen.getByTestId('draft-state')).toHaveTextContent('information');
  expect(screen.getAllByText('Preparar mis preguntas')).toHaveLength(1);
  expect(fetcher).toHaveBeenCalledTimes(3);
  expect(screen.getByLabelText('Email')).toHaveValue('ana@example.com');

  fireEvent.click(screen.getByRole('button', { name: 'Revisar ficha' }));
  expect(screen.getByTestId('draft-state')).toHaveTextContent('review');
  expect(screen.queryByRole('region', { name: 'Conversación de admisión' })).toBeNull();
  expect(screen.getByTestId('lead-count')).toHaveTextContent('0');
});

it.each(['information', 'review'])('canceling valid intake in %s keeps draft null and creates no lead', async step => {
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  const onReturn = openValidIntake();
  if (step === 'review') fireEvent.click(screen.getByRole('button', { name: 'Revisar ficha' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar perfilado' }));
  await waitFor(() => expect(screen.getByTestId('draft-state')).toHaveTextContent('null'));
  expect(screen.getByTestId('lead-count')).toHaveTextContent('0');
  expect(screen.queryByRole('button', { name: 'Revisar ficha' })).toBeNull();
  expect(onReturn).toHaveBeenCalledTimes(1);
  expect(fetcher).not.toHaveBeenCalled();
});