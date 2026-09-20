export type CategoriaGasto = { id: number; nome: string; protegida: boolean };
export type SubcategoriaGasto = { id: number; categoriaId: number; nome: string };

export type Gasto = {
  id: number;
  descricao: string;
  categoriaId: number;
  categoriaNome: string;
  subcategoriaId: number | null;
  subcategoriaNome: string | null;
  valorCentavos: number;
  data: string;
};

export type EntradaGasto = Omit<Gasto, 'id' | 'categoriaNome' | 'subcategoriaNome'>;

export interface RepositorioGastos {
  listar(): Promise<Gasto[]>;
  obter(id: number): Promise<Gasto | null>;
  criar(entrada: EntradaGasto): Promise<number>;
  atualizar(id: number, entrada: EntradaGasto): Promise<void>;
  excluir(id: number): Promise<void>;
}

export interface RepositorioCategoriasGasto {
  listarCategorias(): Promise<CategoriaGasto[]>;
  listarSubcategorias(categoriaId?: number): Promise<SubcategoriaGasto[]>;
  criarCategoria(nome: string): Promise<number>;
  atualizarCategoria(id: number, nome: string): Promise<void>;
  excluirCategoria(id: number): Promise<void>;
  criarSubcategoria(categoriaId: number, nome: string): Promise<number>;
  atualizarSubcategoria(id: number, nome: string): Promise<void>;
  excluirSubcategoria(id: number): Promise<void>;
}
