## Dicionário de dados (V1.1)

Formato: `coluna | tipo | nulo? | padrão | restrição | significado | rótulo pt-BR`.

### `herds` — lote de manejo (RF-02)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador interno do lote | — |
| `name` | TEXT | NÃO | — | `UNIQUE NOCASE` | Nome do lote | Nome |
| `description` | TEXT | SIM | NULL | — | Observações do lote | Descrição |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando o lote foi criado | — |
| `updated_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Última alteração | — |

### `cattle` — bovino individual (RF-01, RF-03–RF-07, RD-01–RD-03)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador interno do animal | — |
| `tag_number` | TEXT | NÃO | — | `UNIQUE` parcial `WHERE status='active'` | Número do brinco; não repete entre ativos | Brinco |
| `sex` | TEXT | NÃO | — | `CHECK IN ('male','female')` | Sexo do animal | Sexo |
| `birth_date` | TEXT | SIM | NULL | `YYYY-MM-DD` | Data de nascimento; calcula idade (RF-01.4) | Nascimento |
| `estimated_age_months` | INTEGER | SIM | NULL | `CHECK ≥ 0` | Idade estimada quando sem data (RF-01.3) | Idade estimada |
| `breed` | TEXT | NÃO | — | — | Raça | Raça |
| `notes` | TEXT | SIM | NULL | — | Observações | Observações |
| `herd_id` | INTEGER | SIM | NULL | FK `herds(id)` | Lote atual; um por vez (RD-03) | Lote |
| `pasture_id` | INTEGER | SIM | NULL | FK `pastures(id)` | Pasto atual; um por vez (RD-03) | Pasto |
| `status` | TEXT | NÃO | `'active'` | `CHECK IN ('active','sold','dead','transferred')` | Situação (RF-06) | Situação |
| `mother_id` | INTEGER | SIM | NULL | auto-FK `cattle(id)` `RESTRICT` | Mãe do bezerro (RF-10) | Mãe |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando foi cadastrado | — |
| `updated_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Última alteração | — |

### `herd_memberships` — histórico de lotes (RF-02.3)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do vínculo | — |
| `cattle_id` | INTEGER | NÃO | — | FK `cattle(id)` `RESTRICT` | Bovino do vínculo | Animal |
| `herd_id` | INTEGER | NÃO | — | FK `herds(id)` `RESTRICT` | Lote do vínculo | Lote |
| `entered_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Entrada no lote | Entrada |
| `exited_on` | TEXT | SIM | NULL | `YYYY-MM-DD ≥ entered_on` | Saída do lote | Saída |

### `grass_types` — tipo de capim (RF-16.3, RD-06) — já existe

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do tipo | — |
| `name` | TEXT | NÃO | — | `UNIQUE NOCASE` | Nome do capim | Nome |
| `min_height_cm` | REAL | NÃO | — | `CHECK ≥ 0` | Altura mínima ideal (cm) | Altura mín. |
| `max_height_cm` | REAL | NÃO | — | `CHECK ≥ min_height_cm` | Altura máxima ideal (cm) | Altura máx. |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando foi criado | — |
| `updated_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Última alteração | — |

### `pastures` — cadastro do pasto (RF-15.1, RD-05) — já existe

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do pasto | — |
| `name` | TEXT | NÃO | — | `UNIQUE NOCASE` | Nome do pasto (sem duplicatas) | Nome |
| `area_hectares` | REAL | NÃO | — | `CHECK > 0` | Área em hectares | Área (ha) |
| `grass_type_id` | INTEGER | NÃO | — | FK `grass_types(id)` `RESTRICT` | Capim do pasto | Tipo de capim |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando foi criado | — |
| `updated_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Última alteração | — |

### `pasture_inspections` — vistoria de qualidade (RF-15.2/15.3/15.4, RF-16.1/16.2)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador da vistoria | — |
| `pasture_id` | INTEGER | NÃO | — | FK `pastures(id)` `RESTRICT` | Pasto vistoriado | Pasto |
| `inspected_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Data da leitura em campo | Data da leitura |
| `grass_height_cm` | REAL | NÃO | — | `CHECK ≥ 0` | Altura medida (cm) | Altura |
| `grass_condition` | TEXT | NÃO | — | `CHECK IN ('green','partly_dry','dry')` | Condição do capim | Condição |
| `coverage_percent` | INTEGER | NÃO | — | `CHECK 0–100` | Cobertura do solo (%) | Cobertura |
| `quality` | TEXT | NÃO | — | `CHECK IN ('good','fair','poor')` | Classificação gravada | Qualidade |

### `pasture_movements` — movimentação entre pastos (RF-17)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do movimento | — |
| `cattle_id` | INTEGER | SIM | NULL | FK `cattle(id)` | Bovino movido (ou lote) | Animal |
| `herd_id` | INTEGER | SIM | NULL | FK `herds(id)` | Lote movido (ou animal) | Lote |
| `origin_pasture_id` | INTEGER | NÃO | — | FK `pastures(id)` | Pasto de origem | Origem |
| `destination_pasture_id` | INTEGER | NÃO | — | FK `pastures(id)`, `≠ origem` | Pasto de destino | Destino |
| `moved_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Data do movimento | Data |

`CHECK`: exatamente um entre `cattle_id`/`herd_id` não-nulo.

### `reproductive_events` — reprodução (RF-08, RF-09)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do evento | — |
| `cattle_id` | INTEGER | NÃO | — | FK `cattle(id)` `RESTRICT` | Fêmea do evento | Animal |
| `status` | TEXT | NÃO | — | `CHECK IN ('unevaluated','open','pregnant','calved')` | Situação reprodutiva | Situação |
| `check_date` | TEXT | SIM | NULL | `YYYY-MM-DD` | Data da identificação da prenhez (RF-08.2) | Data da prenhez |
| `breeding_date` | TEXT | SIM | NULL | `YYYY-MM-DD` | Data da cobertura | Cobertura |
| `expected_calving_date` | TEXT | SIM | NULL | `YYYY-MM-DD` | Previsão de parto (RF-09) | Previsão de parto |

### `vaccinations` — vacinação (RF-11)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador da dose | — |
| `cattle_id` | INTEGER | NÃO | — | FK `cattle(id)` `RESTRICT` | Animal vacinado (individual, RF-11.1) | Animal |
| `vaccine_name` | TEXT | NÃO | — | — | Nome da vacina | Vacina |
| `given_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Data da aplicação | Data |
| `dose` | TEXT | NÃO | — | — | Dose aplicada | Dose |
| `notes` | TEXT | SIM | NULL | — | Observações | Observações |

