## Dicionário de dados (V1.3)

Formato: `coluna | tipo | nulo? | padrão | restrição | significado | rótulo pt-BR`.

### `herds` — lote de manejo (RF-02) — implementada (migração 3)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador interno do lote | — |
| `name` | TEXT | NÃO | — | `UNIQUE NOCASE` | Nome do lote | Nome |
| `description` | TEXT | SIM | NULL | — | Observações do lote | Descrição |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando o lote foi criado | — |
| `updated_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Última alteração | — |

### `cattle` — bovino individual (RF-01, RF-03–RF-07, RD-01–RD-03) — implementada (migração 2/3)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador interno do animal | — |
| `tag_number` | TEXT | NÃO | — | `UNIQUE` parcial `WHERE status='active'` | Número do brinco; não repete entre ativos | Brinco |
| `sex` | TEXT | NÃO | — | `CHECK IN ('male','female')` | Sexo do animal | Sexo |
| `birth_date` | TEXT | SIM | NULL | `YYYY-MM-DD` | Data de nascimento; calcula idade (RF-01.4) | Nascimento |
| `estimated_age_months` | INTEGER | SIM | NULL | `CHECK ≥ 0` | Idade estimada quando sem data (RF-01.3) | Idade estimada |
| `breed` | TEXT | NÃO | — | — | Raça | Raça |
| `notes` | TEXT | SIM | NULL | — | Observações | Observações |
| `herd_id` | INTEGER | SIM | NULL | FK `herds(id)` `RESTRICT` | Lote atual; um por vez (RD-03, migração 3) | Lote |
| `pasture_id` | INTEGER | SIM | NULL | FK `pastures(id)` `RESTRICT` | Pasto atual; um por vez (RD-03, migração 3) | Pasto |
| `status` | TEXT | NÃO | `'active'` | `CHECK IN ('active','sold','dead','transferred')` | Situação (RF-06) | Situação |
| `mother_id` | INTEGER | SIM | NULL | auto-FK `cattle(id)` `RESTRICT` | Mãe do bezerro (RF-10) — **prevista** | Mãe |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando foi cadastrado | — |
| `updated_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Última alteração | — |

`CHECK`: exatamente um entre `birth_date` e `estimated_age_months` (XOR).

### `herd_memberships` — histórico de lotes (RF-02.3) — prevista (não implementada)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do vínculo | — |
| `cattle_id` | INTEGER | NÃO | — | FK `cattle(id)` `RESTRICT` | Bovino do vínculo | Animal |
| `herd_id` | INTEGER | NÃO | — | FK `herds(id)` `RESTRICT` | Lote do vínculo | Lote |
| `entered_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Entrada no lote | Entrada |
| `exited_on` | TEXT | SIM | NULL | `YYYY-MM-DD ≥ entered_on` | Saída do lote | Saída |

### `grass_types` — tipo de capim (RF-16.3, RD-06) — implementada (migração 1)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do tipo | — |
| `name` | TEXT | NÃO | — | `UNIQUE NOCASE` | Nome do capim | Nome |
| `min_height_cm` | REAL | NÃO | — | `CHECK ≥ 0` | Altura mínima ideal (cm) | Altura mín. |
| `max_height_cm` | REAL | NÃO | — | `CHECK ≥ min_height_cm` | Altura máxima ideal (cm) | Altura máx. |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando foi criado | — |
| `updated_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Última alteração | — |

