alter table public.profiles
  add column if not exists deletion_requested_at timestamptz;

create index if not exists profiles_deletion_request_idx
  on public.profiles(deletion_requested_at)
  where deletion_requested_at is not null;


drop policy if exists "business_transactions_owner_insert" on public.business_transactions;
create policy "business_transactions_owner_insert" on public.business_transactions for insert with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.businesses b
    where b.id = business_id
      and b.owner_id = auth.uid()
      and b.currency = business_transactions.currency
  )
);

drop policy if exists "business_transactions_owner_update" on public.business_transactions;
create policy "business_transactions_owner_update" on public.business_transactions for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.businesses b
    where b.id = business_id
      and b.owner_id = auth.uid()
      and b.currency = business_transactions.currency
  )
);
