import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Demo } from "@/components/donna/Demo";
import type { DemoPlayer } from "@/components/donna/useDemoPlayer";
import { END, frameAt, initialPlayer, type PlayerAction, type PlayerState } from "@/lib/demo-timeline";

function makePlayer(state: PlayerState = initialPlayer) {
  const actions: PlayerAction[] = [];
  const player = {
    ref: { current: null },
    state,
    dispatch: (a: PlayerAction) => actions.push(a),
    frame: frameAt(state.elapsed),
    done: state.elapsed >= END,
  } as DemoPlayer;
  return { player, actions };
}

describe("Controles del recorrido", () => {
  it("el módulo no muestra botones Pausar/Reanudar/Repetir", () => {
    const { player } = makePlayer();
    render(<Demo player={player} />);
    expect(screen.queryByRole("button", { name: /pausar|reanudar|repetir/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
  });

  it("el foco dentro del módulo pausa y al salir reanuda", () => {
    const { player, actions } = makePlayer();
    const { container } = render(<Demo player={player} />);
    const root = container.firstElementChild!;
    root.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    root.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    expect(actions).toContainEqual({ type: "pause" });
    expect(actions).toContainEqual({ type: "resume" });
  });
});
