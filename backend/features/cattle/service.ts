import { idadeDoAnimal } from './idade';
import { validarAnimal } from './validation';
import type { Animal, EntradaAnimal, RepositorioAnimais } from './types';
import { ErroDominio } from '../../domain/errors';

export interface RepositorioConsultaAnimais extends RepositorioAnimais {
  consultarPorBrinco(brinco: string): Promise<Animal[]>;
}

export type DetalhesAnimal = Animal & { idade: ReturnType<typeof idadeDoAnimal> };

/** Cadastro e consulta locais, sem dependência do domínio do frontend. */
export class ServicoAnimais {
  constructor(private readonly repositorio: RepositorioConsultaAnimais) {}

  listar() { return this.repositorio.listar(); }
  obter(id: number) { return this.repositorio.obter(id); }

  async exigirAnimal(id: number): Promise<Animal> {
    const animal = await this.obter(id);
    if (!animal) throw new ErroDominio('nao_encontrado', 'Animal não encontrado.');
    return animal;
  }

  async salvar(entrada: EntradaAnimal, id?: number): Promise<number | void> {
    const valida = validarAnimal(entrada);
    if (id !== undefined) {
      const existente = await this.exigirAnimal(id);
      // Alterar um registro histórico não disputa o brinco com o animal ativo.
      if (existente.situacao !== 'ativo') return this.repositorio.atualizar(id, valida);
    }
    if (await this.repositorio.existeAtivoComBrinco(valida.brinco, id)) {
      throw new ErroDominio('duplicado',
        `Já existe um animal ativo com o brinco ${valida.brinco}. Use outro número ou altere a situação do animal que já tem esse brinco.`);
    }
    return id !== undefined ? this.repositorio.atualizar(id, valida) : this.repositorio.criar(valida);
  }

  /** Retorna o ativo primeiro, seguido pelo histórico; retorna [] se não encontrar. */
  async consultarPorBrinco(brinco: string, hoje = new Date()): Promise<DetalhesAnimal[]> {
    const numero = brinco.trim();
    if (!numero) throw new ErroDominio('validacao', 'Informe o número do brinco para consultar.');
    const animais = await this.repositorio.consultarPorBrinco(numero);
    return animais.map((animal) => ({ ...animal, idade: idadeDoAnimal(animal, hoje) }));
  }
}
