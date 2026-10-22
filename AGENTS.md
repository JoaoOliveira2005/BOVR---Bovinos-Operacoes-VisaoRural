# BOVR — Bovinos, Operações e Visão Rural
App Android offline (10+, minSdk 29): usuário único, uma fazenda, até 500 animais. Sem internet, sem nuvem, sem notificações (RF-31, RNF-03, RF-14).

## Onde trabalhar
- `frontend/` — todo o código atual (Expo SDK 57 + expo-router). Comandos, tokens e gotchas de device: `frontend/AGENTS.md` + `frontend/README.md`.
- `backend/` — vazio de propósito (só `.gitkeep`). Não criar API/servidor: o "backend" é on-device (domínio + SQLite local), ver `docs/Banco de Dados/Arquitetura.md`.
- `docs/` — fonte de verdade dos requisitos. `Conceitos/` é rascunho local e está gitignored.

## Docs que valem (nesta ordem)
1. `docs/Requisitos.md` (RF/RNF, P-01–P-23) + `docs/vision/DocumentoDeVisao.md` — os IDs são citados nos comentários do código.
2. `docs/Banco de Dados/Arquitetura.md` + `DicionarioDeDados.md` — camadas locais, convenções, seeds protegidos.
3. `docs/Product-Backlog.md` — stories INVEST; Done exige: revisado, testes ok, 100% offline, pt-BR + `R$ 1.234,50` + `DD/MM/AAAA`, consultas ≤2s / relatórios ≤5s, dados sobrevivem a reinício.
4. `frontend/README.md` — estado real (Pastos e Gastos funcionais; Gado, Vendas e Relatórios são placeholders) + padrão visual + pendências.
- `DESIGN.md` NÃO está versionado. Conflito P-07 × RF-21 resolvido em 13/10/2026: vendas planejadas voltaram ao escopo — venda é planejada (0) que se transforma em realizada (1); pesos em @ (P-21/P-22/P-23).

## Como contribuir
- `cd frontend` para tudo (`npm install`, `npm run web` p/ preview, `npm run android` p/ device, `npm run typecheck`, `npm test`). Entrega é APK Android, não web.
- Mudanças pequenas, um módulo por vez (gado, pastos, vendas, gastos, relatórios).
- Nunca inventar números/datas na tela inicial — indicadores só com consulta real e backup real; sem mocks fictícios.

## Gotchas que o agente adivinharia errado
- Expo SDK 57 + `expo-router` (rota = arquivo em `frontend/app/`); nunca importar de `@react-navigation/*` direto. Detalhe em `frontend/AGENTS.md`.
- `cd frontend`: `npm run web` é só preview, entrega é APK (`npm run android` precisa do Android SDK). Sem lint configurado; `npm run typecheck` + `npx jest __tests__/<arq> --runInBand` (preset `jest-expo`, `app/` fora do jest).
- SQLite `bovr.db` com migrations versionadas (`user_version` em `src/data/sqlite/database.ts`); dinheiro em centavos int, datas `YYYY-MM-DD`; nunca criar servidor/API.
- Moeda/data só via `src/lib/formato.ts` (nunca `Intl` — Hermes varia); UI só via tokens de `src/theme/tokens.ts`, pt-BR obrigatório.
