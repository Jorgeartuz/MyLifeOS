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
    if (name === './goalPlanning') return load('src/lib/goalPlanning.ts');
    if (name === '../lib/planningEvents') return { notifyPlanningChanged() {} };
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

const planning = load('src/lib/planning.ts', { './life': { debtRemaining } });
const servicePlan = (overrides = {}) => ({ id: 'p1', motorcycle_id: 'm1', name: 'Aceite', interval_km: 2000, last_service_km: 43000, last_service_date: '2026-11-12', estimated_cost: 50000, active: true, ...overrides });
test('Oil change automatically forecasts 45000 km and twenty calendar days at 100 km/day', () => {
  const [next] = planning.maintenanceForecast([servicePlan()], 43000, 100, '2026-11-12');
  assert.equal(next.nextKm, 45000);
  assert.equal(next.remainingKm, 2000);
  assert.equal(next.days, 20);
  assert.equal(next.estimatedDate, '2026-12-02');
  assert.equal(next.dailyProvision, 2500);
});
test('Forecast uses current odometer, supports overdue services and no mileage estimate', () => {
  assert.equal(planning.maintenanceForecast([servicePlan()], 44000, 100, '2026-11-12')[0].days, 10);
  assert.equal(planning.maintenanceForecast([servicePlan()], 46000, 100, '2026-11-12')[0].estimatedDate, '2026-11-12');
  assert.equal(planning.maintenanceForecast([servicePlan()], 43000, 0, '2026-11-12')[0].estimatedDate, null);
  assert.equal(planning.maintenanceForecast([servicePlan({ active: false })], 43000, 100, '2026-11-12').length, 0);
});
test('Real mileage requires a week of readings and includes rest days', () => {
  assert.deepEqual(planning.dailyMileage([{ reading_date: '2026-11-12', odometer: 43000 }], 100), { km: 100, source: 'manual' });
  assert.deepEqual(planning.dailyMileage([{ reading_date: '2026-11-05', odometer: 42300 }, { reading_date: '2026-11-12', odometer: 43000 }], 50), { km: 100, source: 'readings' });
  assert.equal(planning.dailyMileage([{ reading_date: '2026-11-05', odometer: 43000 }, { reading_date: '2026-11-12', odometer: 43000 }], 100).km, 0);
});
test('Provision sums wear and allocates the fund once across imminent services', () => {
  const plans = planning.maintenanceForecast([servicePlan({ estimated_cost: 50000 }), servicePlan({ id: 'p2', estimated_cost: 50000 })], 44900, 100, '2026-11-12');
  assert.equal(planning.motoProvision(plans, 50000), 52500);
});
test('Daily debt cap respects living costs, moto provision, account buffer and no income days', () => {
  const input = { income: 100000, essentials: 40000, spent: 0, debtPaid: 0, motoNeeded: 10000, motoFunded: 0, percent: 20, liquid: 100000, buffer: 20000 };
  assert.equal(planning.dailyBudget(input).debt, 18000);
  assert.equal(planning.dailyBudget(input).forYou, 72000);
  assert.equal(planning.dailyBudget({ ...input, liquid: 25000 }).debt, 0);
  assert.equal(planning.dailyBudget({ ...input, liquid: 5000, buffer: 0 }).debt, 0);
  assert.equal(planning.dailyBudget({ ...input, income: 0 }).debt, 0);
  assert.equal(planning.dailyBudget({ ...input, spent: 95000 }).debt, 0);
  assert.equal(planning.dailyBudget({ ...input, essentials: 100000 }).provision, 0);
});
test('Already funded moto provision and debt paid cannot be suggested twice on refresh', () => {
  const input = { income: 100000, essentials: 40000, spent: 0, debtPaid: 18000, motoNeeded: 10000, motoFunded: 10000, percent: 20, liquid: 72000, buffer: 0 };
  assert.equal(planning.dailyBudget(input).debt, 0);
  assert.equal(planning.dailyBudget(input).provision, 0);
});
test('Minimums are covered before highest-interest extras; allocations never exceed budget', () => {
  const debts = [debt({ id: 'low', original_amount: 100000, annual_interest_rate: 0, minimum_payment: 3000, due_date: '2026-11-12' }), debt({ id: 'high', original_amount: 200000, annual_interest_rate: 30 })];
  const allocation = planning.allocateDebts(debts, 10000, 'avalanche', '2026-11-12');
  assert.equal(allocation.rows[0].debt.id, 'high');
  assert.equal(allocation.rows.find(r => r.debt.id === 'low').amount, 3000);
  assert.equal(allocation.rows.reduce((s,r) => s+r.amount,0), 10000);
  assert.equal(planning.allocateDebts(debts, 1000, 'avalanche', '2026-11-12').minimumShortfall, 2000);
  assert.equal(planning.allocateDebts(debts, 10000, 'snowball', '2026-11-12').rows[0].debt.id, 'low');
});
test('Debt projections roll paid-off allocations forward, include interest, and handle non-amortizing budgets', () => {
  assert.equal(planning.payoffProjection([debt({ original_amount: 100000 })], 10000, 'avalanche', '2026-11-12').days, 10);
  assert.equal(planning.payoffProjection([debt({ original_amount: 100000 })], 0, 'avalanche', '2026-11-12'), null);
  assert.ok(planning.payoffProjection([debt({ original_amount: 100000, annual_interest_rate: 30 })], 10000, 'avalanche', '2026-11-12').days > 10);
  assert.equal(planning.payoffProjection([debt({ original_amount: 100000, annual_interest_rate: 30 })], 1, 'avalanche', '2026-11-12'), null);
});
test('Snapshot excludes reserve refunds from earnings and debt payments from living expenses', () => {
  const snapshot = planning.planningSnapshot({
    settings: { ...planning.defaultSettings, daily_essentials: 40000 }, plans: [], readings: [], fund: { balance: 10000 }, moto: null,
    debts: [debt({ debt_payments: [{ amount: 20000, paid_on: '2026-11-12', financial_transaction_id: 'payment' }] })],
    accounts: [{ type: 'cash', balance: 100000 }],
    transactions: [
      { id: 'income', type: 'income', amount: 100000, transaction_date: '2026-11-12T12:00:00-05:00' },
      { id: 'refund', type: 'income', source: 'moto_reserve_refund', amount: 50000, transaction_date: '2026-11-12T12:00:00-05:00' },
      { id: 'payment', type: 'expense', amount: 20000, transaction_date: '2026-11-12T12:00:00-05:00' },
    ],
  }, '2026-11-12');
  assert.equal(snapshot.budget.income, 100000);
  assert.equal(snapshot.averageSpending, 0);
  assert.equal(snapshot.budget.debt, 0);
});

