create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  default_currency text not null default 'KES' check (length(default_currency) = 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  account_type text not null check (account_type in ('cash','bank','mobile_money','other')),
  currency text not null default 'KES' check (length(currency) = 3),
  opening_balance_minor bigint not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('income','expense')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  unique(owner_id, name, kind)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  kind text not null check (kind in ('income','expense')),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'KES' check (length(currency) = 3),
  occurred_on date not null,
  description text,
  reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'KES' check (length(currency) = 3),
  created_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_minor bigint not null check (target_minor > 0),
  current_minor bigint not null default 0 check (current_minor >= 0),
  monthly_contribution_minor bigint not null default 0 check (monthly_contribution_minor >= 0),
  target_date date,
  currency text not null default 'KES' check (length(currency) = 3),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists transactions_owner_date_idx on public.transactions(owner_id, occurred_on desc);
create index if not exists accounts_owner_idx on public.accounts(owner_id);
create index if not exists budgets_owner_period_idx on public.budgets(owner_id, period_start, period_end);
create index if not exists savings_goals_owner_idx on public.savings_goals(owner_id);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "accounts_owner_select" on public.accounts for select using (owner_id = auth.uid());
create policy "accounts_owner_insert" on public.accounts for insert with check (owner_id = auth.uid());
create policy "accounts_owner_update" on public.accounts for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "accounts_owner_delete" on public.accounts for delete using (owner_id = auth.uid());

create policy "categories_owner_select" on public.categories for select using (owner_id = auth.uid());
create policy "categories_owner_insert" on public.categories for insert with check (owner_id = auth.uid());
create policy "categories_owner_update" on public.categories for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "categories_owner_delete" on public.categories for delete using (owner_id = auth.uid());

create policy "transactions_owner_select" on public.transactions for select using (owner_id = auth.uid());
create policy "transactions_owner_insert" on public.transactions for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.accounts a where a.id = account_id and a.owner_id = auth.uid())
  and (category_id is null or exists (select 1 from public.categories c where c.id = category_id and c.owner_id = auth.uid()))
);
create policy "transactions_owner_update" on public.transactions for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.accounts a where a.id = account_id and a.owner_id = auth.uid())
  and (category_id is null or exists (select 1 from public.categories c where c.id = category_id and c.owner_id = auth.uid()))
);
create policy "transactions_owner_delete" on public.transactions for delete using (owner_id = auth.uid());

create policy "budgets_owner_select" on public.budgets for select using (owner_id = auth.uid());
create policy "budgets_owner_insert" on public.budgets for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.categories c where c.id = category_id and c.owner_id = auth.uid())
);
create policy "budgets_owner_update" on public.budgets for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "budgets_owner_delete" on public.budgets for delete using (owner_id = auth.uid());

create policy "savings_goals_owner_select" on public.savings_goals for select using (owner_id = auth.uid());
create policy "savings_goals_owner_insert" on public.savings_goals for insert with check (owner_id = auth.uid());
create policy "savings_goals_owner_update" on public.savings_goals for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "savings_goals_owner_delete" on public.savings_goals for delete using (owner_id = auth.uid());

create policy "audit_logs_owner_select" on public.audit_logs for select using (owner_id = auth.uid());
create policy "audit_logs_owner_insert" on public.audit_logs for insert with check (owner_id = auth.uid());


-- Keep transaction categories semantically aligned with transaction kind.
drop policy if exists "transactions_owner_insert" on public.transactions;
create policy "transactions_owner_insert" on public.transactions for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.accounts a where a.id = account_id and a.owner_id = auth.uid())
  and (
    category_id is null
    or exists (
      select 1 from public.categories c
      where c.id = category_id
        and c.owner_id = auth.uid()
        and c.kind = transactions.kind
    )
  )
);

drop policy if exists "transactions_owner_update" on public.transactions;
create policy "transactions_owner_update" on public.transactions for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.accounts a where a.id = account_id and a.owner_id = auth.uid())
  and (
    category_id is null
    or exists (
      select 1 from public.categories c
      where c.id = category_id
        and c.owner_id = auth.uid()
        and c.kind = transactions.kind
    )
  )
);

-- Automatically create a user profile when an Auth user is created.
create or replace function public.handle_new_rita_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_rita on auth.users;
create trigger on_auth_user_created_rita
after insert on auth.users
for each row execute procedure public.handle_new_rita_user();
