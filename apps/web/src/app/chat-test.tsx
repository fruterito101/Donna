"use client";

import { useState } from "react";

type Turn = { who: "tú" | "Donna"; text: string };

export function ChatTest() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  // The browser does not pick a thread: the server ties this visitor to their own conversation
  // with an httpOnly cookie (see api/chat/route.ts).

  async function send() {
    const message = text.trim();
    if (!message || busy) return;
    setTurns((t) => [...t, { who: "tú", text: message }]);
    setText("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setTurns((t) => [...t, { who: "Donna", text: data.reply ?? `⚠️ ${data.error ?? "sin respuesta"}` }]);
    } catch {
      setTurns((t) => [...t, { who: "Donna", text: "⚠️ No pude conectar con el servidor." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <ol className="flex flex-col gap-3">
        {turns.map((turn, i) => (
          <li
            key={i}
            className={`whitespace-pre-wrap rounded-xl px-4 py-3 text-sm ${
              turn.who === "tú" ? "self-end bg-violet-600 text-white" : "self-start bg-zinc-100 dark:bg-zinc-800"
            }`}
          >
            {turn.text}
          </li>
        ))}
        {busy && <li className="self-start text-sm text-zinc-500">Donna está escribiendo…</li>}
      </ol>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Cuéntale a Donna qué construyes…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          disabled={busy || !text.trim()}
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
