import { ErroDominio } from '../src/domain/errors';
import { descreverIdade, idadeDoAnimal, idadeEmMeses } from '../src/features/cattle/idade';
import { ServicoAnimais } from '../src/features/cattle/service';
import type { Animal, EntradaAnimal, RepositorioAnimais } from '../src/features/cattle/types';
import { validarAnimal } from '../src/features/cattle/validation';

const HOJE = new Date(2026, 8, 24); // 24/09/2026

const valido: EntradaAnimal = {
  brinco: '1234',
  sexo: 'macho',
  dataNascimento: '2024-03-10',
  idadeEstimadaMeses: null,
  raca: 'Nelore',
  observacoes: null,
};

describe('validação de animais (RF-01.3)', () => {
  it('normaliza brinco, raça e observações em branco', () => {
    expect(validarAnimal({ ...valido, brinco: '  1234 ', raca: ' Nelore ', observacoes: '   ' }, HOJE))
      .toEqual({ ...valido, observacoes: null });
  });

  it('exige o número do brinco', () => {
    expect(() => validarAnimal({ ...valido, brinco: '   ' }, HOJE)).toThrow(ErroDominio);
  });

  it('exige a raça', () => {
    expect(() => validarAnimal({ ...valido, raca: '' }, HOJE)).toThrow(ErroDominio);
  });

  it('aceita idade estimada quando não há data de nascimento', () => {
    const entrada = { ...valido, dataNascimento: null, idadeEstimadaMeses: 30 };
    expect(validarAnimal(entrada, HOJE)).toEqual(entrada);
  });

  it('rejeita quando nenhuma das duas fontes de idade é informada', () => {
    expect(() => validarAnimal({ ...valido, dataNascimento: null }, HOJE)).toThrow(ErroDominio);
  });

  it('rejeita data de nascimento e idade estimada ao mesmo tempo', () => {
    expect(() => validarAnimal({ ...valido, idadeEstimadaMeses: 30 }, HOJE)).toThrow(ErroDominio);
  });

  it('rejeita data que não existe no calendário', () => {
    expect(() => validarAnimal({ ...valido, dataNascimento: '2025-02-31' }, HOJE)).toThrow(ErroDominio);
  });

  it('rejeita data de nascimento no futuro', () => {
    expect(() => validarAnimal({ ...valido, dataNascimento: '2027-01-01' }, HOJE)).toThrow(ErroDominio);
  });

  it('rejeita idade estimada acima de 30 anos', () => {
    expect(() => validarAnimal({ ...valido, dataNascimento: null, idadeEstimadaMeses: 400 }, HOJE))
      .toThrow(ErroDominio);
  });
});

describe('cálculo de idade (RF-01.4)', () => {
  it('conta apenas meses completos', () => {
    expect(idadeEmMeses('2026-08-25', HOJE)).toBe(0); // falta um dia para 1 mês
    expect(idadeEmMeses('2026-08-24', HOJE)).toBe(1);
    expect(idadeEmMeses('2024-03-10', HOJE)).toBe(30);
  });

  it('descreve a idade em anos e meses', () => {
    expect(descreverIdade(0)).toBe('recém-nascido');
    expect(descreverIdade(1)).toBe('1 mês');
    expect(descreverIdade(12)).toBe('1 ano');
    expect(descreverIdade(30)).toBe('2 anos e 6 meses');
  });

  it('usa a estimativa quando não há data de nascimento', () => {
    expect(idadeDoAnimal({ dataNascimento: null, idadeEstimadaMeses: 18 }, HOJE))
      .toEqual({ meses: 18, estimada: true });
    expect(idadeDoAnimal({ dataNascimento: '2024-03-10', idadeEstimadaMeses: null }, HOJE))
      .toEqual({ meses: 30, estimada: false });
    expect(idadeDoAnimal({ dataNascimento: null, idadeEstimadaMeses: null }, HOJE)).toBeNull();
  });
});

/** Repositório mínimo em memória, só para exercitar a regra do brinco. */
function repositorioFake(existentes: Animal[] = []): RepositorioAnimais {
  const animais = [...existentes];
  return {
    listar: async () => animais,
    obter: async (id) => animais.find((a) => a.id === id) ?? null,
    existeAtivoComBrinco: async (brinco, ignorarId) =>
      animais.some((a) => a.situacao === 'ativo' && a.id !== ignorarId && a.brinco === brinco),
    criar: async (entrada) => {
      const id = animais.length + 1;
      animais.push({ ...entrada, id, situacao: 'ativo' });
      return id;
    },
    atualizar: async () => undefined,
  };
}

const ativo: Animal = { ...valido, id: 1, situacao: 'ativo' };

describe('brinco duplicado (RF-01.1, RF-01.2)', () => {
  it('impede cadastrar outro animal ativo com o mesmo brinco', async () => {
    const servico = new ServicoAnimais(repositorioFake([ativo]));
    await expect(servico.salvar({ ...valido, brinco: '1234' })).rejects.toThrow(ErroDominio);
  });

  it('a mensagem de erro diz o que fazer para corrigir (RNF-09)', async () => {
    const servico = new ServicoAnimais(repositorioFake([ativo]));
    await expect(servico.salvar({ ...valido, brinco: '1234' }))
      .rejects.toThrow(/Use outro número ou altere a situação/);
  });

  it('permite reaproveitar o brinco de um animal vendido (RF-06.1)', async () => {
    const servico = new ServicoAnimais(repositorioFake([{ ...ativo, situacao: 'vendido' }]));
    await expect(servico.salvar({ ...valido, brinco: '1234' })).resolves.toBe(2);
  });

  it('não acusa conflito do animal consigo mesmo ao editar', async () => {
    const servico = new ServicoAnimais(repositorioFake([ativo]));
    await expect(servico.salvar({ ...valido, raca: 'Angus' }, 1)).resolves.toBeUndefined();
  });
});
