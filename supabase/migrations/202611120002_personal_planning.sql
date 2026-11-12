-- Apply once, AFTER 202611120001_life_modules.sql. Existing records are preserved.
begin;

alter table public.debts add column annual_interest_rate numeric(8,4) not null default 0 check (annual_interest_rate between 0 and 1000);
alter table public.debts add column minimum_payment numeric(14,2) not null default 0 check (minimum_payment between 0 and 999999999999);
grant update (annual_interest_rate, minimum_payment) on public.debts to authenticated;

create table public.personal_planning_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  debt_percent numeric not null default 20 check (debt_percent between 0 and 100),
  daily_essentials numeric(14,2) not null default 0 check (daily_essentials between 0 and 999999999999),
  cash_buffer numeric(14,2) not null default 0 check (cash_buffer between 0 and 999999999999),
  daily_km numeric not null default 100 check (daily_km between 0 and 2000),
  strategy text not null default 'avalanche' check (strategy in ('avalanche', 'snowball'))
);
create table public.motorcycle_service_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  motorcycle_id uuid not null references public.motorcycles(id),
  name text not null check (length(trim(name)) between 1 and 120),
  interval_km integer not null check (interval_km between 1 and 1000000),
  last_service_km integer not null check (last_service_km >= 0),
  last_service_date date not null,
  estimated_cost numeric(14,2) not null check (estimated_cost between 0 and 999999999999),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.motorcycle_odometer_readings (
  user_id uuid not null references auth.users(id) on delete cascade,
  reading_date date not null,
  odometer integer not null check (odometer >= 0),
  primary key(user_id, reading_date)
);
create table public.motorcycle_funds (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance numeric(14,2) not null default 0 check (balance between 0 and 999999999999)
);
create table public.motorcycle_fund_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id),
  financial_transaction_id uuid unique references public.transactions(id),
  amount numeric(14,2) not null check (amount between 0.01 and 999999999999),
  kind text not null check (kind in ('contribution', 'service', 'refund')),
  description text not null,
  created_at timestamptz not null default now()
);
alter table public.motorcycle_maintenance add column plan_id uuid references public.motorcycle_service_plans(id);
create index on public.motorcycle_service_plans(user_id);
create index on public.motorcycle_fund_movements(user_id, created_at);
create index on public.motorcycle_maintenance(plan_id);
create unique index motorcycle_service_once on public.motorcycle_maintenance(plan_id, performed_on, odometer) where plan_id is not null;
alter table public.personal_planning_settings enable row level security;
alter table public.motorcycle_service_plans enable row level security;
alter table public.motorcycle_odometer_readings enable row level security;
alter table public.motorcycle_funds enable row level security;
alter table public.motorcycle_fund_movements enable row level security;
create policy own_planning on public.personal_planning_settings for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_service_plans on public.motorcycle_service_plans for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (select 1 from public.motorcycles m where m.id = motorcycle_id and m.user_id = (select auth.uid())));
create policy own_readings on public.motorcycle_odometer_readings for select to authenticated using (user_id = (select auth.uid()));
create policy own_fund on public.motorcycle_funds for select to authenticated using (user_id = (select auth.uid()));
create policy own_fund_movements on public.motorcycle_fund_movements for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.personal_planning_settings, public.motorcycle_service_plans, public.motorcycle_odometer_readings, public.motorcycle_funds, public.motorcycle_fund_movements from anon, authenticated;
grant select, insert, update on public.personal_planning_settings, public.motorcycle_service_plans to authenticated;
grant select on public.motorcycle_odometer_readings, public.motorcycle_funds, public.motorcycle_fund_movements to authenticated;

create function public.capture_motorcycle_odometer() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.motorcycle_odometer_readings(user_id, reading_date, odometer)
    values(new.user_id, (now() at time zone 'America/Bogota')::date, new.odometer)
    on conflict(user_id, reading_date) do update set odometer = greatest(public.motorcycle_odometer_readings.odometer, excluded.odometer);
  return new;
end;
$$;
create trigger motorcycle_daily_reading after insert or update of odometer on public.motorcycles for each row execute function public.capture_motorcycle_odometer();
insert into public.motorcycle_odometer_readings(user_id, reading_date, odometer) select user_id, (now() at time zone 'America/Bogota')::date, odometer from public.motorcycles;

