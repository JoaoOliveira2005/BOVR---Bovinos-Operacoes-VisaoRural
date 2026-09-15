# Product Backlog — BOVR (Bovinos — Operações Visão Rural)

**Versão:** 0.1  
**Autor:** Equipe de desenvolvimento  
**Status:** Draft — aguardando refinement  
**Data:** 2026-09-15  

---

## Visão geral

Este documento contém o Product Backlog completo do BOVR, organizado conforme os conceitos de engenharia de requisitos estudados. Cada item segue o formato **User Story (INVEST)** com **critérios de aceitação (Dado/Quando/Então)**, priorização **MoSCoW**, estimativa em **story points**, **rastreabilidade** às RFs de origem e dependências mapeadas.

### Regras de fluxo

| Coluna | Definição |
|---|---|
| **Backlog** | Item aguardando refinement. Deve satisfazer INVEST + ACs + estimativa + MoSCoW para ir para Ready |
| **Ready** | Item aprovado pelo DoR checklist: claro, testável, sem blockers, dependências mapeadas, stakeholder aprovou |
| **In progress** | Item em desenvolvimento (máximo 2-3 por dev) |
| **In review** | Item com código submetido em PR, aguardando revisão e testes |
| **Done** | Item que satisfaz DoD checklist: revisado, testes passando, ACs atendidas, offline, PT-BR/R$/data, performance OK |

### DoR checklist (para ir para Ready)
- [ ] User Story escrita no formato INVEST
- [ ] Critérios de aceitação definidos e testáveis
- [ ] Estimativa em story points atribuída
- [ ] MoSCoW definido
- [ ] Dependências identificadas
- [ ] Stakeholders aprovaram (decisão documentada)

### DoD checklist (para ir para Done)
- [ ] Código revisado por outro membro da equipe
- [ ] Testes automatizados passando (RNF-15)
- [ ] Funciona 100% offline (RNF-03)
- [ ] PT-BR, R$ com 2 casas decimais, DD/MM/AAAA (RNF-17/18)
- [ ] Critérios de aceitação todos atendidos
- [ ] Performance OK: consultas ≤2s, relatórios ≤5s (RNF-05/06)
- [ ] Dados persistidos após fechar app ou reiniciar (RNF-10/33)

### Item bloqueado
- **B-24** (PIN + bloqueio) → não pode ir para Ready até P-12/P-18 serem resolvidos (proteção do backup).

---

## Sprint 0 — Fundação (Must)

### B-00 — Setup projeto Android + arquitetura offline + DB local
### B-01 — Tela inicial com atalhos + navegação + padrão visual PT-BR/R$/data
### B-02 — Modelo base Animal/Lote/Pasto + seed 500 animais para teste de performance

---

## Sprint 1 — Gado core (Must)

### B-03 — Cadastrar animal individual com validação de brinco duplicado
### B-04 — Alterar situação do animal + histórico + contadores
### B-05 — Consultar/filtrar animais

---

## Sprint 2 — Lotes + Reprodução

### B-06 — Criar lote + adicionar/remover animais + impedir duplo vínculo
### B-07 — Histórico de lotes + aplicação em lote com confirmação
### B-08 — Situação reprodutiva de fêmeas + confirmação prenha→vazia
### B-09 — Previsão de parto via data de cobertura + vínculo bezerro-mãe

---

## Sprint 3 — Saúde + Pasto base

### B-10 — Vacinação individual + histórico + filtro
### B-11 — Ocorrências de saúde + machucado como observação/log
### B-12 — Consultar animais em tratamento + sem notificações
### B-13 — CRUD de pastos + tipos de capim (altura mínima/máxima)
### B-14 — Classificação automática de qualidade do pasto + leitura datada

---

## Sprint 4 — Pasto movimento + Vendas

### B-15 — Movimentação de animal/lote entre pastos + histórico de rotação
### B-16 — Painel de pasto: lotação + permanência/descanso em dias
### B-17 — Registrar venda realizada + baixa automática dos animais vendidos
### B-18 — Consultar vendas + vendas planejadas separadas

---

## Sprint 5 — Financeiro + Relatórios

### B-19 — CRUD de gastos + categorias e subcategorias
### B-20 — Consulta de gastos + totais por categoria + resultado financeiro
### B-21 — Relatórios de controle do gado, vendas, gastos e resumo financeiro em tela
### B-22 — Exportar relatórios em formato PDF

---

## Sprint 6 — Backup/Segurança + Hardening

### B-23 — Backup manual + restauração com confirmação + data do último backup
### B-24 — PIN de acesso + bloqueio após 3 tentativas + hardening do backup
### B-25 — Testes automatizados das regras de animal + cálculos financeiros + testes de performance

---

### Dependências críticas

| Item | Depende de | Bloqueio |
|---|---|---|
| B-02 | B-00 (setup + DB) | Não pode ser feito sem base |
| Todos os B-xx | B-01 (interface base) | Navegação depende da tela inicial |
| **B-24** | **P-12/P-18** | **Não pode ir para Ready até decisões pendentes** |
| B-23 | B-24 (RNF-13) | Proteção do backup depende de PIN |

### Decisões pendentes

| ID | Descrição | Status | Impacto |
|---|---|---|---|
| P-12 | Como o arquivo de backup deve ser protegido contra alterações não autorizadas? | ⏳ Pendente | B-24, B-23 |
| P-18 | O que define um arquivo de backup como "válido"? | ⏳ Pendente | B-23 |

### Regras

- Nenhum item vai para `Ready` sem satisfazer o **DoR checklist** completo
- Nenhum item vai para `Done` sem satisfazer o **DoD checklist** completo
- **B-24** permanece em `Backlog` até P-12/P-18 serem respondidos
- Se velocidade < 13 pts/sprint, recomenda-se quebrar B-17 (8 pts) em dois itens menores
- NÃO adicionar notificações (RF-14/RF-21.3), NÃO permitir múltiplos usuários sem reavaliar modelagem

---

