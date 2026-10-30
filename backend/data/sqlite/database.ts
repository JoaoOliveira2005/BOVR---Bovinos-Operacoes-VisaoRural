import type { SQLiteDatabase } from 'expo-sqlite';

const VERSAO_BANCO = 4;

const MIGRACAO_1 = `
CREATE TABLE IF NOT EXISTS grass_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  min_height_cm REAL NOT NULL CHECK (min_height_cm >= 0),
  max_height_cm REAL NOT NULL CHECK (max_height_cm >= min_height_cm),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pastures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  area_hectares REAL NOT NULL CHECK (area_hectares > 0),
  grass_type_id INTEGER NOT NULL,
  current_height_cm REAL NOT NULL CHECK (current_height_cm >= 0),
  grass_condition TEXT NOT NULL CHECK (grass_condition IN ('green', 'partly_dry', 'dry')),
  coverage_percent INTEGER NOT NULL CHECK (coverage_percent BETWEEN 0 AND 100),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grass_type_id) REFERENCES grass_types(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_pastures_grass_type ON pastures(grass_type_id);

CREATE TABLE IF NOT EXISTS expense_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expense_subcategories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL COLLATE NOCASE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (category_id, name),
  FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_expense_subcategories_category
  ON expense_subcategories(category_id);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  subcategory_id INTEGER,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  expense_date TEXT NOT NULL CHECK (expense_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (subcategory_id) REFERENCES expense_subcategories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);

INSERT OR IGNORE INTO expense_categories (name, is_system) VALUES ('Água', 1);
INSERT OR IGNORE INTO expense_categories (name, is_system) VALUES ('Ração', 1);
INSERT OR IGNORE INTO expense_categories (name, is_system) VALUES ('Mão de obra', 1);
INSERT OR IGNORE INTO expense_categories (name, is_system) VALUES ('Infraestrutura', 1);
`;

// O índice parcial permite reutilizar brincos de animais fora do rebanho ativo.
const MIGRACAO_2 = `
CREATE TABLE IF NOT EXISTS cattle (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_number TEXT NOT NULL COLLATE NOCASE CHECK (length(trim(tag_number)) > 0),
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  birth_date TEXT,
  estimated_age_months INTEGER CHECK (
    estimated_age_months IS NULL OR
    (typeof(estimated_age_months) = 'integer' AND estimated_age_months BETWEEN 0 AND 360)
  ),
  breed TEXT NOT NULL CHECK (length(trim(breed)) > 0),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'sold', 'dead', 'transferred')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((birth_date IS NOT NULL AND estimated_age_months IS NULL) OR
         (birth_date IS NULL AND estimated_age_months IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cattle_active_tag_number
  ON cattle(trim(tag_number) COLLATE NOCASE) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_cattle_tag_number
  ON cattle(trim(tag_number) COLLATE NOCASE);
`;

