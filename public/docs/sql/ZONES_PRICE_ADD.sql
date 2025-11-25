-- Migração: adicionar coluna price_add em public.zones
-- Objetivo: permitir cálculo dinâmico de acréscimos por região no frontend

begin;

-- 1) Adicionar coluna price_add (numérica, default 0, não nula)
alter table public.zones
  add column if not exists price_add numeric(10,2) not null default 0 check (price_add >= 0);

comment on column public.zones.price_add is 'Acréscimo de preço para a zona, usado no cálculo de orçamentos';

-- 2) Exemplos de preenchimento (ajuste conforme sua operação)
-- OBS: Se houver nomes duplicados (ex.: duas entradas "Zona Sul"),
-- utilize também cep_start/cep_end ou o id da linha para diferenciar.

update public.zones set price_add = 0   where name = 'Litoral de São Paulo';
update public.zones set price_add = 100 where name = 'Centro';
update public.zones set price_add = 150 where name = 'Zona Norte';
update public.zones set price_add = 140 where name = 'Zona Leste 1';
update public.zones set price_add = 180 where name = 'Zona Leste 2 (Distritos)';

-- Duas faixas distintas para "Zona Sul" (exemplo usando ranges)
update public.zones set price_add = 120 where name = 'Zona Sul' and cep_start = '04000-000' and cep_end = '04999-999';
update public.zones set price_add = 120 where name = 'Zona Sul' and cep_start = '05700-000' and cep_end = '05899-999';

update public.zones set price_add = 160 where name = 'Zona Oeste';
update public.zones set price_add = 90  where name = 'Área Metropolitana (Grande SP)';
update public.zones set price_add = 220 where name = 'Interior de São Paulo';

-- 3) Garantia de consistência (caso alguma linha fique sem valor)
update public.zones set price_add = 0 where price_add is null;

commit;

-- Como executar:
-- - Abra o SQL Editor do Supabase e cole este script.
-- - Ajuste os valores conforme sua política de preços.
-- - Execute e verifique se as zonas foram atualizadas corretamente.
-- O frontend já está preparado para ler public.zones.price_add.