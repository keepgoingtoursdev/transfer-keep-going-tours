# Estrutura do Banco de Dados (Supabase / Postgres)

Este documento foi ajustado para refletir o esquema solicitado, com as tabelas:
`users`, `services`, `zones`, `transfers` e `configurations`.

Objetivos principais:
- Cadastro de usuários;
- Catálogo de serviços;
- Definição de zonas/regiões por faixas de CEP;
- Registro de transfers (solicitações/viagens);
- Configurações globais (ex.: datas de início/fim de temporada para limitar seleção de datas no app).

Observação: Em ambientes com Supabase Auth, a guarda de `password_hash` pode ser substituída pela própria autenticação do Supabase. O esquema abaixo segue sua solicitação literal; ajuste conforme a estratégia de auth do projeto.

## 1. Tabelas

- `users` — usuários do sistema;
- `services` — catálogo de serviços;
- `zones` — zonas/regiões com faixas de CEP;
- `transfers` — registros de transfer (associados a usuário, serviço e zona);
- `configurations` — chave/valor para configuração global.

## 2. Especificação das tabelas e colunas

### 2.1 users
Guarda dados básicos dos usuários.

- `id` (uuid, PK)
- `name` (text, NOT NULL)
- `email` (text, UNIQUE, NOT NULL)
- `password_hash` (text, NOT NULL)
- `created_at` (timestamptz, DEFAULT now())

Índices recomendados: `users_email_key` (UNIQUE já cobre)

### 2.2 services
Catálogo de serviços ofertados.

- `id` (uuid, PK)
- `name` (text, UNIQUE, NOT NULL)
- `description` (text, NULL)
- `base_price` (numeric NOT NULL DEFAULT 0)
- `created_at` (timestamptz, DEFAULT now())

Índices recomendados: `services_name_key` (UNIQUE já cobre)

### 2.3 zones
Zonas/regiões definidas por faixas de CEP (início/fim).

- `id` (uuid, PK)
- `name` (text, NOT NULL)
- `cep_start` (varchar, NOT NULL)
- `cep_end` (varchar, NOT NULL)
- `description` (text, NULL)
- `created_at` (timestamptz, DEFAULT now())

Recomendações:
- Armazenar CEP com 8 dígitos (apenas números) e largura fixa, para que a comparação lexicográfica funcione corretamente (ex.: `'04500000' <= cep <= '04799999'`).
- Opcional: validar formato com `CHECK (cep_start ~ '^\d{8}$' AND cep_end ~ '^\d{8}$')`.

Índices recomendados: `idx_zones_name`, `idx_zones_cep_start`, `idx_zones_cep_end`.

### 2.4 transfers
Registros de transfers, vinculados a usuário, serviço e zona.

- `id` (uuid, PK)
- `user_id` (uuid, FK -> users.id)
- `zone_id` (uuid, FK -> zones.id)
- `service_id` (uuid, FK -> services.id)
- `date` (date, NOT NULL)
- `pickup_location` (text, NOT NULL)
- `dropoff_location` (text, NOT NULL)
- `passengers` (integer, NOT NULL)
- `price` (numeric, NOT NULL)
- `created_at` (timestamptz, DEFAULT now())

Índices recomendados: `idx_transfers_user_id`, `idx_transfers_service_id`, `idx_transfers_date`.

### 2.5 configurations
Configurações globais em `key/value`.

- `id` (uuid, PK)
- `key` (text, UNIQUE, NOT NULL) — ex.: `season_start`, `season_end`
- `value` (text, NOT NULL) — ex.: datas no formato ISO `YYYY-MM-DD`
- `created_at` (timestamptz, DEFAULT now())

Observações:
- Para datas, recomenda-se ISO `YYYY-MM-DD`.
- Se desejar maior rigidez, pode-se especializar por tipo (ex.: criar chaves específicas com coluna `date`), porém manter `text` dá flexibilidade.

## 3. DDL (SQL) — Criação das tabelas

Copie e execute os comandos a seguir no SQL editor do Supabase.

```sql
-- Extensão para gerar UUIDs
create extension if not exists pgcrypto;

-- users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text null,
  base_price numeric not null default 0,
  created_at timestamptz not null default now()
);

-- zones
create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cep_start varchar not null,
  cep_end varchar not null,
  description text null,
  created_at timestamptz not null default now(),
  check (cep_start ~ '^\d{8}$' and cep_end ~ '^\d{8}$')
);

create index if not exists idx_zones_name on public.zones(name);
create index if not exists idx_zones_cep_start on public.zones(cep_start);
create index if not exists idx_zones_cep_end on public.zones(cep_end);

-- configurations
create table if not exists public.configurations (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  created_at timestamptz not null default now()
);

-- transfers
create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.users(id),
  zone_id uuid null references public.zones(id),
  service_id uuid null references public.services(id),
  date date not null,
  pickup_location text not null,
  dropoff_location text not null,
  passengers integer not null check (passengers > 0),
  price numeric not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_transfers_user_id on public.transfers(user_id);
create index if not exists idx_transfers_service_id on public.transfers(service_id);
create index if not exists idx_transfers_date on public.transfers(date);
```

