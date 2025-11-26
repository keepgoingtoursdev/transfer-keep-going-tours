# Cálculo de Transfer — Visão Simplificada

Este documento explica, de forma objetiva, como o cálculo de preços do transfer está sendo realizado no projeto e quais dados são usados.

## Objetivo
Estimar um orçamento para o transfer com base no serviço selecionado, tipo de veículo e região de origem/destino (faixas de CEP), exibindo uma faixa mínima e máxima.

## Fonte de Dados (Supabase)
- services
  - name, base_price (usamos "Transfer Privado" como serviço base)
- vehicles
  - name, capacity_max, price_add, description, active
- zones
  - name, cep_start, cep_end, description, price_add
- configurations
  - season_start_date, season_end_date (janela de temporada para restringir a data)

## Fórmula por Perna (ida ou volta)
- preço_perna = base_price (serviço) + vehicle.price_add + zone.price_add
  - base_price: valor base do serviço "Transfer Privado"
  - vehicle.price_add: acréscimo do veículo selecionado
  - zone.price_add: acréscimo da zona correspondente ao CEP informado

## Viagem Completa
- Somente ida: total = preço_perna(ida)
- Ida e volta: total = preço_perna(ida) + preço_perna(volta)

## Faixa de Orçamento Apresentada
- minPrice ≈ total × 0,95
- maxPrice ≈ total × 1,15

## Fluxo no App (passo a passo)
1) Tipo de Serviço (ida ou ida e volta)
2) CEP de origem (identificação da zona por faixa de CEP)
3) Data (restrita pelo período de temporada)
4) Passageiros
5) Veículo
6) Resultado (faixa de preço)

## Validações Importantes
- CEP precisa estar dentro de uma faixa cadastrada em zones.
- Data deve estar entre season_start_date e season_end_date.
- Passageiros devem respeitar a capacidade máxima do veículo.
- Caso uma zona não possua price_add definido, aplica-se um fallback padrão (atualmente 120). Este valor pode ser alterado conforme necessidade.

## Exemplo Prático
- base_price (Transfer Privado) = 180
- vehicle.price_add (SUV Premium) = 120
- zone.price_add (Zona Norte) = 150
- Ida: 180 + 120 + 150 = 450
- Ida e volta (mesmos parâmetros): 450 + 450 = 900
- Faixa apresentada: min ≈ 900 × 0,95 = 855 | max ≈ 900 × 1,15 = 1.035

## Onde está implementado no código
- src/pages/Calculadora.vue
  - estimateLegPriceDb(zone, vehicleName)
  - estimateTripTotalDb(firstLeg, secondLeg?)
  - getServiceBasePrice() — lê services.base_price para "Transfer Privado"
  - Busca de dados: fetchZones, fetchVehicles, fetchServices, getSeasonDates

## Painel Administrativo (edição de dados)
- /admin/configurations: editar datas de temporada (habilitam a seleção de data)
- /admin/zones: CRUD de zonas com faixas de CEP e price_add
- (Opcional/Planejado) Admin de vehicles e services para edição completa

## Observações
- A temporada atualmente restringe a data (não altera preço). Caso desejado, podemos incluir multiplicadores (ex.: alta temporada).
- Recomenda-se evitar sobreposição de faixas de CEP e nomes duplicados de zonas.
- O cálculo exibe uma faixa para cobrir variações (horário, pedágios, paradas). Regras específicas podem ser adicionadas.