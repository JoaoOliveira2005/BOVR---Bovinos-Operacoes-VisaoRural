import type { SQLiteDatabase } from 'expo-sqlite';

import { ErroDominio } from '../../../frontend/src/domain/errors';
import type {
  EntradaPasto,
  EntradaTipoCapim,
  Pasto,
  RepositorioPastos,
  RepositorioTiposCapim,
  TipoCapim,
} from '../../../frontend/src/features/pastures/types';
import { converterErroSqlite } from './errors';
import { classificarQualidade, hojeLocal } from '../../features/pastures/rules';
import { gravarLeitura } from './pastureManagementRepository';
import { transacaoPastos } from './pastureTransaction';
import type { AbrirConexaoPastos } from './pastureTransaction';

type LinhaTipo = { id: number; name: string; min_height_cm: number; max_height_cm: number };
type LinhaPasto = {
  id: number;
  name: string;
  area_hectares: number;
  grass_type_id: number;
  grass_type_name: string;
  current_height_cm: number;
  grass_condition: Pasto['condicaoCapim'];
  coverage_percent: number;
  min_height_cm: number;
  max_height_cm: number;
  inspected_on: string | null;
};

const SELECT_PASTO = `
SELECT p.id, p.name, p.area_hectares, p.grass_type_id,
       g.name AS grass_type_name, p.current_height_cm,
       p.grass_condition, p.coverage_percent, g.min_height_cm, g.max_height_cm,
       (SELECT inspected_on FROM pasture_inspections WHERE pasture_id = p.id
        ORDER BY inspected_on DESC, id DESC LIMIT 1) AS inspected_on
FROM pastures p
JOIN grass_types g ON g.id = p.grass_type_id`;

function mapearTipo(linha: LinhaTipo): TipoCapim {
  return {
    id: linha.id,
    nome: linha.name,
    alturaMinimaCm: linha.min_height_cm,
    alturaMaximaCm: linha.max_height_cm,
  };
}

function mapearPasto(linha: LinhaPasto): Pasto {
  return {
    id: linha.id,
    nome: linha.name,
    areaHectares: linha.area_hectares,
    tipoCapimId: linha.grass_type_id,
    tipoCapimNome: linha.grass_type_name,
    alturaAtualCm: linha.current_height_cm,
    condicaoCapim: linha.grass_condition,
    coberturaPercentual: linha.coverage_percent,
    qualidade: classificarQualidade(linha.current_height_cm, linha.grass_condition,
      linha.coverage_percent, linha.min_height_cm, linha.max_height_cm),
    dataLeitura: linha.inspected_on,
  };
}

export class RepositorioTiposCapimSqlite implements RepositorioTiposCapim {
  constructor(private readonly db: SQLiteDatabase, private readonly abrirConexao?: AbrirConexaoPastos) {}

  async listar(): Promise<TipoCapim[]> {
    const linhas = await this.db.getAllAsync<LinhaTipo>(
      'SELECT id, name, min_height_cm, max_height_cm FROM grass_types ORDER BY name COLLATE NOCASE',
    );
    return linhas.map(mapearTipo);
  }

  async obter(id: number): Promise<TipoCapim | null> {
    const linha = await this.db.getFirstAsync<LinhaTipo>(
      'SELECT id, name, min_height_cm, max_height_cm FROM grass_types WHERE id = ?',
      id,
    );
    return linha ? mapearTipo(linha) : null;
  }

  async criar(entrada: EntradaTipoCapim): Promise<number> {
    try {
      return await transacaoPastos(this.db, this.abrirConexao, async (db) => {
        const resultado = await db.runAsync(
          'INSERT INTO grass_types (name, min_height_cm, max_height_cm) VALUES (?, ?, ?)',
          entrada.nome,
          entrada.alturaMinimaCm,
          entrada.alturaMaximaCm,
        );
        return resultado.lastInsertRowId;
      });
    } catch (erro) {
      converterErroSqlite(erro, 'Tipo de capim');
    }
  }