const MIGRACAO_3 = `
CREATE TABLE herds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (length(trim(name)) > 0),
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE cattle ADD COLUMN herd_id INTEGER REFERENCES herds(id) ON DELETE RESTRICT;
ALTER TABLE cattle ADD COLUMN pasture_id INTEGER REFERENCES pastures(id) ON DELETE RESTRICT;
CREATE INDEX idx_cattle_herd ON cattle(herd_id);
CREATE INDEX idx_cattle_pasture ON cattle(pasture_id);

CREATE TABLE pasture_inspections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pasture_id INTEGER NOT NULL REFERENCES pastures(id) ON DELETE RESTRICT,
  inspected_on TEXT NOT NULL CHECK (inspected_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  grass_type_id INTEGER NOT NULL REFERENCES grass_types(id) ON DELETE RESTRICT,
  min_height_cm REAL NOT NULL CHECK (min_height_cm >= 0),
  max_height_cm REAL NOT NULL CHECK (max_height_cm >= min_height_cm),
  grass_height_cm REAL NOT NULL CHECK (grass_height_cm >= 0),
  grass_condition TEXT NOT NULL CHECK (grass_condition IN ('green', 'partly_dry', 'dry')),
  coverage_percent INTEGER NOT NULL CHECK (typeof(coverage_percent) = 'integer' AND coverage_percent BETWEEN 0 AND 100),
  quality TEXT NOT NULL CHECK (quality IN ('good', 'fair', 'poor')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pasture_inspections_date ON pasture_inspections(pasture_id, inspected_on DESC, id DESC);

-- Cada linha guarda um animal; herd_id identifica uma movimentação de lote.
-- Assim, um lote pode sair de vários pastos sem perder as origens individuais.
CREATE TABLE pasture_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cattle_id INTEGER NOT NULL REFERENCES cattle(id) ON DELETE RESTRICT,
  herd_id INTEGER REFERENCES herds(id) ON DELETE RESTRICT,
  origin_pasture_id INTEGER REFERENCES pastures(id) ON DELETE RESTRICT,
  destination_pasture_id INTEGER REFERENCES pastures(id) ON DELETE RESTRICT,
  moved_on TEXT NOT NULL CHECK (moved_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (origin_pasture_id IS NOT destination_pasture_id)
);
CREATE INDEX idx_pasture_movements_cattle ON pasture_movements(cattle_id, moved_on DESC, id DESC);
CREATE INDEX idx_pasture_movements_origin ON pasture_movements(origin_pasture_id, moved_on DESC);
CREATE INDEX idx_pasture_movements_destination ON pasture_movements(destination_pasture_id, moved_on DESC);
CREATE INDEX idx_pasture_movements_herd ON pasture_movements(herd_id, moved_on DESC);

CREATE TABLE pasture_rest_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pasture_id INTEGER NOT NULL REFERENCES pastures(id) ON DELETE RESTRICT,
  started_on TEXT NOT NULL CHECK (started_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  ended_on TEXT CHECK (ended_on IS NULL OR (ended_on >= started_on AND ended_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'))
);
CREATE UNIQUE INDEX idx_pasture_rest_open ON pasture_rest_periods(pasture_id) WHERE ended_on IS NULL;
CREATE INDEX idx_pasture_rest_date ON pasture_rest_periods(pasture_id, started_on DESC, id DESC);

-- A baixa precisa passar pela saída datada para não perder a rotação/descanso.
CREATE TRIGGER cattle_status_requires_pasture_exit
BEFORE UPDATE OF status ON cattle
WHEN NEW.status <> 'active' AND NEW.pasture_id IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'Retire o animal do pasto antes de alterar sua situação.');
END;
`;

const TRIGGERS_VENDAS_V13 = `
DROP TRIGGER IF EXISTS trg_cattle_death_remove_from_planned_sales;
CREATE TRIGGER trg_cattle_death_remove_from_planned_sales
AFTER UPDATE OF status ON cattle
WHEN NEW.status = 'dead'
BEGIN
  DELETE FROM sale_items
  WHERE (animal_id = NEW.id OR trim(ear_tag) = trim(NEW.tag_number) COLLATE NOCASE)
    AND sale_id IN (SELECT id FROM sales WHERE sale_type = 'planejada');
END;

DROP TRIGGER IF EXISTS trg_cattle_delete_remove_from_planned_sales;
CREATE TRIGGER trg_cattle_delete_remove_from_planned_sales
AFTER DELETE ON cattle
BEGIN
  DELETE FROM sale_items
  WHERE (animal_id = OLD.id OR trim(ear_tag) = trim(OLD.tag_number) COLLATE NOCASE)
    AND sale_id IN (SELECT id FROM sales WHERE sale_type = 'planejada');
END;

DROP TRIGGER IF EXISTS trg_cleanup_empty_planned_sales;
CREATE TRIGGER trg_cleanup_empty_planned_sales
AFTER DELETE ON sale_items
BEGIN
  DELETE FROM sales
  WHERE id = OLD.sale_id
    AND sale_type = 'planejada'
    AND NOT EXISTS (SELECT 1 FROM sale_items WHERE sale_id = OLD.sale_id);
END;
`;

const MIGRACAO_4 = `
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer TEXT NOT NULL CHECK (length(trim(buyer)) > 0),
  sale_date TEXT NOT NULL CHECK (sale_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  gross_value_cents INTEGER NOT NULL CHECK (gross_value_cents > 0),
  sale_type TEXT NOT NULL DEFAULT 'realizada' CHECK (sale_type IN ('realizada', 'planejada')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  animal_id INTEGER,
  ear_tag TEXT NOT NULL,
  weight_kg REAL NOT NULL CHECK (weight_kg > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (animal_id) REFERENCES cattle(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_type ON sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_sales_buyer ON sales(buyer COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_animal ON sale_items(animal_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_ear_tag ON sale_items(ear_tag COLLATE NOCASE);

${TRIGGERS_VENDAS_V13}
`;

