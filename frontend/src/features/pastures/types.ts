export type CondicaoCapim = 'verde' | 'parcialmente_seco' | 'seco';

export type TipoCapim = {
  id: number;
  nome: string;
  alturaMinimaCm: number;
  alturaMaximaCm: number;
};

export type EntradaTipoCapim = Omit<TipoCapim, 'id'>;

export type Pasto = {
  id: number;
  nome: string;
  areaHectares: number;
  tipoCapimId: number;
  tipoCapimNome: string;
  alturaAtualCm: number;
  condicaoCapim: CondicaoCapim;
  coberturaPercentual: number;
};

export type EntradaPasto = Omit<Pasto, 'id' | 'tipoCapimNome'>;

export interface RepositorioPastos {
  listar(): Promise<Pasto[]>;
  obter(id: number): Promise<Pasto | null>;
  criar(entrada: EntradaPasto): Promise<number>;
  atualizar(id: number, entrada: EntradaPasto): Promise<void>;
  excluir(id: number): Promise<void>;
}

export interface RepositorioTiposCapim {
  listar(): Promise<TipoCapim[]>;
  obter(id: number): Promise<TipoCapim | null>;
  criar(entrada: EntradaTipoCapim): Promise<number>;
  atualizar(id: number, entrada: EntradaTipoCapim): Promise<void>;
  excluir(id: number): Promise<void>;
}
