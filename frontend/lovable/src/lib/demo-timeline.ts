import type { Stage } from "./donna-case";

// Momentos (ms) en que aparece cada elemento, por paso. Duración total ~24 s.
export const STEP_BEATS: number[][] = [
  [0, 1200, 2400, 3800], // Cuéntame: Donna, usuario, archivos, expediente
  [6000, 7400, 9000, 10000, 11200], // Confirma: pregunta, opciones, selección, burbuja, confirmación
  [13000, 14000, 15200, 16400, 17400], // Entiende: Donna, confirmados, pendientes, revisión, nota
  [19500, 20600, 21800], // Prepara: Donna, checklist, texto visible
];
export const ANSWER_AT = 9000;
export const SIMULATED_ANSWER: Stage = "clientes";
export const END = 24000;

export interface Frame { step: number; beat: number; stage: Stage | null }

export function frameAt(t: number): Frame {
  let step = 0;
  let beat = 0;
  STEP_BEATS.forEach((beats, s) =>
    beats.forEach((bt, b) => {
      if (t >= bt) { step = s; beat = b; }
    }),
  );
  return { step, beat, stage: t >= ANSWER_AT ? SIMULATED_ANSWER : null };
}

export interface PlayerState { elapsed: number; paused: boolean }
export type PlayerAction =
  | { type: "tick"; dt: number }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "restart" }
  | { type: "goStep"; step: number }
  | { type: "report" };

export const initialPlayer: PlayerState = { elapsed: 0, paused: false };

export function playerReducer(s: PlayerState, a: PlayerAction): PlayerState {
  switch (a.type) {
    case "tick":
      if (s.paused || s.elapsed >= END) return s;
      return { ...s, elapsed: Math.min(END, s.elapsed + a.dt) };
    case "pause":
      return { ...s, paused: true };
    case "resume":
      return { ...s, paused: false };
    case "restart":
      return { elapsed: 0, paused: false };
    case "goStep": {
      const beats = STEP_BEATS[a.step] ?? [0];
      return { elapsed: beats[beats.length - 1] ?? 0, paused: true };
    }
    case "report":
      return { elapsed: END, paused: true };
  }
}
