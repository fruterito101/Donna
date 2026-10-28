// Shared trust boundary for the standalone proxy and the same-origin Next handler.
const MAX_BODY = 24 * 1024;
export const MAX_MESSAGE = 4000;
const error = (status: number, message: string) => Response.json({ error: message }, {
  status, headers: { 'Cache-Control': 'no-store' },
});

async function readBounded(request: Request): Promise<string> {
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) throw new Error('size');
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) { await reader.cancel(); throw new Error('size'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const joined = new Uint8Array(size);
  let position = 0;
  for (const chunk of chunks) { joined.set(chunk, position); position += chunk.byteLength; }
  return new TextDecoder('utf-8', { fatal: true }).decode(joined);
}

export async function readDonnaMessage(request: Request, expectedOrigin = new URL(request.url).origin): Promise<string | Response> {
  const origin = request.headers.get('origin');
  if (!origin || origin !== expectedOrigin || request.headers.get('sec-fetch-site') === 'cross-site') {
    return error(403, 'Esta solicitud debe iniciarse desde Donna.');
  }
  if (request.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/json') {
    return error(415, 'Envía un mensaje en formato JSON.');
  }
  let body: unknown;
  try { body = JSON.parse(await readBounded(request)); }
  catch (failure) {
    return error(failure instanceof Error && failure.message === 'size' ? 413 : 400, 'El mensaje no es válido o supera el tamaño permitido.');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1 || !('message' in body) || typeof body.message !== 'string') {
    return error(400, 'Solo se admite un mensaje de texto.');
  }
  const message = body.message.trim();
  if (!message || message.length > MAX_MESSAGE) return error(400, 'Escribe un mensaje de entre 1 y 4000 caracteres.');
  return message;
}