### `health_events` — saúde e machucados (RF-12, P-04/P-13)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do caso | — |
| `cattle_id` | INTEGER | NÃO | — | FK `cattle(id)` `RESTRICT` | Animal do caso | Animal |
| `happened_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Data da ocorrência | Data |
| `description` | TEXT | NÃO | — | — | Descrição | Descrição |
| `treatment` | TEXT | SIM | NULL | — | Tratamento realizado | Tratamento |
| `status` | TEXT | NÃO | `'under_treatment'` | `CHECK IN ('under_treatment','recovered','closed')` | Situação atual | Situação |
| `origin` | TEXT | NÃO | `'case'` | `CHECK IN ('case','injury_note')` | Ocorrência ou observação de machucado | Tipo |

### `sales` — venda realizada (RF-19) — só realizadas, sem planejadas

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador da venda | — |
| `sold_on` | TEXT | NÃO | — | `YYYY-MM-DD` | Data da venda | Data |
| `buyer` | TEXT | NÃO | — | texto livre (RF-19.1) | Comprador | Comprador |
| `gross_amount_cents` | INTEGER | NÃO | — | `CHECK > 0` | Valor bruto em centavos | Valor bruto |
| `notes` | TEXT | NÃO | — | obrigatório (RF-19.1) | Observações | Observações |
| `created_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Quando foi registrada | — |
| `updated_at` | TEXT | NÃO | `CURRENT_TIMESTAMP` | — | Última alteração | — |

### `sale_items` — itens da venda (RF-19.1/19.2, RD-04)

| Coluna | Tipo | Nulo? | Padrão | Restrição | Significado | Rótulo pt-BR |
|---|---|---|---|---|---|---|
| `id` | INTEGER | NÃO | autoincremento | PK | Identificador do item | — |
| `sale_id` | INTEGER | NÃO | — | FK `sales(id)` `CASCADE` | Venda do item | Venda |
| `cattle_id` | INTEGER | NÃO | — | FK `cattle(id)` `RESTRICT` | Animal vendido | Animal |
| `weight_kg` | REAL | NÃO | — | `CHECK > 0` | Peso individual em kg | Peso (kg) |

Ao confirmar a venda, o app altera `cattle.status → 'sold'` (RF-19.3).

### `expense_categories` / `expense_subcategories` / `expenses` — gastos (RF-22–RF-24) — já existem

Seeds protegidos (`is_system = 1`): Água, Ração, Mão de obra, Infraestrutura
(RF-22.2). Categorias do sistema não podem ser renomeadas nem excluídas.

### Chaves candidatas (V1.1)

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
| `pasture_movements` | `id` (só) | `id` | — (composta seria larga demais e o XOR a invalida) |
| `reproductive_events` | `id` (só) | `id` | — |
| `vaccinations` | `id`, (`cattle_id`, `vaccine_name`, `given_on`) | `id` | **não imposta** — duas doses iguais no mesmo dia são legítimas |
| `health_events` | `id` (só) | `id` | — |
| `sales` | `id` (só) | `id` | — (data + comprador não é único) |
| `sale_items` | `id`, (`sale_id`, `cattle_id`) | `id` | composta (`sale_id`, `cattle_id`) — um bovino entra uma vez por venda |
| `expense_categories` | `id`, `name` | `id` | `name` (NOCASE) |
| `expense_subcategories` | `id`, (`category_id`, `name`) | `id` | composta (`category_id`, `name`) |
| `expenses` | `id` (só) | `id` | — |

### Normalização (V1.1)

Critério: 3FN basta. Todas as PKs são surrogate de coluna única, logo a 2FN é
automática em todas as tabelas (sem dependência parcial possível). Vereditos:

**Passam em 3FN (13 tabelas):** `herds`, `cattle` (as FKs `herd_id`,
`pasture_id` e `mother_id` são fatos do vínculo, não transitividade),
`herd_memberships`, `grass_types`, `pastures`, `pasture_movements`,
`vaccinations`, `health_events`, `sales` (`gross_amount_cents` é entrada
independente — RF-19.1 — não derivável dos itens), `sale_items`,
`expense_categories`, `expense_subcategories`, `expenses` (nomes só via `JOIN`;
os `*Nome` nos tipos TS são display, não coluna).

**Exceções justificadas (2):**

1. `pasture_inspections.quality` — redundância calculada intencional: depende
   de altura, condição, cobertura e da faixa ideal do capim. Gravada porque o
   histórico é imutável (RF-15.3); recalcular o passado reescreveria história.
   Regra: o app recalcula a cada `INSERT`, nunca em `UPDATE`.
2. `reproductive_events.expected_calving_date` — função determinística de
   `breeding_date` (RF-09), gravada por conveniência de consulta e relatório.
   Mesma regra: recalculada a cada escrita.