test('Partial contribution does not reduce an imminent service shortfall twice', () => {
  const snapshot = planning.planningSnapshot({
    settings: { ...planning.defaultSettings }, plans: [servicePlan()], readings: [], fund: { balance: 25000 },
    moto: { odometer: 44900 }, debts: [], accounts: [{ type: 'cash', balance: 175000 }],
    transactions: [
      { id: 'income', type: 'income', amount: 200000, transaction_date: '2026-11-12T12:00:00-05:00' },
      { id: 'fund', type: 'expense', source: 'moto_reserve', amount: 25000, transaction_date: '2026-11-12T12:00:00-05:00' },
    ],
  }, '2026-11-12');
  assert.equal(snapshot.budget.provision, 25000);
});

test('Finance RPC result accepts PostgREST row arrays as well as a singular object', async () => {
  for (const result of [{ id: 'tx1' }, [{ id: 'tx1' }]]) {
    const { financeService } = load('src/services/finance.service.ts', { '../lib/supabase': { supabase: { rpc: async () => ({ data: result, error: null }) } } });
    const tx = await financeService.createTransaction({ account_id: 'a1', category_id: null, amount: 10, type: 'income', description: '', transaction_date: '2026-11-12' });
    assert.equal(tx.id, 'tx1');
  }
});

