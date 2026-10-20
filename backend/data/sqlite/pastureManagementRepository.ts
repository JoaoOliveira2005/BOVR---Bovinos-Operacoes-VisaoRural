import type { SQLiteDatabase } from 'expo-sqlite';
import { ErroDominio } from '../../../frontend/src/domain/errors';
import { classificarQualidade, diasEntre } from '../../features/pastures/rules';
import type {
  DescansoPasto, EntradaLeituraPasto, EntradaMovimentoPasto, FiltroMovimentos,
  LeituraPasto, MovimentoPasto, PainelPasto, RepositorioManejoPastos,
} from '../../features/pastures/types';
import { converterErroSqlite } from './errors';
import { transacaoPastos } from './pastureTransaction';
import type { AbrirConexaoPastos } from './pastureTransaction';

type AnimalLocal = { id: number; pasture_id: number | null; status: string };
type LinhaDescanso = { id: number; pasture_id: number; started_on: string; ended_on: string | null };

async function exigirPasto(db: SQLiteDatabase, id: number): Promise<void> {
  if (!await db.getFirstAsync('SELECT id FROM pastures WHERE id = ?', id)) {
    throw new ErroDominio('nao_encontrado', 'Pasto não encontrado.');
  }
}

// Também usado pelo cadastro: a leitura e os dados atuais são gravados juntos.
export async function gravarLeitura(db: SQLiteDatabase, entrada: EntradaLeituraPasto): Promise<number> {
  const tipo = await db.getFirstAsync<{ id: number; min_height_cm: number; max_height_cm: number }>(
    `SELECT g.id, g.min_height_cm, g.max_height_cm FROM pastures p
     JOIN grass_types g ON g.id = p.grass_type_id WHERE p.id = ?`, entrada.pastoId,
  );
  if (!tipo) throw new ErroDominio('nao_encontrado', 'Pasto não encontrado.');
  const ultima = await db.getFirstAsync<{ inspected_on: string }>(
    'SELECT inspected_on FROM pasture_inspections WHERE pasture_id = ? ORDER BY inspected_on DESC, id DESC LIMIT 1',
    entrada.pastoId,
  );
  const qualidade = classificarQualidade(
    entrada.alturaAtualCm, entrada.condicaoCapim, entrada.coberturaPercentual, tipo.min_height_cm, tipo.max_height_cm,
  );
  const resultado = await db.runAsync(
    `INSERT INTO pasture_inspections
     (pasture_id, inspected_on, grass_type_id, min_height_cm, max_height_cm,
      grass_height_cm, grass_condition, coverage_percent, quality) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    entrada.pastoId, entrada.dataLeitura, tipo.id, tipo.min_height_cm, tipo.max_height_cm,
    entrada.alturaAtualCm, entrada.condicaoCapim, entrada.coberturaPercentual, qualidade,
  );
  if (!ultima || entrada.dataLeitura >= ultima.inspected_on) {
    await db.runAsync(
      `UPDATE pastures SET current_height_cm = ?, grass_condition = ?, coverage_percent = ?,
       updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      entrada.alturaAtualCm, entrada.condicaoCapim, entrada.coberturaPercentual, entrada.pastoId,
    );
  }
  return resultado.lastInsertRowId;
}

export class RepositorioManejoPastosSqlite implements RepositorioManejoPastos {
  constructor(private readonly db: SQLiteDatabase, private readonly abrirConexao?: AbrirConexaoPastos) {}

