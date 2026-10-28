// The only door to Donna's agent. Server-side only: it reads AGENT_URL, AGENT_TOKEN and
// AGENT_SIGNING_SECRET from the environment, so it must never be imported from a client component.
// See docs/AGENTE.md.
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { IDENTITY } from "./identity.generated.ts";

export type DonnaReply = {
  /** What Donna answered, in Markdown. */
  reply: string;
  /** The conversation thread the agent used (echoes `tema`). */
  thread: string;
};

/** A failed call to the agent. `status` is the HTTP status, or 0 when the agent was unreachable. */
export class AgentError extends Error {
  readonly status: number;
  // No parameter property: `node --test` strips types only and rejects that syntax.
  constructor(message: string, status: number) {
    super(message);
    this.name = "AgentError";
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 150_000;

// ── Visitor isolation ────────────────────────────────────────────────────────────────────────
// Each web visitor gets a random id that only the server creates and keeps in an httpOnly cookie
// signed with AGENT_SIGNING_SECRET. The agent sees a hash of it as X-Client-Id, signed with the
// same secret (X-Client-Sig = HMAC-SHA256 in hex), so every visitor is a separate client with its
// own thread and memory, and nobody can claim another visitor's id. The browser chooses nothing.

const hmacHex = (secret: string, data: string) => createHmac("sha256", secret).update(data).digest("hex");

/** A new visitor id: 128 random bits, hex. Only the server calls this. */
export function newVisitorId(): string {
  return randomBytes(16).toString("hex");
}

/** The cookie value for a visitor: `<id>.<signature>`. */
export function signVisitor(visitorId: string, secret: string): string {
  return `${visitorId}.${hmacHex(secret, `visitor:${visitorId}`)}`;
}

/** The visitor id inside a cookie value, or null when it is missing, malformed or forged. */
export function readVisitor(cookie: string | undefined, secret: string): string | null {
  const m = /^([0-9a-f]{32})\.([0-9a-f]{64})$/.exec(cookie ?? "");
  if (!m || !secret) return null;
  const expected = Buffer.from(hmacHex(secret, `visitor:${m[1]}`), "hex");
  const given = Buffer.from(m[2], "hex");
  return timingSafeEqual(expected, given) ? m[1] : null;
}

/** The agent-side client id of a visitor: `v` + 24 hex of its sha256 (fits the agent's 32-char ids). */
export function clientIdFor(visitorId: string): string {
  return "v" + createHash("sha256").update(visitorId).digest("hex").slice(0, 24);
}

/** X-Client-Sig for a client id: what the agent recomputes with its own copy of the secret. */
export function clientSignature(clientId: string, secret: string): string {
  return hmacHex(secret, clientId);
}

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
 * Ask Donna. `tema` is the conversation thread inside the caller's own space. Pass `visitorId`
 * (from `readVisitor`/`newVisitorId`) for a web visitor: the agent then keeps that visitor's
 * conversation apart from everyone else's. Without it the call speaks as the shared client.
 */
export async function askDonna(
  message: string,
  tema: string,
  { timeoutMs = DEFAULT_TIMEOUT_MS, visitorId }: { timeoutMs?: number; visitorId?: string } = {},
): Promise<DonnaReply> {
  if (!message.trim()) throw new AgentError("empty message", 400);
  if (!tema.trim()) throw new AgentError("empty tema", 400);
  const { url, token } = config();

  const headers: Record<string, string> = { "Content-Type": "application/json", "X-API-Key": token };
  if (visitorId) {
    const secret = process.env.AGENT_SIGNING_SECRET;
    // Fail closed: a visitor without a signature would land in the shared client.
    if (!secret) throw new AgentError("AGENT_SIGNING_SECRET must be set (see docs/AGENTE.md)", 0);
    const clientId = clientIdFor(visitorId);
    headers["X-Client-Id"] = clientId;
    headers["X-Client-Sig"] = clientSignature(clientId, secret);
  }

  let res: Response;
  try {
    res = await fetch(`${url}/v1/chat`, {
      method: "POST",
      headers,
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
