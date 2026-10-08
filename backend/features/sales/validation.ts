import { ErroDominio } from '../../domain/errors';
import type { EntradaItemVenda, EntradaVenda } from './types';

const ISO_DATA = /^\d{4}-\d{2}-\d{2}$/;

function dataValida(iso: string): boolean {
  if (!ISO_DATA.test(iso)) return false;
  const [ano, mes, dia] = iso.split('-').map(Number);
  const d = new Date(ano, mes - 1, dia);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
}

export function validarItemVenda(item: EntradaItemVenda, indice?: number): EntradaItemVenda {
  const prefixo = indice !== undefined ? `No animal ${indice + 1}: ` : '';
  const brinco = item.brinco?.trim();
  if (!brinco) {
    throw new ErroDominio('validacao', `${prefixo}Informe o número do brinco do animal.`);
  }

  if (typeof item.pesoKg !== 'number' || !Number.isFinite(item.pesoKg) || item.pesoKg <= 0) {
    throw new ErroDominio('validacao', `${prefixo}O peso do animal deve ser maior que zero (em kg).`);
  }

  return {
    animalId: item.animalId ?? null,
    brinco,
    pesoKg: Number(item.pesoKg.toFixed(2)),
  };
}

export function validarVenda(entrada: EntradaVenda): EntradaVenda {
  const comprador = entrada.comprador?.trim();
  if (!comprador) {
    throw new ErroDominio('validacao', 'Informe o nome do comprador.');
  }

  const data = entrada.data?.trim();
  if (!data || !dataValida(data)) {
    throw new ErroDominio('validacao', 'Informe uma data válida no formato DD/MM/AAAA.');
  }

  if (
    typeof entrada.valorBrutoCentavos !== 'number' ||
    !Number.isInteger(entrada.valorBrutoCentavos) ||
    entrada.valorBrutoCentavos <= 0
  ) {
    throw new ErroDominio('validacao', 'O valor bruto da venda deve ser maior que zero.');
  }

  if (entrada.tipo !== 'realizada' && entrada.tipo !== 'planejada') {
    throw new ErroDominio('validacao', 'Tipo de venda inválido. Deve ser realizada ou planejada.');
  }

  if (!Array.isArray(entrada.itens) || entrada.itens.length === 0) {
    throw new ErroDominio('validacao', 'Adicione pelo menos um animal à venda.');
  }

  // Verifica brincos duplicados dentro da mesma venda
  const brincosVistos = new Set<string>();
  const itensValidados = entrada.itens.map((item, idx) => {
    const itemValido = validarItemVenda(item, idx);
    const chave = itemValido.brinco.toUpperCase();
    if (brincosVistos.has(chave)) {
      throw new ErroDominio('validacao', `O brinco ${itemValido.brinco} foi incluído mais de uma vez nesta venda.`);
    }
    brincosVistos.add(chave);
    return itemValido;
  });

  const observacoes = entrada.observacoes?.trim() || null;

  return {
    tipo: entrada.tipo,
    comprador,
    data,
    valorBrutoCentavos: entrada.valorBrutoCentavos,
    observacoes,
    itens: itensValidados,
  };
}
