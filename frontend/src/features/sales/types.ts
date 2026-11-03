export type TipoVenda = 'realizada' | 'planejada';

export type ItemVenda = {
  id?: number;
  animalId?: number | null;
  brinco: string;
  pesoKg: number;
};

export type EntradaItemVenda = {
  animalId?: number | null;
  brinco: string;
  pesoKg: number;
};

export type Venda = {
  id: number;
  tipo: TipoVenda;
  comprador: string;
  data: string; // YYYY-MM-DD
  valorBrutoCentavos: number;
  observacoes: string | null;
  itens: ItemVenda[];
  quantidadeAnimais: number;
  pesoTotalKg: number;
  criadoEm?: string;
  atualizadoEm?: string;
};

export type EntradaVenda = {
  tipo: TipoVenda;
  comprador: string;
  data: string;
  valorBrutoCentavos: number;
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
}
