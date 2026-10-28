// Shared request-boundary checks protect both the standalone proxy and Next alias.
import { describe, expect, it } from 'vitest';
import { readDonnaMessage } from '@/server/donna-request';

const origin = 'https://donna-mx.vercel.app';
const request = (body: unknown, headers: Record<string, string> = {}) => new Request(`${origin}/api/donna/chat`, {
  method: 'POST',
  headers: { origin, 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

describe('Donna request boundary', () => {
  it('uses the public origin supplied by the host adapter when Next normalizes its internal URL', async () => {
    const internal = new Request('http://localhost/api/donna/chat', {
      method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ message: 'Hola' }),
    });
    expect(await readDonnaMessage(internal, origin)).toBe('Hola');
  });
  it('returns only a trimmed message, without accepting visitor identity in the body', async () => {
    expect(await readDonnaMessage(request({ message: '  Hola Donna  ' }))).toBe('Hola Donna');
    const invalid = await readDonnaMessage(request({ message: 'Hola', visitorId: 'someone-else' }));
    expect(invalid).toBeInstanceOf(Response);
    expect((invalid as Response).status).toBe(400);
  });

  it('refuses foreign or missing origins and non-JSON requests', async () => {
    for (const headers of [{ origin: '' }, { origin: 'https://other.example' }, { 'sec-fetch-site': 'cross-site' }]) {
      expect((await readDonnaMessage(request({ message: 'Hola' }, headers)) as Response).status).toBe(403);
    }
    expect((await readDonnaMessage(request({ message: 'Hola' }, { 'content-type': 'text/plain' })) as Response).status).toBe(415);
  });

  it('limits streamed UTF-8 bytes even without a content-length header', async () => {
    const stream = new ReadableStream({ start(controller) {
      controller.enqueue(new TextEncoder().encode(JSON.stringify({ message: '😀'.repeat(7000) })));
      controller.close();
    } });
    const streamed = new Request(`${origin}/api/donna/chat`, {
      method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: stream, duplex: 'half',
    } as RequestInit);
    expect((await readDonnaMessage(streamed) as Response).status).toBe(413);
  });
});
