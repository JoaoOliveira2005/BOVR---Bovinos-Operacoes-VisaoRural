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

  marcarAnimalMorto(vendaId: number, brinco: string): Promise<void> {
    return this.repositorio.marcarAnimalMorto(vendaId, brinco);
  }

  removerAnimal(vendaId: number, brinco: string): Promise<void> {
    return this.repositorio.removerAnimal(vendaId, brinco);
  }

  realizarVenda(id: number, itensComPesoReal: Array<{ brinco: string; actualWeightArroba: number }>): Promise<void> {
    return this.repositorio.atualizar(id, {
      tipo: 'realizada',
      itens: itensComPesoReal.map((item) => ({
        brinco: item.brinco,
        pricePerArrobaCentavos: 0,
        actualWeightArroba: item.actualWeightArroba,
      })),
    });
  }

  calcularResumo(vendas: Venda[]) {
    return vendas.reduce(
      (acc, v) => {
        const peso = v.itens.reduce((s, it) => s + (it.actualWeightArroba ?? it.plannedWeightArroba ?? 0), 0);
        const total = v.valorBrutoCentavos ?? v.itens.reduce((s, it) => s + (it.actualTotalCentavos ?? it.plannedTotalCentavos ?? 0), 0);
        return {
          totalCentavos: acc.totalCentavos + total,
          totalAnimais: acc.totalAnimais + v.quantidadeAnimais,
          pesoTotalArrobas: acc.pesoTotalArrobas + peso,
        };
      },
      { totalCentavos: 0, totalAnimais: 0, pesoTotalArrobas: 0 },
    );
  }
}