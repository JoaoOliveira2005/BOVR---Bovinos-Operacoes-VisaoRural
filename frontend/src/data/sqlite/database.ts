import type { SQLiteDatabase } from 'expo-sqlite';

const VERSAO_BANCO = 1;

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

export async function inicializarBanco(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const versao = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const atual = versao?.user_version ?? 0;
  if (atual >= VERSAO_BANCO) return;

  await db.execAsync('BEGIN IMMEDIATE;');
  try {
    if (atual < 1) await db.execAsync(MIGRACAO_1);
    await db.execAsync(`PRAGMA user_version = ${VERSAO_BANCO};`);
    await db.execAsync('COMMIT;');
  } catch (erro) {
    await db.execAsync('ROLLBACK;');
    throw erro;
  }
}
