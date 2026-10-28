import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SessionContext } from '@/components/workspace/session-context';
import { useDonnaSession } from '@/components/workspace/SessionProvider';

afterEach(() => { cleanup(); vi.doUnmock('@/components/workspace/session-context'); });

function OriginalConsumer() {
  const session = useDonnaSession();
  return <>
    <output>{session.workspace.profile.name || 'empty'}</output>
    <button type="button" onClick={() => session.dispatch({
      type: 'save', profile: { name: 'Circuito', description: '', stage: '', topics: '' },
    })}>Edit business</button>
  </>;
}

it('a re-evaluated provider module still supplies the original consumer context', async () => {
  // A provider-only hot update re-evaluates the component, not its unchanged
  // context dependency. Preserve that dependency while refreshing the module.
  vi.doMock('@/components/workspace/session-context', () => ({ SessionContext }));
  vi.resetModules();
  const refreshed = await import('@/components/workspace/SessionProvider');
  render(<refreshed.SessionProvider><OriginalConsumer /></refreshed.SessionProvider>);
  expect(screen.getByText('empty')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit business' }));
  expect(screen.getByText('Circuito')).toBeInTheDocument();
});