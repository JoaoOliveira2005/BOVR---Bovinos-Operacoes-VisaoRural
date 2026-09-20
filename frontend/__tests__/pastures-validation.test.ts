import { ErroDominio } from '../src/domain/errors';
import { validarPasto, validarTipoCapim } from '../src/features/pastures/validation';

describe('validação de tipos de capim', () => {
  it('normaliza o nome e aceita uma faixa válida', () => {
    expect(validarTipoCapim({ nome: '  Braquiária ', alturaMinimaCm: 20, alturaMaximaCm: 40 }))
      .toEqual({ nome: 'Braquiária', alturaMinimaCm: 20, alturaMaximaCm: 40 });
  });

  it('rejeita altura máxima menor que a mínima', () => {
    expect(() => validarTipoCapim({ nome: 'Mombaça', alturaMinimaCm: 50, alturaMaximaCm: 30 }))
      .toThrow(ErroDominio);
  });
});

describe('validação de pastos', () => {
  const valido = {
    nome: 'Pasto Norte', areaHectares: 12.5, tipoCapimId: 1,
    alturaAtualCm: 25, condicaoCapim: 'verde' as const, coberturaPercentual: 80,
  };

  it('aceita cobertura nos limites', () => {
    expect(validarPasto({ ...valido, coberturaPercentual: 0 }).coberturaPercentual).toBe(0);
    expect(validarPasto({ ...valido, coberturaPercentual: 100 }).coberturaPercentual).toBe(100);
  });

  it('rejeita cobertura fora de 0 a 100', () => {
    expect(() => validarPasto({ ...valido, coberturaPercentual: 101 })).toThrow(ErroDominio);
  });
});
