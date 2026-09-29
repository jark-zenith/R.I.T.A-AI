alter table public.profiles
  add column if not exists deletion_requested_at timestamptz;

create index if not exists profiles_deletion_request_idx
  on public.profiles(deletion_requested_at)
  where deletion_requested_at is not null;
