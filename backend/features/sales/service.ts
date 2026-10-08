import { ErroDominio } from '../../domain/errors';
import type { EntradaVenda, FiltroVendas, RepositorioVendas, Venda } from './types';
import { validarVenda } from './validation';

export class ServicoVendas {
  constructor(private readonly repositorio: RepositorioVendas) {}

  listar(filtro?: FiltroVendas): Promise<Venda[]> {
    return this.repositorio.listar(filtro);
  }

  obter(id: number): Promise<Venda | null> {
    return this.repositorio.obter(id);
  }

  async exigir(id: number): Promise<Venda> {
    const venda = await this.repositorio.obter(id);
    if (!venda) throw new ErroDominio('nao_encontrado', 'Venda não encontrada.');
    return venda;
  }

  salvar(entrada: EntradaVenda, id?: number): Promise<number | void> {
    const valida = validarVenda(entrada);
    return id ? this.repositorio.atualizar(id, valida) : this.repositorio.criar(valida);
  }

  excluir(id: number): Promise<void> {
    return this.repositorio.excluir(id);
  }

  calcularResumo(vendas: Venda[]) {
    return vendas.reduce(
      (acc, v) => ({
        totalCentavos: acc.totalCentavos + v.valorBrutoCentavos,
        totalAnimais: acc.totalAnimais + v.quantidadeAnimais,
        pesoTotalKg: acc.pesoTotalKg + v.pesoTotalKg,
      }),
      { totalCentavos: 0, totalAnimais: 0, pesoTotalKg: 0 },
    );
  }
}
