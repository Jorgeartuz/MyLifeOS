import { test, expect, type Page } from '@playwright/test';

const uid = '11111111-1111-1111-1111-111111111111';
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
function days(offset: number) { return new Date(Date.parse(`${date}T12:00:00Z`) + offset * 86400000).toISOString().slice(0,10); }
const user = { id: uid, aud: 'authenticated', role: 'authenticated', email: 'demo@example.test', user_metadata: { full_name: 'Alex Prueba' }, created_at: `${date}T12:00:00Z` };
async function fixtures(page: Page, empty = false) {
  const goals = [{ id: 'g1', user_id: uid, name: 'Fondo de emergencia', target_amount: 500000, current_amount: 2500, target_date: days(14), status: 'active', created_at: `${date}T12:00:00-05:00`, goal_contributions: [{ amount: 2500, contribution_date: `${date}T12:00:00-05:00`, financial_transaction_id: 't-goal' }] }];
  const transactions = [
    { id: 't1', user_id: uid, account_id: 'a1', category_id: 'c1', type: 'income', amount: 100000, transaction_date: `${date}T12:00:00-05:00`, description: 'Ingresos registrados hoy', source: null, accounts: { name: 'Efectivo' }, categories: { name: 'Trabajo', icon: null } },
    { id: 't2', user_id: uid, account_id: 'a1', category_id: 'c2', type: 'expense', amount: 10000, transaction_date: `${date}T12:00:00-05:00`, description: 'Almuerzo y gastos del día', source: null, accounts: { name: 'Efectivo' }, categories: { name: 'Comida', icon: null } },
    { id: 't-goal', user_id: uid, account_id: 'a1', category_id: null, type: 'expense', amount: 2500, transaction_date: `${date}T12:00:00-05:00`, description: 'Aporte a meta: Fondo de emergencia', source: 'goal_contribution', accounts: { name: 'Efectivo' } },
    { id: 't-prev', user_id: uid, account_id: 'a1', category_id: null, type: 'income', amount: 80000, transaction_date: `${days(-1)}T12:00:00-05:00`, description: 'Ingreso anterior', source: null },
  ];
  const tables: Record<string, unknown> = {
    accounts: [{ id: 'a1', user_id: uid, name: 'Efectivo', type: 'cash', balance: 250000, is_active: true }],
    categories: [{ id: 'c1', user_id: uid, name: 'Trabajo', type: 'income', is_active: true }, { id: 'c2', user_id: uid, name: 'Comida', type: 'expense', is_active: true }],
    transactions,
    debts: [{ id: 'd1', name: 'Préstamo personal', creditor: 'Banco', original_amount: 180000, due_date: days(7), notes: '', annual_interest_rate: 20, minimum_payment: 10000, debt_payments: [] }],
    motorcycles: { id: 'm1', user_id: uid, model: 'Moto de prueba', plate: 'ABC123', odometer: 44000, next_maintenance_km: null, soat_date: days(20), inspection_date: null },
    motorcycle_maintenance: [],
    personal_planning_settings: { user_id: uid, debt_percent: 20, daily_essentials: 30000, daily_personal: 10000, cash_buffer: 20000, goal_percent: 20, daily_km: 100, strategy: 'avalanche', personal_category_ids: [] },
    motorcycle_service_plans: [{ id: 'p1', user_id: uid, motorcycle_id: 'm1', name: 'Cambio de aceite', last_service_km: 43000, last_service_date: days(-10), interval_km: 2000, estimated_cost: 50000, active: true }],
    motorcycle_odometer_readings: [], motorcycle_funds: { balance: 10000 }, motorcycle_fund_movements: [],
    calendar_events: [{ id: 'e1', title: 'Revisar presupuesto semanal', event_date: days(3), completed: false, notes: '' }],
    work_packages: [{ id: 'wp1', package_size: 30, remaining_deliveries: 18, used_deliveries: 12, status: 'active', price: 60000 }],
    work_deliveries: [1,2].map(i => ({ id: `w${i}`, user_id: uid, amount: 12500, net_amount: 10000, commission_amount: 2500, payment_method: i === 1 ? 'cash' : 'transfer', created_at: `${date}T12:00:00-05:00`, account_id: 'a1' })),
  };
  await page.route('https://test-project.supabase.co/**', async route => {
    const request = route.request(); const url = new URL(request.url());
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS' };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user, headers });
    if (url.pathname === '/rest/v1/rpc/get_savings_goal_overview') return route.fulfill({ json: empty ? [] : goals, headers });
    if (request.method() !== 'GET') return route.fulfill({ status: 400, json: { message: 'Mutaciones deshabilitadas en pruebas de interfaz' } });
    const table = url.pathname.split('/').at(-1)!;
    const singular = ['motorcycles','personal_planning_settings','motorcycle_funds'].includes(table);
    return route.fulfill({ json: empty ? singular ? null : [] : tables[table] ?? [], headers });
  });
  await page.addInitScript(({ user }) => {
    const payload = btoa(JSON.stringify({ sub: user.id, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now()/1000)+7200 }));
    const access_token = `eyJhbGciOiJIUzI1NiJ9.${payload}.test-only`;
    localStorage.setItem('sb-test-project-auth-token', JSON.stringify({ access_token, refresh_token: 'test-only-refresh', expires_at: Math.floor(Date.now()/1000)+7200, expires_in: 7200, token_type: 'bearer', user }));
  }, { user });
}