  private async transacao<T>(executar: (db: SQLiteDatabase) => Promise<T>): Promise<T> {
    try { return await transacaoPastos(this.db, this.abrirConexao, executar); }
    catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Manejo de pasto');
    }
  }

  registrarLeitura(entrada: EntradaLeituraPasto): Promise<number> {
    return this.transacao((db) => gravarLeitura(db, entrada));
  }

  async listarLeituras(pastoId: number): Promise<LeituraPasto[]> {
    await exigirPasto(this.db, pastoId);
    const linhas = await this.db.getAllAsync<{
      id: number; pasture_id: number; inspected_on: string; grass_type_id: number;
      min_height_cm: number; max_height_cm: number; grass_height_cm: number;
      grass_condition: LeituraPasto['condicaoCapim']; coverage_percent: number; quality: LeituraPasto['qualidade'];
    }>('SELECT * FROM pasture_inspections WHERE pasture_id = ? ORDER BY inspected_on DESC, id DESC', pastoId);
    return linhas.map((l) => ({
      id: l.id, pastoId: l.pasture_id, dataLeitura: l.inspected_on, tipoCapimId: l.grass_type_id,
      alturaMinimaCm: l.min_height_cm, alturaMaximaCm: l.max_height_cm, alturaAtualCm: l.grass_height_cm,
      condicaoCapim: l.grass_condition, coberturaPercentual: l.coverage_percent, qualidade: l.quality,
    }));
  }

  moverAnimal(animalId: number, entrada: EntradaMovimentoPasto): Promise<number[]> {
    return this.transacao(async (db) => {
      const animal = await db.getFirstAsync<AnimalLocal>('SELECT id, pasture_id, status FROM cattle WHERE id = ?', animalId);
      if (!animal) throw new ErroDominio('nao_encontrado', 'Animal não encontrado.');
      if (animal.status !== 'ativo') throw new ErroDominio('validacao', 'Somente animais ativos podem ser movimentados.');
      return this.movimentar(db, [animal], null, entrada);
    });
  }

  moverLote(loteId: number, entrada: EntradaMovimentoPasto): Promise<number[]> {
    return this.transacao(async (db) => {
      if (!await db.getFirstAsync('SELECT id FROM herds WHERE id = ?', loteId)) {
        throw new ErroDominio('nao_encontrado', 'Lote não encontrado.');
      }
      const animais = await db.getAllAsync<AnimalLocal>(
        "SELECT id, pasture_id, status FROM cattle WHERE herd_id = ? AND status = 'ativo' ORDER BY id", loteId,
      );
      if (!animais.length) throw new ErroDominio('validacao', 'O lote não possui animais ativos.');
      return this.movimentar(db, animais, loteId, entrada);
    });
  }

  private async movimentar(
    db: SQLiteDatabase, animais: AnimalLocal[], loteId: number | null, entrada: EntradaMovimentoPasto,
  ): Promise<number[]> {
    const destino = entrada.pastoDestinoId;
    if (destino !== null) await exigirPasto(db, destino);
    // Membros já no destino permanecem ali, conservando sua data de entrada.
    const mover = animais.filter((a) => a.pasture_id !== destino);
    if (!mover.length) throw new ErroDominio('validacao', 'Os animais já estão no destino informado.');
    const pastos = new Set<number>();
    if (destino !== null) pastos.add(destino);
    for (const a of mover) if (a.pasture_id !== null) pastos.add(a.pasture_id);
    const quantidades = new Map<number, number>();
    for (const id of pastos) {
      const ultima = await db.getFirstAsync<{ data: string | null }>(
        `SELECT MAX(moved_on) AS data FROM pasture_movements
         WHERE origin_pasture_id = ? OR destination_pasture_id = ?`, id, id,
      );
      if (ultima?.data && entrada.dataMovimento < ultima.data) {
        throw new ErroDominio('validacao', 'A data não pode anteceder a última movimentação dos pastos envolvidos.');
      }
      const quantidade = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM cattle WHERE pasture_id = ?', id);
      quantidades.set(id, quantidade!.total);
    }
    // Animais sem pasto também podem ter saídas posteriores à data solicitada.
    for (const a of mover) {
      const ultima = await db.getFirstAsync<{ data: string | null }>(
        'SELECT MAX(moved_on) AS data FROM pasture_movements WHERE cattle_id = ?', a.id,
      );
      if (ultima?.data && entrada.dataMovimento < ultima.data) {
        throw new ErroDominio('validacao', 'A data não pode anteceder a última movimentação do animal.');
      }
    }
    const ids: number[] = [];
    for (const a of mover) {
      const resultado = await db.runAsync(
        `INSERT INTO pasture_movements (cattle_id, herd_id, origin_pasture_id, destination_pasture_id, moved_on)
         VALUES (?, ?, ?, ?, ?)`, a.id, loteId, a.pasture_id, destino, entrada.dataMovimento,
      );
      await db.runAsync('UPDATE cattle SET pasture_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', destino, a.id);
      ids.push(resultado.lastInsertRowId);
    }
    // Compara antes/depois de todo o lote: só a saída do último animal inicia descanso.
    for (const id of pastos) {
      const depois = (await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM cattle WHERE pasture_id = ?', id))!.total;
      if (quantidades.get(id)! > 0 && depois === 0) {
        await db.runAsync('INSERT INTO pasture_rest_periods (pasture_id, started_on) VALUES (?, ?)', id, entrada.dataMovimento);
      } else if (quantidades.get(id) === 0 && depois > 0) {
        await db.runAsync(
          'UPDATE pasture_rest_periods SET ended_on = ? WHERE pasture_id = ? AND ended_on IS NULL', entrada.dataMovimento, id,
        );
      }
    }
    return ids;
  }

  async listarMovimentos(filtro: FiltroMovimentos): Promise<MovimentoPasto[]> {
    const clausulas: string[] = [];
    const parametros: number[] = [];
    if (filtro.pastoId !== undefined) {
      clausulas.push('(origin_pasture_id = ? OR destination_pasture_id = ?)');
      parametros.push(filtro.pastoId, filtro.pastoId);
    }
    if (filtro.animalId !== undefined) { clausulas.push('cattle_id = ?'); parametros.push(filtro.animalId); }
    if (filtro.loteId !== undefined) { clausulas.push('herd_id = ?'); parametros.push(filtro.loteId); }
    const linhas = await this.db.getAllAsync<{
      id: number; cattle_id: number; herd_id: number | null; origin_pasture_id: number | null;
      destination_pasture_id: number | null; moved_on: string;
    }>(`SELECT * FROM pasture_movements ${clausulas.length ? `WHERE ${clausulas.join(' AND ')}` : ''}
        ORDER BY moved_on DESC, id DESC`, ...parametros);
    return linhas.map((l) => ({
      id: l.id, animalId: l.cattle_id, loteId: l.herd_id, pastoOrigemId: l.origin_pasture_id,
      pastoDestinoId: l.destination_pasture_id, dataMovimento: l.moved_on,
    }));
  }

  async listarDescansos(pastoId: number, referencia: string): Promise<DescansoPasto[]> {
    await exigirPasto(this.db, pastoId);
    const linhas = await this.db.getAllAsync<LinhaDescanso>(
      'SELECT * FROM pasture_rest_periods WHERE pasture_id = ? ORDER BY started_on DESC, id DESC', pastoId,
    );
    return linhas.map((l) => ({
      id: l.id, pastoId: l.pasture_id, dataInicio: l.started_on, dataFim: l.ended_on,
      diasDescanso: diasEntre(l.started_on, l.ended_on ?? referencia),
    }));
  }

  obterPainel(pastoId: number, referencia: string): Promise<PainelPasto> {
    // A leitura do painel usa a mesma transação para não misturar dois movimentos.
    return this.transacao(async (db) => {
      await exigirPasto(db, pastoId);
      const linhas = await db.getAllAsync<{ id: number; ear_tag: string; herd_id: number | null; moved_on: string }>(
        `SELECT c.id, c.ear_tag, c.herd_id, m.moved_on FROM cattle c
         JOIN pasture_movements m ON m.id = (SELECT MAX(id) FROM pasture_movements WHERE cattle_id = c.id)
         WHERE c.pasture_id = ? AND c.status = 'ativo' ORDER BY c.ear_tag COLLATE NOCASE`, pastoId,
      );
      const animais = linhas.map((l) => ({
        animalId: l.id, brinco: l.ear_tag, loteId: l.herd_id,
        dataEntrada: l.moved_on, diasPermanencia: diasEntre(l.moved_on, referencia),
      }));
      const lotes = new Map<number, PainelPasto['lotes'][number]>();
      for (const a of animais) {
        if (a.loteId === null) continue;
        const lote = lotes.get(a.loteId);
        if (lote) {
          lote.quantidadeAnimais++;
          lote.diasMinimos = Math.min(lote.diasMinimos, a.diasPermanencia);
          lote.diasMaximos = Math.max(lote.diasMaximos, a.diasPermanencia);
        } else lotes.set(a.loteId, {
          loteId: a.loteId, quantidadeAnimais: 1, diasMinimos: a.diasPermanencia, diasMaximos: a.diasPermanencia,
        });
      }
      const descansos = await new RepositorioManejoPastosSqlite(db).listarDescansos(pastoId, referencia);
      return {
        pastoId, quantidadeAnimais: animais.length, animais, lotes: [...lotes.values()],
        descansoAtual: descansos.find((d) => d.dataFim === null) ?? null,
        ultimoDescansoConcluido: descansos.find((d) => d.dataFim !== null) ?? null,
      };
    });
  }
}
