create table public.external_action_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null check (action_type in ('payment','transfer','payout')),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'KES' check (length(currency) = 3),
  destination_ref text not null,
  idempotency_key text not null,
  status text not null default 'draft' check (status in ('draft','pending_confirmation','confirmed','rejected','executed','failed')),
  provider text,
  provider_reference text,
  confirmed_at timestamptz,
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, idempotency_key)
);

create index external_action_owner_status_idx on public.external_action_requests(owner_id, status, created_at desc);

alter table public.external_action_requests enable row level security;

create policy "external_action_owner_select" on public.external_action_requests for select using (owner_id = auth.uid());
create policy "external_action_owner_insert" on public.external_action_requests for insert with check (owner_id = auth.uid());
create policy "external_action_owner_update" on public.external_action_requests for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
