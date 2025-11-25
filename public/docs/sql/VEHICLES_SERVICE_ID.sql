-- Migração: vincular veículos a serviços
-- Adiciona a coluna service_id em vehicles e referencia services(id)

alter table public.vehicles
add column if not exists service_id uuid references public.services(id) on delete set null;

-- Exemplos de atualização (ajuste conforme seu catálogo real)
-- Supondo que existam serviços 'Transfer Executivo' e 'Transfer Premium'
-- 1) Crie/garanta os serviços
insert into public.services (name, description, base_price)
values
  ('Transfer Executivo', 'Serviço executivo, base ajustável.', 180),
  ('Transfer Premium', 'Serviço premium, base ajustável.', 220)
on conflict (name) do update set description = excluded.description, base_price = excluded.base_price;

-- 2) Vincule veículos aos serviços
update public.vehicles v
set service_id = s.id
from public.services s
where v.name = 'Sedan Executivo' and s.name = 'Transfer Executivo';

update public.vehicles v
set service_id = s.id
from public.services s
where v.name = 'SUV Premium' and s.name = 'Transfer Premium';

update public.vehicles v
set service_id = s.id
from public.services s
where v.name = 'Van (até 12 pax)' and s.name = 'Transfer Premium';

-- Observações:
-- - Ajuste os vínculos conforme a sua política real de serviços e frota.
-- - Se preferir manter apenas 'Transfer Privado', também é possível vincular todos a ele.
-- - A calculadora passa a usar o base_price do serviço vinculado ao veículo.