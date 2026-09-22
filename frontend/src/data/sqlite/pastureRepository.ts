import type { SQLiteDatabase } from 'expo-sqlite';

import { ErroDominio } from '../../domain/errors';
import type {
  EntradaPasto,
  EntradaTipoCapim,
  Pasto,
  RepositorioPastos,
  RepositorioTiposCapim,
  TipoCapim,
} from '../../features/pastures/types';
import { converterErroSqlite } from './errors';

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
};

const SELECT_PASTO = `
SELECT p.id, p.name, p.area_hectares, p.grass_type_id,
       g.name AS grass_type_name, p.current_height_cm,
       p.grass_condition, p.coverage_percent
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
  };
}

export class RepositorioTiposCapimSqlite implements RepositorioTiposCapim {
  constructor(private readonly db: SQLiteDatabase) {}

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
      const resultado = await this.db.runAsync(
        'INSERT INTO grass_types (name, min_height_cm, max_height_cm) VALUES (?, ?, ?)',
        entrada.nome,
        entrada.alturaMinimaCm,
        entrada.alturaMaximaCm,
      );
      return resultado.lastInsertRowId;
    } catch (erro) {
      converterErroSqlite(erro, 'Tipo de capim');
    }
  }

  async atualizar(id: number, entrada: EntradaTipoCapim): Promise<void> {
    try {
      const resultado = await this.db.runAsync(
        `UPDATE grass_types SET name = ?, min_height_cm = ?, max_height_cm = ?,
         updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        entrada.nome,
        entrada.alturaMinimaCm,
        entrada.alturaMaximaCm,
        id,
      );
      if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Tipo de capim não encontrado.');
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Tipo de capim');
    }
  }

  async excluir(id: number): Promise<void> {
    try {
      const resultado = await this.db.runAsync('DELETE FROM grass_types WHERE id = ?', id);
      if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Tipo de capim não encontrado.');
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Tipo de capim');
    }
  }
}

export class RepositorioPastosSqlite implements RepositorioPastos {
  constructor(private readonly db: SQLiteDatabase) {}

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
      const resultado = await this.db.runAsync(
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
      return resultado.lastInsertRowId;
    } catch (erro) {
      converterErroSqlite(erro, 'Pasto');
    }
  }

  async atualizar(id: number, entrada: EntradaPasto): Promise<void> {
    try {
      const resultado = await this.db.runAsync(
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
    } catch (erro) {
      if (erro instanceof ErroDominio) throw erro;
      converterErroSqlite(erro, 'Pasto');
    }
  }

  async excluir(id: number): Promise<void> {
    const resultado = await this.db.runAsync('DELETE FROM pastures WHERE id = ?', id);
    if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Pasto não encontrado.');
  }
}
