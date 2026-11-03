import type { SQLiteDatabase } from 'expo-sqlite';
import { ErroDominio } from '../../domain/errors';
import type { Animal, EntradaAnimal } from '../../features/cattle/types';
import { validarAnimal } from '../../features/cattle/validation';
import type { RepositorioConsultaAnimais } from '../../features/cattle/service';

type LinhaAnimal = {
  id: number;
  tag_number: string;
  sex: Animal['sexo'];
  birth_date: string | null;
  estimated_age_months: number | null;
  breed: string;
  notes: string | null;
  status: Animal['situacao'];
};

const SELECT_ANIMAL = `SELECT id, tag_number, sex, birth_date, estimated_age_months,
  breed, notes, status FROM cattle`;

function mapear(linha: LinhaAnimal): Animal {
  return {
    id: linha.id, brinco: linha.tag_number, sexo: linha.sex,
    dataNascimento: linha.birth_date, idadeEstimadaMeses: linha.estimated_age_months,
    raca: linha.breed, observacoes: linha.notes, situacao: linha.status,
  };
}

function tratarErro(erro: unknown, operacao = 'salvar', contexto?: unknown): never {
  if (erro instanceof ErroDominio) throw erro;
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  console.error(`[RepositorioAnimaisSqlite] Erro ao ${operacao} animal:`, {
    mensagem,
    contexto,
    erro,
  });
  if (mensagem.includes('UNIQUE constraint failed')) {
    throw new ErroDominio('duplicado', 'Já existe um animal ativo com esse brinco. Use outro número.');
  }
  if (mensagem.includes('CHECK constraint failed')) {
    throw new ErroDominio(
      'validacao',
      `Dados inválidos para o animal (${mensagem}). Verifique os campos preenchidos.`,
    );
  }
  throw new ErroDominio('persistencia', `Não foi possível ${operacao} o animal (${mensagem}).`);
}

export class RepositorioAnimaisSqlite implements RepositorioConsultaAnimais {
  constructor(private readonly db: SQLiteDatabase) {}

  async listar(filtro?: { situacao?: Animal['situacao'] | 'todos' }): Promise<Animal[]> {
    try {
      if (filtro?.situacao && filtro.situacao !== 'todos') {
        const linhas = await this.db.getAllAsync<LinhaAnimal>(
          `${SELECT_ANIMAL} WHERE status = ? ORDER BY id DESC`,
          filtro.situacao,
        );
        return linhas.map(mapear);
      }
      return (await this.db.getAllAsync<LinhaAnimal>(`${SELECT_ANIMAL} ORDER BY id DESC`)).map(mapear);
    } catch (erro) {
      tratarErro(erro, 'listar', filtro);
    }
  }

  async listarAtivos(): Promise<Animal[]> {
    return this.listar({ situacao: 'active' });
  }

  async obter(id: number): Promise<Animal | null> {
    try {
      const linha = await this.db.getFirstAsync<LinhaAnimal>(`${SELECT_ANIMAL} WHERE id = ?`, id);
      return linha ? mapear(linha) : null;
    } catch (erro) {
      tratarErro(erro, 'obter', { id });
    }
  }

  async consultarPorBrinco(brinco: string): Promise<Animal[]> {
    try {
      const linhas = await this.db.getAllAsync<LinhaAnimal>(
        `${SELECT_ANIMAL} WHERE trim(tag_number) = ? COLLATE NOCASE
         ORDER BY (status = 'active') DESC, id DESC`, brinco.trim(),
      );
      return linhas.map(mapear);
    } catch (erro) {
      tratarErro(erro, 'consultar por brinco', { brinco });
    }
  }

  async existeAtivoComBrinco(brinco: string, ignorarId?: number): Promise<boolean> {
    try {
      const tag = brinco.trim();
      const linha =
        ignorarId !== undefined
          ? await this.db.getFirstAsync<{ id: number }>(
              `SELECT id FROM cattle
               WHERE status = 'active' AND trim(tag_number) = ? COLLATE NOCASE AND id <> ?
               LIMIT 1`,
              tag,
              ignorarId,
            )
          : await this.db.getFirstAsync<{ id: number }>(
              `SELECT id FROM cattle
               WHERE status = 'active' AND trim(tag_number) = ? COLLATE NOCASE
               LIMIT 1`,
              tag,
            );
      return linha !== null;
    } catch (erro) {
      tratarErro(erro, 'verificar duplicidade de brinco', { brinco, ignorarId });
    }
  }

