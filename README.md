# Keep Going Tours — Configuração de Supabase

## Variáveis de Ambiente

O projeto usa Vite, portanto as variáveis devem ser prefixadas com `VITE_`.

1) Copie `.env.example` para `.env.local` e preencha:

```
VITE_SUPABASE_URL=https://<sua-instancia>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key>
```

2) Para produção, crie `.env.production` com as chaves adequadas.

> Observação: `.env.local` já está no `.gitignore` e não será commitado.

## Cliente Supabase

O cliente é inicializado em `src/lib/supabaseClient.ts` usando as variáveis acima.

## Serviços (fetch)

Funções utilitárias em `src/services/supabase.ts`:
- `fetchZones()` — busca zonas ordenadas por nome;
- `fetchServices()` — lista serviços com base_price;
- `fetchConfigurations(keys?)` — busca configurações por chave;
- `getSeasonDates()` — retorna `{ start, end }` para limitar o datepicker;
- `findZoneByCepFromDb(zones, cep)` — normaliza CEP e encontra a zona correspondente.


## Próximos passos


- Integrar a Calculadora para usar os dados de `zones` e `services` do Supabase;
- Carregar `season_start_date` e `season_end_date` ao montar a página e limitar o datepicker;
- Implementar inserção de `transfers` ao clicar em “Solicitar Reserva”, caso desejado.