const { goalSchedule, allocateGoals } = load('src/lib/goalPlanning.ts');
test('Goal projection handles tiny contributions without invalid JavaScript dates', () => {
  const { goalCompletionDate, bogotaDay } = load('src/lib/goalPlanning.ts');
  assert.equal(goalCompletionDate(1000, 100, '2026-11-12'), '2026-11-21');
  assert.equal(goalCompletionDate(999999999999, 0.01, '2026-11-12'), null);
  assert.equal(bogotaDay('2026-11-12'), '2026-11-12');
});
const goal = (overrides = {}) => ({ id: 'g1', name: 'Viaje', target_amount: 900, current_amount: 0, target_date: '2026-11-20', status: 'active', created_at: '2026-11-12', goal_contributions: [], ...overrides });
test('Goal schedule uses inclusive calendar days and separate weekly/monthly deposit counts', () => {
  const plan = goalSchedule(goal(), '2026-11-12');
  assert.equal(plan.days, 9);
  assert.equal(plan.daily, 100);
  assert.equal(plan.weeks, 2);
  assert.equal(plan.weekly, 450);
  assert.equal(plan.months, 1);
  assert.equal(plan.monthly, 900);
});
test('Monthly deposits respect month lengths, leap years and the initial anchor day', () => {
  assert.equal(goalSchedule(goal({ target_date: '2027-03-31' }), '2027-01-31').months, 3);
  assert.equal(goalSchedule(goal({ target_date: '2027-03-30' }), '2027-01-31').months, 2);
  assert.equal(goalSchedule(goal({ target_date: '2028-02-29' }), '2028-01-31').months, 2);
});
test('Saving the daily quota does not cause another quota to be suggested on refresh', () => {
  const plan = goalSchedule(goal({ target_amount: 1000, current_amount: 100, target_date: '2026-11-21', goal_contributions: [{ amount: 100, contribution_date: '2026-11-12T12:00:00-05:00' }] }), '2026-11-12');
  assert.equal(plan.daily, 0);
  assert.equal(plan.paidToday, 100);
  assert.equal(goalSchedule({ ...plan.goal }, '2026-11-13').daily, 100);
});
test('Overdue, completed, paused and undated goals do not invent a future deadline', () => {
  assert.equal(goalSchedule(goal({ target_date: '2026-11-11' }), '2026-11-12').overdue, true);
  assert.equal(goalSchedule(goal({ target_date: null }), '2026-11-12').daily, null);
  assert.equal(allocateGoals([goal({ status: 'paused' }), goal({ current_amount: 900 })], 500, '2026-11-12').total, 0);
});
test('Goals share one budget, with dated goals before flexible goals', () => {
  const rows = [goal({ id: 'flex', target_date: null }), goal({ id: 'later', target_date: '2026-12-12' }), goal({ id: 'soon' })];
  const allocation = allocateGoals(rows, 100, '2026-11-12');
  assert.equal(allocation.total, 100);
  assert.equal(allocation.rows[0].goal.id, 'soon');
  assert.equal(allocation.rows[0].amount, 100);
  assert.equal(allocation.rows[1].amount, 0);
});
const unifiedData = (overrides = {}) => ({
  settings: { ...planning.defaultSettings, daily_essentials: 30000, daily_personal: 10000 }, plans: [], readings: [], fund: { balance: 0 }, moto: null, debts: [],
  accounts: [{ type: 'cash', balance: 100000 }],
  transactions: [{ id: 'income', type: 'income', amount: 100000, transaction_date: '2026-11-12T12:00:00-05:00' }],
  goals: [goal({ target_amount: 900000 })], ...overrides,
});
test('Unified allocation protects expenses, takes 20% for goals, and leaves a real base', () => {
  const plan = planning.planningSnapshot(unifiedData(), '2026-11-12');
  assert.equal(plan.budget.debt, 0); // No phantom debt allocation when there are no debts.
  assert.equal(plan.workRemaining, 30000);
  assert.equal(plan.personalRemaining, 10000);
  assert.equal(plan.goals.total, 12000);
  assert.equal(plan.base, 48000);
  assert.equal(plan.workRemaining + plan.personalRemaining + plan.goals.total + plan.base, 100000);
});
test('A goal contribution is neither a second living expense nor an opportunity to apply 20% again', () => {
  const contribution = { amount: 12000, contribution_date: '2026-11-12T12:00:00-05:00', financial_transaction_id: 'saving' };
  const data = unifiedData({ accounts: [{ type: 'cash', balance: 88000 }], goals: [goal({ target_amount: 900000, current_amount: 12000, goal_contributions: [contribution] })] });
  data.transactions.push({ id: 'saving', type: 'expense', source: 'goal_contribution', amount: 12000, transaction_date: '2026-11-12T12:00:00-05:00' });
  const plan = planning.planningSnapshot(data, '2026-11-12');
  assert.equal(plan.spent, 0);
  assert.equal(plan.goalPaid, 12000);
  assert.equal(plan.goals.total, 0);
  assert.equal(plan.base, 48000);
});
test('Underfunded days never allocate more than received and report unmet living needs', () => {
  const plan = planning.planningSnapshot(unifiedData({ accounts: [{ type: 'cash', balance: 10000 }], transactions: [{ id: 'income', type: 'income', amount: 10000, transaction_date: '2026-11-12T12:00:00-05:00' }] }), '2026-11-12');
  assert.equal(plan.workRemaining, 10000);
  assert.equal(plan.personalRemaining, 0);
  assert.equal(plan.livingShortfall, 30000);
  assert.equal(plan.goals.total, 0);
  assert.equal(plan.base, 0);
});
test('Chosen personal categories reduce their own budget without consuming the work allowance twice', () => {
  const data = unifiedData({ settings: { ...planning.defaultSettings, daily_essentials: 30000, daily_personal: 10000, personal_category_ids: ['personal'] }, accounts: [{ type: 'cash', balance: 95000 }] });
  data.transactions.push({ id: 'lunch', type: 'expense', category_id: 'personal', amount: 5000, transaction_date: '2026-11-12T12:00:00-05:00' });
  const plan = planning.planningSnapshot(data, '2026-11-12');
  assert.equal(plan.workRemaining, 30000);
  assert.equal(plan.personalRemaining, 5000);
  assert.equal(plan.spent, 5000);
  assert.equal(plan.goals.total, 12000);
});

