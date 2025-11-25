-- Script de seed (dados iniciais) para novo ambiente Supabase
-- Execute este arquivo após o INIT_SCHEMA.sql

-- Configurações de temporada (ajuste datas conforme necessário)
insert into public.configurations (key, value)
values ('season_start_date', '2025-12-20')
on conflict (key) do update set value = excluded.value;

insert into public.configurations (key, value)
values ('season_end_date', '2026-02-10')
on conflict (key) do update set value = excluded.value;

-- Serviços
insert into public.services (name, description, base_price)
values
  ('Transfer Privado', 'Transporte exclusivo com veículo dedicado.', 180.00),
  ('Transfer Compartilhado', 'Transporte compartilhado com outros passageiros.', 95.00),
  ('City Tour', 'Passeio guiado pela cidade.', 250.00)
on conflict (name) do update set description = excluded.description, base_price = excluded.base_price;

-- Veículos (inclui suitcases)
insert into public.vehicles (name, description, capacity_max, suitcases, price_add, active)
values
  ('Sedan Executivo', 'Conforto para até 3 passageiros', 3, 3, 0, true),
  ('SUV Premium', 'Espaço para até 6 passageiros', 6, 4, 120.00, true),
  ('Van (até 12 pax)', 'Ideal para grupos maiores', 12, 10, 240.00, true)
on conflict (name) do update set description = excluded.description, capacity_max = excluded.capacity_max, suitcases = excluded.suitcases, price_add = excluded.price_add, active = excluded.active;

-- Zonas (faixas de CEP) — ajuste price_add conforme sua política
insert into public.zones (name, cep_start, cep_end, description, price_add)
values
  ('Centro', '01000-000', '01599-999', 'Sé, República, Consolação, Bela Vista, Liberdade, Jardins (parte), Cambuci.', 100.00),
  ('Zona Norte', '02000-000', '02999-999', 'Santana, Vila Guilherme, Tucuruvi, Freguesia do Ó, Casa Verde, Mandaqui, etc.', 150.00),
  ('Zona Leste 1', '03000-000', '03999-999', 'Tatuapé, Mooca, Penha, Vila Formosa, Brás, Belém, Água Rasa, Vila Prudente, etc.', 140.00),
  ('Zona Sul', '04000-000', '04999-999', 'Vila Mariana, Saúde, Jabaquara, Ipiranga, Moema, etc.', 120.00),
  ('Zona Oeste', '05000-000', '05699-999', 'Lapa, Perdizes, Pinheiros, Butantã, Morumbi, Pirituba, Vila Leopoldina, etc.', 160.00),
  ('Zona Sul', '05700-000', '05899-999', 'Campo Limpo, Santo Amaro, M''Boi Mirim, etc.', 120.00),
  ('Área Metropolitana (Grande SP)', '06000-000', '09999-999', 'Osasco, Guarulhos, Santo André, São Bernardo, Diadema, Mogi das Cruzes, etc.', 90.00),
  ('Litoral de São Paulo', '11000-000', '11999-999', 'Santos, Guarujá, Praia Grande, São Sebastião, Ubatuba, etc.', 0.00),
  ('Interior de São Paulo', '12000-000', '19999-999', 'Campinas, Ribeirão Preto, São José dos Campos, Sorocaba, Bauru, São José do Rio Preto, etc.', 220.00)
on conflict do nothing;

-- Hospedagens (exemplos)
insert into public.lodgings (name, pax_per_apartment, price_per_apartment, active)
values
  ('Apartamento Standard', 2, 280.00, true),
  ('Apartamento Família', 4, 520.00, true),
  ('Suíte Premium', 2, 780.00, true)
on conflict (name) do update set pax_per_apartment = excluded.pax_per_apartment, price_per_apartment = excluded.price_per_apartment, active = excluded.active;

-- Observações:
-- - Se desejar evitar nomes duplicados, diferencie as zonas (ex.: "Zona Sul 1" e "Zona Sul 2").
-- - Os valores de price_add são exemplos e podem ser ajustados.
-- - A Calculadora já consome price_add diretamente da tabela zones.