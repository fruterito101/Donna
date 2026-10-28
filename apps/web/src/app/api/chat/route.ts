// Backend → agent. The browser talks to THIS route; only this server talks to the agent,
// so AGENT_URL, AGENT_TOKEN and AGENT_SIGNING_SECRET never reach the browser.
// Who the visitor is comes from currentVisitor() (a signed httpOnly cookie) — never from the
// request body — so nobody can read or continue another visitor's conversation.
// The whole contract for talking to Donna: docs/COMUNICACION.md.
import { askDonna, AgentError } from "@donna/agent-client";
import { currentVisitor } from "@/lib/visitor";

const MAX_MESSAGE = 4_000;

export async function POST(request: Request) {
  let body: { message?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return Response.json({ error: "message is required" }, { status: 400 });
  if (message.length > MAX_MESSAGE) return Response.json({ error: `message over ${MAX_MESSAGE} chars` }, { status: 413 });

  const visitorId = await currentVisitor();
  if (!visitorId) return Response.json({ error: "service not configured" }, { status: 503 });

  try {
    const { reply } = await askDonna(message, "web", { visitorId });
    return Response.json({ reply });
  } catch (e) {
    const status = e instanceof AgentError && e.status === 400 ? 400 : 502;
    // The error text never carries the agent's address or key (agent-client guarantees it).
    return Response.json({ error: e instanceof Error ? e.message : "agent error" }, { status });
  }
}
