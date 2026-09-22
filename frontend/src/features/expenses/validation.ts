import { ErroDominio } from '../../domain/errors';
import type { EntradaGasto } from './types';

export function validarNomeCategoria(nome: string): string {
  const limpo = nome.trim();
  if (!limpo) throw new ErroDominio('validacao', 'Informe um nome.');
  return limpo;
}

export function validarGasto(entrada: EntradaGasto): EntradaGasto {
  const descricao = entrada.descricao.trim();
  if (!descricao) throw new ErroDominio('validacao', 'Informe a descrição do gasto.');
  if (!Number.isInteger(entrada.categoriaId) || entrada.categoriaId <= 0) {
    throw new ErroDominio('validacao', 'Selecione uma categoria.');
  }
  if (!Number.isInteger(entrada.valorCentavos) || entrada.valorCentavos <= 0) {
    throw new ErroDominio('validacao', 'Informe um valor maior que zero.');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entrada.data)) {
    throw new ErroDominio('validacao', 'Informe uma data válida no formato DD/MM/AAAA.');
  }
  const [ano, mes, dia] = entrada.data.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
    throw new ErroDominio('validacao', 'Informe uma data válida no formato DD/MM/AAAA.');
  }
  return { ...entrada, descricao };
}

export function reaisParaCentavos(valor: string): number {
  const normalizado = valor.trim().replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) {
    throw new ErroDominio('validacao', 'Informe o valor com até duas casas decimais.');
  }
  return Math.round(Number(normalizado) * 100);
}

export function dataPtBrParaIso(valor: string): string {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor.trim());
  if (!partes) throw new ErroDominio('validacao', 'Informe a data no formato DD/MM/AAAA.');
  const [, dia, mes, ano] = partes;
  return validarGasto({ descricao: 'data', categoriaId: 1, subcategoriaId: null, valorCentavos: 1, data: `${ano}-${mes}-${dia}` }).data;
}

export function dataIsoParaPtBr(valor: string): string {
  const [ano, mes, dia] = valor.split('-');
  return `${dia}/${mes}/${ano}`;
}