/**
 * Converte bancos criados antes da padronização V1.3 (onde `cattle` usava
 * `ear_tag`, `'macho'|'femea'` e `'ativo'|'vendido'|'morto'|'transferido'`, e
 * `pastures` usava `'verde'|'meio_seco'|'seco'`) para o schema V1.3 em inglês,
 * preservando todos os registros existentes.
 */
async function migrarEsquemaLegadoParaV13(db: SQLiteDatabase): Promise<void> {
  const objetos = await db.getAllAsync<{ name: string; type: string; sql: string | null }>(
    "SELECT name, type, sql FROM sqlite_master WHERE type IN ('table', 'trigger')",
  );
  const mapaTabelas = new Map<string, string>();
  const mapaTriggers = new Map<string, string>();
  for (const obj of objetos) {
    if (obj.type === 'table') mapaTabelas.set(obj.name, obj.sql ?? '');
    if (obj.type === 'trigger') mapaTriggers.set(obj.name, obj.sql ?? '');
  }

  // 1. Verifica e migra `pastures` se ainda estiver com CHECK em português ('verde')
  const sqlPastures = mapaTabelas.get('pastures') ?? '';
  if (sqlPastures.includes("'verde'")) {
    console.log('[BancoDados] Migrando tabela pastures para schema V1.3...');
    await db.execAsync('PRAGMA foreign_keys = OFF;');
    await db.execAsync('BEGIN IMMEDIATE;');
    try {
      await db.execAsync(`
        DROP INDEX IF EXISTS idx_pastures_grass_type;
        CREATE TABLE pastures_v13 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL COLLATE NOCASE UNIQUE,
          area_hectares REAL NOT NULL CHECK (area_hectares > 0),
          grass_type_id INTEGER NOT NULL,
          current_height_cm REAL NOT NULL CHECK (current_height_cm >= 0),
          grass_condition TEXT NOT NULL CHECK (grass_condition IN ('green', 'partly_dry', 'dry')),
          coverage_percent INTEGER NOT NULL CHECK (coverage_percent BETWEEN 0 AND 100),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (grass_type_id) REFERENCES grass_types(id) ON DELETE RESTRICT
        );
        INSERT INTO pastures_v13 (
          id, name, area_hectares, grass_type_id, current_height_cm, grass_condition, coverage_percent, created_at, updated_at
        )
        SELECT
          id, name, area_hectares, grass_type_id, current_height_cm,
          CASE grass_condition
            WHEN 'verde' THEN 'green'
            WHEN 'meio_seco' THEN 'partly_dry'
            WHEN 'seco' THEN 'dry'
            WHEN 'partly_dry' THEN 'partly_dry'
            WHEN 'dry' THEN 'dry'
            ELSE 'green'
          END,
          coverage_percent, created_at, updated_at
        FROM pastures;
        DROP TABLE pastures;
        ALTER TABLE pastures_v13 RENAME TO pastures;
        CREATE INDEX IF NOT EXISTS idx_pastures_grass_type ON pastures(grass_type_id);
      `);
      await db.execAsync('COMMIT;');
    } catch (erro) {
      await db.execAsync('ROLLBACK;').catch(() => undefined);
      console.error('[BancoDados] Falha ao migrar tabela pastures para V1.3:', erro);
      throw erro;
    } finally {
      await db.execAsync('PRAGMA foreign_keys = ON;');
    }
  }

  // 2. Verifica e migra `pasture_inspections` se ainda estiver com CHECK em português ('verde' / 'boa')
  const sqlInspections = mapaTabelas.get('pasture_inspections') ?? '';
  if (sqlInspections.includes("'verde'") || sqlInspections.includes("'boa'")) {
    console.log('[BancoDados] Migrando tabela pasture_inspections para schema V1.3...');
    await db.execAsync('PRAGMA foreign_keys = OFF;');
    await db.execAsync('BEGIN IMMEDIATE;');
    try {
      await db.execAsync(`
        DROP INDEX IF EXISTS idx_pasture_inspections_date;
        CREATE TABLE pasture_inspections_v13 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pasture_id INTEGER NOT NULL REFERENCES pastures(id) ON DELETE RESTRICT,
          inspected_on TEXT NOT NULL CHECK (inspected_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
          grass_type_id INTEGER NOT NULL REFERENCES grass_types(id) ON DELETE RESTRICT,
          min_height_cm REAL NOT NULL CHECK (min_height_cm >= 0),
          max_height_cm REAL NOT NULL CHECK (max_height_cm >= min_height_cm),
          grass_height_cm REAL NOT NULL CHECK (grass_height_cm >= 0),
          grass_condition TEXT NOT NULL CHECK (grass_condition IN ('green', 'partly_dry', 'dry')),
          coverage_percent INTEGER NOT NULL CHECK (typeof(coverage_percent) = 'integer' AND coverage_percent BETWEEN 0 AND 100),
          quality TEXT NOT NULL CHECK (quality IN ('good', 'fair', 'poor')),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO pasture_inspections_v13 (
          id, pasture_id, inspected_on, grass_type_id, min_height_cm, max_height_cm, grass_height_cm, grass_condition, coverage_percent, quality, created_at
        )
        SELECT
          id, pasture_id, inspected_on, grass_type_id, min_height_cm, max_height_cm, grass_height_cm,
          CASE grass_condition
            WHEN 'verde' THEN 'green'
            WHEN 'meio_seco' THEN 'partly_dry'
            WHEN 'seco' THEN 'dry'
            WHEN 'partly_dry' THEN 'partly_dry'
            WHEN 'dry' THEN 'dry'
            ELSE 'green'
          END,
          coverage_percent,
          CASE quality
            WHEN 'boa' THEN 'good'
            WHEN 'regular' THEN 'fair'
            WHEN 'ruim' THEN 'poor'
            WHEN 'fair' THEN 'fair'
            WHEN 'poor' THEN 'poor'
            ELSE 'good'
          END,
          created_at
        FROM pasture_inspections;
        DROP TABLE pasture_inspections;
        ALTER TABLE pasture_inspections_v13 RENAME TO pasture_inspections;
        CREATE INDEX IF NOT EXISTS idx_pasture_inspections_date ON pasture_inspections(pasture_id, inspected_on DESC, id DESC);
      `);
      await db.execAsync('COMMIT;');
    } catch (erro) {
      await db.execAsync('ROLLBACK;').catch(() => undefined);
      console.error('[BancoDados] Falha ao migrar tabela pasture_inspections para V1.3:', erro);
      throw erro;
    } finally {
      await db.execAsync('PRAGMA foreign_keys = ON;');
    }
  }

  // 3. Verifica e migra `cattle` se ainda usar `ear_tag` ou CHECK em português ('macho' / 'ativo')
  if (mapaTabelas.has('cattle')) {
    const colunasCattle = await db.getAllAsync<{ name: string }>('PRAGMA table_info(cattle);');
    const nomesCols = new Set(colunasCattle.map((c) => c.name));
    const sqlCattle = mapaTabelas.get('cattle') ?? '';
    const precisaMigrarCattle =
      !nomesCols.has('tag_number') ||
      sqlCattle.includes("'macho'") ||
      sqlCattle.includes("'ativo'");

    if (precisaMigrarCattle) {
      console.log('[BancoDados] Migrando tabela cattle (ear_tag -> tag_number e enums V1.3)...');
      const colBrinco = nomesCols.has('tag_number') ? 'tag_number' : 'ear_tag';
      const exprHerd = nomesCols.has('herd_id') ? 'herd_id' : 'NULL';
      const exprPasture = nomesCols.has('pasture_id') ? 'pasture_id' : 'NULL';

      await db.execAsync('PRAGMA foreign_keys = OFF;');
      await db.execAsync('BEGIN IMMEDIATE;');
      try {
        await db.execAsync(`
          DROP TRIGGER IF EXISTS cattle_status_requires_pasture_exit;
          DROP TRIGGER IF EXISTS trg_cattle_death_remove_from_planned_sales;
          DROP TRIGGER IF EXISTS trg_cattle_delete_remove_from_planned_sales;
          DROP INDEX IF EXISTS idx_cattle_active_ear_tag;
          DROP INDEX IF EXISTS idx_cattle_ear_tag;
          DROP INDEX IF EXISTS idx_cattle_active_tag_number;
          DROP INDEX IF EXISTS idx_cattle_tag_number;
          DROP INDEX IF EXISTS idx_cattle_herd;
          DROP INDEX IF EXISTS idx_cattle_pasture;

          CREATE TABLE cattle_v13 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag_number TEXT NOT NULL COLLATE NOCASE CHECK (length(trim(tag_number)) > 0),
            sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
            birth_date TEXT,
            estimated_age_months INTEGER CHECK (
              estimated_age_months IS NULL OR
              (typeof(estimated_age_months) = 'integer' AND estimated_age_months BETWEEN 0 AND 360)
            ),
            breed TEXT NOT NULL CHECK (length(trim(breed)) > 0),
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'sold', 'dead', 'transferred')),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            herd_id INTEGER REFERENCES herds(id) ON DELETE RESTRICT,
            pasture_id INTEGER REFERENCES pastures(id) ON DELETE RESTRICT,
            CHECK ((birth_date IS NOT NULL AND estimated_age_months IS NULL) OR
                   (birth_date IS NULL AND estimated_age_months IS NOT NULL))
          );

          INSERT INTO cattle_v13 (
            id, tag_number, sex, birth_date, estimated_age_months,
            breed, notes, status, created_at, updated_at, herd_id, pasture_id
          )
          SELECT
            id,
            ${colBrinco},
            CASE sex
              WHEN 'macho' THEN 'male'
              WHEN 'femea' THEN 'female'
              WHEN 'female' THEN 'female'
              ELSE 'male'
            END,
            birth_date,
            estimated_age_months,
            breed,
            notes,
            CASE status
              WHEN 'ativo' THEN 'active'
              WHEN 'vendido' THEN 'sold'
              WHEN 'morto' THEN 'dead'
              WHEN 'transferido' THEN 'transferred'
              WHEN 'sold' THEN 'sold'
              WHEN 'dead' THEN 'dead'
              WHEN 'transferred' THEN 'transferred'
              ELSE 'active'
            END,
            created_at,
            updated_at,
            ${exprHerd},
            ${exprPasture}
          FROM cattle;

          DROP TABLE cattle;
          ALTER TABLE cattle_v13 RENAME TO cattle;

          CREATE UNIQUE INDEX IF NOT EXISTS idx_cattle_active_tag_number
            ON cattle(trim(tag_number) COLLATE NOCASE) WHERE status = 'active';
          CREATE INDEX IF NOT EXISTS idx_cattle_tag_number
            ON cattle(trim(tag_number) COLLATE NOCASE);
          CREATE INDEX IF NOT EXISTS idx_cattle_herd ON cattle(herd_id);
          CREATE INDEX IF NOT EXISTS idx_cattle_pasture ON cattle(pasture_id);
        `);
        await db.execAsync('COMMIT;');
      } catch (erro) {
        await db.execAsync('ROLLBACK;').catch(() => undefined);
        console.error('[BancoDados] Falha ao migrar tabela cattle para V1.3:', erro);
        throw erro;
      } finally {
        await db.execAsync('PRAGMA foreign_keys = ON;');
      }
    } else {
      // Garante colunas herd_id e pasture_id mesmo que tag_number já exista
      if (!nomesCols.has('herd_id')) {
        await db.execAsync('ALTER TABLE cattle ADD COLUMN herd_id INTEGER REFERENCES herds(id) ON DELETE RESTRICT;');
      }
      if (!nomesCols.has('pasture_id')) {
        await db.execAsync('ALTER TABLE cattle ADD COLUMN pasture_id INTEGER REFERENCES pastures(id) ON DELETE RESTRICT;');
      }
    }

    // Garante que a trigger de saída do pasto esteja alinhada ao status 'active'
    const sqlTriggerPasto = mapaTriggers.get('cattle_status_requires_pasture_exit') ?? '';
    if (!sqlTriggerPasto || sqlTriggerPasto.includes("'ativo'") || ! mapaTriggers.has('cattle_status_requires_pasture_exit')) {
      await db.execAsync(`
        DROP TRIGGER IF EXISTS cattle_status_requires_pasture_exit;
        CREATE TRIGGER cattle_status_requires_pasture_exit
        BEFORE UPDATE OF status ON cattle
        WHEN NEW.status <> 'active' AND NEW.pasture_id IS NOT NULL
        BEGIN
          SELECT RAISE(ABORT, 'Retire o animal do pasto antes de alterar sua situação.');
        END;
      `);
    }
  }
}

