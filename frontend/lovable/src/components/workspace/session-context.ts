import { createContext, type Dispatch } from 'react';
import type { Action, WorkspaceState } from '@/lib/donna-workspace';
import type { IntakeAction, IntakeSession } from '@/lib/donna-intake';
import type { DonnaChat } from './useDonnaChat';

export interface Session {
  workspace: WorkspaceState;
  dispatch: Dispatch<Action>;
  intake: IntakeSession;
  intakeDispatch: Dispatch<IntakeAction>;
  mainChat: DonnaChat;
  admissionChat: DonnaChat;
}

// Keep context identity outside the refreshed provider component. Only the
// React context object is shared here; all visitor state remains in the provider.
export const SessionContext = createContext<Session | null>(null);