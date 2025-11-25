-- Script de criação do esquema (DDL) para novo ambiente Supabase
-- Execute este arquivo primeiro no SQL Editor do Supabase

-- Extensão para UUID
create extension if not exists pgcrypto;

-- Tabela de usuários (administradores/operadores)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Tabela de serviços (ex.: Transfer Privado)
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text null,
  base_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Tabela de veículos (frota)
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text null,
  capacity_max integer not null check (capacity_max > 0),
  suitcases integer not null default 0 check (suitcases >= 0),
  price_add numeric(10,2) not null default 0 check (price_add >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_vehicles_active on public.vehicles(active);

-- Tabela de zonas (faixas de CEP)
create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cep_start varchar(9) not null,
  cep_end varchar(9) not null,
  description text null,
  price_add numeric(10,2) not null default 0 check (price_add >= 0),
  created_at timestamptz not null default now(),
  check (cep_start ~ '^\d{5}-\d{3}$' and cep_end ~ '^\d{5}-\d{3}$')
);
create index if not exists idx_zones_name on public.zones(name);
create index if not exists idx_zones_cep_start on public.zones(cep_start);
create index if not exists idx_zones_cep_end on public.zones(cep_end);

-- Tabela de hospedagens (apartamentos)
create table if not exists public.lodgings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  pax_per_apartment integer not null check (pax_per_apartment > 0),
  price_per_apartment numeric(10,2) not null default 0 check (price_per_apartment >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_lodgings_active on public.lodgings(active);

-- Tabela de transfers
create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.users(id),
  zone_id uuid null references public.zones(id),
  service_id uuid null references public.services(id),
  vehicle_id uuid null references public.vehicles(id),
  date date not null,
  pickup_location text not null,
  dropoff_location text not null,
  passengers integer not null check (passengers > 0),
  price numeric(10,2) not null check (price >= 0),
  created_at timestamptz not null default now()
);
create index if not exists idx_transfers_user_id on public.transfers(user_id);
create index if not exists idx_transfers_zone_id on public.transfers(zone_id);
create index if not exists idx_transfers_service_id on public.transfers(service_id);
create index if not exists idx_transfers_vehicle_id on public.transfers(vehicle_id);
create index if not exists idx_transfers_date on public.transfers(date);

-- Tabela de configurações (temporada, etc.)
create table if not exists public.configurations (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  created_at timestamptz not null default now()
);

-- Comentários (opcionais)
comment on column public.zones.price_add is 'Acréscimo de preço para a zona, usado no cálculo de orçamentos';

-- Observações:
-- - Ajuste RLS e políticas após criar o esquema, conforme necessidades de segurança.
-- - Em produção, use Supabase Auth e restrinja acesso às tabelas admin.