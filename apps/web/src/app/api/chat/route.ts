// Backend → agent. The browser talks to THIS route; only this server talks to the agent,
// so AGENT_URL, AGENT_TOKEN and AGENT_SIGNING_SECRET never reach the browser. See docs/AGENTE.md.
// Who the visitor is comes from a signed httpOnly cookie that only this server writes — never from
// the request body — so nobody can read or continue another visitor's conversation.
import { cookies } from "next/headers";
import { askDonna, AgentError, newVisitorId, readVisitor, signVisitor } from "@donna/agent-client";

const MAX_MESSAGE = 4_000;
const VISITOR_COOKIE = "donna_visitor";
const VISITOR_MAX_AGE_S = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const secret = process.env.AGENT_SIGNING_SECRET ?? "";
  if (!secret) return Response.json({ error: "service not configured" }, { status: 503 });

  let body: { message?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return Response.json({ error: "message is required" }, { status: 400 });
  if (message.length > MAX_MESSAGE) return Response.json({ error: `message over ${MAX_MESSAGE} chars` }, { status: 413 });

  const jar = await cookies();
  let visitorId = readVisitor(jar.get(VISITOR_COOKIE)?.value, secret);
  if (!visitorId) {
    visitorId = newVisitorId();
    jar.set(VISITOR_COOKIE, signVisitor(visitorId, secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: VISITOR_MAX_AGE_S,
    });
  }

  try {
    const { reply } = await askDonna(message, "web", { visitorId });
    return Response.json({ reply });
  } catch (e) {
    const status = e instanceof AgentError && e.status === 400 ? 400 : 502;
    // The error text never carries the agent's address or key (agent-client guarantees it).
    return Response.json({ error: e instanceof Error ? e.message : "agent error" }, { status });
  }
}
