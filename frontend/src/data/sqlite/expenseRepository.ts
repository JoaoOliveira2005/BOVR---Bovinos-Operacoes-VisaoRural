import type { SQLiteDatabase } from 'expo-sqlite';

import { ErroDominio } from '../../domain/errors';
import type {
  CategoriaGasto,
  EntradaGasto,
  Gasto,
  RepositorioCategoriasGasto,
  RepositorioGastos,
  SubcategoriaGasto,
} from '../../features/expenses/types';
import { converterErroSqlite } from './errors';

type LinhaGasto = {
  id: number;
  description: string;
  category_id: number;
  category_name: string;
  subcategory_id: number | null;
  subcategory_name: string | null;
  amount_cents: number;
  expense_date: string;
};

const SELECT_GASTO = `
SELECT e.id, e.description, e.category_id, c.name AS category_name,
       e.subcategory_id, s.name AS subcategory_name, e.amount_cents, e.expense_date
FROM expenses e
JOIN expense_categories c ON c.id = e.category_id
LEFT JOIN expense_subcategories s ON s.id = e.subcategory_id`;

function mapearGasto(linha: LinhaGasto): Gasto {
  return {
    id: linha.id,
    descricao: linha.description,
    categoriaId: linha.category_id,
    categoriaNome: linha.category_name,
    subcategoriaId: linha.subcategory_id,
    subcategoriaNome: linha.subcategory_name,
    valorCentavos: linha.amount_cents,
    data: linha.expense_date,
  };
}

export class RepositorioGastosSqlite implements RepositorioGastos {
  constructor(private readonly db: SQLiteDatabase) {}

  async listar(): Promise<Gasto[]> {
    const linhas = await this.db.getAllAsync<LinhaGasto>(
      `${SELECT_GASTO} ORDER BY e.expense_date DESC, e.id DESC`,
    );
    return linhas.map(mapearGasto);
  }

  async obter(id: number): Promise<Gasto | null> {
    const linha = await this.db.getFirstAsync<LinhaGasto>(`${SELECT_GASTO} WHERE e.id = ?`, id);
    return linha ? mapearGasto(linha) : null;
  }

  async criar(entrada: EntradaGasto): Promise<number> {
    try {
      const resultado = await this.db.runAsync(
        `INSERT INTO expenses
         (description, category_id, subcategory_id, amount_cents, expense_date)
         VALUES (?, ?, ?, ?, ?)`,
        entrada.descricao,
        entrada.categoriaId,
        entrada.subcategoriaId,
        entrada.valorCentavos,
        entrada.data,
      );
      return resultado.lastInsertRowId;
    } catch (erro) {
      converterErroSqlite(erro, 'Gasto');
    }
  }

  async atualizar(id: number, entrada: EntradaGasto): Promise<void> {
    try {
      const resultado = await this.db.runAsync(
        `UPDATE expenses SET description = ?, category_id = ?, subcategory_id = ?,
         amount_cents = ?, expense_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        entrada.descricao,
        entrada.categoriaId,
        entrada.subcategoriaId,
        entrada.valorCentavos,
        entrada.data,
        id,
      );
      if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Gasto não encontrado.');
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Gasto');
    }
  }

  async excluir(id: number): Promise<void> {
    const resultado = await this.db.runAsync('DELETE FROM expenses WHERE id = ?', id);
    if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Gasto não encontrado.');
  }
}

export class RepositorioCategoriasGastoSqlite implements RepositorioCategoriasGasto {
  constructor(private readonly db: SQLiteDatabase) {}

  async listarCategorias(): Promise<CategoriaGasto[]> {
    const linhas = await this.db.getAllAsync<{ id: number; name: string; is_system: number }>(
      'SELECT id, name, is_system FROM expense_categories ORDER BY is_system DESC, name COLLATE NOCASE',
    );
    return linhas.map((linha) => ({ id: linha.id, nome: linha.name, protegida: linha.is_system === 1 }));
  }

  async listarSubcategorias(categoriaId?: number): Promise<SubcategoriaGasto[]> {
    const sql = `SELECT id, category_id, name FROM expense_subcategories
      ${categoriaId ? 'WHERE category_id = ?' : ''} ORDER BY name COLLATE NOCASE`;
    const linhas = categoriaId
      ? await this.db.getAllAsync<{ id: number; category_id: number; name: string }>(sql, categoriaId)
      : await this.db.getAllAsync<{ id: number; category_id: number; name: string }>(sql);
    return linhas.map((linha) => ({ id: linha.id, categoriaId: linha.category_id, nome: linha.name }));
  }

  async criarCategoria(nome: string): Promise<number> {
    try {
      const resultado = await this.db.runAsync(
        'INSERT INTO expense_categories (name, is_system) VALUES (?, 0)',
        nome,
      );
      return resultado.lastInsertRowId;
    } catch (erro) {
      converterErroSqlite(erro, 'Categoria');
    }
  }

  async atualizarCategoria(id: number, nome: string): Promise<void> {
    await this.exigirNaoProtegida(id);
    try {
      const resultado = await this.db.runAsync(
        'UPDATE expense_categories SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        nome,
        id,
      );
      if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Categoria não encontrada.');
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Categoria');
    }
  }

  async excluirCategoria(id: number): Promise<void> {
    await this.exigirNaoProtegida(id);
    try {
      const resultado = await this.db.runAsync('DELETE FROM expense_categories WHERE id = ?', id);
      if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Categoria não encontrada.');
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Categoria');
    }
  }

  async criarSubcategoria(categoriaId: number, nome: string): Promise<number> {
    try {
      const resultado = await this.db.runAsync(
        'INSERT INTO expense_subcategories (category_id, name) VALUES (?, ?)',
        categoriaId,
        nome,
      );
      return resultado.lastInsertRowId;
    } catch (erro) {
      converterErroSqlite(erro, 'Subcategoria');
    }
  }

  async atualizarSubcategoria(id: number, nome: string): Promise<void> {
    try {
      const resultado = await this.db.runAsync(
        'UPDATE expense_subcategories SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        nome,
        id,
      );
      if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Subcategoria não encontrada.');
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Subcategoria');
    }
  }

  async excluirSubcategoria(id: number): Promise<void> {
    try {
      const resultado = await this.db.runAsync('DELETE FROM expense_subcategories WHERE id = ?', id);
      if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Subcategoria não encontrada.');
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Subcategoria');
    }
  }

  private async exigirNaoProtegida(id: number): Promise<void> {
    const categoria = await this.db.getFirstAsync<{ is_system: number }>(
      'SELECT is_system FROM expense_categories WHERE id = ?',
      id,
    );
    if (!categoria) throw new ErroDominio('nao_encontrado', 'Categoria não encontrada.');
    if (categoria.is_system === 1) {
      throw new ErroDominio('protegido', 'As categorias iniciais não podem ser renomeadas ou excluídas.');
    }
  }
}
