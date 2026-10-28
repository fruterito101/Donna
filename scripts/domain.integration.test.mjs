// Exercise the production-shaped Next site and its real handlers with a local agent fixture.
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const calls = [];
let child, fixture, origin, output = '', landing = '';

before(async () => {
  fixture = createServer(async (request, response) => {
    assert.equal(request.url, '/v1/chat');
    assert.equal(request.headers['x-api-key'], 'domain-test-token');
    let raw = '';
    for await (const chunk of request) raw += chunk;
    const body = JSON.parse(raw);
    assert.match(body.message, /IDENTIDAD DE DONNA/);
    calls.push({ id: request.headers['x-client-id'], signature: request.headers['x-client-sig'] });
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ reply: 'Respuesta de la prueba local', thread: body.tema }));
  }).listen(0, '127.0.0.1');
  await once(fixture, 'listening');
  const reservation = createServer().listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  origin = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', 'apps/web', '-H', '127.0.0.1', '-p', String(port)], {
    cwd: root,
    env: {
      ...process.env,
      AGENT_URL: `http://127.0.0.1:${fixture.address().port}`,
      AGENT_TOKEN: 'domain-test-token',
      AGENT_SIGNING_SECRET: 'domain-test-signing-secret',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { output += data; });
  for (let attempt = 0; attempt < 200; attempt++) {
    if (child.exitCode !== null) throw new Error(`Next exited before starting: ${output}`);
    try { if ((await fetch(`${origin}/api/chat`)).status === 405) return; } catch { /* wait for listener */ }
    await delay(100);
  }
  throw new Error(`Next did not become ready: ${output}`);
});

after(async () => {
  if (child && child.exitCode === null) {
    child.kill('SIGTERM');
    await once(child, 'exit');
  }
  if (fixture) await new Promise(resolve => fixture.close(resolve));
});

test('the public root serves the Lovable landing with canonical metadata', async () => {
  const response = await fetch(`${origin}/?campaign=test`);
  assert.equal(response.status, 200);
  landing = await response.text();
  assert.match(landing, /Sabes de código/);
  assert.match(landing, /https:\/\/donna-mx\.vercel\.app\//);
  assert.doesNotMatch(landing, /Cuéntale a Donna qué construyes/);
});

test('app and contact routes support direct refresh without marketing content', async () => {
  for (const [path, expected] of [['/app', '¿Qué ponemos en orden hoy?'], ['/professional-contact', 'Centro de prospectos'], ['/operaciones', 'Centro de prospectos']]) {
    const response = await fetch(`${origin}${path}?direct=1`);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(html.includes(expected), path);
    assert.doesNotMatch(html, /Sabes de código/);
  }
});

test('landing CSS and JavaScript load as assets instead of HTML documents', async () => {
  const paths = [...new Set([...landing.matchAll(/(?:src|href)="(\/donna-assets\/[^"?]+(?:\.js|\.css))"/g)].map(match => match[1]))];
  assert.ok(paths.some(path => path.endsWith('.css')));
  assert.ok(paths.some(path => path.endsWith('.js')));
  for (const path of paths) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, path);
    assert.doesNotMatch(response.headers.get('content-type'), /text\/html/);
  }
  assert.equal((await fetch(`${origin}/favicon.svg`)).status, 200);
});

test('unregistered paths remain 404 instead of entering the workspace', async () => {
  assert.equal((await fetch(`${origin}/this-route-does-not-exist`)).status, 404);
});

const post = (path, body, headers = {}) => fetch(`${origin}${path}`, {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
});

test('the chat alias rejects foreign origins, extra identity fields and large bodies before the agent', async () => {
  const count = calls.length;
  assert.equal((await post('/api/donna/chat', { message: 'Hola' }, { Origin: 'https://other.example' })).status, 403);
  assert.equal((await post('/api/donna/chat', { message: 'Hola' }, { Origin: 'https://other.example', 'X-Forwarded-Host': 'other.example' })).status, 403);
  assert.equal((await post('/api/donna/chat', { message: 'Hola', visitorId: 'forged' })).status, 400);
  assert.equal((await post('/api/donna/chat', { message: '😀'.repeat(7000) })).status, 413);
  assert.equal((await post('/api/donna/chat', { message: 'Hola' }, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal(calls.length, count);
});

test('the local alias retains signed visitor identity and the original API works too', async () => {
  const first = await post('/api/donna/chat', { message: 'Hola desde la app' });
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { reply: 'Respuesta de la prueba local' });
  assert.equal(first.headers.get('cache-control'), 'no-store');
  const setCookie = first.headers.get('set-cookie');
  assert.match(setCookie, /donna_visitor=/);
  assert.match(setCookie, /httponly/i);
  assert.match(setCookie, /samesite=lax/i);
  const cookie = setCookie.split(';')[0];
  const second = await post('/api/chat', { message: 'Continuar' }, { Cookie: cookie });
  assert.equal(second.status, 200);
  const third = await post('/api/donna/chat', { message: 'Otra persona' });
  assert.equal(third.status, 200);
  assert.equal(calls.length, 3);
  assert.match(calls[0].id, /^v[0-9a-f]{24}$/);
  assert.match(calls[0].signature, /^[0-9a-f]{64}$/);
  assert.equal(calls[0].id, calls[1].id);
  assert.notEqual(calls[0].id, calls[2].id);
});

test('the same-origin boundary also accepts HTTPS terminated by the deployment proxy', async () => {
  const publicOrigin = origin.replace('http:', 'https:');
  const response = await post('/api/donna/chat', { message: 'Petición detrás de TLS' }, {
    Origin: publicOrigin, 'X-Forwarded-Proto': 'https',
  });
  assert.equal(response.status, 200);
});

test('the report endpoint still computes verified rules without calling the agent', async () => {
  const count = calls.length;
  const response = await post('/api/report', { answered: { tiene_ingresos: true }, explain: false });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.rules_total, 9);
  assert.ok(result.rules_verified >= 4);
  assert.ok(Array.isArray(result.report.obligations));
  assert.equal(calls.length, count);
});
