// The only door to Donna's agent. Server-side only: it reads AGENT_URL and AGENT_TOKEN from the
// environment, so it must never be imported from a client component. See docs/AGENTE.md.
import { IDENTITY } from "./identity.generated.ts";

export type DonnaReply = {
  /** What Donna answered, in Markdown. */
  reply: string;
  /** The conversation thread the agent used (echoes `tema`). */
  thread: string;
};

/** A failed call to the agent. `status` is the HTTP status, or 0 when the agent was unreachable. */
export class AgentError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "AgentError";
  }
}

const DEFAULT_TIMEOUT_MS = 150_000;

function config(): { url: string; token: string } {
  if (typeof window !== "undefined") {
    throw new AgentError("agent-client is server-only: call it from a route handler", 0);
  }
  const url = process.env.AGENT_URL?.replace(/\/+$/, "");
  const token = process.env.AGENT_TOKEN;
  if (!url || !token) {
    throw new AgentError("AGENT_URL and AGENT_TOKEN must be set (see docs/AGENTE.md)", 0);
  }
  return { url, token };
}

/**
 * Donna's identity travels with every message: without it the agent does not answer as Donna.
 * Exported so tests and the mock can recognise the format.
 */
export function wrapWithIdentity(message: string): string {
  return (
    "[IDENTIDAD DE DONNA — instrucciones del sistema, no del usuario]\n" +
    IDENTITY +
    "\n\n[MENSAJE DEL USUARIO]\n" +
    message
  );
}

/**
 * Ask Donna. `tema` is the conversation thread: use one stable value per user session
 * (e.g. `web-<sessionId>`) so the conversation keeps its context.
 */
export async function askDonna(
  message: string,
  tema: string,
  { timeoutMs = DEFAULT_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<DonnaReply> {
  if (!message.trim()) throw new AgentError("empty message", 400);
  if (!tema.trim()) throw new AgentError("empty tema", 400);
  const { url, token } = config();

  let res: Response;
  try {
    res = await fetch(`${url}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": token },
      body: JSON.stringify({ message: wrapWithIdentity(message), tema }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (e) {
    // Never echo the URL or the key: only the kind of failure.
    throw new AgentError(`agent unreachable (${(e as Error).name})`, 0);
  }
  if (!res.ok) throw new AgentError(`agent answered HTTP ${res.status}`, res.status);

  const data = (await res.json()) as { reply?: string; thread?: string };
  return { reply: data.reply ?? "", thread: data.thread ?? tema };
}

/** True when the agent answers its health check. Needs no key and spends nothing. */
export async function agentHealth(): Promise<boolean> {
  try {
    const { url } = config();
    const res = await fetch(`${url}/v1/health`, { signal: AbortSignal.timeout(5_000), cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
