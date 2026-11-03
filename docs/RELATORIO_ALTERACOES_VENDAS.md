# 📄 Relatório de Alterações — Módulo de Vendas (`feat/crud-vendas`)

Este documento descreve detalhadamente todas as alterações, novos arquivos, estruturas de pastas e regras de negócio implementadas na branch **`feat/crud-vendas`**.

---

## 🎯 Objetivo da Branch
Implementar o fluxo completo de **Vendas de Bovinos** (tanto vendas **Realizadas** quanto **Planejadas**), cobrindo os requisitos do projeto:
- **RF-19 / B-17**: Registro de vendas realizadas, dados obrigatórios, cálculo de métricas e baixa automática dos animais vendidos no rebanho.
- **RF-20 / B-18**: Consulta de histórico e filtros de vendas.
- **RF-21 / B-18**: Registro e visualização de vendas planejadas de forma separada das realizadas.

---

## 🗂️ Estrutura de Pastas e Arquivos Alterados / Criados

```
BOVR---Bovinos-Operacoes-VisaoRural/
│
├── backend/
│   ├── data/sqlite/
│   │   ├── database.ts                  [MODIFICADO] Versão do banco subiu para 3 + MIGRACAO_3
│   │   ├── saleRepository.ts            [NOVO] Repositório SQLite para Vendas e Itens de Venda
│   │   └── saleServices.ts              [NOVO] Hook/Context provider `useServicoVendas()`
│   │
│   ├── domain/
│   │   └── errors.ts                    [MODIFICADO] Tratamento centralizado de erros de domínio
│   │
│   ├── features/sales/
│   │   ├── types.ts                     [NOVO] Tipos e interfaces de Venda, Itens e Filtros
│   │   ├── validation.ts                [NOVO] Validação de regras de negócio de vendas
│   │   └── service.ts                   [NOVO] Casos de uso e cálculos agregados de vendas
│   │
│   └── __tests__/
│       ├── sales-validation.test.ts     [NOVO] Testes automatizados de validação de vendas
│       └── cattle.test.js               [MODIFICADO] Ajuste das asserções para o schema versão 3
│
└── frontend/
    ├── app/
    │   ├── _layout.tsx                  [MODIFICADO] Integração da rota e layout de vendas
    │   ├── vendas.tsx                   [MODIFICADO] Tela principal de listagem e histórico de vendas
    │   └── venda-form.tsx               [NOVO] Formulário de cadastro e edição de venda
    │
    ├── src/
    │   ├── components/SplashAnimado.tsx [MODIFICADO] Ajuste de layout da splash screen
    │   ├── domain/errors.ts             [MODIFICADO] Exportação dos erros vindos do backend
    │   └── features/sales/types.ts      [NOVO] Exportação dos tipos de venda para o frontend
    │
    └── __tests__/
        └── sales-validation.test.ts     [NOVO] Testes de validação de formulário no frontend
```

---

## 🛠️ Detalhamento do que foi Feito