  async criar(entrada: EntradaAnimal): Promise<number> {
    const animal = validarAnimal(entrada);
    try {
      const status = entrada.situacao ?? 'active';
      const resultado = await this.db.runAsync(
        `INSERT INTO cattle (tag_number, sex, birth_date, estimated_age_months, breed, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        animal.brinco,
        animal.sexo,
        animal.dataNascimento,
        animal.idadeEstimadaMeses,
        animal.raca,
        animal.observacoes,
        status,
      );
      return resultado.lastInsertRowId;
    } catch (erro) {
      tratarErro(erro, 'cadastrar', animal);
    }
  }

  async desconsiderarDeVendasPlanejadas(animalId: number, brinco?: string): Promise<void> {
    const tagLimpa = brinco?.trim();
    const itens = tagLimpa
      ? await this.db.getAllAsync<{ id: number; sale_id: number; weight_kg: number }>(
          `SELECT si.id, si.sale_id, si.weight_kg
           FROM sale_items si
           JOIN sales s ON s.id = si.sale_id
           WHERE s.sale_type = 'planejada'
             AND (si.animal_id = ? OR trim(si.ear_tag) = ? COLLATE NOCASE)`,
          animalId,
          tagLimpa,
        )
      : await this.db.getAllAsync<{ id: number; sale_id: number; weight_kg: number }>(
          `SELECT si.id, si.sale_id, si.weight_kg
           FROM sale_items si
           JOIN sales s ON s.id = si.sale_id
           WHERE s.sale_type = 'planejada'
             AND si.animal_id = ?`,
          animalId,
        );

    if (itens.length === 0) return;

    const saleIds = Array.from(new Set(itens.map((it) => it.sale_id)));

    for (const saleId of saleIds) {
      const todosItensDaVenda = await this.db.getAllAsync<{ id: number; animal_id: number | null; ear_tag: string }>(
        `SELECT id, animal_id, ear_tag FROM sale_items WHERE sale_id = ?`,
        saleId,
      );

      const itensParaRemover = todosItensDaVenda.filter(
        (it) =>
          it.animal_id === animalId ||
          (tagLimpa && it.ear_tag.trim().toUpperCase() === tagLimpa.toUpperCase()),
      );

      const qtdRestante = todosItensDaVenda.length - itensParaRemover.length;

      if (qtdRestante <= 0) {
        await this.db.runAsync(`DELETE FROM sales WHERE id = ?`, saleId);
      } else {
        const placeholders = itensParaRemover.map(() => '?').join(',');
        await this.db.runAsync(
          `DELETE FROM sale_items WHERE id IN (${placeholders})`,
          ...itensParaRemover.map((it) => it.id),
        );

        const vendaAtual = await this.db.getFirstAsync<{ gross_value_cents: number }>(
          `SELECT gross_value_cents FROM sales WHERE id = ?`,
          saleId,
        );
        if (vendaAtual) {
          const novoValor = Math.max(
            1,
            Math.round((vendaAtual.gross_value_cents * qtdRestante) / todosItensDaVenda.length),
          );
          await this.db.runAsync(
            `UPDATE sales SET gross_value_cents = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            novoValor,
            saleId,
          );
        }
      }
    }
  }

  async atualizar(id: number, entrada: EntradaAnimal): Promise<void> {
    const animal = validarAnimal(entrada);
    try {
      if (entrada.situacao === 'dead') {
        const existente = await this.obter(id);
        await this.desconsiderarDeVendasPlanejadas(id, existente?.brinco ?? animal.brinco);
      }

      let resultado;
      if (entrada.situacao) {
        resultado = await this.db.runAsync(
          `UPDATE cattle SET tag_number = ?, sex = ?, birth_date = ?, estimated_age_months = ?,
           breed = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          animal.brinco, animal.sexo, animal.dataNascimento, animal.idadeEstimadaMeses,
          animal.raca, animal.observacoes, entrada.situacao, id,
        );
      } else {
        resultado = await this.db.runAsync(
          `UPDATE cattle SET tag_number = ?, sex = ?, birth_date = ?, estimated_age_months = ?,
           breed = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          animal.brinco, animal.sexo, animal.dataNascimento, animal.idadeEstimadaMeses,
          animal.raca, animal.observacoes, id,
        );
      }
      if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Animal não encontrado.');
    } catch (erro) {
      tratarErro(erro, 'atualizar', { id, animal });
    }
  }

  async marcarComoMorto(id: number): Promise<void> {
    try {
      const animal = await this.obter(id);
      if (!animal) throw new ErroDominio('nao_encontrado', 'Animal não encontrado.');
      await this.desconsiderarDeVendasPlanejadas(id, animal.brinco);
      const resultado = await this.db.runAsync(
        `UPDATE cattle SET status = 'dead', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        id,
      );
      if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Animal não encontrado.');
    } catch (erro) {
      tratarErro(erro, 'registrar morte de', { id });
    }
  }

  async excluir(id: number): Promise<void> {
    try {
      const animal = await this.obter(id);
      if (animal) {
        await this.desconsiderarDeVendasPlanejadas(id, animal.brinco);
      }
      const resultado = await this.db.runAsync('DELETE FROM cattle WHERE id = ?', id);
      if (!resultado.changes) throw new ErroDominio('nao_encontrado', 'Animal não encontrado.');
    } catch (erro) {
      tratarErro(erro, 'excluir', { id });
    }
  }
}
