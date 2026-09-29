create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  currency text not null default 'KES' check (length(currency) = 3),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_transactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind text not null check (kind in ('revenue','direct_cost','operating_expense')),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'KES' check (length(currency) = 3),
  occurred_on date not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reconciliation_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  statement_date date not null,
  statement_balance_minor bigint not null,
  completed_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create index business_owner_idx on public.businesses(owner_id);
create index business_transactions_owner_date_idx on public.business_transactions(owner_id, occurred_on desc);
create index reconciliation_owner_date_idx on public.reconciliation_sessions(owner_id, statement_date desc);

alter table public.businesses enable row level security;
alter table public.business_transactions enable row level security;
alter table public.reconciliation_sessions enable row level security;

create policy "businesses_owner_select" on public.businesses for select using (owner_id = auth.uid());
create policy "businesses_owner_insert" on public.businesses for insert with check (owner_id = auth.uid());
create policy "businesses_owner_update" on public.businesses for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "businesses_owner_delete" on public.businesses for delete using (owner_id = auth.uid());

create policy "business_transactions_owner_select" on public.business_transactions for select using (owner_id = auth.uid());
create policy "business_transactions_owner_insert" on public.business_transactions for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create policy "business_transactions_owner_update" on public.business_transactions for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create policy "business_transactions_owner_delete" on public.business_transactions for delete using (owner_id = auth.uid());

create policy "reconciliation_owner_select" on public.reconciliation_sessions for select using (owner_id = auth.uid());
create policy "reconciliation_owner_insert" on public.reconciliation_sessions for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.accounts a where a.id = account_id and a.owner_id = auth.uid())
);
create policy "reconciliation_owner_update" on public.reconciliation_sessions for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.accounts a where a.id = account_id and a.owner_id = auth.uid())
);
create policy "reconciliation_owner_delete" on public.reconciliation_sessions for delete using (owner_id = auth.uid());