const dashboard = load('src/lib/dashboardAnalytics.ts', {
  './planning': planning, './life': { debtRemaining, automaticEvents }, './goalPlanning': load('src/lib/goalPlanning.ts'),
});
test('Dashboard compares equal calendar-day windows across week and month boundaries', () => {
  assert.deepEqual(dashboard.dashboardWindow('semana','2026-11-12'), { start: '2026-11-09', end: '2026-11-13', previousStart: '2026-11-05', days: 4 });
  assert.deepEqual(dashboard.dashboardWindow('mes','2026-11-01'), { start: '2026-11-01', end: '2026-11-02', previousStart: '2026-10-31', days: 1 });
});
test('Dashboard separates savings and fund refunds from real expenses and earned income', () => {
  const ledger = [
    { id: 'earned', type: 'income', amount: 100000, transaction_date: '2026-11-12T12:00:00-05:00' },
    { id: 'prior', type: 'income', amount: 80000, transaction_date: '2026-11-11T12:00:00-05:00' },
    { id: 'expense', type: 'expense', amount: 10000, transaction_date: '2026-11-12T12:00:00-05:00' },
    { id: 'saving', type: 'expense', source: 'goal_contribution', amount: 20000, transaction_date: '2026-11-12T12:00:00-05:00' },
    { id: 'refund', type: 'income', source: 'moto_reserve_refund', amount: 5000, transaction_date: '2026-11-12T12:00:00-05:00' },
    { id: 'future', type: 'income', amount: 500000, transaction_date: '2026-11-13T12:00:00-05:00' },
  ];
  const data = dashboard.dashboardAnalytics(unifiedData(), ledger, [], [], 'hoy','2026-11-12');
  assert.equal(data.totals.income, 100000);
  assert.equal(data.totals.expenses, 10000);
  assert.equal(data.totals.reserved, 20000);
  assert.equal(data.totals.cashflow, 75000);
  assert.equal(data.incomeChange, 25);
  assert.equal(data.expenseChange, null);
  assert.equal(data.chart.length, 1);
  assert.equal(data.recentTransactions.length, 4);
});
test('Work summary uses recorded commission/net values and does not fabricate hours or kilometres', () => {
  const rows = [
    { created_at: '2026-11-12T12:00:00-05:00', amount: 10000, net_amount: 8000, commission_amount: 2000, payment_method: 'cash' },
    { created_at: '2026-11-11T12:00:00-05:00', amount: 10000, net_amount: 8000, commission_amount: 2000, payment_method: 'transfer' },
  ];
  const data = dashboard.dashboardAnalytics(unifiedData(), [], rows, [], 'hoy','2026-11-12');
  assert.equal(data.work.count, 1);
  assert.equal(data.work.net, 8000);
  assert.equal(data.work.cash, 8000);
  assert.equal(data.work.commissions, 2000);
  assert.equal('hours' in data.work, false);
  assert.equal('kilometers' in data.work, false);
});
test('Dashboard lists unfinished upcoming events and active goals while omitting completed events', () => {
  const events = [{ id: 'e1', title: 'Pendiente', event_date: '2026-11-13', completed: false }, { id: 'e2', title: 'Hecho', event_date: '2026-11-13', completed: true }];
  const data = dashboard.dashboardAnalytics(unifiedData(), [], [], events, 'hoy','2026-11-12');
  assert.ok(data.deadlines.some(e => e.title === 'Pendiente'));
  assert.equal(data.deadlines.some(e => e.title === 'Hecho'), false);
  assert.ok(data.deadlines.some(e => e.href === '/metas'));
  assert.equal(data.incomeChange, null);
});
