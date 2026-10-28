// A local stand-in for Dona's agent: same endpoints, same shapes, no key, no cost.
// Use it to build without the real agent:  npm run mock   →  AGENT_URL=http://127.0.0.1:8787  AGENT_TOKEN=dev-mock-key
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_PORT || 8787);
const KEY = "dev-mock-key";

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

createServer((req, res) => {
  if (req.method === "GET" && req.url === "/v1/health") return send(res, 200, { ok: true });
  if (req.method !== "POST" || req.url !== "/v1/chat") return send(res, 404, { error: "not found" });
  if (req.headers["x-api-key"] !== KEY) return send(res, 401, { error: "no autorizado" });

  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return send(res, 400, { error: "request inválido" });
    }
    const message = String(body.message || "");
    if (!message.trim()) return send(res, 400, { error: "falta message" });
    const user = message.split("[MENSAJE DEL USUARIO]\n").pop().trim();
    const hasIdentity = message.includes("[IDENTIDAD DE DONA");
    const reply = hasIdentity
      ? `(simulado) Soy Dona, tu asesora de cumplimiento. Recibí: «${user.slice(0, 160)}»`
      : "(simulado) ⚠️ Llegó un mensaje SIN la identidad de Dona: usa @dona/agent-client.";
    setTimeout(() => send(res, 200, { reply, thread: body.tema || "sin-tema", client: "mock" }), 400);
  });
}).listen(PORT, "127.0.0.1", () => console.log(`agent mock on http://127.0.0.1:${PORT} · key: ${KEY}`));
