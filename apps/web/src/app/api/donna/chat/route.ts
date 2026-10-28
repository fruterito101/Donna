// Serve the imported frontend through the existing server-side visitor/agent boundary.
import { readDonnaMessage } from '@donna/frontend/server/chat-request';
import { POST as chat } from '../../chat/route';

export async function POST(request: Request) {
  // Next may normalize request.url to localhost; Host is the address actually requested.
  // Do not trust a caller-supplied X-Forwarded-Host to change the accepted origin.
  const publicURL = new URL(request.url);
  publicURL.host = request.headers.get('host') ?? publicURL.host;
  const message = await readDonnaMessage(request, publicURL.origin);
  if (message instanceof Response) return message;
  const headers = new Headers(request.headers);
  headers.delete('content-length');
  const response = await chat(new Request(request.url, {
    method: 'POST', headers, body: JSON.stringify({ message }),
  }));
  // currentVisitor() still reads and writes the original Next request's cookie store.
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
