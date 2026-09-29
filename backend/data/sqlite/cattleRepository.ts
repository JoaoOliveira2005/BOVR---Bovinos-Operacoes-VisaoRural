import type { SQLiteDatabase } from 'expo-sqlite';
import { ErroDominio } from '../../domain/errors';
import type { Animal, EntradaAnimal } from '../../features/cattle/types';
import { validarAnimal } from '../../features/cattle/validation';
import type { RepositorioConsultaAnimais } from '../../features/cattle/service';

type LinhaAnimal = {
  id: number;
  ear_tag: string;
  sex: Animal['sexo'];
  birth_date: string | null;
  estimated_age_months: number | null;
  breed: string;
  notes: string | null;
  status: Animal['situacao'];
};

const SELECT_ANIMAL = `SELECT id, ear_tag, sex, birth_date, estimated_age_months,
  breed, notes, status FROM cattle`;

function mapear(linha: LinhaAnimal): Animal {
  return {
    id: linha.id, brinco: linha.ear_tag, sexo: linha.sex,
    dataNascimento: linha.birth_date, idadeEstimadaMeses: linha.estimated_age_months,
    raca: linha.breed, observacoes: linha.notes, situacao: linha.status,
  };
}

function tratarErro(erro: unknown): never {
  if (erro instanceof ErroDominio) throw erro;
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  if (mensagem.includes('UNIQUE constraint failed')) {
    throw new ErroDominio('duplicado', 'Já existe um animal ativo com esse brinco. Use outro número.');
  }
  throw new ErroDominio('persistencia', 'Não foi possível salvar o animal.');
}

export class RepositorioAnimaisSqlite implements RepositorioConsultaAnimais {
  constructor(private readonly db: SQLiteDatabase) {}

  async listar(): Promise<Animal[]> {
    return (await this.db.getAllAsync<LinhaAnimal>(`${SELECT_ANIMAL} ORDER BY id DESC`)).map(mapear);
  }

  async obter(id: number): Promise<Animal | null> {
    const linha = await this.db.getFirstAsync<LinhaAnimal>(`${SELECT_ANIMAL} WHERE id = ?`, id);
    return linha ? mapear(linha) : null;
  }

  async consultarPorBrinco(brinco: string): Promise<Animal[]> {
    const linhas = await this.db.getAllAsync<LinhaAnimal>(
      `${SELECT_ANIMAL} WHERE trim(ear_tag) = ? COLLATE NOCASE
       ORDER BY (status = 'ativo') DESC, id DESC`, brinco.trim(),
    );
    return linhas.map(mapear);
  }

  async existeAtivoComBrinco(brinco: string, ignorarId?: number): Promise<boolean> {
    const linha = await this.db.getFirstAsync<{ id: number }>(
      `SELECT id FROM cattle WHERE status = 'ativo' AND trim(ear_tag) = ? COLLATE NOCASE
       AND (? IS NULL OR id <> ?) LIMIT 1`, brinco.trim(), ignorarId ?? null, ignorarId ?? null,
    );
    return linha !== null;
  }

  async criar(entrada: EntradaAnimal): Promise<number> {
    const animal = validarAnimal(entrada);
    try {
      const resultado = await this.db.runAsync(
        `INSERT INTO cattle (ear_tag, sex, birth_date, estimated_age_months, breed, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        animal.brinco, animal.sexo, animal.dataNascimento, animal.idadeEstimadaMeses,
        animal.raca, animal.observacoes,
      );
      return resultado.lastInsertRowId;
    } catch (erro) { tratarErro(erro); }
  }

  async atualizar(id: number, entrada: EntradaAnimal): Promise<void> {
    const animal = validarAnimal(entrada);
    try {
      const resultado = await this.db.runAsync(
        `UPDATE cattle SET ear_tag = ?, sex = ?, birth_date = ?, estimated_age_months = ?,
         breed = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        animal.brinco, animal.sexo, animal.dataNascimento, animal.idadeEstimadaMeses,
        animal.raca, animal.observacoes, id,
      );
      if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Animal não encontrado.');
    } catch (erro) { tratarErro(erro); }
  }
}
