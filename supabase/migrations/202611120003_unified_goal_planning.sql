-- Apply once after migrations 001 and 002. Existing savings are preserved.
begin;

alter table public.personal_planning_settings
  add column goal_percent numeric not null default 20 check (goal_percent between 0 and 100),
  add column daily_personal numeric(14,2) not null default 0 check (daily_personal between 0 and 999999999999),
  add column personal_category_ids uuid[] not null default '{}';

alter table public.goal_contributions add column financial_transaction_id uuid unique references public.transactions(id);
create index if not exists goal_contributions_goal_lookup on public.goal_contributions(goal_id);
revoke insert, update, delete on public.goal_contributions from authenticated;

-- Sum the entire history in PostgreSQL; return only recent contributions to the planner.
create function public.get_savings_goal_overview() returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para continuar'; end if;
  select coalesce(jsonb_agg(to_jsonb(g) || jsonb_build_object(
    'current_amount', (select coalesce(sum(c.amount),0) from public.goal_contributions c where c.goal_id=g.id),
    'goal_contributions', (select coalesce(jsonb_agg(jsonb_build_object('amount',c.amount,'contribution_date',c.contribution_date,'financial_transaction_id',c.financial_transaction_id)), '[]'::jsonb) from public.goal_contributions c where c.goal_id=g.id and c.contribution_date >= now() - interval '31 days')
  ) order by g.created_at desc), '[]'::jsonb) into v_result from public.savings_goals g where g.user_id=auth.uid();
  return v_result;
end;
$$;

create function public.contribute_to_savings_goal(p_goal_id uuid, p_account_id uuid, p_amount numeric, p_notes text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_goal public.savings_goals%rowtype; v_account public.accounts%rowtype; v_saved numeric; v_tx uuid;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para continuar'; end if;
  if p_amount is null or p_amount not between 0.01 and 999999999999 or p_amount <> round(p_amount,2) then raise exception 'Monto inválido'; end if;
  if length(coalesce(p_notes,'')) > 2000 then raise exception 'Las notas son demasiado largas'; end if;
  select * into v_goal from public.savings_goals where id = p_goal_id and user_id = auth.uid() for update;
  if v_goal.id is null then raise exception 'Meta no encontrada'; end if;
  if v_goal.status <> 'active' then raise exception 'La meta no está activa'; end if;
  select coalesce(sum(amount),0) into v_saved from public.goal_contributions where goal_id = p_goal_id;
  if p_amount > v_goal.target_amount - v_saved then raise exception 'El aporte supera lo que falta para la meta'; end if;
  select * into v_account from public.accounts where id = p_account_id and user_id = auth.uid() and is_active = true for update;
  if v_account.id is null or v_account.type = 'credit_card' then raise exception 'Selecciona una cuenta propia sin crédito'; end if;
  if p_amount > coalesce(v_account.balance,0) then raise exception 'Saldo insuficiente para ahorrar'; end if;
  insert into public.transactions(user_id,account_id,category_id,amount,type,description,source,transaction_date)
    values(auth.uid(),p_account_id,null,p_amount,'expense','Aporte a meta: ' || v_goal.name,'goal_contribution',now()) returning id into v_tx;
  update public.accounts set balance = balance - p_amount where id = p_account_id;
  insert into public.goal_contributions(user_id,goal_id,account_id,amount,notes,contribution_date,financial_transaction_id)
    values(auth.uid(),p_goal_id,p_account_id,p_amount,p_notes,now(),v_tx);
  if v_saved + p_amount >= v_goal.target_amount then
    update public.savings_goals set status = 'completed' where id = p_goal_id;
  end if;
end;
$$;

create function public.update_savings_goal_plan(p_goal_id uuid,p_name text,p_target numeric,p_date date)
returns void language plpgsql security definer set search_path = '' as $$
declare v_goal public.savings_goals%rowtype; v_saved numeric;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para continuar'; end if;
  if p_name is null or length(trim(p_name)) not between 1 and 120 then raise exception 'Nombre inválido'; end if;
  if p_target is null or p_target not between 0.01 and 999999999999 or p_target <> round(p_target,2) then raise exception 'Monto objetivo inválido'; end if;
  select * into v_goal from public.savings_goals where id=p_goal_id and user_id=auth.uid() for update;
  if v_goal.id is null then raise exception 'Meta no encontrada'; end if;
  select coalesce(sum(amount),0) into v_saved from public.goal_contributions where goal_id=p_goal_id;
  if p_target < v_saved then raise exception 'El objetivo no puede ser menor a lo que ya ahorraste'; end if;
  update public.savings_goals set name=trim(p_name),target_amount=p_target,target_date=p_date where id=p_goal_id;
  if v_saved >= p_target then update public.savings_goals set status='completed' where id=p_goal_id;
  elsif v_goal.status='completed' then update public.savings_goals set status='active' where id=p_goal_id; end if;
end;
$$;
revoke all on function public.contribute_to_savings_goal(uuid,uuid,numeric,text) from public,anon,authenticated;
revoke all on function public.get_savings_goal_overview() from public,anon,authenticated;
revoke all on function public.update_savings_goal_plan(uuid,text,numeric,date) from public,anon,authenticated;
grant execute on function public.contribute_to_savings_goal(uuid,uuid,numeric,text) to authenticated;
grant execute on function public.get_savings_goal_overview() to authenticated;
grant execute on function public.update_savings_goal_plan(uuid,text,numeric,date) to authenticated;
commit;
