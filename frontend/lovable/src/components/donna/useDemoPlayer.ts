import { useEffect, useReducer, useRef, useState } from "react";
import { END, frameAt, initialPlayer, playerReducer } from "@/lib/demo-timeline";

export function useDemoPlayer() {
  const [state, dispatch] = useReducer(playerReducer, initialPlayer);
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const running = inView && tabVisible && !state.paused && state.elapsed < END;
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      dispatch({ type: "tick", dt: now - last });
      last = now;
    }, 100);
    return () => window.clearInterval(id);
  }, [running]);

  return { ref, state, dispatch, frame: frameAt(state.elapsed), done: state.elapsed >= END };
}

export type DemoPlayer = ReturnType<typeof useDemoPlayer>;