-- All existing finance callers now share row locks with debt payments and moto funding.
create function public.create_financial_entry(p_account_id uuid, p_category_id uuid, p_amount numeric, p_type text, p_description text, p_date timestamptz)
returns public.transactions language plpgsql security definer set search_path = '' as $$
declare v_account public.accounts%rowtype; v_tx public.transactions%rowtype; v_balance numeric;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para continuar'; end if;
  if p_amount is null or p_amount not between 0.01 and 999999999999 or p_amount <> round(p_amount, 2) then raise exception 'Monto inválido'; end if;
  if p_type is null or p_type not in ('income', 'expense') then raise exception 'Tipo de movimiento inválido'; end if;
  if p_date is null then raise exception 'Fecha obligatoria'; end if;
  select * into v_account from public.accounts where id = p_account_id and user_id = auth.uid() and is_active = true for update;
  if v_account.id is null then raise exception 'Cuenta no encontrada'; end if;
  if p_category_id is not null and not exists(select 1 from public.categories where id = p_category_id and user_id = auth.uid() and is_active = true and (type::text = p_type or type::text = 'both')) then raise exception 'Categoría no válida para este movimiento'; end if;
  v_balance := coalesce(v_account.balance, 0) + case when p_type = 'income' then p_amount else -p_amount end;
  if v_balance < 0 and v_account.type <> 'credit_card' then raise exception 'Saldo insuficiente'; end if;
  -- Use an explicit branch so enum-based schemas accept literal transaction types too.
  if p_type = 'income' then
    insert into public.transactions(user_id, account_id, category_id, amount, type, description, transaction_date) values(auth.uid(), p_account_id, p_category_id, p_amount, 'income', p_description, p_date) returning * into v_tx;
  else
    insert into public.transactions(user_id, account_id, category_id, amount, type, description, transaction_date) values(auth.uid(), p_account_id, p_category_id, p_amount, 'expense', p_description, p_date) returning * into v_tx;
  end if;
  update public.accounts set balance = v_balance where id = p_account_id;
  return v_tx;