test('Dashboard shows real period totals, planning, deadlines and no invented productivity', async ({ page }, testInfo) => {
  await fixtures(page);
  const failures: string[] = []; page.on('pageerror', error => failures.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Alex/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tu panorama financiero' })).toBeVisible();
  await expect(page.locator('article').filter({ hasText: 'Ingresos del período' })).toContainText('100.000');
  await expect(page.locator('article').filter({ hasText: 'Gastos pagados' })).toContainText('10.000');
  await expect(page.getByRole('heading', { name: 'Así puedes repartir lo que ganaste hoy' })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Para tener presente' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Pagar: Préstamo personal/ })).toBeVisible();
  await expect(page.getByText('$/hora', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/dashboard-${testInfo.project.name}.png`, fullPage: true });
  await page.screenshot({ path: `test-results/dashboard-${testInfo.project.name}-top.png` });
  await page.getByRole('button', { name: 'Este mes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Este mes', exact: true })).toHaveAttribute('aria-pressed','true');
  await expect(page.getByText('Actualizando datos', { exact: false })).toHaveCount(0);
  expect(failures).toEqual([]);
});

test('Empty dashboard offers useful states without sample money or motorcycle data', async ({ page }) => {
  await fixtures(page, true); await page.goto('/');
  await expect(page.getByRole('heading', { name: /Alex/ })).toBeVisible();
  await expect(page.getByText('Tu gráfica aparecerá con los movimientos de este período.')).toBeVisible();
  await expect(page.getByText('Registra tu moto y sus intervalos para anticipar los cambios.')).toBeVisible();
  await expect(page.getByText('AKT CR4 125')).toHaveCount(0);
});

test('A failed period refresh preserves the last summary and allows retry', async ({ page }) => {
  await fixtures(page); await page.goto('/');
  await expect(page.getByRole('heading', { name: /Alex/ })).toBeVisible();
  const pattern = 'https://test-project.supabase.co/rest/v1/transactions?**';
  await page.route(pattern, route => route.fulfill({ status: 500, headers: { 'access-control-allow-origin': '*' }, json: { message: 'Error temporal de prueba' } }));
  await page.getByRole('button', { name: 'Este mes', exact: true }).click();
  await expect(page.getByRole('alert').first()).toContainText('Error temporal de prueba');
  await expect(page.getByRole('button', { name: 'Actualizar Dashboard' })).toBeEnabled();
  await page.unroute(pattern);
  await page.getByRole('button', { name: 'Actualizar Dashboard' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('Dashboard expense shortcut opens the entry form without extra navigation', async ({ page }) => {
  await fixtures(page); await page.goto('/');
  await page.getByRole('link', { name: 'Registrar gasto', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Registrar Movimiento' })).toBeVisible();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('Install guide is accessible and manifest/icon metadata is present', async ({ page }) => {
  await fixtures(page); await page.goto('/');
  await page.getByRole('button', { name: 'Instalar MyLifeOs en mi iPhone' }).click();
  const dialog = page.getByRole('dialog', { name: 'MyLifeOs en tu iPhone' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Añadir a pantalla de inicio');
  await page.getByRole('button', { name: 'Entendido' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href','/manifest.webmanifest');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href','/icons/app-180.png');
  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
});

test('iPhone navigation opens goals and handles touch-friendly inputs', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile navigation');
  await fixtures(page); await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav).toBeVisible(); await nav.getByRole('button', { name: 'Más' }).click();
  await page.getByRole('dialog', { name: 'Otras opciones' }).getByRole('link', { name: 'Metas' }).click();
  await expect(page.getByRole('heading', { name: 'Mis metas', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Nueva meta', exact: true }).click();
  const amount = page.locator('input[type="number"]').last();
  expect(await amount.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
});

test.describe('Offline support', () => {
test.use({ serviceWorkers: 'allow' });
test('Offline navigation shows a safe fallback and never caches Supabase data', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Service worker cache inspection in Chromium');
  await fixtures(page); await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const cached = await page.evaluate(async () => { const keys = await caches.keys(); return (await Promise.all(keys.map(async key => (await (await caches.open(key)).keys()).map(request => request.url)))).flat(); });
  expect(cached.some(url => url.includes('supabase') || url.includes('/rest/v1/') || url.includes('/auth/'))).toBe(false);
  await context.setOffline(true); await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Volvemos cuando tengas conexión' })).toBeVisible();
});
});
