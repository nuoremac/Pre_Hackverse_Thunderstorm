-- PulsePlan: initial schema (tasks, fixed events, preferences, generated schedule blocks)
-- Created: 2026-04-22

create extension if not exists "pgcrypto";

-- Updated-at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles (optional, but handy for storing name)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: select own"
on public.profiles for select
using (auth.uid() = user_id);

create policy "Profiles: insert own"
on public.profiles for insert
with check (auth.uid() = user_id);

create policy "Profiles: update own"
on public.profiles for update
using (auth.uid() = user_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create a profile when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  description text,
  category text,
  status text not null default 'todo',
  deadline timestamptz,
  estimated_minutes int not null,
  remaining_minutes int not null,
  priority int not null default 3,
  difficulty int not null default 3,
  splittable boolean not null default true,
  preferred_time_of_day text default 'any',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_priority_range check (priority between 1 and 5),
  constraint tasks_difficulty_range check (difficulty between 1 and 5),
  constraint tasks_estimated_nonneg check (estimated_minutes > 0),
  constraint tasks_remaining_nonneg check (remaining_minutes >= 0)
);

alter table public.tasks enable row level security;

create policy "Tasks: select own"
on public.tasks for select
using (auth.uid() = user_id);

create policy "Tasks: insert own"
on public.tasks for insert
with check (auth.uid() = user_id);

create policy "Tasks: update own"
on public.tasks for update
using (auth.uid() = user_id);

create policy "Tasks: delete own"
on public.tasks for delete
using (auth.uid() = user_id);

create index if not exists tasks_user_deadline_idx on public.tasks(user_id, deadline);

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- Fixed events (classes, meetings, etc.)
create table if not exists public.fixed_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fixed_events_end_after_start check (end_at > start_at)
);

alter table public.fixed_events enable row level security;

create policy "Fixed events: select own"
on public.fixed_events for select
using (auth.uid() = user_id);

create policy "Fixed events: insert own"
on public.fixed_events for insert
with check (auth.uid() = user_id);

create policy "Fixed events: update own"
on public.fixed_events for update
using (auth.uid() = user_id);

create policy "Fixed events: delete own"
on public.fixed_events for delete
using (auth.uid() = user_id);

create index if not exists fixed_events_user_start_idx on public.fixed_events(user_id, start_at);

create trigger set_fixed_events_updated_at
before update on public.fixed_events
for each row execute function public.set_updated_at();

-- Preferences (constraints)
create table if not exists public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  timezone_offset_minutes int not null default 0,
  workday_start_minutes int not null default 540,
  workday_end_minutes int not null default 1080,
  max_work_minutes_per_day int not null default 360,
  focus_block_minutes int not null default 90,
  break_minutes int not null default 15,
  buffer_minutes_between_sessions int not null default 5,
  allowed_weekdays int[] not null default '{1,2,3,4,5}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint preferences_workday_valid check (workday_end_minutes > workday_start_minutes),
  constraint preferences_offset_range check (timezone_offset_minutes between -840 and 840),
  constraint preferences_max_work_range check (max_work_minutes_per_day between 0 and 1440)
);

alter table public.preferences enable row level security;

create policy "Preferences: select own"
on public.preferences for select
using (auth.uid() = user_id);

create policy "Preferences: insert own"
on public.preferences for insert
with check (auth.uid() = user_id);

create policy "Preferences: update own"
on public.preferences for update
using (auth.uid() = user_id);

create trigger set_preferences_updated_at
before update on public.preferences
for each row execute function public.set_updated_at();

-- Generated schedule blocks (output of the engine)
create table if not exists public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  task_id uuid references public.tasks(id) on delete set null,
  type text not null,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  meta jsonb,
  reason text,
  created_at timestamptz not null default now(),
  constraint schedule_blocks_end_after_start check (end_at > start_at)
);

alter table public.schedule_blocks enable row level security;

create policy "Schedule blocks: select own"
on public.schedule_blocks for select
using (auth.uid() = user_id);

create policy "Schedule blocks: insert own"
on public.schedule_blocks for insert
with check (auth.uid() = user_id);

create policy "Schedule blocks: delete own"
on public.schedule_blocks for delete
using (auth.uid() = user_id);

create index if not exists schedule_blocks_user_start_idx on public.schedule_blocks(user_id, start_at);
