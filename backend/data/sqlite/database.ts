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
