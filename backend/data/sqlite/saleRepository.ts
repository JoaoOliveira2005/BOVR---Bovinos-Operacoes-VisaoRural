import type { SQLiteDatabase } from 'expo-sqlite';

import { ErroDominio } from '../../domain/errors';
import type {
  EntradaVenda,
  FiltroVendas,
  ItemVenda,
  RepositorioVendas,
  TipoVenda,
  Venda,
} from '../../features/sales/types';
import { converterErroSqlite } from './errors';

type LinhaVenda = {
  id: number;
  buyer: string;
  sale_date: string;
  gross_value_cents: number;
  sale_type: TipoVenda;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type LinhaItem = {
  id: number;
  sale_id: number;
  animal_id: number | null;
  ear_tag: string;
  weight_kg: number;
};

export class RepositorioVendasSqlite implements RepositorioVendas {
  constructor(private readonly db: SQLiteDatabase) {}

  async listar(filtro?: FiltroVendas): Promise<Venda[]> {
    const condicoes: string[] = [];
    const parametros: (string | number)[] = [];

    if (filtro?.tipo) {
      condicoes.push('s.sale_type = ?');
      parametros.push(filtro.tipo);
    }

    if (filtro?.dataInicio) {
      condicoes.push('s.sale_date >= ?');
      parametros.push(filtro.dataInicio);
    }

    if (filtro?.dataFim) {
      condicoes.push('s.sale_date <= ?');
      parametros.push(filtro.dataFim);
    }

    if (filtro?.comprador) {
      condicoes.push('s.buyer LIKE ?');
      parametros.push(`%${filtro.comprador.trim()}%`);
    }

    if (filtro?.brinco) {
      condicoes.push(`EXISTS (
        SELECT 1 FROM sale_items si
        WHERE si.sale_id = s.id AND trim(si.ear_tag) = ? COLLATE NOCASE
      )`);
      parametros.push(filtro.brinco.trim());
    }

    const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';
    const sql = `SELECT s.id, s.buyer, s.sale_date, s.gross_value_cents,
                        s.sale_type, s.notes, s.created_at, s.updated_at
                 FROM sales s
                 ${where}
                 ORDER BY s.sale_date DESC, s.id DESC`;

    const linhas = await this.db.getAllAsync<LinhaVenda>(sql, ...parametros);
    if (linhas.length === 0) return [];

    const ids = linhas.map((l) => l.id);
    const placeholders = ids.map(() => '?').join(',');
    const itens = await this.db.getAllAsync<LinhaItem>(
      `SELECT id, sale_id, animal_id, ear_tag, weight_kg
       FROM sale_items
       WHERE sale_id IN (${placeholders})
       ORDER BY id ASC`,
      ...ids,
    );

    const itensPorVenda = new Map<number, ItemVenda[]>();
    for (const item of itens) {
      const lista = itensPorVenda.get(item.sale_id) ?? [];
      lista.push({
        id: item.id,
        animalId: item.animal_id,
        brinco: item.ear_tag,
        pesoKg: item.weight_kg,
      });
      itensPorVenda.set(item.sale_id, lista);
    }

    return linhas.map((linha) => {
      const itensVenda = itensPorVenda.get(linha.id) ?? [];
      const pesoTotal = itensVenda.reduce((acc, it) => acc + it.pesoKg, 0);
      return {
        id: linha.id,
        tipo: linha.sale_type,
        comprador: linha.buyer,
        data: linha.sale_date,
        valorBrutoCentavos: linha.gross_value_cents,
        observacoes: linha.notes,
        itens: itensVenda,
        quantidadeAnimais: itensVenda.length,
        pesoTotalKg: Number(pesoTotal.toFixed(2)),
        criadoEm: linha.created_at,
        atualizadoEm: linha.updated_at,
      };
    });
  }

  async obter(id: number): Promise<Venda | null> {
    const linha = await this.db.getFirstAsync<LinhaVenda>(
      `SELECT id, buyer, sale_date, gross_value_cents,
              sale_type, notes, created_at, updated_at
       FROM sales
       WHERE id = ?`,
      id,
    );

    if (!linha) return null;

    const itens = await this.db.getAllAsync<LinhaItem>(
      `SELECT id, sale_id, animal_id, ear_tag, weight_kg
       FROM sale_items
       WHERE sale_id = ?
       ORDER BY id ASC`,
      id,
    );

    const itensMapeados: ItemVenda[] = itens.map((item) => ({
      id: item.id,
      animalId: item.animal_id,
      brinco: item.ear_tag,
      pesoKg: item.weight_kg,
    }));

    const pesoTotal = itensMapeados.reduce((acc, it) => acc + it.pesoKg, 0);

    return {
      id: linha.id,
      tipo: linha.sale_type,
      comprador: linha.buyer,
      data: linha.sale_date,
      valorBrutoCentavos: linha.gross_value_cents,
      observacoes: linha.notes,
      itens: itensMapeados,
      quantidadeAnimais: itensMapeados.length,
      pesoTotalKg: Number(pesoTotal.toFixed(2)),
      criadoEm: linha.created_at,
      atualizadoEm: linha.updated_at,
    };
  }

  async criar(entrada: EntradaVenda): Promise<number> {
    try {
      await this.db.execAsync('BEGIN IMMEDIATE;');

      const resultadoVenda = await this.db.runAsync(
        `INSERT INTO sales (buyer, sale_date, gross_value_cents, sale_type, notes)
         VALUES (?, ?, ?, ?, ?)`,
        entrada.comprador,
        entrada.data,
        entrada.valorBrutoCentavos,
        entrada.tipo,
        entrada.observacoes ?? null,
      );

      const saleId = resultadoVenda.lastInsertRowId;

      for (const item of entrada.itens) {
        let animalId = item.animalId ?? null;

        // Se animalId não foi passado, procura se existe animal ativo com este brinco
        if (!animalId) {
          const animalAtivo = await this.db.getFirstAsync<{ id: number }>(
            `SELECT id FROM cattle WHERE trim(tag_number) = ? COLLATE NOCASE AND status = 'active' LIMIT 1`,
            item.brinco.trim(),
          );
          if (animalAtivo) {
            animalId = animalAtivo.id;
          }
        }

        await this.db.runAsync(
          `INSERT INTO sale_items (sale_id, animal_id, ear_tag, weight_kg)
           VALUES (?, ?, ?, ?)`,
          saleId,
          animalId,
          item.brinco.trim(),
          item.pesoKg,
        );

        // RF-19.3: Se a venda for realizada, atualiza o status do animal para 'sold'
        if (entrada.tipo === 'realizada') {
          if (animalId) {
            await this.db.runAsync(
              `UPDATE cattle SET status = 'sold', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
              animalId,
            );
          } else {
            await this.db.runAsync(
              `UPDATE cattle SET status = 'sold', updated_at = CURRENT_TIMESTAMP
               WHERE trim(tag_number) = ? COLLATE NOCASE AND status = 'active'`,
              item.brinco.trim(),
            );
          }

          // Desconsidera este animal de outras vendas planejadas
          await this.db.runAsync(
            `DELETE FROM sale_items
             WHERE sale_id IN (SELECT id FROM sales WHERE sale_type = 'planejada')
               AND (animal_id = ? OR trim(ear_tag) = ? COLLATE NOCASE)`,
            animalId,
            item.brinco.trim(),
          );
        }
      }

      // Remove vendas planejadas que ficaram sem animais
      await this.db.runAsync(
        `DELETE FROM sales
         WHERE sale_type = 'planejada'
           AND NOT EXISTS (SELECT 1 FROM sale_items WHERE sale_items.sale_id = sales.id)`,
      );

      await this.db.execAsync('COMMIT;');
      return saleId;
    } catch (erro) {
      await this.db.execAsync('ROLLBACK;').catch(() => undefined);
      converterErroSqlite(erro, 'Venda');
    }
  }

  async atualizar(id: number, entrada: EntradaVenda): Promise<void> {
    try {
      await this.db.execAsync('BEGIN IMMEDIATE;');

      const vendaAnterior = await this.db.getFirstAsync<{ sale_type: TipoVenda }>(
        `SELECT sale_type FROM sales WHERE id = ?`,
        id,
      );

      const itensAntigos = await this.db.getAllAsync<{ animal_id: number | null; ear_tag: string }>(
        `SELECT animal_id, ear_tag FROM sale_items WHERE sale_id = ?`,
        id,
      );

      const resultado = await this.db.runAsync(
        `UPDATE sales
         SET buyer = ?, sale_date = ?, gross_value_cents = ?, sale_type = ?, notes = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        entrada.comprador,
        entrada.data,
        entrada.valorBrutoCentavos,
        entrada.tipo,
        entrada.observacoes ?? null,
        id,
      );

      if (!resultado.changes) {
        throw new ErroDominio('nao_encontrado', 'Venda não encontrada.');
      }

      // Se era realizada e agora virou planejada, devolve os animais para ativos
      if (vendaAnterior?.sale_type === 'realizada' && entrada.tipo === 'planejada') {
        for (const it of itensAntigos) {
          if (it.animal_id) {
            await this.db.runAsync(
              `UPDATE cattle SET status = 'active', updated_at = CURRENT_TIMESTAMP
               WHERE id = ? AND status = 'sold'`,
              it.animal_id,
            );
          } else {
            await this.db.runAsync(
              `UPDATE cattle SET status = 'active', updated_at = CURRENT_TIMESTAMP
               WHERE trim(tag_number) = ? COLLATE NOCASE AND status = 'sold'`,
              it.ear_tag.trim(),
            );
          }
        }
      }

      // Remove itens antigos e reinsere
      await this.db.runAsync('DELETE FROM sale_items WHERE sale_id = ?', id);

      for (const item of entrada.itens) {
        let animalId = item.animalId ?? null;
        if (!animalId) {
          const animalAtivo = await this.db.getFirstAsync<{ id: number }>(
            `SELECT id FROM cattle WHERE trim(tag_number) = ? COLLATE NOCASE AND status = 'active' LIMIT 1`,
            item.brinco.trim(),
          );
          if (animalAtivo) {
            animalId = animalAtivo.id;
          }
        }

        await this.db.runAsync(
          `INSERT INTO sale_items (sale_id, animal_id, ear_tag, weight_kg)
           VALUES (?, ?, ?, ?)`,
          id,
          animalId,
          item.brinco.trim(),
          item.pesoKg,
        );

        if (entrada.tipo === 'realizada') {
          if (animalId) {
            await this.db.runAsync(
              `UPDATE cattle SET status = 'sold', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
              animalId,
            );
          } else {
            await this.db.runAsync(
              `UPDATE cattle SET status = 'sold', updated_at = CURRENT_TIMESTAMP
               WHERE trim(tag_number) = ? COLLATE NOCASE AND status = 'active'`,
              item.brinco.trim(),
            );
          }

          // Desconsidera de outras vendas planejadas
          await this.db.runAsync(
            `DELETE FROM sale_items
             WHERE sale_id IN (SELECT s.id FROM sales s WHERE s.sale_type = 'planejada' AND s.id <> ?)
               AND (animal_id = ? OR trim(ear_tag) = ? COLLATE NOCASE)`,
            id,
            animalId,
            item.brinco.trim(),
          );
        }
      }

      // Remove vendas planejadas que ficaram sem animais
      await this.db.runAsync(
        `DELETE FROM sales
         WHERE sale_type = 'planejada'
           AND NOT EXISTS (SELECT 1 FROM sale_items WHERE sale_items.sale_id = sales.id)`,
      );

      await this.db.execAsync('COMMIT;');
    } catch (erro) {
      await this.db.execAsync('ROLLBACK;').catch(() => undefined);
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Venda');
    }
  }

  async excluir(id: number): Promise<void> {
    try {
      await this.db.execAsync('BEGIN IMMEDIATE;');

      const venda = await this.db.getFirstAsync<{ sale_type: TipoVenda }>(
        `SELECT sale_type FROM sales WHERE id = ?`,
        id,
      );

      if (!venda) {
        throw new ErroDominio('nao_encontrado', 'Venda não encontrada.');
      }

      // Se a venda for realizada, devolve animais vendidos para ativos ao excluir a venda
      if (venda.sale_type === 'realizada') {
        const itens = await this.db.getAllAsync<{ animal_id: number | null; ear_tag: string }>(
          `SELECT animal_id, ear_tag FROM sale_items WHERE sale_id = ?`,
          id,
        );
        for (const it of itens) {
          if (it.animal_id) {
            await this.db.runAsync(
              `UPDATE cattle SET status = 'active', updated_at = CURRENT_TIMESTAMP
               WHERE id = ? AND status = 'sold'`,
              it.animal_id,
            );
          } else {
            await this.db.runAsync(
              `UPDATE cattle SET status = 'active', updated_at = CURRENT_TIMESTAMP
               WHERE trim(tag_number) = ? COLLATE NOCASE AND status = 'sold'`,
              it.ear_tag.trim(),
            );
          }
        }
      }

      const resultado = await this.db.runAsync('DELETE FROM sales WHERE id = ?', id);
      if (!resultado.changes) {
        throw new ErroDominio('nao_encontrado', 'Venda não encontrada.');
      }

      await this.db.execAsync('COMMIT;');
    } catch (erro) {
      await this.db.execAsync('ROLLBACK;').catch(() => undefined);
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Venda');
    }
  }
}
