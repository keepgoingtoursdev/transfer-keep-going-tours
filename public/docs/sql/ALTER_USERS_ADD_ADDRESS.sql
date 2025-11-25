-- Alteração da tabela de usuários para incluir campos de endereço
-- Execute este arquivo no SQL Editor do Supabase após criar o schema base

alter table public.users
  add column if not exists address_street text null,
  add column if not exists address_number varchar(10) null,
  add column if not exists address_complement text null,
  add column if not exists address_neighborhood text null,
  add column if not exists address_city text null,
  add column if not exists address_state varchar(2) null check (address_state ~ '^[A-Za-z]{2}$'),
  add column if not exists address_zip varchar(9) null check (address_zip ~ '^\d{5}-\d{3}$'),
  add column if not exists address_country text null default 'Brasil';

-- Opcional: índices para consultas por CEP e cidade/UF
create index if not exists idx_users_address_zip on public.users(address_zip);
create index if not exists idx_users_address_city on public.users(address_city);
create index if not exists idx_users_address_state on public.users(address_state);

comment on column public.users.address_zip is 'CEP no formato 00000-000';
comment on column public.users.address_state is 'UF com 2 letras (ex.: SP, RJ)';