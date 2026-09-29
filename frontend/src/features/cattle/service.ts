import { ErroDominio } from '../../domain/errors';
import type { EntradaAnimal, RepositorioAnimais } from './types';
import { validarAnimal } from './validation';

export class ServicoAnimais {
  constructor(private readonly animais: RepositorioAnimais) {}

  listar() { return this.animais.listar(); }
  obter(id: number) { return this.animais.obter(id); }

  /**
   * RF-01, RF-01.1, RF-01.2 — cadastra ou atualiza, barrando brinco duplicado.
   *
   * A checagem vem depois da validação de formato: não faz sentido consultar o
   * banco por um brinco que ainda nem passou no `trim`.
   */
  async salvar(entrada: EntradaAnimal, id?: number): Promise<number | void> {
    const valida = validarAnimal(entrada);

    if (await this.animais.existeAtivoComBrinco(valida.brinco, id)) {
      throw new ErroDominio(
        'duplicado',
        `Já existe um animal ativo com o brinco ${valida.brinco}. Use outro número ou altere a situação do animal que já tem esse brinco.`,
      );
    }

    return id ? this.animais.atualizar(id, valida) : this.animais.criar(valida);
  }

  async exigirAnimal(id: number) {
    const animal = await this.animais.obter(id);
    if (!animal) throw new ErroDominio('nao_encontrado', 'Animal não encontrado.');
    return animal;
  }
}