### `pastures` — cadastro do pasto (RF-15.1, RD-05) — implementada (migração 1)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do pasto | — |
| `name` | TEXT | NÃO | — | `UNIQUE NOCASE` (modelo-alvo; código ainda não aplica) | Nome do pasto | Nome |
| `area_hectares` | REAL | NÃO | — | `CHECK > 0` | Área em hectares | Área (ha) |
| `grass_type_id` | INTEGER | NÃO | — | FK `grass_types(id)` `RESTRICT` | Capim do pasto | Tipo de capim |
| `current_height_cm` | REAL | NÃO | — | `CHECK ≥ 0` | Altura atual do capim (leitura atual) | Altura |
| `grass_condition` | TEXT | NÃO | — | `CHECK IN ('green','partly_dry','dry')` | Condição atual do capim | Condição |
| `coverage_percent` | INTEGER | NÃO | — | `CHECK 0–100` | Cobertura atual do solo (%) | Cobertura |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando foi criado | — |
| `updated_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Última alteração | — |

### `pasture_inspections` — vistoria de qualidade (RF-15.2/15.3/15.4, RF-16.1/16.2) — implementada (migração 3)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador da vistoria | — |
| `pasture_id` | INTEGER | NÃO | — | FK `pastures(id)` `RESTRICT` | Pasto vistoriado | Pasto |
| `inspected_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Data da leitura em campo | Data da leitura |
| `grass_type_id` | INTEGER | NÃO | — | FK `grass_types(id)` `RESTRICT` | Tipo de capim (snapshot) | Tipo de capim |
| `min_height_cm` | REAL | NÃO | — | `CHECK ≥ 0` | Altura mínima ideal (snapshot) | Altura mín. |
| `max_height_cm` | REAL | NÃO | — | `CHECK ≥ min_height_cm` | Altura máxima ideal (snapshot) | Altura máx. |
| `grass_height_cm` | REAL | NÃO | — | `CHECK ≥ 0` | Altura medida (cm) | Altura |
| `grass_condition` | TEXT | NÃO | — | `CHECK IN ('green','partly_dry','dry')` | Condição do capim | Condição |
| `coverage_percent` | INTEGER | NÃO | — | `CHECK 0–100` | Cobertura do solo (%) | Cobertura |
| `quality` | TEXT | NÃO | — | `CHECK IN ('good','fair','poor')` | Classificação gravada | Qualidade |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando foi registrada | — |

### `pasture_movements` — movimentação entre pastos (RF-17) — implementada (migração 3)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do movimento | — |
| `cattle_id` | INTEGER | NÃO | — | FK `cattle(id)` `RESTRICT` | Animal movido (1 linha por animal) | Animal |
| `herd_id` | INTEGER | SIM | NULL | FK `herds(id)` `RESTRICT` | Lote de contexto (quando a movimentação veio de um lote) | Lote |
| `origin_pasture_id` | INTEGER | NÃO | — | FK `pastures(id)` | Pasto de origem | Origem |
| `destination_pasture_id` | INTEGER | NÃO | — | FK `pastures(id)`, `≠ origem` | Pasto de destino | Destino |
| `moved_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Data do movimento | Data |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando foi registrada | — |

`CHECK`: `origin_pasture_id IS NOT destination_pasture_id`. Granularidade: uma
linha por animal (preserva origem individual quando um lote se divide entre
pastos), `herd_id` é apenas contexto.

### `pasture_rest_periods` — período de descanso do pasto (RF-18.3) — implementada (migração 3)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do período | — |
| `pasture_id` | INTEGER | NÃO | — | FK `pastures(id)` `RESTRICT` | Pasto em descanso | Pasto |
| `started_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Início do descanso | Início |
| `ended_on` | TEXT | SIM | NULL | `YYYY-MM-DD ≥ started_on` ou NULL | Fim do descanso (NULL = aberto) | Fim |

Regra: **no máximo um descanso aberto por pasto** (índice único parcial
`idx_pasture_rest_open` WHERE `ended_on IS NULL`). Trigger
`cattle_status_requires_pasture_exit` obriga saída datada antes de
vender/morrer/transferir, preservando o início do descanso.

### `reproductive_events` — reprodução (RF-08, RF-09) — prevista (não implementada)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do evento | — |
| `cattle_id` | INTEGER | NÃO | — | FK `cattle(id)` `RESTRICT` | Fêmea do evento | Animal |
| `status` | TEXT | NÃO | — | `CHECK IN ('unevaluated','open','pregnant','calved')` | Situação reprodutiva | Situação |
| `check_date` | TEXT | SIM | NULL | `YYYY-MM-DD` | Data da identificação da prenhez (RF-08.2) | Data da prenhez |
| `breeding_date` | TEXT | SIM | NULL | `YYYY-MM-DD` | Data da cobertura | Cobertura |
| `expected_calving_date` | TEXT | SIM | NULL | `YYYY-MM-DD` | Previsão de parto (RF-09) | Previsão de parto |

