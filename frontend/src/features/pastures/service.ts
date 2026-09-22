import { ErroDominio } from '../../domain/errors';
import type { EntradaPasto, EntradaTipoCapim, RepositorioPastos, RepositorioTiposCapim } from './types';
import { validarPasto, validarTipoCapim } from './validation';

export class ServicoPastos {
  constructor(
    private readonly pastos: RepositorioPastos,
    private readonly tipos: RepositorioTiposCapim,
  ) {}

  listarPastos() { return this.pastos.listar(); }
  listarTipos() { return this.tipos.listar(); }
  obterPasto(id: number) { return this.pastos.obter(id); }
  obterTipo(id: number) { return this.tipos.obter(id); }

  salvarPasto(entrada: EntradaPasto, id?: number) {
    const valida = validarPasto(entrada);
    return id ? this.pastos.atualizar(id, valida) : this.pastos.criar(valida);
  }

  salvarTipo(entrada: EntradaTipoCapim, id?: number) {
    const valida = validarTipoCapim(entrada);
    return id ? this.tipos.atualizar(id, valida) : this.tipos.criar(valida);
  }

  excluirPasto(id: number) { return this.pastos.excluir(id); }
  excluirTipo(id: number) { return this.tipos.excluir(id); }

  async exigirPasto(id: number) {
    const pasto = await this.pastos.obter(id);
    if (!pasto) throw new ErroDominio('nao_encontrado', 'Pasto não encontrado.');
    return pasto;
  }
}
