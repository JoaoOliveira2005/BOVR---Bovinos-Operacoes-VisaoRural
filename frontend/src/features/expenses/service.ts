import { ErroDominio } from '../../domain/errors';
import type { EntradaGasto, RepositorioCategoriasGasto, RepositorioGastos } from './types';
import { validarGasto, validarNomeCategoria } from './validation';

export class ServicoGastos {
  constructor(
    private readonly gastos: RepositorioGastos,
    private readonly categorias: RepositorioCategoriasGasto,
  ) {}

  listarGastos() { return this.gastos.listar(); }
  obterGasto(id: number) { return this.gastos.obter(id); }
  listarCategorias() { return this.categorias.listarCategorias(); }
  listarSubcategorias(categoriaId?: number) { return this.categorias.listarSubcategorias(categoriaId); }

  async salvarGasto(entrada: EntradaGasto, id?: number) {
    const valida = validarGasto(entrada);
    if (valida.subcategoriaId) {
      const subs = await this.categorias.listarSubcategorias(valida.categoriaId);
      if (!subs.some((item) => item.id === valida.subcategoriaId && item.categoriaId === valida.categoriaId)) {
        throw new ErroDominio('validacao', 'A subcategoria não pertence à categoria selecionada.');
      }
    }
    return id ? this.gastos.atualizar(id, valida) : this.gastos.criar(valida);
  }

  excluirGasto(id: number) { return this.gastos.excluir(id); }
  criarCategoria(nome: string) { return this.categorias.criarCategoria(validarNomeCategoria(nome)); }
  atualizarCategoria(id: number, nome: string) { return this.categorias.atualizarCategoria(id, validarNomeCategoria(nome)); }
  excluirCategoria(id: number) { return this.categorias.excluirCategoria(id); }
  criarSubcategoria(categoriaId: number, nome: string) { return this.categorias.criarSubcategoria(categoriaId, validarNomeCategoria(nome)); }
  atualizarSubcategoria(id: number, nome: string) { return this.categorias.atualizarSubcategoria(id, validarNomeCategoria(nome)); }
  excluirSubcategoria(id: number) { return this.categorias.excluirSubcategoria(id); }
}