### `vaccinations` — vacinação (RF-11) — prevista (não implementada)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador da dose | — |
| `cattle_id` | INTEGER | NÃO | — | FK `cattle(id)` `RESTRICT` | Animal vacinado (individual, RF-11.1) | Animal |
| `vaccine_name` | TEXT | NÃO | — | — | Nome da vacina | Vacina |
| `given_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Data da aplicação | Data |
| `dose` | TEXT | NÃO | — | — | Dose aplicada | Dose |
| `notes` | TEXT | SIM | NULL | — | Observações | Observações |

### `health_events` — saúde e machucados (RF-12, P-04/P-13) — prevista (não implementada)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do caso | — |
| `cattle_id` | INTEGER | NÃO | — | FK `cattle(id)` `RESTRICT` | Animal do caso | Animal |
| `happened_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Data da ocorrência | Data |
| `description` | TEXT | NÃO | — | — | Descrição | Descrição |
| `treatment` | TEXT | SIM | NULL | — | Tratamento realizado | Tratamento |
| `status` | TEXT | NÃO | `'under_treatment'` | `CHECK IN ('under_treatment','recovered','closed')` | Situação atual | Situação |
| `origin` | TEXT | NÃO | `'case'` | `CHECK IN ('case','injury_note')` | Ocorrência ou observação de machucado | Tipo |

