export type TipoVenda = 'planejada' | 'realizada';

export type ItemVenda = {
  id?: number;
  animalId?: number | null;
  brinco: string;
  pricePerArrobaCentavos: number;
  plannedWeightArroba?: number | null;
  plannedTotalCentavos?: number | null;
  actualWeightArroba?: number | null;
  actualTotalCentavos?: number | null;
};

export type EntradaItemVenda = {
  animalId?: number | null;
  brinco: string;
  pricePerArrobaCentavos: number;
  plannedWeightArroba?: number | null;
  actualWeightArroba?: number | null;
};

export type Venda = {
  id: number;
  tipo: TipoVenda;
  comprador: string | null;
  data: string | null;
  valorBrutoCentavos: number | null;
  observacoes: string | null;
  itens: ItemVenda[];
  quantidadeAnimais: number;
  criadoEm?: string;
  atualizadoEm?: string;
};

export type EntradaVenda = {
  tipo: TipoVenda;
  comprador?: string | null;
  data?: string | null;
  valorBrutoCentavos?: number | null;
  observacoes?: string | null;
  itens: EntradaItemVenda[];
};

export type FiltroVendas = {
  tipo?: TipoVenda;
  dataInicio?: string;
  dataFim?: string;
  comprador?: string;
  brinco?: string;
};

export interface RepositorioVendas {
  listar(filtro?: FiltroVendas): Promise<Venda[]>;
  obter(id: number): Promise<Venda | null>;
  criar(entrada: EntradaVenda): Promise<number>;
  atualizar(id: number, entrada: EntradaVenda): Promise<void>;
  excluir(id: number): Promise<void>;
  marcarAnimalMorto(vendaId: number, brinco: string): Promise<void>;
  removerAnimal(vendaId: number, brinco: string): Promise<void>;
}