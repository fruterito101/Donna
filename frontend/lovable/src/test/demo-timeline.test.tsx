import { describe, expect, it } from "vitest";
import { ANSWER_AT, END, frameAt, initialPlayer, playerReducer, STEP_BEATS, type PlayerState } from "@/lib/demo-timeline";

const run = (s: PlayerState, ms: number) => {
  for (let i = 0; i < ms / 100; i++) s = playerReducer(s, { type: "tick", dt: 100 });
  return s;
};

describe("Reproducción automática de la demo", () => {
  it("recorre los cuatro pasos sin clicks", () => {
    const seen = new Set<number>();
    let s = initialPlayer;
    while (s.elapsed < END) { s = run(s, 100); seen.add(frameAt(s.elapsed).step); }
    expect([...seen].sort()).toEqual([0, 1, 2, 3]);
    expect(frameAt(END).step).toBe(3);
  });

  it("la respuesta 'Ya tengo clientes' se aplica antes de Entiende", () => {
    expect(ANSWER_AT).toBeLessThan(STEP_BEATS[2]![0]!);
    expect(frameAt(STEP_BEATS[2]![0]!).stage).toBe("clientes");
    expect(frameAt(STEP_BEATS[1]![0]!).stage).toBeNull();
  });

  it("la pausa manual detiene el reloj", () => {
    let s = run(initialPlayer, 3000);
    s = playerReducer(s, { type: "pause" });
    expect(run(s, 5000).elapsed).toBe(s.elapsed);
  });

  it("Repetir reinicia toda la secuencia y la respuesta", () => {
    let s = run(initialPlayer, 15000);
    s = playerReducer(playerReducer(s, { type: "pause" }), { type: "restart" });
    expect(s).toEqual({ elapsed: 0, paused: false });
    expect(frameAt(s.elapsed)).toEqual({ step: 0, beat: 0, stage: null });
  });

  it("Explorar un informe deja el paso final y los ticks no lo sobreescriben", () => {
    let s = playerReducer(run(initialPlayer, 2000), { type: "report" });
    s = run(s, 5000);
    expect(frameAt(s.elapsed).step).toBe(3);
    expect(s.elapsed).toBe(END);
  });

  it("elegir un paso manualmente pausa en ese paso completo", () => {
    const s = run(playerReducer(initialPlayer, { type: "goStep", step: 1 }), 5000);
    expect(s.paused).toBe(true);
    expect(frameAt(s.elapsed).step).toBe(1);
  });
});
