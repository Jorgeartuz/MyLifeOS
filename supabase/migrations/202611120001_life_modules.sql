-- Run once in the SQL Editor of the existing MyLifeOs Supabase project.
-- Requires the existing public.accounts and public.transactions tables.
begin;

create table public.motorcycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  model text not null check (length(trim(model)) between 1 and 100),
  plate text not null default '' check (length(plate) <= 15),
  odometer integer not null default 0 check (odometer >= 0),
  next_maintenance_km integer check (next_maintenance_km >= 0),
  soat_date date,
  inspection_date date,
  created_at timestamptz not null default now()
);
create table public.motorcycle_maintenance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  motorcycle_id uuid not null references public.motorcycles(id),
  title text not null check (length(trim(title)) between 1 and 120),
  performed_on date not null,
  odometer integer not null check (odometer >= 0),
  cost numeric(14,2) not null default 0 check (cost between 0 and 999999999999),
  notes text not null default '' check (length(notes) <= 2000),
  created_at timestamptz not null default now()
);
create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  creditor text not null check (length(trim(creditor)) between 1 and 120),
  original_amount numeric(14,2) not null check (original_amount between 0.01 and 999999999999),
  due_date date,
  notes text not null default '' check (length(notes) <= 2000),
  created_at timestamptz not null default now()
);
create table public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  debt_id uuid not null references public.debts(id),
  account_id uuid not null references public.accounts(id),
  financial_transaction_id uuid not null unique references public.transactions(id),
  amount numeric(14,2) not null check (amount between 0.01 and 999999999999),
  paid_on date not null,
  created_at timestamptz not null default now()
);
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 150),
  event_date date not null,
  notes text not null default '' check (length(notes) <= 2000),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.motorcycle_maintenance(user_id, performed_on);
create index on public.debts(user_id, due_date);
create index on public.debt_payments(debt_id);
create index on public.debt_payments(user_id);
create index on public.calendar_events(user_id, event_date);

alter table public.motorcycles enable row level security;
alter table public.motorcycle_maintenance enable row level security;
alter table public.debts enable row level security;
alter table public.debt_payments enable row level security;
alter table public.calendar_events enable row level security;
create policy own_motorcycles on public.motorcycles for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_maintenance on public.motorcycle_maintenance for select to authenticated using (user_id = (select auth.uid()));
create policy own_debts on public.debts for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_payments on public.debt_payments for select to authenticated using (user_id = (select auth.uid()));
create policy own_events on public.calendar_events for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.motorcycles, public.motorcycle_maintenance, public.debts, public.debt_payments, public.calendar_events from anon, authenticated;
grant select, insert, update on public.motorcycles to authenticated;
grant select, insert on public.debts to authenticated;
grant select on public.motorcycle_maintenance, public.debt_payments to authenticated;
grant select, insert, update, delete on public.calendar_events to authenticated;

create function public.prevent_odometer_decrease() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.odometer < old.odometer then raise exception 'El kilometraje no puede disminuir'; end if;
  return new;
end;
$$;
create trigger motorcycles_odometer_check before update on public.motorcycles for each row execute function public.prevent_odometer_decrease();

create function public.record_motorcycle_maintenance(p_motorcycle_id uuid, p_title text, p_performed_on date, p_odometer integer, p_cost numeric, p_notes text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para continuar'; end if;
  select id into v_id from public.motorcycles where id = p_motorcycle_id and user_id = auth.uid() for update;
  if v_id is null then raise exception 'Moto no encontrada'; end if;
  if p_performed_on is null or p_performed_on > (now() at time zone 'America/Bogota')::date then raise exception 'La fecha no puede estar en el futuro'; end if;
  insert into public.motorcycle_maintenance(user_id, motorcycle_id, title, performed_on, odometer, cost, notes)
    values(auth.uid(), v_id, trim(p_title), p_performed_on, p_odometer, p_cost, coalesce(p_notes, ''));
  update public.motorcycles set odometer = greatest(odometer, p_odometer) where id = v_id;
end;
$$;

create function public.pay_personal_debt(p_debt_id uuid, p_account_id uuid, p_amount numeric, p_paid_on date)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_debt public.debts%rowtype;
  v_account public.accounts%rowtype;
  v_paid numeric;
  v_transaction uuid;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para continuar'; end if;
  if p_amount is null or p_amount not between 0.01 and 999999999999 or p_amount <> round(p_amount, 2) then raise exception 'Ingresa un monto válido de hasta dos decimales'; end if;
  if p_paid_on is null or p_paid_on > (now() at time zone 'America/Bogota')::date then raise exception 'La fecha no puede estar en el futuro'; end if;
  select * into v_debt from public.debts where id = p_debt_id and user_id = auth.uid() for update;
  if v_debt.id is null then raise exception 'Deuda no encontrada'; end if;
  select coalesce(sum(amount), 0) into v_paid from public.debt_payments where debt_id = p_debt_id;
  if p_amount > v_debt.original_amount - v_paid then raise exception 'El abono supera el saldo pendiente'; end if;
  select * into v_account from public.accounts where id = p_account_id and user_id = auth.uid() and is_active = true for update;
  if v_account.id is null then raise exception 'Cuenta no encontrada'; end if;
  if coalesce(v_account.balance, 0) < p_amount and v_account.type <> 'credit_card' then raise exception 'Saldo insuficiente'; end if;
  insert into public.transactions(user_id, account_id, category_id, amount, type, description, transaction_date)
    values(auth.uid(), p_account_id, null, p_amount, 'expense', 'Abono a deuda: ' || v_debt.name, (p_paid_on + time '12:00') at time zone 'America/Bogota') returning id into v_transaction;
  update public.accounts set balance = coalesce(balance, 0) - p_amount where id = p_account_id;
  insert into public.debt_payments(user_id, debt_id, account_id, financial_transaction_id, amount, paid_on)
    values(auth.uid(), p_debt_id, p_account_id, v_transaction, p_amount, p_paid_on);
end;
$$;
revoke all on function public.prevent_odometer_decrease() from public, anon, authenticated;
revoke all on function public.record_motorcycle_maintenance(uuid, text, date, integer, numeric, text) from public, anon, authenticated;
revoke all on function public.pay_personal_debt(uuid, uuid, numeric, date) from public, anon, authenticated;
grant execute on function public.record_motorcycle_maintenance(uuid, text, date, integer, numeric, text) to authenticated;
grant execute on function public.pay_personal_debt(uuid, uuid, numeric, date) to authenticated;
commit;
