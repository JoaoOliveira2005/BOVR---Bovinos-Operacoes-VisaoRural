import { ErroDominio } from '../src/domain/errors';
import { ServicoGastos } from '../src/features/expenses/service';
import type { RepositorioCategoriasGasto, RepositorioGastos } from '../src/features/expenses/types';
import { ServicoPastos } from '../src/features/pastures/service';
import type { RepositorioPastos, RepositorioTiposCapim } from '../src/features/pastures/types';

describe('casos de uso de gastos', () => {
  it('impede associar subcategoria de outra categoria', async () => {
    const gastos = { criar: jest.fn() } as unknown as RepositorioGastos;
    const categorias = {
      listarSubcategorias: jest.fn().mockResolvedValue([{ id: 8, categoriaId: 2, nome: 'Mineral' }]),
    } as unknown as RepositorioCategoriasGasto;
    const servico = new ServicoGastos(gastos, categorias);

    await expect(servico.salvarGasto({
      descricao: 'Compra', categoriaId: 1, subcategoriaId: 8,
      valorCentavos: 1500, data: '2026-09-20',
    })).rejects.toEqual(expect.objectContaining<Partial<ErroDominio>>({ codigo: 'validacao' }));
    expect(gastos.criar).not.toHaveBeenCalled();
  });
});

describe('casos de uso de pastos', () => {
  it('valida antes de chamar o repositório', async () => {
    const pastos = { criar: jest.fn() } as unknown as RepositorioPastos;
    const tipos = {} as RepositorioTiposCapim;
    const servico = new ServicoPastos(pastos, tipos);

    expect(() => servico.salvarPasto({
      nome: 'Pasto', areaHectares: 0, tipoCapimId: 1,
      alturaAtualCm: 20, condicaoCapim: 'verde', coberturaPercentual: 80,
    })).toThrow(ErroDominio);
    expect(pastos.criar).not.toHaveBeenCalled();
  });
});