async function garantirTabelasCriticas(db: SQLiteDatabase): Promise<void> {
  await migrarEsquemaLegadoParaV13(db);

  const tabelas = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table'",
  );
  const nomes = new Set(tabelas.map((t) => t.name));

  if (!nomes.has('pasture_inspections') && nomes.has('pastures')) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS herds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (length(trim(name)) > 0),
        description TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS pasture_inspections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pasture_id INTEGER NOT NULL REFERENCES pastures(id) ON DELETE RESTRICT,
        inspected_on TEXT NOT NULL CHECK (inspected_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
        grass_type_id INTEGER NOT NULL REFERENCES grass_types(id) ON DELETE RESTRICT,
        min_height_cm REAL NOT NULL CHECK (min_height_cm >= 0),
        max_height_cm REAL NOT NULL CHECK (max_height_cm >= min_height_cm),
        grass_height_cm REAL NOT NULL CHECK (grass_height_cm >= 0),
        grass_condition TEXT NOT NULL CHECK (grass_condition IN ('green', 'partly_dry', 'dry')),
        coverage_percent INTEGER NOT NULL CHECK (typeof(coverage_percent) = 'integer' AND coverage_percent BETWEEN 0 AND 100),
        quality TEXT NOT NULL CHECK (quality IN ('good', 'fair', 'poor')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_pasture_inspections_date ON pasture_inspections(pasture_id, inspected_on DESC, id DESC);
      CREATE TABLE IF NOT EXISTS pasture_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cattle_id INTEGER NOT NULL REFERENCES cattle(id) ON DELETE RESTRICT,
        herd_id INTEGER REFERENCES herds(id) ON DELETE RESTRICT,
        origin_pasture_id INTEGER REFERENCES pastures(id) ON DELETE RESTRICT,
        destination_pasture_id INTEGER REFERENCES pastures(id) ON DELETE RESTRICT,
        moved_on TEXT NOT NULL CHECK (moved_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (origin_pasture_id IS NOT destination_pasture_id)
      );
      CREATE TABLE IF NOT EXISTS pasture_rest_periods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pasture_id INTEGER NOT NULL REFERENCES pastures(id) ON DELETE RESTRICT,
        started_on TEXT NOT NULL CHECK (started_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
        ended_on TEXT CHECK (ended_on IS NULL OR (ended_on >= started_on AND ended_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'))
      );
    `);
  }

  if (!nomes.has('sales') && nomes.has('cattle')) {
    await db.execAsync(MIGRACAO_4);
  } else if (nomes.has('sales') && nomes.has('cattle')) {
    // Garante que as triggers de vendas usem NEW.tag_number / OLD.tag_number e 'dead'
    await db.execAsync(TRIGGERS_VENDAS_V13);
  }
}

export async function inicializarBanco(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const versao = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const atual = versao?.user_version ?? 0;
  if (atual >= VERSAO_BANCO) {
    await garantirTabelasCriticas(db);
    return;
  }

  await db.execAsync('BEGIN IMMEDIATE;');
  try {
    if (atual < 1) await db.execAsync(MIGRACAO_1);
    if (atual < 2) await db.execAsync(MIGRACAO_2);
    if (atual < 3) await db.execAsync(MIGRACAO_3);
    if (atual < 4) await db.execAsync(MIGRACAO_4);
    await db.execAsync(`PRAGMA user_version = ${VERSAO_BANCO};`);
    await db.execAsync('COMMIT;');
  } catch (erro) {
    await db.execAsync('ROLLBACK;');
    console.error('[BancoDados] Erro durante migração inicial:', erro);
    throw erro;
  }

  // Se o banco veio de uma versão intermediária (ex.: user_version 2 ou 3 anterior à V1.3),
  // garante que tabelas e triggers legadas sejam atualizadas para o padrão V1.3.
  if (atual > 0) {
    await garantirTabelasCriticas(db);
  }
}