### 1. Banco de Dados Local (SQLite)
* **Arquivo:** [`backend/data/sqlite/database.ts`](file:///c:/Users/Kayke/OneDrive/Área%20de%20Trabalho/boi/BOVR---Bovinos-Operacoes-VisaoRural/backend/data/sqlite/database.ts)
  * A constante `VERSAO_BANCO` foi alterada de `2` para `3`.
  * Foi adicionada a **`MIGRACAO_3`** contendo:
    * Tabela `sales`: armazena comprador, data da venda, valor bruto em centavos, tipo (`realizada` ou `planejada`) e observações.
    * Tabela `sale_items`: armazena os animais vinculados à venda, número do brinco e o peso individual em kg.
    * Índices de performance: busca por data (`idx_sales_date`), tipo (`idx_sales_type`), comprador (`idx_sales_buyer`) e brinco (`idx_sale_items_ear_tag`).

### 2. Repositório e Regras de Negócio de Vendas
* **Arquivo:** [`backend/data/sqlite/saleRepository.ts`](file:///c:/Users/Kayke/OneDrive/Área%20de%20Trabalho/boi/BOVR---Bovinos-Operacoes-VisaoRural/backend/data/sqlite/saleRepository.ts)
  * Operações CRUD completas com transações seguras (`BEGIN IMMEDIATE`, `COMMIT`, `ROLLBACK`).
  * **Baixa Automática no Rebanho (RF-19.3):** Quando uma venda é cadastrada como `realizada`, o status dos animais associados na tabela `cattle` é automaticamente alterado de `'ativo'` para `'vendido'`.
  * Filtros de consulta por período, comprador, brinco do animal e tipo de venda.

* **Arquivo:** [`backend/features/sales/validation.ts`](file:///c:/Users/Kayke/OneDrive/Área%20de%20Trabalho/boi/BOVR---Bovinos-Operacoes-VisaoRural/backend/features/sales/validation.ts)
  * Valida se o comprador foi informado.
  * Valida o formato e integridade da data (`YYYY-MM-DD` / `DD/MM/AAAA`).
  * Valida se o valor bruto é maior que zero.
  * Valida se há pelo menos um animal na venda e se o peso de cada animal é maior que zero.
  * Impede que o mesmo brinco seja inserido mais de uma vez na mesma venda.

* **Arquivo:** [`backend/features/sales/service.ts`](file:///c:/Users/Kayke/OneDrive/Área%20de%20Trabalho/boi/BOVR---Bovinos-Operacoes-VisaoRural/backend/features/sales/service.ts)
  * Provê métodos de consulta, salvamento e exclusão.
  * Método `calcularResumo(vendas)` para consolidação dos totais em tela (total em R$, total de animais e peso total).

### 3. Interface de Usuário (Expo / React Native)
* **Arquivo:** [`frontend/app/vendas.tsx`](file:///c:/Users/Kayke/OneDrive/Área%20de%20Trabalho/boi/BOVR---Bovinos-Operacoes-VisaoRural/frontend/app/vendas.tsx)
  * **Abas:** Alternância entre vendas **Realizadas** e **Planejadas** mantendo-as separadas (RF-21.2).
  * **Painel de Métricas:** Exibição do total financeiro, total de cabeças vendidas, peso total acumulado, preço médio por cabeça e peso médio por cabeça.
  * **Filtros:** Campo de busca textual (por comprador ou brinco) e seleção de período (data inicial e final).
  * **Cards Interativos:** Lista de vendas com botão para expandir e ver a lista individual de animais com seus respectivos pesos, além de botões para **Editar** e **Excluir**.

* **Arquivo:** [`frontend/app/venda-form.tsx`](file:///c:/Users/Kayke/OneDrive/Área%20de%20Trabalho/boi/BOVR---Bovinos-Operacoes-VisaoRural/frontend/app/venda-form.tsx)
  * Formulário completo para inclusão/edição de vendas.
  * Permite adicionar animais manualmente ou selecionar rapidamente a partir dos animais **ativos** do rebanho já cadastrados.
  * Formatação automática de moeda (R$) e datas (DD/MM/AAAA).

### 4. Testes Automatizados e Ajustes
* **Testes adicionados/ajustados:**
  * [`backend/__tests__/sales-validation.test.ts`](file:///c:/Users/Kayke/OneDrive/Área%20de%20Trabalho/boi/BOVR---Bovinos-Operacoes-VisaoRural/backend/__tests__/sales-validation.test.ts): Validações do backend.
  * [`frontend/__tests__/sales-validation.test.ts`](file:///c:/Users/Kayke/OneDrive/Área%20de%20Trabalho/boi/BOVR---Bovinos-Operacoes-VisaoRural/frontend/__tests__/sales-validation.test.ts): Validações do frontend.
  * [`backend/__tests__/cattle.test.js`](file:///c:/Users/Kayke/OneDrive/Área%20de%20Trabalho/boi/BOVR---Bovinos-Operacoes-VisaoRural/backend/__tests__/cattle.test.js): Atualizado para validar a transição até a versão 3 do schema.
* **Resultado dos Testes:**
  * **Backend:** 3 suítes, 43 testes aprovados (100%).
  * **Frontend:** 7 suítes, 39 testes aprovados (100%).
