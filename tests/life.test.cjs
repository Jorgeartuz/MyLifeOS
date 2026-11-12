const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Compile the actual TypeScript without adding a test-runner dependency.
function load(relative, overrides = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    if (name in overrides) return overrides[name];
    throw new Error(`Unexpected dependency ${name}`);
  }, module, module.exports);
  return module.exports;
}
const { debtRemaining, automaticEvents, dateLabel, today, errorMessage } = load('src/lib/life.ts');
const debt = (overrides = {}) => ({ id: 'debt-1', name: 'Moto', creditor: 'Banco', original_amount: '100000.50', due_date: '2026-12-01', notes: '', debt_payments: [], ...overrides });
test('Outstanding debt handles decimal strings from Postgres and multiple payments', () => {
  assert.equal(debtRemaining(debt({ debt_payments: [{ amount: '20000.25' }, { amount: '30000.25' }] })), 50000);
  assert.equal(debtRemaining(debt({ debt_payments: [{ amount: '100000.50' }] })), 0);
});
test('Calendar omits settled and undated debts, includes both motorcycle documents', () => {
  const events = automaticEvents([debt(), debt({ id: 'settled', debt_payments: [{ amount: '100000.50' }] }), debt({ id: 'undated', due_date: null })], { soat_date: '2026-11-20', inspection_date: '2026-12-20' });
  assert.equal(events.length, 3);
  assert.equal(events[0].href, '/deudas');
  assert.deepEqual(events.slice(1).map(e => e.event_date), ['2026-11-20', '2026-12-20']);
  assert.deepEqual(automaticEvents([], null), []);
});
test('Local dates keep the selected day across time zones', () => {
  const original = process.env.TZ;
  try {
    for (const timezone of ['America/Bogota', 'Pacific/Honolulu', 'Pacific/Kiritimati']) {
      process.env.TZ = timezone;
      assert.match(dateLabel('2026-11-12'), /12/);
      const local = new Date();
      assert.equal(today(), `${local.getFullYear()}-${String(local.getMonth()+1).padStart(2,'0')}-${String(local.getDate()).padStart(2,'0')}`);
    }
  } finally { if (original === undefined) delete process.env.TZ; else process.env.TZ = original; }
});
test('Missing schema produces an actionable error; Supabase messages remain visible', () => {
  assert.match(errorMessage({ code: 'PGRST205', message: 'relation missing' }), /migración/);
  assert.equal(errorMessage({ message: 'Saldo insuficiente' }), 'Saldo insuficiente');
});
test('Unauthenticated users cannot load private module data', async () => {
  const { lifeService } = load('src/services/life.service.ts', { '../lib/supabase': { supabase: { auth: { getUser: async () => ({ data: { user: null }, error: null }) }, from: () => assert.fail('Private query must not run') } } });
  await assert.rejects(lifeService.getMoto(), /Inicia sesión/);
  await assert.rejects(lifeService.getDebts(), /Inicia sesión/);
  await assert.rejects(lifeService.getEvents(), /Inicia sesión/);
});
test('Debt payment uses one atomic RPC and propagates insufficient balance', async () => {
  const calls = [];
  const { lifeService } = load('src/services/life.service.ts', { '../lib/supabase': { supabase: {
    rpc: async (...args) => { calls.push(args); return { error: { message: 'Saldo insuficiente' } }; },
    from: () => assert.fail('Payment must not make separate balance writes'),
  } } });
  await assert.rejects(lifeService.payDebt('d1', 'a1', 25000, '2026-11-12'), { message: 'Saldo insuficiente' });
  assert.deepEqual(calls, [['pay_personal_debt', { p_debt_id: 'd1', p_account_id: 'a1', p_amount: 25000, p_paid_on: '2026-11-12' }]]);
});
test('Maintenance uses one atomic RPC to preserve history and odometer together', async () => {
  const calls = [];
  const { lifeService } = load('src/services/life.service.ts', { '../lib/supabase': { supabase: { rpc: async (...args) => { calls.push(args); return { error: null }; } } } });
  await lifeService.addMaintenance({ motorcycle_id: 'm1', title: 'Aceite', performed_on: '2026-11-12', odometer: 5000, cost: 35000, notes: '' });
  assert.equal(calls[0][0], 'record_motorcycle_maintenance');
  assert.equal(calls[0][1].p_odometer, 5000);
});
test('Wrong current password prevents changing account credentials', async () => {
  const { settingsService } = load('src/services/settings.service.ts', {
    './finance.service': { financeService: {} },
    '../lib/supabase': { supabase: { auth: { signInWithPassword: async () => ({ error: new Error('Invalid credentials') }), updateUser: () => assert.fail('Password must not change') } } },
  });
  await assert.rejects(settingsService.changePassword('new-password', 'wrong', 'a@example.com'), /actual no es correcta/);
});