  async atualizar(id: number, entrada: EntradaTipoCapim): Promise<void> {
    try {
      await transacaoPastos(this.db, this.abrirConexao, async (db) => {
        const resultado = await db.runAsync(
          `UPDATE grass_types SET name = ?, min_height_cm = ?, max_height_cm = ?,
           updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          entrada.nome,
          entrada.alturaMinimaCm,
          entrada.alturaMaximaCm,
          id,
        );
        if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Tipo de capim não encontrado.');
      });
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Tipo de capim');
    }
  }

  async excluir(id: number): Promise<void> {
    try {
      await transacaoPastos(this.db, this.abrirConexao, async (db) => {
        const resultado = await db.runAsync('DELETE FROM grass_types WHERE id = ?', id);
        if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Tipo de capim não encontrado.');
      });
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Tipo de capim');
    }
  }
}

export class RepositorioPastosSqlite implements RepositorioPastos {
  constructor(private readonly db: SQLiteDatabase, private readonly abrirConexao?: AbrirConexaoPastos) {}

  async listar(): Promise<Pasto[]> {
    const linhas = await this.db.getAllAsync<LinhaPasto>(`${SELECT_PASTO} ORDER BY p.name COLLATE NOCASE`);
    return linhas.map(mapearPasto);
  }

  async obter(id: number): Promise<Pasto | null> {
    const linha = await this.db.getFirstAsync<LinhaPasto>(`${SELECT_PASTO} WHERE p.id = ?`, id);
    return linha ? mapearPasto(linha) : null;
  }

  async criar(entrada: EntradaPasto): Promise<number> {
    try {
      return await transacaoPastos(this.db, this.abrirConexao, async (db) => {
        const resultado = await db.runAsync(
          `INSERT INTO pastures
           (name, area_hectares, grass_type_id, current_height_cm, grass_condition, coverage_percent)
           VALUES (?, ?, ?, ?, ?, ?)`,
          entrada.nome,
          entrada.areaHectares,
          entrada.tipoCapimId,
          entrada.alturaAtualCm,
          entrada.condicaoCapim,
          entrada.coberturaPercentual,
        );
        await gravarLeitura(db, { ...entrada, pastoId: resultado.lastInsertRowId, dataLeitura: entrada.dataLeitura ?? hojeLocal() });
        return resultado.lastInsertRowId;
      });
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Pasto');
    }
  }

  async atualizar(id: number, entrada: EntradaPasto): Promise<void> {
    try {
      await transacaoPastos(this.db, this.abrirConexao, async (db) => {
        const atual = await new RepositorioPastosSqlite(db).obter(id);
        if (!atual) throw new ErroDominio('nao_encontrado', 'Pasto não encontrado.');
        const novaLeitura = entrada.dataLeitura !== undefined || atual.dataLeitura === null ||
          atual.tipoCapimId !== entrada.tipoCapimId || atual.alturaAtualCm !== entrada.alturaAtualCm ||
          atual.condicaoCapim !== entrada.condicaoCapim || atual.coberturaPercentual !== entrada.coberturaPercentual;
        const dataLeitura = entrada.dataLeitura ?? hojeLocal();
        if (novaLeitura && atual.dataLeitura && dataLeitura < atual.dataLeitura) {
          throw new ErroDominio('validacao', 'Use o registro de leitura para incluir medições históricas.');
        }
        const resultado = await db.runAsync(
          `UPDATE pastures SET name = ?, area_hectares = ?, grass_type_id = ?,
           current_height_cm = ?, grass_condition = ?, coverage_percent = ?,
           updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          entrada.nome,
          entrada.areaHectares,
          entrada.tipoCapimId,
          entrada.alturaAtualCm,
          entrada.condicaoCapim,
          entrada.coberturaPercentual,
          id,
        );
        if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Pasto não encontrado.');
        if (novaLeitura) await gravarLeitura(db, { ...entrada, pastoId: id, dataLeitura });
      });
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Pasto');
    }
  }

  async excluir(id: number): Promise<void> {
    try {
      await transacaoPastos(this.db, this.abrirConexao, async (db) => {
        // Leituras pertencem ao cadastro; a rotação impede apagar pastos usados.
        const uso = await db.getFirstAsync(
          'SELECT id FROM pasture_movements WHERE origin_pasture_id = ? OR destination_pasture_id = ? LIMIT 1', id, id,
        );
        if (uso) throw new ErroDominio('em_uso', 'O pasto possui histórico de movimentação e não pode ser excluído.');
        await db.runAsync('DELETE FROM pasture_inspections WHERE pasture_id = ?', id);
        const resultado = await db.runAsync('DELETE FROM pastures WHERE id = ?', id);
        if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Pasto não encontrado.');
      });
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Pasto');
    }
  }
}
