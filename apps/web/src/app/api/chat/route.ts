// Backend → agent. The browser talks to THIS route; only this server talks to the agent,
// so AGENT_URL and AGENT_TOKEN never reach the browser. See docs/AGENTE.md.
import { askDonna, AgentError } from "@donna/agent-client";

const MAX_MESSAGE = 4_000;

export async function POST(request: Request) {
  let body: { message?: unknown; tema?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const tema = typeof body.tema === "string" && body.tema.trim() ? body.tema.trim().slice(0, 80) : "web";
  if (!message) return Response.json({ error: "message is required" }, { status: 400 });
  if (message.length > MAX_MESSAGE) return Response.json({ error: `message over ${MAX_MESSAGE} chars` }, { status: 413 });

  try {
    const { reply, thread } = await askDonna(message, tema);
    return Response.json({ reply, thread });
  } catch (e) {
    const status = e instanceof AgentError && e.status === 400 ? 400 : 502;
    // The error text never carries the agent's address or key (agent-client guarantees it).
    return Response.json({ error: e instanceof Error ? e.message : "agent error" }, { status });
  }
}
