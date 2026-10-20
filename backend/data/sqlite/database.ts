import type { SQLiteDatabase } from 'expo-sqlite';

const VERSAO_BANCO = 3;

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
  name TEXT NOT NULL,
  area_hectares REAL NOT NULL CHECK (area_hectares > 0),
  grass_type_id INTEGER NOT NULL,
  current_height_cm REAL NOT NULL CHECK (current_height_cm >= 0),
  grass_condition TEXT NOT NULL CHECK (grass_condition IN ('verde', 'parcialmente_seco', 'seco')),
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
  ear_tag TEXT NOT NULL COLLATE NOCASE CHECK (length(trim(ear_tag)) > 0),
  sex TEXT NOT NULL CHECK (sex IN ('macho', 'femea')),
  birth_date TEXT,
  estimated_age_months INTEGER CHECK (
    estimated_age_months IS NULL OR
    (typeof(estimated_age_months) = 'integer' AND estimated_age_months BETWEEN 0 AND 360)
  ),
  breed TEXT NOT NULL CHECK (length(trim(breed)) > 0),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'ativo'
    CHECK (status IN ('ativo', 'vendido', 'morto', 'transferido')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((birth_date IS NOT NULL AND estimated_age_months IS NULL) OR
         (birth_date IS NULL AND estimated_age_months IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cattle_active_ear_tag
  ON cattle(trim(ear_tag) COLLATE NOCASE) WHERE status = 'ativo';
CREATE INDEX IF NOT EXISTS idx_cattle_ear_tag
  ON cattle(trim(ear_tag) COLLATE NOCASE);
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
  grass_condition TEXT NOT NULL CHECK (grass_condition IN ('verde', 'parcialmente_seco', 'seco')),
  coverage_percent INTEGER NOT NULL CHECK (typeof(coverage_percent) = 'integer' AND coverage_percent BETWEEN 0 AND 100),
  quality TEXT NOT NULL CHECK (quality IN ('boa', 'regular', 'ruim')),
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
WHEN NEW.status <> 'ativo' AND NEW.pasture_id IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'Retire o animal do pasto antes de alterar sua situação.');
END;
`;

export async function inicializarBanco(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const versao = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const atual = versao?.user_version ?? 0;
  if (atual >= VERSAO_BANCO) return;

  await db.execAsync('BEGIN IMMEDIATE;');
  try {
    if (atual < 1) await db.execAsync(MIGRACAO_1);
    if (atual < 2) await db.execAsync(MIGRACAO_2);
    if (atual < 3) await db.execAsync(MIGRACAO_3);
    await db.execAsync(`PRAGMA user_version = ${VERSAO_BANCO};`);
    await db.execAsync('COMMIT;');
  } catch (erro) {
    await db.execAsync('ROLLBACK;');
    throw erro;
  }
}
