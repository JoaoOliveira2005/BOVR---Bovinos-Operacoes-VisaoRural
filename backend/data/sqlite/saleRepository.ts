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
  status: number;
  sold_on: string | null;
  buyer: string | null;
  gross_amount_cents: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type LinhaItem = {
  id: number;
  sale_id: number;
  cattle_id: number | null;
  tag_number: string;
  price_per_arroba_cents: number;
  planned_weight_arroba: number | null;
  planned_total_cents: number | null;
  actual_weight_arroba: number | null;
  actual_total_cents: number | null;
};

function mapearItem(linha: LinhaItem): ItemVenda {
  return {
    id: linha.id,
    animalId: linha.cattle_id,
    brinco: linha.tag_number,
    pricePerArrobaCentavos: linha.price_per_arroba_cents,
    plannedWeightArroba: linha.planned_weight_arroba,
    plannedTotalCentavos: linha.planned_total_cents,
    actualWeightArroba: linha.actual_weight_arroba,
    actualTotalCentavos: linha.actual_total_cents,
  };
}

function statusParaTipo(status: number): TipoVenda {
  return status === 1 ? 'realizada' : 'planejada';
}

function tipoParaStatus(tipo: TipoVenda): number {
  return tipo === 'realizada' ? 1 : 0;
}

function calcularTotalPlanejado(itens: Array<{ pricePerArrobaCentavos: number; plannedWeightArroba?: number | null }>): number | null {
  const total = itens.reduce((acc, item) => {
    if (item.plannedWeightArroba) {
      return acc + item.pricePerArrobaCentavos * item.plannedWeightArroba;
    }
    return acc;
  }, 0);
  return total > 0 ? Math.round(total) : null;
}

function calcularTotalReal(itens: Array<{ pricePerArrobaCentavos: number; actualWeightArroba?: number | null }>): number | null {
  const total = itens.reduce((acc, item) => {
    if (item.actualWeightArroba) {
      return acc + item.pricePerArrobaCentavos * item.actualWeightArroba;
    }
    return acc;
  }, 0);
  return total > 0 ? Math.round(total) : null;
}

function tratarErro(erro: unknown, operacao: string): never {
  if (erro instanceof ErroDominio) throw erro;
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  if (mensagem.includes('UNIQUE constraint failed')) {
    throw new ErroDominio('duplicado', 'Animal já incluído nesta venda.');
  }
  throw new ErroDominio('persistencia', `Não foi possível ${operacao} a venda (${mensagem}).`);
}

export class RepositorioVendasSqlite implements RepositorioVendas {
  constructor(private readonly db: SQLiteDatabase) {}

  async listar(filtro?: FiltroVendas): Promise<Venda[]> {
    try {
      const condicoes: string[] = [];
      const parametros: (string | number)[] = [];

      if (filtro?.tipo) {
        condicoes.push('s.status = ?');
        parametros.push(tipoParaStatus(filtro.tipo));
      }

      if (filtro?.dataInicio) {
        condicoes.push('COALESCE(s.sold_on, substr(s.created_at, 1, 10)) >= ?');
        parametros.push(filtro.dataInicio);
      }

      if (filtro?.dataFim) {
        condicoes.push('COALESCE(s.sold_on, substr(s.created_at, 1, 10)) <= ?');
        parametros.push(filtro.dataFim);
      }

      if (filtro?.comprador) {
        condicoes.push('s.buyer LIKE ?');
        parametros.push(`%${filtro.comprador.trim()}%`);
      }

      if (filtro?.brinco) {
        condicoes.push(`EXISTS (
          SELECT 1 FROM sale_items si
          WHERE si.sale_id = s.id AND trim(si.tag_number) = ? COLLATE NOCASE
        )`);
        parametros.push(filtro.brinco.trim());
      }

      const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';
      const sql = `SELECT s.id, s.status, s.sold_on, s.buyer, s.gross_amount_cents,
                          s.notes, s.created_at, s.updated_at
                   FROM sales s
                   ${where}
                   ORDER BY COALESCE(s.sold_on, substr(s.created_at, 1, 10)) DESC, s.id DESC`;

      const linhas = await this.db.getAllAsync<LinhaVenda>(sql, ...parametros);
      if (linhas.length === 0) return [];

      const ids = linhas.map((l) => l.id);
      const placeholders = ids.map(() => '?').join(',');
      const itens = await this.db.getAllAsync<LinhaItem>(
        `SELECT id, sale_id, cattle_id, tag_number, price_per_arroba_cents,
                planned_weight_arroba, planned_total_cents, actual_weight_arroba, actual_total_cents
         FROM sale_items
         WHERE sale_id IN (${placeholders})
         ORDER BY id ASC`,
        ...ids,
      );

      const itensPorVenda = new Map<number, ItemVenda[]>();
      for (const item of itens) {
        const lista = itensPorVenda.get(item.sale_id) ?? [];
        lista.push(mapearItem(item));
        itensPorVenda.set(item.sale_id, lista);
      }

      return linhas.map((linha) => {
        const itensVenda = itensPorVenda.get(linha.id) ?? [];
        return {
          id: linha.id,
          tipo: statusParaTipo(linha.status),
          comprador: linha.buyer,
          data: linha.sold_on,
          valorBrutoCentavos: linha.gross_amount_cents,
          observacoes: linha.notes,
          itens: itensVenda,
          quantidadeAnimais: itensVenda.length,
          criadoEm: linha.created_at,
          atualizadoEm: linha.updated_at,
        };
      });
    } catch (erro) {
      converterErroSqlite(erro, 'Venda');
    }
  }

