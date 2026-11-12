const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');

test('PostgreSQL migrations, authorization and atomic money operations', { timeout: 120000 }, async t => {
  const db = new PGlite();
  const user = '11111111-1111-1111-1111-111111111111';
  const other = '22222222-2222-2222-2222-222222222222';
  const account = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const otherAccount = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const moto = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  const plan = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  const debtId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  async function scalar(sql) { return (await db.query(sql)).rows[0].value; }
  async function isolated(work) {
    await db.exec('begin');
    try { await work(); } finally { await db.exec('rollback'); }
  }
  async function rejected(sql, pattern) {
    await db.exec('savepoint expected_error');
    try { await assert.rejects(db.exec(sql), pattern); } finally { await db.exec('rollback to savepoint expected_error'); }
  }
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to authenticated, anon;
      create type public.transaction_kind as enum ('income','expense','transfer');
      create type public.category_kind as enum ('income','expense','both');
      create table public.accounts(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id), name text not null, type text not null, balance numeric(14,2) not null default 0, is_active boolean not null default true);
      create table public.categories(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id), name text, type public.category_kind, is_active boolean default true);
      create table public.transactions(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id), account_id uuid not null references public.accounts(id), category_id uuid references public.categories(id), amount numeric(14,2), type public.transaction_kind, description text, source text, transaction_date timestamptz not null, created_at timestamptz default now());
      insert into auth.users values('${user}'),('${other}');
      insert into public.accounts(id,user_id,name,type,balance) values('${account}','${user}','Efectivo','cash',100000),('${otherAccount}','${other}','Otra cuenta','cash',100000);
    `);
    for (const name of ['202611120001_life_modules.sql', '202611120002_personal_planning.sql']) {
      await db.exec(fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', name), 'utf8'));
    }
    await db.exec(`
      insert into public.motorcycles(id,user_id,model,odometer) values('${moto}','${user}','Moto',43000);
      insert into public.motorcycle_service_plans(id,user_id,motorcycle_id,name,interval_km,last_service_km,last_service_date,estimated_cost) values('${plan}','${user}','${moto}','Aceite',2000,43000,'2026-01-01',50000);
      insert into public.debts(id,user_id,name,creditor,original_amount) values('${debtId}','${user}','Préstamo','Banco',80000);
      select set_config('request.jwt.claim.sub','${user}',false);
    `);
    await t.test('Migrations compile with enum transaction/category types and capture initial odometer', async () => {
      assert.equal(await scalar('select count(*)::int as value from public.motorcycle_odometer_readings'), 1);
    });
    await t.test('Funding atomically debits account, increases fund and records expense', () => isolated(async () => {
      await db.exec(`select public.move_motorcycle_fund('${account}',10000,false)`);
      assert.equal(Number(await scalar(`select balance as value from public.accounts where id='${account}'`)), 90000);
      assert.equal(Number(await scalar(`select balance as value from public.motorcycle_funds where user_id='${user}'`)), 10000);
      assert.equal(await scalar("select source as value from public.transactions limit 1"), 'moto_reserve');
      await rejected(`select public.move_motorcycle_fund('${account}',100000,false)`, /Saldo insuficiente/);
      assert.equal(Number(await scalar(`select balance as value from public.accounts where id='${account}'`)), 90000);
    }));
    await t.test('Service completion advances interval and consumes reserve exactly once', () => isolated(async () => {
      await db.exec(`select public.move_motorcycle_fund('${account}',50000,false); select public.complete_planned_service('${plan}',current_date,45000,50000,'',true)`);
      assert.equal(Number(await scalar(`select last_service_km + interval_km as value from public.motorcycle_service_plans where id='${plan}'`)), 47000);
      assert.equal(Number(await scalar(`select balance as value from public.motorcycle_funds where user_id='${user}'`)), 0);
      assert.equal(Number(await scalar(`select odometer as value from public.motorcycles where id='${moto}'`)), 45000);
      assert.equal(await scalar('select count(*)::int as value from public.transactions'), 1);
      await rejected(`select public.complete_planned_service('${plan}',current_date,45000,50000,'',false)`, /duplicate key/);
    }));
    await t.test('Insufficient moto fund leaves service plan, history and odometer unchanged', () => isolated(async () => {
      await rejected(`select public.complete_planned_service('${plan}',current_date,45000,50000,'',true)`, /no alcanza/);
      assert.equal(Number(await scalar(`select last_service_km as value from public.motorcycle_service_plans where id='${plan}'`)), 43000);
      assert.equal(await scalar('select count(*)::int as value from public.motorcycle_maintenance'), 0);
    }));
    await t.test('Refund cannot exceed reserve and is not recorded as earned income', () => isolated(async () => {
      await db.exec(`select public.move_motorcycle_fund('${account}',10000,false)`);
      await rejected(`select public.move_motorcycle_fund('${account}',10001,true)`, /supera el fondo/);
      await db.exec(`select public.move_motorcycle_fund('${account}',10000,true)`);
      assert.equal(Number(await scalar(`select balance as value from public.accounts where id='${account}'`)), 100000);
      assert.equal(await scalar("select count(*)::int as value from public.transactions where source='moto_reserve_refund'"), 1);
    }));
    await t.test('Finance create/reverse preserves decimal balances and rolls back insufficient funds', () => isolated(async () => {
      await db.exec(`select public.create_financial_entry('${account}',null,12.34,'expense','Almuerzo',now())`);
      assert.equal(Number(await scalar(`select balance as value from public.accounts where id='${account}'`)), 99987.66);
      const id = await scalar('select id as value from public.transactions limit 1');
      await db.exec(`select public.reverse_financial_entry('${id}')`);
      assert.equal(Number(await scalar(`select balance as value from public.accounts where id='${account}'`)), 100000);
      await rejected(`select public.create_financial_entry('${account}',null,100001,'expense','Exceso',now())`, /Saldo insuficiente/);
      assert.equal(await scalar('select count(*)::int as value from public.transactions'), 0);
    }));
    await t.test('Debt payment rejects overpayment and cannot bypass reserve accounting', () => isolated(async () => {
      await db.exec(`select public.move_motorcycle_fund('${account}',30000,false)`);
      await rejected(`select public.pay_personal_debt('${debtId}','${account}',80000,current_date)`, /Saldo insuficiente/);
      await db.exec(`select public.pay_personal_debt('${debtId}','${account}',10000,current_date)`);
      assert.equal(Number(await scalar(`select balance as value from public.accounts where id='${account}'`)), 60000);
      assert.equal(Number(await scalar(`select balance as value from public.motorcycle_funds where user_id='${user}'`)), 30000);
      await rejected(`select public.pay_personal_debt('${debtId}','${account}',80000,current_date)`, /supera el saldo/);
    }));
    await t.test('Cross-user RPC access and unauthenticated calls are rejected', () => isolated(async () => {
      await rejected(`select public.move_motorcycle_fund('${otherAccount}',10000,false)`, /cuenta propia/);
      await db.exec(`select set_config('request.jwt.claim.sub','${other}',true)`);
      await rejected(`select public.complete_planned_service('${plan}',current_date,45000,50000,'',false)`, /Plan no encontrado/);
      await rejected(`select public.create_financial_entry('${account}',null,1,'expense','',now())`, /Cuenta no encontrada/);
      await db.exec("select set_config('request.jwt.claim.sub','',true)");
      await rejected(`select public.move_motorcycle_fund('${account}',1,false)`, /Inicia sesión/);
    }));
    await t.test('RLS hides plans and funds of another user; direct fund writes are forbidden', () => isolated(async () => {
      await db.exec(`set local role authenticated; select set_config('request.jwt.claim.sub','${other}',true)`);
      assert.equal(await scalar('select count(*)::int as value from public.motorcycle_service_plans'), 0);
      await rejected('update public.motorcycle_funds set balance=100000', /permission denied/);
      await rejected(`insert into public.motorcycle_service_plans(user_id,motorcycle_id,name,interval_km,last_service_km,last_service_date,estimated_cost) values('${other}','${moto}','Falso',1000,43000,current_date,1000)`, /row-level security/);
    }));
    await t.test('Authenticated role can fund via RPC and edit only authorized debt terms', () => isolated(async () => {
      await db.exec(`set local role authenticated; select public.move_motorcycle_fund('${account}',1000,false)`);
      assert.equal(Number(await scalar(`select balance as value from public.motorcycle_funds where user_id='${user}'`)), 1000);
      await db.exec(`update public.debts set annual_interest_rate=25, minimum_payment=1000 where id='${debtId}'`);
      assert.equal(Number(await scalar(`select annual_interest_rate as value from public.debts where id='${debtId}'`)), 25);
      await rejected(`update public.debts set original_amount=0 where id='${debtId}'`, /permission denied/);
    }));
  } finally { await db.close(); }
});
