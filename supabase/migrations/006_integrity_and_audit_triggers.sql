create or replace function public.prevent_account_currency_change_with_history()
returns trigger
language plpgsql
as $$
begin
  if new.currency <> old.currency then
    if exists (select 1 from public.transactions where account_id = old.id)
       or exists (select 1 from public.transfers where from_account_id = old.id or to_account_id = old.id) then
      raise exception 'Account currency cannot change after financial history exists';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_account_currency_change on public.accounts;
create trigger prevent_account_currency_change
before update on public.accounts
for each row execute procedure public.prevent_account_currency_change_with_history();

create or replace function public.prevent_category_kind_change_with_history()
returns trigger
language plpgsql
as $$
begin
  if new.kind <> old.kind and exists (select 1 from public.transactions where category_id = old.id) then
    raise exception 'Category type cannot change after financial history exists';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_category_kind_change on public.categories;
create trigger prevent_category_kind_change
before update on public.categories
for each row execute procedure public.prevent_category_kind_change_with_history();

create or replace function public.prevent_business_currency_change_with_history()
returns trigger
language plpgsql
as $$
begin
  if new.currency <> old.currency and exists (select 1 from public.business_transactions where business_id = old.id) then
    raise exception 'Business currency cannot change after financial history exists';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_business_currency_change on public.businesses;
create trigger prevent_business_currency_change
before update on public.businesses
for each row execute procedure public.prevent_business_currency_change_with_history();

create or replace function public.log_transaction_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_logs(owner_id, action, entity_type, entity_id)
    values (new.owner_id, 'created', 'transaction', new.id);
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_logs(owner_id, action, entity_type, entity_id)
    values (new.owner_id, 'updated', 'transaction', new.id);
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_logs(owner_id, action, entity_type, entity_id)
    values (old.owner_id, 'deleted', 'transaction', old.id);
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists transactions_audit_trigger on public.transactions;
create trigger transactions_audit_trigger
after insert or update or delete on public.transactions
for each row execute procedure public.log_transaction_audit_event();

create or replace function public.log_transfer_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_logs(owner_id, action, entity_type, entity_id)
    values (new.owner_id, 'created', 'transfer', new.id);
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_logs(owner_id, action, entity_type, entity_id)
    values (new.owner_id, 'updated', 'transfer', new.id);
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_logs(owner_id, action, entity_type, entity_id)
    values (old.owner_id, 'deleted', 'transfer', old.id);
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists transfers_audit_trigger on public.transfers;
create trigger transfers_audit_trigger
after insert or update or delete on public.transfers
for each row execute procedure public.log_transfer_audit_event();