  async obter(id: number): Promise<Venda | null> {
    try {
      const linha = await this.db.getFirstAsync<LinhaVenda>(
        `SELECT id, status, sold_on, buyer, gross_amount_cents, notes, created_at, updated_at
         FROM sales WHERE id = ?`,
        id,
      );
      if (!linha) return null;

      const itens = await this.db.getAllAsync<LinhaItem>(
        `SELECT id, sale_id, cattle_id, tag_number, price_per_arroba_cents,
                planned_weight_arroba, planned_total_cents, actual_weight_arroba, actual_total_cents
         FROM sale_items WHERE sale_id = ? ORDER BY id ASC`,
        id,
      );

      return {
        id: linha.id,
        tipo: statusParaTipo(linha.status),
        comprador: linha.buyer,
        data: linha.sold_on,
        valorBrutoCentavos: linha.gross_amount_cents,
        observacoes: linha.notes,
        itens: itens.map(mapearItem),
        quantidadeAnimais: itens.length,
        criadoEm: linha.created_at,
        atualizadoEm: linha.updated_at,
      };
    } catch (erro) {
      converterErroSqlite(erro, 'Venda');
    }
  }

  async criar(entrada: EntradaVenda): Promise<number> {
    const status = tipoParaStatus(entrada.tipo);
    const isRealizada = status === 1;

    const itens = entrada.itens.map((item) => {
      const plannedWeight = item.plannedWeightArroba ?? null;
      const plannedTotal = plannedWeight ? item.pricePerArrobaCentavos * plannedWeight : null;
      const actualWeight = isRealizada ? (item.actualWeightArroba ?? null) : null;
      const actualTotal = actualWeight ? item.pricePerArrobaCentavos * actualWeight : null;
      return {
        ...item,
        plannedWeightArroba: plannedWeight,
        plannedTotalCentavos: plannedTotal ? Math.round(plannedTotal) : null,
        actualWeightArroba: actualWeight,
        actualTotalCentavos: actualTotal ? Math.round(actualTotal) : null,
      };
    });

    if (isRealizada) {
      for (const item of itens) {
        if (item.actualWeightArroba === null) {
          throw new ErroDominio('validacao', `Informe o Peso@ real do animal ${item.brinco}.`);
        }
      }
    }

    const totalReal = calcularTotalReal(itens);
    const totalPlanejado = calcularTotalPlanejado(itens);
    const grossAmount = entrada.valorBrutoCentavos ?? (isRealizada ? totalReal : totalPlanejado);

    try {
      await this.db.execAsync('BEGIN IMMEDIATE;');

      const resultadoVenda = await this.db.runAsync(
        `INSERT INTO sales (status, sold_on, buyer, gross_amount_cents, notes)
         VALUES (?, ?, ?, ?, ?)`,
        status,
        isRealizada ? entrada.data ?? null : null,
        isRealizada ? entrada.comprador ?? null : null,
        grossAmount,
        entrada.observacoes ?? null,
      );

      const saleId = resultadoVenda.lastInsertRowId;

      for (const item of itens) {
        let animalId = item.animalId ?? null;
        if (!animalId) {
          const animalAtivo = await this.db.getFirstAsync<{ id: number }>(
            `SELECT id FROM cattle WHERE trim(tag_number) = ? COLLATE NOCASE AND status = 'active' LIMIT 1`,
            item.brinco.trim(),
          );
          if (animalAtivo) animalId = animalAtivo.id;
        }

        await this.db.runAsync(
          `INSERT INTO sale_items (
             sale_id, cattle_id, tag_number, price_per_arroba_cents,
             planned_weight_arroba, planned_total_cents, actual_weight_arroba, actual_total_cents
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          saleId,
          animalId,
          item.brinco.trim(),
          item.pricePerArrobaCentavos,
          item.plannedWeightArroba,
          item.plannedTotalCentavos,
          item.actualWeightArroba,
          item.actualTotalCentavos,
        );

        if (isRealizada && item.actualWeightArroba !== null) {
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
        }
      }

      if (isRealizada) {
        await this.db.runAsync(
          `DELETE FROM sale_items
           WHERE sale_id IN (SELECT id FROM sales WHERE status = 0)
             AND (cattle_id = ? OR trim(tag_number) = ? COLLATE NOCASE)`,
          null,
          '',
        );
      }

      await this.db.execAsync('COMMIT;');
      return saleId;
    } catch (erro) {
      await this.db.execAsync('ROLLBACK;').catch(() => undefined);
      tratarErro(erro, 'criar');
    }
  }

  async atualizar(id: number, entrada: EntradaVenda): Promise<void> {
    const novoStatus = tipoParaStatus(entrada.tipo);

    try {
      const vendaAnterior = await this.db.getFirstAsync<{ status: number }>(
        `SELECT status FROM sales WHERE id = ?`,
        id,
      );
      if (!vendaAnterior) throw new ErroDominio('nao_encontrado', 'Venda não encontrada.');

      if (vendaAnterior.status === 1 && entrada.tipo === 'planejada') {
        throw new ErroDominio('validacao', 'Venda realizada não pode voltar a ser planejada.');
      }

      const isRealizada = novoStatus === 1;
      const itens = entrada.itens.map((item) => {
        const plannedWeight = item.plannedWeightArroba ?? null;
        const plannedTotal = plannedWeight ? item.pricePerArrobaCentavos * plannedWeight : null;
        const actualWeight = isRealizada ? (item.actualWeightArroba ?? null) : null;
        const actualTotal = actualWeight ? item.pricePerArrobaCentavos * actualWeight : null;
        return {
          ...item,
          plannedWeightArroba: plannedWeight,
          plannedTotalCentavos: plannedTotal ? Math.round(plannedTotal) : null,
          actualWeightArroba: actualWeight,
          actualTotalCentavos: actualTotal ? Math.round(actualTotal) : null,
        };
      });

      if (isRealizada) {
        for (const item of itens) {
          const morto = await this.db.getFirstAsync<{ status: string }>(
            `SELECT status FROM cattle WHERE trim(tag_number) = ? COLLATE NOCASE LIMIT 1`,
            item.brinco.trim(),
          );
          if (morto?.status !== 'dead' && item.actualWeightArroba === null) {
            throw new ErroDominio('validacao', `Informe o Peso@ real do animal ${item.brinco}.`);
          }
        }
      }

      const totalReal = calcularTotalReal(itens);
      const totalPlanejado = calcularTotalPlanejado(itens);
      const grossAmount = entrada.valorBrutoCentavos ?? (isRealizada ? totalReal : totalPlanejado);

      await this.db.execAsync('BEGIN IMMEDIATE;');

      const existente = await this.db.getFirstAsync<{ sold_on: string | null; buyer: string | null }>(
        `SELECT sold_on, buyer FROM sales WHERE id = ?`,
        id,
      );

      await this.db.runAsync(
        `UPDATE sales
         SET status = ?, sold_on = ?, buyer = ?, gross_amount_cents = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        novoStatus,
        isRealizada ? (entrada.data ?? existente?.sold_on ?? null) : null,
        isRealizada ? (entrada.comprador ?? existente?.buyer ?? null) : null,
        grossAmount,
        entrada.observacoes ?? null,
        id,
      );

      await this.db.runAsync('DELETE FROM sale_items WHERE sale_id = ?', id);

      for (const item of itens) {
        let animalId = item.animalId ?? null;
        if (!animalId) {
          const animalAtivo = await this.db.getFirstAsync<{ id: number }>(
            `SELECT id FROM cattle WHERE trim(tag_number) = ? COLLATE NOCASE AND status = 'active' LIMIT 1`,
            item.brinco.trim(),
          );
          if (animalAtivo) animalId = animalAtivo.id;
        }

        await this.db.runAsync(
          `INSERT INTO sale_items (
             sale_id, cattle_id, tag_number, price_per_arroba_cents,
             planned_weight_arroba, planned_total_cents, actual_weight_arroba, actual_total_cents
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          id,
          animalId,
          item.brinco.trim(),
          item.pricePerArrobaCentavos,
          item.plannedWeightArroba,
          item.plannedTotalCentavos,
          item.actualWeightArroba,
          item.actualTotalCentavos,
        );

        if (isRealizada) {
          const morto = await this.db.getFirstAsync<{ status: string }>(
            `SELECT status FROM cattle WHERE trim(tag_number) = ? COLLATE NOCASE LIMIT 1`,
            item.brinco.trim(),
          );
          if (morto?.status !== 'dead') {
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
          }
        }
      }

      await this.db.execAsync('COMMIT;');
    } catch (erro) {
      await this.db.execAsync('ROLLBACK;').catch(() => undefined);
      tratarErro(erro, 'atualizar');
    }
  }

  async excluir(id: number): Promise<void> {
    try {
      await this.db.execAsync('BEGIN IMMEDIATE;');
      await this.db.runAsync('DELETE FROM sale_items WHERE sale_id = ?', id);
      await this.db.runAsync('DELETE FROM sales WHERE id = ?', id);
      await this.db.execAsync('COMMIT;');
    } catch (erro) {
      await this.db.execAsync('ROLLBACK;').catch(() => undefined);
      tratarErro(erro, 'excluir');
    }
  }

  async marcarAnimalMorto(vendaId: number, brinco: string): Promise<void> {
    try {
      await this.db.execAsync('BEGIN IMMEDIATE;');
      const animal = await this.db.getFirstAsync<{ id: number }>(
        `SELECT id FROM cattle WHERE trim(tag_number) = ? COLLATE NOCASE AND status = 'active' LIMIT 1`,
        brinco.trim(),
      );
      if (animal) {
        await this.db.runAsync(
          `UPDATE cattle SET status = 'dead', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          animal.id,
        );
      }
      await this.db.runAsync(
        `UPDATE sale_items
         SET actual_weight_arroba = NULL, actual_total_cents = NULL
         WHERE sale_id = ? AND trim(tag_number) = ? COLLATE NOCASE`,
        vendaId,
        brinco.trim(),
      );
      await this.db.execAsync('COMMIT;');
    } catch (erro) {
      await this.db.execAsync('ROLLBACK;').catch(() => undefined);
      tratarErro(erro, 'marcar animal morto');
    }
  }

  async removerAnimal(vendaId: number, brinco: string): Promise<void> {
    try {
      await this.db.execAsync('BEGIN IMMEDIATE;');
      await this.db.runAsync(
        `DELETE FROM sale_items WHERE sale_id = ? AND trim(tag_number) = ? COLLATE NOCASE`,
        vendaId,
        brinco.trim(),
      );
      const restantes = await this.db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) AS total FROM sale_items WHERE sale_id = ?`,
        vendaId,
      );
      if (!restantes || restantes.total === 0) {
        await this.db.runAsync('DELETE FROM sales WHERE id = ?', vendaId);
      }
      await this.db.execAsync('COMMIT;');
    } catch (erro) {
      await this.db.execAsync('ROLLBACK;').catch(() => undefined);
      tratarErro(erro, 'remover animal');
    }
  }
}