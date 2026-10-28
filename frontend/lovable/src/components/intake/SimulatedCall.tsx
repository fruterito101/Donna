import * as Dialog from '@radix-ui/react-dialog';
import { Phone, PhoneOff, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppButton } from '@/components/workspace/primitives';
import { DESTINATION } from '@/lib/donna-intake';

function CallContent({ onContinue }: { onContinue: () => void }) {
  const [phase, setPhase] = useState<'dialing' | 'connecting' | 'active'>('dialing');
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let clock: ReturnType<typeof setInterval> | undefined;
    const connecting = setTimeout(() => setPhase('connecting'), 2000);
    const active = setTimeout(() => {
      setPhase('active');
      clock = setInterval(() => setSeconds(s => s + 1), 1000);
    }, 5000);
    return () => { clearTimeout(connecting); clearTimeout(active); if (clock !== undefined) clearInterval(clock); };
  }, []);
  const status = phase === 'dialing' ? 'Marcando…' : phase === 'connecting' ? 'Conectando con el despacho…' : 'Llamada simulada en curso';
  return <>
    <Dialog.Close asChild><AppButton type="button" variant="ghost" className="absolute right-3 top-3 size-11 p-0" aria-label="Cerrar simulación de llamada"><X aria-hidden /></AppButton></Dialog.Close>
    <p className="mb-6 text-sm font-semibold text-primary">Simulación de llamada</p>
    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-accent text-primary motion-safe:animate-pulse"><Phone className="size-8" aria-hidden /></div>
    <Dialog.Title className="mt-6 break-words font-serif text-2xl leading-tight">{DESTINATION}</Dialog.Title>
    <p className="mt-2 text-sm text-muted-foreground">Admisión fiscal</p>
    <p role="status" aria-live="polite" aria-atomic="true" className="mt-6 min-h-12 font-semibold text-primary">{status}</p>
    <p aria-live="off" aria-label="Duración de la llamada simulada" className="min-h-8 font-sans text-xl tabular-nums">{phase === 'active' ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : ''}</p>
    <Dialog.Description className="mt-4 text-sm text-muted-foreground">Tu contexto de ejemplo está listo para la revisión. Solo es una simulación visual, sin llamada, audio ni conexión al despacho.</Dialog.Description>
    <div className="mt-7 flex flex-col gap-3">
      <Dialog.Close asChild><AppButton type="button" variant="destructive"><PhoneOff aria-hidden />Colgar</AppButton></Dialog.Close>
      <AppButton type="button" variant="ghost" onClick={onContinue}>Continuar por texto</AppButton>
    </div>
  </>;
}

export function SimulatedCall({ open, onOpenChange, onContinue, returnFocus }: {
  open: boolean; onOpenChange: (open: boolean) => void; onContinue: () => void; returnFocus: () => void;
}) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    {open && <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
      <Dialog.Content onCloseAutoFocus={e => { e.preventDefault(); returnFocus(); }} className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card px-6 py-8 text-center shadow-xl">
        <CallContent onContinue={() => { onOpenChange(false); onContinue(); }} />
      </Dialog.Content>
    </Dialog.Portal>}
  </Dialog.Root>;
}