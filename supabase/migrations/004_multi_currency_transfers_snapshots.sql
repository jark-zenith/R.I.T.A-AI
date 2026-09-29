alter table public.profiles
  add column if not exists report_enabled boolean not null default false,
  add column if not exists report_time time not null default '19:00',
  add column if not exists report_timezone text not null default 'Africa/Nairobi';

alter table public.transactions
  add column if not exists client_submission_id uuid,
  add column if not exists source text not null default 'manual',
  add column if not exists detail_level text not null default 'transaction';

alter table public.transactions
  add constraint transactions_source_check check (source in ('manual','imported','verified')),
  add constraint transactions_detail_level_check check (detail_level in ('transaction','summary'));

create unique index if not exists transactions_owner_submission_idx
  on public.transactions(owner_id, client_submission_id)
  where client_submission_id is not null;

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  from_account_id uuid not null references public.accounts(id) on delete restrict,
  to_account_id uuid not null references public.accounts(id) on delete restrict,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'KES' check (currency ~ '^[A-Z]{3}$'),
  fee_minor bigint not null default 0 check (fee_minor >= 0),
  occurred_on date not null,
  description text,
  client_submission_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_account_id <> to_account_id)
);

create unique index if not exists transfers_owner_submission_idx
  on public.transfers(owner_id, client_submission_id)
  where client_submission_id is not null;
create index if not exists transfers_owner_date_idx on public.transfers(owner_id, occurred_on desc);

alter table public.transfers enable row level security;

create policy "transfers_owner_select" on public.transfers for select using (owner_id = auth.uid());
create policy "transfers_owner_insert" on public.transfers for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.accounts a where a.id = from_account_id and a.owner_id = auth.uid() and a.currency = transfers.currency)
  and exists (select 1 from public.accounts a where a.id = to_account_id and a.owner_id = auth.uid() and a.currency = transfers.currency)
);
create policy "transfers_owner_update" on public.transfers for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.accounts a where a.id = from_account_id and a.owner_id = auth.uid() and a.currency = transfers.currency)
  and exists (select 1 from public.accounts a where a.id = to_account_id and a.owner_id = auth.uid() and a.currency = transfers.currency)
);
create policy "transfers_owner_delete" on public.transfers for delete using (owner_id = auth.uid());

drop policy if exists "budgets_owner_update" on public.budgets;
create policy "budgets_owner_update" on public.budgets for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.categories c where c.id = category_id and c.owner_id = auth.uid() and c.kind = 'expense')
);

drop policy if exists "budgets_owner_insert" on public.budgets;
create policy "budgets_owner_insert" on public.budgets for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.categories c where c.id = category_id and c.owner_id = auth.uid() and c.kind = 'expense')
);

create table if not exists public.daily_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  snapshot_date date not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  opening_balance_minor bigint not null,
  income_minor bigint not null default 0 check (income_minor >= 0),
  expense_minor bigint not null default 0 check (expense_minor >= 0),
  transfer_in_minor bigint not null default 0 check (transfer_in_minor >= 0),
  transfer_out_minor bigint not null default 0 check (transfer_out_minor >= 0),
  adjustment_minor bigint not null default 0,
  reported_closing_balance_minor bigint,
  source text not null default 'manual' check (source in ('manual','calculated','imported')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, snapshot_date, currency)
);

create index if not exists daily_snapshots_owner_date_idx on public.daily_snapshots(owner_id, snapshot_date desc);
alter table public.daily_snapshots enable row level security;
create policy "daily_snapshots_owner_select" on public.daily_snapshots for select using (owner_id = auth.uid());
create policy "daily_snapshots_owner_insert" on public.daily_snapshots for insert with check (owner_id = auth.uid());
create policy "daily_snapshots_owner_update" on public.daily_snapshots for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "daily_snapshots_owner_delete" on public.daily_snapshots for delete using (owner_id = auth.uid());

create table if not exists public.report_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  report_type text not null check (report_type in ('daily','monthly')),
  period_start date not null,
  period_end date not null,
  timezone text not null,
  status text not null default 'generated' check (status in ('generated','failed')),
  generated_at timestamptz not null default now(),
  unique(owner_id, report_type, period_start, period_end)
);

create index if not exists report_runs_owner_period_idx on public.report_runs(owner_id, report_type, period_start desc);
alter table public.report_runs enable row level security;
create policy "report_runs_owner_select" on public.report_runs for select using (owner_id = auth.uid());
create policy "report_runs_owner_insert" on public.report_runs for insert with check (owner_id = auth.uid());
create policy "report_runs_owner_update" on public.report_runs for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table if not exists public.transaction_revisions (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null,
  operation text not null check (operation in ('update','delete')),
  changed_at timestamptz not null default now(),
  old_record jsonb not null
);

create index if not exists transaction_revisions_owner_tx_idx on public.transaction_revisions(owner_id, transaction_id, changed_at desc);
alter table public.transaction_revisions enable row level security;
create policy "transaction_revisions_owner_select" on public.transaction_revisions for select using (owner_id = auth.uid());

create or replace function public.capture_transaction_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    insert into public.transaction_revisions(owner_id, transaction_id, operation, old_record)
    values (old.owner_id, old.id, 'update', to_jsonb(old));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.transaction_revisions(owner_id, transaction_id, operation, old_record)
    values (old.owner_id, old.id, 'delete', to_jsonb(old));
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists transactions_revision_trigger on public.transactions;
create trigger transactions_revision_trigger
before update or delete on public.transactions
for each row execute procedure public.capture_transaction_revision();