## 4. Políticas de Segurança (RLS) — Recomendações

No Supabase, ative RLS (Row Level Security) e crie políticas para proteger os dados:

```sql
-- Ativar RLS
alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.zones enable row level security;
alter table public.transfers enable row level security;
alter table public.configurations enable row level security;

-- users: restringir leitura/escrita ao próprio usuário ou perfis administrativos
-- Nota: se usar Supabase Auth, normalmente você evita expor a tabela users diretamente.
create policy users_select_admin on public.users for select using (auth.role() = 'service_role');
create policy users_write_admin on public.users for all using (auth.role() = 'service_role');

-- services: leitura pública, escrita apenas admin
create policy services_select_public on public.services for select using (true);
create policy services_write_admin on public.services for all using (auth.role() = 'service_role');

-- zones: leitura pública, escrita apenas admin
create policy zones_select_public on public.zones for select using (true);
create policy zones_write_admin on public.zones for all using (auth.role() = 'service_role');

-- transfers: usuário pode ver/inserir/aplicar atualizações apenas nos próprios registros
create policy transfers_select_own on public.transfers for select using (auth.uid() = user_id);
create policy transfers_insert_own on public.transfers for insert with check (auth.uid() = user_id);
create policy transfers_update_own on public.transfers for update using (auth.uid() = user_id);

-- configurations: leitura pública (app precisa dessas infos), escrita apenas admin
create policy configurations_select_public on public.configurations for select using (true);
create policy configurations_write_admin on public.configurations for all using (auth.role() = 'service_role');
```

Observações:
- Ajuste `auth.role()`/`auth.uid()` conforme sua estratégia de autenticação.
- Em projetos com Supabase Auth, considere usar tabelas padrão de perfis (ex.: `public.profiles`) e evitar armazenar `password_hash` manualmente.

## 5. Exemplos de consultas

Encontrar zona que cobre um CEP específico:
```sql
select *
from public.zones z
where '04502000' between z.cep_start and z.cep_end;
-- Observação: funciona bem se usar sempre 8 dígitos (string fixa) para cep_start/cep_end.
```

Listar transfers de um usuário em um período:
```sql
select t.*
from public.transfers t
where t.user_id = :user_id
  and t.date between :start_date and :end_date
order by t.date desc;
```

Criar um novo transfer (exemplo):
```sql
insert into public.transfers (
  user_id, zone_id, service_id, date, pickup_location, dropoff_location, passengers, price
) values (
  :user_id, :zone_id, :service_id, :date, :pickup, :dropoff, :pax, :price
);
```

Carregar datas de temporada e aplicar no frontend:
```sql
select key, value
from public.configurations
where key in ('season_start','season_end');
```

## 6. Próximos passos

1) Criar o projeto no Supabase e executar o DDL acima no SQL editor.
2) Ativar RLS e ajustar políticas conforme a estratégia de autenticação.
3) Popular `services` e `zones` com dados reais (nomes de zonas e faixas de CEP coerentes com o negócio).
4) Preencher `configurations` com as chaves `season_start` e `season_end` (`YYYY-MM-DD`). Exemplo:

```sql
insert into public.configurations(key, value)
values ('season_start', '2025-01-10')
on conflict (key) do update set value = excluded.value;

insert into public.configurations(key, value)
values ('season_end', '2025-03-31')
on conflict (key) do update set value = excluded.value;
```

5) Integrar o frontend para:
- Carregar `season_start` e `season_end` e limitar o datepicker;
- Listar serviços e zonas para formular a solicitação;
- Criar transfers e exibi-los para o usuário.

---

## 8. Migração: adicionar price_add em zones

Para permitir cálculo 100% dinâmico no frontend, adicione o campo `price_add` em `zones` e preencha valores.

```sql
alter table public.zones
  add column if not exists price_add numeric(10,2) not null default 0 check (price_add >= 0);

-- Exemplos de preenchimento (ajuste conforme seu negócio)
update public.zones set price_add = 0   where name = 'Litoral de São Paulo';
update public.zones set price_add = 100 where name = 'Centro';
update public.zones set price_add = 150 where name = 'Zona Norte';
update public.zones set price_add = 140 where name = 'Zona Leste 1';
update public.zones set price_add = 180 where name = 'Zona Leste 2 (Distritos)';
update public.zones set price_add = 120 where name = 'Zona Sul';
update public.zones set price_add = 160 where name = 'Zona Oeste';
update public.zones set price_add = 90  where name = 'Área Metropolitana (Grande SP)';
update public.zones set price_add = 220 where name = 'Interior de São Paulo';
```

Observação: se houver nomes duplicados (ex.: duas entradas "Zona Sul"), diferencie os nomes ou use `id` para realizar updates específicos.