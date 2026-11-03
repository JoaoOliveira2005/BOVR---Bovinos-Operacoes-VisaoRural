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

  if (
    typeof item.pricePerArrobaCentavos !== 'number' ||
    !Number.isInteger(item.pricePerArrobaCentavos) ||
    item.pricePerArrobaCentavos <= 0
  ) {
    throw new ErroDominio('validacao', `${prefixo}Informe o Valor@ em centavos, maior que zero.`);
  }

  let plannedWeightArroba: number | null = null;
  if (item.plannedWeightArroba !== null && item.plannedWeightArroba !== undefined) {
    if (typeof item.plannedWeightArroba !== 'number' || !Number.isFinite(item.plannedWeightArroba) || item.plannedWeightArroba <= 0) {
      throw new ErroDominio('validacao', `${prefixo}O Peso@ planejado deve ser maior que zero.`);
    }
    plannedWeightArroba = Number(item.plannedWeightArroba.toFixed(2));
  }

  let actualWeightArroba: number | null = null;
  if (item.actualWeightArroba !== null && item.actualWeightArroba !== undefined) {
    if (typeof item.actualWeightArroba !== 'number' || !Number.isFinite(item.actualWeightArroba) || item.actualWeightArroba <= 0) {
      throw new ErroDominio('validacao', `${prefixo}O Peso@ real deve ser maior que zero.`);
    }
    actualWeightArroba = Number(item.actualWeightArroba.toFixed(2));
  }

  return {
    animalId: item.animalId ?? null,
    brinco,
    pricePerArrobaCentavos: item.pricePerArrobaCentavos,
    plannedWeightArroba,
    actualWeightArroba,
  };
}

export function validarVenda(entrada: EntradaVenda): EntradaVenda {
  if (entrada.tipo !== 'planejada' && entrada.tipo !== 'realizada') {
    throw new ErroDominio('validacao', 'Tipo de venda inválido. Deve ser planejada ou realizada.');
  }

  const comprador = entrada.comprador?.trim() || null;
  const data = entrada.data?.trim() || null;

  if (entrada.tipo === 'realizada') {
    if (!comprador) {
      throw new ErroDominio('validacao', 'Informe o nome do comprador.');
    }
    if (!data || !dataValida(data)) {
      throw new ErroDominio('validacao', 'Informe uma data válida no formato DD/MM/AAAA.');
    }
  } else if (data && !dataValida(data)) {
    throw new ErroDominio('validacao', 'Informe uma data válida no formato DD/MM/AAAA.');
  }

  if (!Array.isArray(entrada.itens) || entrada.itens.length === 0) {
    throw new ErroDominio('validacao', 'Adicione pelo menos um animal à venda.');
  }

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
    valorBrutoCentavos: entrada.valorBrutoCentavos ?? null,
    observacoes,
    itens: itensValidados,
  };
}