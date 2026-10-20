import { ErroDominio } from '../../../frontend/src/domain/errors';
import type { CondicaoCapim, QualidadePasto } from './types';

export function hojeLocal(): string {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
}

export function dataValida(data: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data < '0001-01-01') return false;
  const instante = new Date(`${data}T00:00:00.000Z`);
  return Number.isFinite(instante.getTime()) && instante.toISOString().slice(0, 10) === data;
}

export function validarData(data: string, hoje: string): void {
  if (!dataValida(data) || data > hoje) {
    throw new ErroDominio('validacao', 'Informe uma data válida, sem ultrapassar a data de hoje (AAAA-MM-DD).');
  }
}

export function validarId(id: number): void {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ErroDominio('validacao', 'Informe um identificador válido.');
}

export function validarMedicao(entrada: {
  alturaAtualCm: number; condicaoCapim: CondicaoCapim; coberturaPercentual: number;
}): void {
  if (!Number.isFinite(entrada.alturaAtualCm) || entrada.alturaAtualCm < 0) {
    throw new ErroDominio('validacao', 'A altura atual deve ser um número maior ou igual a zero.');
  }
  if (!['verde', 'parcialmente_seco', 'seco'].includes(entrada.condicaoCapim)) {
    throw new ErroDominio('validacao', 'Selecione uma condição válida para o capim.');
  }
  if (!Number.isInteger(entrada.coberturaPercentual) || entrada.coberturaPercentual < 0 || entrada.coberturaPercentual > 100) {
    throw new ErroDominio('validacao', 'A cobertura deve ser um percentual inteiro entre 0 e 100.');
  }
}

export function classificarQualidade(
  altura: number, condicao: CondicaoCapim, cobertura: number, minima: number, maxima: number,
): QualidadePasto {
  const falhas = Number(altura < minima || altura > maxima) + Number(condicao !== 'verde') + Number(cobertura < 80);
  return falhas === 0 ? 'boa' : falhas === 1 ? 'regular' : 'ruim';
}

// Diferença entre datas de calendário; independe de fuso horário/horário de verão.
export function diasEntre(inicio: string, fim: string): number {
  return (Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`)) / 86400000;
}
