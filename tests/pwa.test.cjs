const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname,'..','public');
function worker(fetcher = async () => new Response('ok')) {
  const listeners = {};
  const self = { location: { origin: 'https://app.example' }, addEventListener: (name, callback) => listeners[name] = callback, clients: { claim: async () => {} }, skipWaiting() {} };
  const caches = { match: async () => new Response('Pantalla sin conexión'), open: async () => ({ addAll: async () => {} }), keys: async () => [] };
  new Function('self','caches','fetch','URL','Response',fs.readFileSync(path.join(root,'sw.js'),'utf8'))(self,caches,fetcher,URL,Response);
  return listeners;
}
test('Install metadata has valid standalone scope and real PNG icons of declared sizes', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
  assert.equal(manifest.display,'standalone'); assert.equal(manifest.scope,'/');
  for (const size of [180,192,512]) {
    const png = fs.readFileSync(path.join(root,'icons',`app-${size}.png`));
    assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10]);
    assert.equal(png.readUInt32BE(16),size); assert.equal(png.readUInt32BE(20),size);
  }
});
test('Service worker never intercepts Supabase, authentication endpoints or mutations', () => {
  const listeners = worker();
  for (const request of [
    { method:'GET', url:'https://project.supabase.co/rest/v1/transactions', mode:'cors' },
    { method:'GET', url:'https://project.supabase.co/auth/v1/user', mode:'cors' },
    { method:'POST', url:'https://app.example/assets/anything', mode:'cors' },
    { method:'GET', url:'https://app.example/api/private', mode:'cors' },
  ]) listeners.fetch({ request, respondWith: () => assert.fail('Private requests must use the network directly') });
});
test('Offline navigation returns generic fallback without caching the authenticated page', async () => {
  const listeners = worker(async () => { throw new Error('Offline'); });
  let response;
  listeners.fetch({ request: { method:'GET',url:'https://app.example/metas',mode:'navigate' }, respondWith: promise => response = promise });
  assert.equal(await (await response).text(),'Pantalla sin conexión');
});
