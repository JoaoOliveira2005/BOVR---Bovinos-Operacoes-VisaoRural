import { ServicoDashboard } from '../src/features/dashboard/service';
import type { RepositorioDashboard, ResumoFazenda } from '../src/features/dashboard/types';

describe('ServicoDashboard', () => {
  it('retorna os dados de resumo da fazenda corretamente', async () => {
    const mockResumo: ResumoFazenda = {
      pastos: {
        totalPastos: 4,
        areaTotalHectares: 120.5,
        pastosBons: 3,
      },
      gastos: {
        totalMesCentavos: 450000,
        quantidadeLancamentosMes: 6,
        totalGeralCentavos: 1200000,
      },
    };

    const repoMock: RepositorioDashboard = {
      obterResumoFazenda: jest.fn().mockResolvedValue(mockResumo),
      obterGastosPorCategoria: jest.fn().mockResolvedValue([]),
    };

    const servico = new ServicoDashboard(repoMock);
    const resultado = await servico.obterResumoFazenda();

    expect(repoMock.obterResumoFazenda).toHaveBeenCalledTimes(1);
    expect(resultado.pastos.totalPastos).toBe(4);
    expect(resultado.pastos.areaTotalHectares).toBe(120.5);
    expect(resultado.gastos.totalMesCentavos).toBe(450000);
  });

  it('retorna os gastos agrupados por categoria', async () => {
    const mockCategorias = [
      { categoriaId: 1, categoriaNome: 'Ração', totalCentavos: 300000, quantidade: 3 },
      { categoriaId: 2, categoriaNome: 'Infraestrutura', totalCentavos: 150000, quantidade: 1 },
    ];

    const repoMock: RepositorioDashboard = {
      obterResumoFazenda: jest.fn(),
      obterGastosPorCategoria: jest.fn().mockResolvedValue(mockCategorias),
    };

    const servico = new ServicoDashboard(repoMock);
    const resultado = await servico.obterGastosPorCategoria();

    expect(repoMock.obterGastosPorCategoria).toHaveBeenCalledTimes(1);
    expect(resultado).toHaveLength(2);
    expect(resultado[0].categoriaNome).toBe('Ração');
    expect(resultado[0].totalCentavos).toBe(300000);
  });
});
