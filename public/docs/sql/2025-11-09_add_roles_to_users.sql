-- Migration: Add roles column to public.users (Supabase / Postgres)
-- Safe to run multiple times; includes enum, backfill, index and helper.

begin;

-- 1) Create enum type public.user_role if not exists
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_role' and n.nspname = 'public'
  ) then
    create type public.user_role as enum ('user', 'admin');
  end if;
end $$;

-- 2) Add roles column (array of enum) with default
alter table public.users
  add column if not exists roles public.user_role[];

-- Ensure default is set (will not affect existing rows)
alter table public.users
  alter column roles set default array['user']::public.user_role[];

-- 3) Backfill existing rows to default
update public.users
set roles = coalesce(roles, array['user']::public.user_role[]);

-- 4) Enforce NOT NULL after backfill
alter table public.users
  alter column roles set not null;

-- 5) Optional: migrate legacy single "role" text column to array, then drop it
-- Uncomment these lines if you already have a text column "role" and want to migrate:
-- update public.users set roles = array[role::public.user_role] where role is not null and roles is null;
-- alter table public.users drop column role;

-- 6) Index for fast membership queries (e.g., 'admin' = any(roles))
create index if not exists users_roles_gin_idx on public.users using gin (roles);

-- 7) Helper function to check admin by current user id
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.users u
    where u.id = uid
      and 'admin' = any(u.roles)
  );
$$;

-- 8) Example: promote a user to admin (adjust email)
-- update public.users
-- set roles = array['user','admin']::public.user_role[]
-- where email = 'admin@example.com';

commit;

-- RLS example (optional): admin-only access for some table
-- alter table public.some_admin_table enable row level security;
-- create policy admin_access on public.some_admin_table
--   for all to authenticated
--   using (public.is_admin(auth.uid()))
--   with check (public.is_admin(auth.uid()));