### `sales` — venda planejada (0) → realizada (1) (RF-19, RF-21) — tabela única — prevista (não implementada)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador da venda | — |
| `status` | INTEGER | NÃO | `0` | `CHECK IN (0,1)` | 0 = planejada, 1 = realizada (RF-21) | Situação |
| `sold_on` | TEXT | SIM | NULL | `YYYY-MM-DD` | Data da venda; preenchida na virada 0→1 (RF-19.1) | Data |
| `buyer` | TEXT | SIM | NULL | — | texto livre; obrigatório ao realizar (RF-19.1) | Comprador |
| `gross_amount_cents` | INTEGER | SIM | NULL | `CHECK > 0` | Valor bruto em centavos; obrigatório ao realizar (RF-19.1) | Valor bruto |
| `notes` | TEXT | SIM | NULL | — | obrigatório ao realizar (RF-19.1) | Observações |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando foi registrada | — |
| `updated_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Última alteração | — |

Nulos permitidos apenas com `status = 0` (RF-19.1 exige todos os campos na
realização); a obrigatoriedade na virada 0→1 é validada pela aplicação.
Excluir a venda não reverte a situação dos animais (RF-21.5).

### `sale_items` — itens da venda planejada e realizada (RF-19.1/19.2, RF-21.2/21.4, RD-04) — prevista (não implementada)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do item | — |
| `sale_id` | INTEGER | NÃO | — | FK `sales(id)` `CASCADE` | Venda do item | Venda |
| `cattle_id` | INTEGER | NÃO | — | FK `cattle(id)` `RESTRICT` | Animal da venda | Animal |
| `price_per_arroba_cents` | INTEGER | NÃO | — | `CHECK > 0` | Valor@ em centavos, obrigatório (RF-21.2) | Valor@ |
| `planned_weight_arroba` | REAL | SIM | NULL | `CHECK > 0` | Peso@ planejado; opcional, sem balança (RF-21.2) | Peso@ planejado |
| `planned_total_cents` | INTEGER | SIM | NULL | `CHECK > 0` | Preço planejado = Peso@ × Valor@; NULL se peso nulo (RF-21.2) | Preço planejado |
| `actual_weight_arroba` | REAL | SIM | NULL | `CHECK > 0` | Peso@ real; obrigatório ao realizar (RF-21.4) | Peso@ real |
| `actual_total_cents` | INTEGER | SIM | NULL | `CHECK > 0` | Preço real = Peso@ real × Valor@; gravado na virada 0→1 | Preço real |

Pesos **somente em arrobas (@)** — sem conversão com kg (RD-04, P-21).
Animal morto em venda planejada é excluído do cálculo real, mantendo o
registro planejado (RF-21.3). Na confirmação (RF-19.3/RF-21.4) o app altera
`cattle.status → 'sold'`, exceto os mortos.

### `expense_categories` / `expense_subcategories` / `expenses` — gastos (RF-22–RF-24) — implementadas (migração 1)

Seeds protegidos (`is_system = 1`): Água, Ração, Mão de obra, Infraestrutura
(RF-22.2). Categorias do sistema não podem ser renomeadas nem excluídas.

### Chaves candidatas (V1.3)

Candidatas = colunas que identificariam a linha sozinhas; elege-se uma como PK
e o resto vira alternada (`UNIQUE`).

| Entidade | Candidatas | PK eleita | Alternadas (`UNIQUE`) |
|---|---|---|---|
| `herds` | `id`, `name` | `id` | `name` (NOCASE) |
| `cattle` | `id`, `tag_number` entre ativos | `id` | `tag_number` parcial `WHERE status = 'active'` |
| `herd_memberships` | `id`, (`cattle_id`, `herd_id`, `entered_on`) | `id` | composta (`cattle_id`, `herd_id`, `entered_on`) |
| `grass_types` | `id`, `name` | `id` | `name` (NOCASE) |
| `pastures` | `id`, `name` | `id` | `name` (NOCASE, sem duplicatas) |
| `pasture_inspections` | `id` (só) | `id` | — (índice não-único em `pasture_id, inspected_on`) |
| `pasture_movements` | `id` (só) | `id` | — (composta seria larga demais) |
| `pasture_rest_periods` | `id`, (`pasture_id`, `started_on`) | `id` | **não imposta** — índice único parcial apenas para `ended_on IS NULL` |
| `reproductive_events` | `id` (só) | `id` | — |
| `vaccinations` | `id`, (`cattle_id`, `vaccine_name`, `given_on`) | `id` | **não imposta** — duas doses iguais no mesmo dia são legítimas |
| `health_events` | `id` (só) | `id` | — |
| `sales` | `id` (só) | `id` | — (data + comprador não é único) |
| `sale_items` | `id`, (`sale_id`, `cattle_id`) | `id` | composta (`sale_id`, `cattle_id`) — um bovino entra uma vez por venda |
| `expense_categories` | `id`, `name` | `id` | `name` (NOCASE) |
| `expense_subcategories` | `id`, (`category_id`, `name`) | `id` | composta (`category_id`, `name`) |
| `expenses` | `id` (só) | `id` | — |

### Normalização (V1.3)

Critério: 3FN basta. Todas as PKs são surrogate de coluna única, logo a 2FN é
automática em todas as tabelas (sem dependência parcial possível). Vereditos:

**Passam em 3FN (13 tabelas):** `herds`, `cattle` (as FKs `herd_id`,
`pasture_id` e `mother_id` são fatos do vínculo, não transitividade),
`herd_memberships`, `grass_types`, `pastures`, `pasture_movements`,
`pasture_rest_periods`, `vaccinations`, `health_events`, `sales`
(`gross_amount_cents` é entrada independente — RF-19.1 — não derivável dos
itens), `expense_categories`, `expense_subcategories`, `expenses` (nomes só
via `JOIN`; os `*Nome` nos tipos TS são display, não coluna).

**Exceções justificadas (3):**

1. `pasture_inspections.quality` — redundância calculada intencional: depende
   de altura, condição, cobertura e da faixa ideal do capim. Gravada porque o
   histórico é imutável (RF-15.3); recalcular o passado reescreveria história.
   Regra: o app recalcula a cada `INSERT`, nunca em `UPDATE`.
2. `reproductive_events.expected_calving_date` — função determinística de
   `breeding_date` (RF-09), gravada por conveniência de consulta e relatório.
   Mesma regra: recalculada a cada escrita.
3. `sale_items.planned_total_cents` e `sale_items.actual_total_cents` —
   derivados de `price_per_arroba_cents × peso@` (RF-21.2/21.4), gravados
   para consulta financeira sem recálculo a cada leitura. Regra: recalculados
   a cada escrita, nunca editados direto (exceto RF-21.5, edição de valores na
   venda realizada, que os recalcula junto).
