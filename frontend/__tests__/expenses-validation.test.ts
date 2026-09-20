import { ErroDominio } from '../src/domain/errors';
import { dataPtBrParaIso, reaisParaCentavos, validarGasto } from '../src/features/expenses/validation';

describe('validação financeira', () => {
  it('converte reais em centavos sem ponto flutuante no domínio', () => {
    expect(reaisParaCentavos('1.234,56')).toBe(123456);
    expect(reaisParaCentavos('10,5')).toBe(1050);
  });

  it('rejeita mais de duas casas decimais', () => {
    expect(() => reaisParaCentavos('10,999')).toThrow(ErroDominio);
  });

  it('converte uma data real para ISO', () => {
    expect(dataPtBrParaIso('20/09/2026')).toBe('2026-09-20');
  });

  it('rejeita datas inexistentes', () => {
    expect(() => dataPtBrParaIso('31/02/2026')).toThrow(ErroDominio);
  });

  it('exige descrição, categoria e valor positivo', () => {
    expect(() => validarGasto({ descricao: '', categoriaId: 1, subcategoriaId: null, valorCentavos: 100, data: '2026-09-20' }))
      .toThrow(ErroDominio);
    expect(() => validarGasto({ descricao: 'Ração', categoriaId: 0, subcategoriaId: null, valorCentavos: 100, data: '2026-09-20' }))
      .toThrow(ErroDominio);
    expect(() => validarGasto({ descricao: 'Ração', categoriaId: 1, subcategoriaId: null, valorCentavos: 0, data: '2026-09-20' }))
      .toThrow(ErroDominio);
  });
});