end;
$$;
create function public.reverse_financial_entry(p_transaction_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare v_tx public.transactions%rowtype; v_account public.accounts%rowtype;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para continuar'; end if;
  select * into v_tx from public.transactions where id = p_transaction_id and user_id = auth.uid() for update;
  if v_tx.id is null then raise exception 'Movimiento no encontrado'; end if;
  select * into v_account from public.accounts where id = v_tx.account_id and user_id = auth.uid() for update;
  if v_account.id is null then raise exception 'Cuenta no encontrada'; end if;
  delete from public.transactions where id = v_tx.id;
  update public.accounts set balance = coalesce(balance, 0) + case when v_tx.type = 'income' then -v_tx.amount else v_tx.amount end where id = v_tx.account_id;
end;
$$;

create function public.move_motorcycle_fund(p_account_id uuid, p_amount numeric, p_refund boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
declare v_account public.accounts%rowtype; v_fund numeric; v_tx uuid;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para continuar'; end if;
  if p_amount is null or p_amount not between 0.01 and 999999999999 or p_amount <> round(p_amount, 2) then raise exception 'Monto inválido'; end if;
  insert into public.motorcycle_funds(user_id) values(auth.uid()) on conflict do nothing;
  select balance into v_fund from public.motorcycle_funds where user_id = auth.uid() for update;
  select * into v_account from public.accounts where id = p_account_id and user_id = auth.uid() and is_active = true for update;
  if v_account.id is null or v_account.type = 'credit_card' then raise exception 'Selecciona una cuenta propia sin crédito'; end if;
  if coalesce(p_refund, false) then
    if p_amount > v_fund then raise exception 'El retiro supera el fondo disponible'; end if;
    update public.motorcycle_funds set balance = balance - p_amount where user_id = auth.uid();
    update public.accounts set balance = coalesce(balance, 0) + p_amount where id = p_account_id;
    insert into public.transactions(user_id, account_id, category_id, type, amount, description, source, transaction_date)
      values(auth.uid(), p_account_id, null, 'income', p_amount, 'Retiro del apartado moto', 'moto_reserve_refund', now()) returning id into v_tx;
  else
    if p_amount > coalesce(v_account.balance, 0) then raise exception 'Saldo insuficiente para apartar'; end if;
    update public.motorcycle_funds set balance = balance + p_amount where user_id = auth.uid();
    update public.accounts set balance = balance - p_amount where id = p_account_id;
    insert into public.transactions(user_id, account_id, category_id, type, amount, description, source, transaction_date)
      values(auth.uid(), p_account_id, null, 'expense', p_amount, 'Apartado para mantenimiento moto', 'moto_reserve', now()) returning id into v_tx;
  end if;
  insert into public.motorcycle_fund_movements(user_id, account_id, financial_transaction_id, amount, kind, description)
    values(auth.uid(), p_account_id, v_tx, p_amount, case when coalesce(p_refund,false) then 'refund' else 'contribution' end, case when coalesce(p_refund,false) then 'Devolución a ' else 'Apartado desde ' end || v_account.name);
end;
$$;

create function public.complete_planned_service(p_plan_id uuid, p_date date, p_odometer integer, p_cost numeric, p_notes text, p_from_fund boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
declare v_plan public.motorcycle_service_plans%rowtype; v_fund numeric; v_moto uuid;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para continuar'; end if;
  select * into v_plan from public.motorcycle_service_plans where id = p_plan_id and user_id = auth.uid() and active = true for update;
  if v_plan.id is null then raise exception 'Plan no encontrado'; end if;
  select id into v_moto from public.motorcycles where id = v_plan.motorcycle_id and user_id = auth.uid() for update;
  if v_moto is null then raise exception 'Moto no encontrada'; end if;
  if p_date is null or p_date > (now() at time zone 'America/Bogota')::date or p_date < v_plan.last_service_date then raise exception 'Fecha de servicio inválida'; end if;
  if p_odometer is null or p_odometer < v_plan.last_service_km then raise exception 'El servicio no puede retroceder el kilometraje del plan'; end if;
  if p_cost is null or p_cost not between 0 and 999999999999 or p_cost <> round(p_cost,2) then raise exception 'Costo inválido'; end if;
  if coalesce(p_from_fund, false) and p_cost > 0 then
    select balance into v_fund from public.motorcycle_funds where user_id = auth.uid() for update;
    if coalesce(v_fund,0) < p_cost then raise exception 'El apartado moto no alcanza para este servicio'; end if;
    update public.motorcycle_funds set balance = balance - p_cost where user_id = auth.uid();
    insert into public.motorcycle_fund_movements(user_id, amount, kind, description) values(auth.uid(), p_cost, 'service', 'Servicio: ' || v_plan.name);
  end if;
  insert into public.motorcycle_maintenance(user_id, motorcycle_id, plan_id, title, performed_on, odometer, cost, notes)
    values(auth.uid(), v_plan.motorcycle_id, v_plan.id, v_plan.name, p_date, p_odometer, p_cost, coalesce(p_notes,''));
  update public.motorcycle_service_plans set last_service_km = p_odometer, last_service_date = p_date where id = v_plan.id;
  update public.motorcycles set odometer = greatest(odometer, p_odometer) where id = v_plan.motorcycle_id;
end;
$$;

revoke all on function public.capture_motorcycle_odometer() from public, anon, authenticated;
revoke all on function public.create_financial_entry(uuid,uuid,numeric,text,text,timestamptz) from public, anon, authenticated;
revoke all on function public.reverse_financial_entry(uuid) from public, anon, authenticated;
revoke all on function public.move_motorcycle_fund(uuid,numeric,boolean) from public, anon, authenticated;
revoke all on function public.complete_planned_service(uuid,date,integer,numeric,text,boolean) from public, anon, authenticated;
grant execute on function public.create_financial_entry(uuid,uuid,numeric,text,text,timestamptz) to authenticated;
grant execute on function public.reverse_financial_entry(uuid) to authenticated;
grant execute on function public.move_motorcycle_fund(uuid,numeric,boolean) to authenticated;
grant execute on function public.complete_planned_service(uuid,date,integer,numeric,text,boolean) to authenticated;
commit;
