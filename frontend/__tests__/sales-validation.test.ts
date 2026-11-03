import { ErroDominio } from '../src/domain/errors';
import { ServicoVendas } from '../../backend/features/sales/service';
import type { EntradaVenda, RepositorioVendas, Venda } from '../../backend/features/sales/types';
import { validarItemVenda, validarVenda } from '../../backend/features/sales/validation';

describe('Validação de Vendas (RF-19, RF-21)', () => {
  const vendaValida: EntradaVenda = {
    tipo: 'realizada',
    comprador: 'Frigorífico Estrela',
    data: '2026-10-07',
    valorBrutoCentavos: 1500000, // R$ 15.000,00
    observacoes: 'À vista',
    itens: [
      { brinco: '001', pesoKg: 520.5 },
      { brinco: '002', pesoKg: 490 },
    ],
  };

  it('valida com sucesso uma venda completa', () => {
    const res = validarVenda(vendaValida);
    expect(res.comprador).toBe('Frigorífico Estrela');
    expect(res.itens).toHaveLength(2);
    expect(res.itens[0].pesoKg).toBe(520.5);
  });

  it('exige nome do comprador (RF-19.1)', () => {
    expect(() => validarVenda({ ...vendaValida, comprador: '   ' })).toThrow(ErroDominio);
  });

  it('exige data no formato válido', () => {
    expect(() => validarVenda({ ...vendaValida, data: 'data-invalida' })).toThrow(ErroDominio);
    expect(() => validarVenda({ ...vendaValida, data: '2026-02-31' })).toThrow(ErroDominio);
  });

  it('exige valor bruto em centavos maior que zero', () => {
    expect(() => validarVenda({ ...vendaValida, valorBrutoCentavos: 0 })).toThrow(ErroDominio);
    expect(() => validarVenda({ ...vendaValida, valorBrutoCentavos: -100 })).toThrow(ErroDominio);
  });

  it('exige pelo menos um animal na venda', () => {
    expect(() => validarVenda({ ...vendaValida, itens: [] })).toThrow(ErroDominio);
  });

  it('rejeita brincos duplicados dentro da mesma venda', () => {
    expect(() =>
      validarVenda({
        ...vendaValida,
        itens: [
          { brinco: '123', pesoKg: 400 },
          { brinco: '123', pesoKg: 420 },
        ],
      }),
    ).toThrow(ErroDominio);
  });

  it('rejeita peso zerado ou negativo no item do animal', () => {
    expect(() => validarItemVenda({ brinco: '123', pesoKg: 0 })).toThrow(ErroDominio);
    expect(() => validarItemVenda({ brinco: '123', pesoKg: -50 })).toThrow(ErroDominio);
    expect(() => validarItemVenda({ brinco: '', pesoKg: 400 })).toThrow(ErroDominio);
  });
});

describe('Servico de Vendas e Resumos', () => {
  function repoFake(dadosIniciais: Venda[] = []): RepositorioVendas {
    const lista = [...dadosIniciais];
    return {
      listar: async (filtro) => {
        return lista.filter((v) => {
          if (filtro?.tipo && v.tipo !== filtro.tipo) return false;
          if (filtro?.comprador && !v.comprador.includes(filtro.comprador)) return false;
          return true;
        });
      },
      obter: async (id) => lista.find((v) => v.id === id) ?? null,
      criar: async (entrada) => {
        const id = lista.length + 1;
        const pesoTotal = entrada.itens.reduce((acc, it) => acc + it.pesoKg, 0);
        lista.push({
          ...entrada,
          id,
          observacoes: entrada.observacoes ?? null,
          quantidadeAnimais: entrada.itens.length,
          pesoTotalKg: pesoTotal,
        });
        return id;
      },
      atualizar: async (id, entrada) => {
        const idx = lista.findIndex((v) => v.id === id);
        if (idx >= 0) {
          const pesoTotal = entrada.itens.reduce((acc, it) => acc + it.pesoKg, 0);
          lista[idx] = {
            ...entrada,
            id,
            observacoes: entrada.observacoes ?? null,
            quantidadeAnimais: entrada.itens.length,
            pesoTotalKg: pesoTotal,
          };
        }
      },
      excluir: async (id) => {
        const idx = lista.findIndex((v) => v.id === id);
        if (idx >= 0) lista.splice(idx, 1);
      },
    };
  }

  it('calcula o resumo de vendas corretamente (RF-19.2)', async () => {
    const repo = repoFake();
    const servico = new ServicoVendas(repo);

    await servico.salvar({
      tipo: 'realizada',
      comprador: 'Comprador A',
      data: '2026-10-01',
      valorBrutoCentavos: 1000000,
      itens: [{ brinco: 'A1', pesoKg: 500 }],
    });

    await servico.salvar({
      tipo: 'realizada',
      comprador: 'Comprador B',
      data: '2026-10-05',
      valorBrutoCentavos: 2000000,
      itens: [
        { brinco: 'B1', pesoKg: 450 },
        { brinco: 'B2', pesoKg: 450 },
      ],
    });

    const vendas = await servico.listar();
    expect(vendas).toHaveLength(2);

    const resumo = servico.calcularResumo(vendas);
    expect(resumo.totalCentavos).toBe(3000000);
    expect(resumo.totalAnimais).toBe(3);
    expect(resumo.pesoTotalKg).toBe(1400);
  });
});
