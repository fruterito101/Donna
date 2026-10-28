// Who is this web visitor? The ONE place that answers it, for every route that talks to Donna.
// The answer comes from a signed httpOnly cookie that only the server writes — never from the
// request body or the IP — so nobody can read or continue another visitor's conversation.
// Server-only: call it from a Route Handler or a Server Function. See docs/COMUNICACION.md.
import { cookies } from "next/headers";
import { newVisitorId, readVisitor, signVisitor } from "@donna/agent-client";

const VISITOR_COOKIE = "donna_visitor";
const VISITOR_MAX_AGE_S = 60 * 60 * 24 * 30;

/**
 * The current visitor's id, creating it (and its cookie) on the first visit.
 * Returns null when AGENT_SIGNING_SECRET is missing: the caller answers 503, it never guesses.
 */
export async function currentVisitor(): Promise<string | null> {
  const secret = process.env.AGENT_SIGNING_SECRET ?? "";
  if (!secret) return null;
  const jar = await cookies();
  const known = readVisitor(jar.get(VISITOR_COOKIE)?.value, secret);
  if (known) return known;
  const visitorId = newVisitorId();
  jar.set(VISITOR_COOKIE, signVisitor(visitorId, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_MAX_AGE_S,
  });
  return visitorId;
}
