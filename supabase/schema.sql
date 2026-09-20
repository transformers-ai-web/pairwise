create table if not exists public.practice_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  solved text[] not null default '{}',
  pair integer not null default 0 check (pair >= 0 and pair < 16),
  updated_at timestamptz not null default now()
);
alter table public.practice_progress enable row level security;
revoke all on public.practice_progress from anon;
grant select, insert, update on public.practice_progress to authenticated;
create policy "Read own progress" on public.practice_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own progress" on public.practice_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own progress" on public.practice_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
