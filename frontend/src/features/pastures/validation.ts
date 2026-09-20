import { ErroDominio } from '../../domain/errors';
import type { EntradaPasto, EntradaTipoCapim } from './types';

function numeroFinito(valor: number, rotulo: string): void {
  if (!Number.isFinite(valor)) {
    throw new ErroDominio('validacao', `Informe ${rotulo} em um formato válido.`);
  }
}

export function validarTipoCapim(entrada: EntradaTipoCapim): EntradaTipoCapim {
  const nome = entrada.nome.trim();
  if (!nome) throw new ErroDominio('validacao', 'Informe o nome do tipo de capim.');
  numeroFinito(entrada.alturaMinimaCm, 'a altura mínima');
  numeroFinito(entrada.alturaMaximaCm, 'a altura máxima');
  if (entrada.alturaMinimaCm < 0 || entrada.alturaMaximaCm < 0) {
    throw new ErroDominio('validacao', 'As alturas não podem ser negativas.');
  }
  if (entrada.alturaMaximaCm < entrada.alturaMinimaCm) {
    throw new ErroDominio('validacao', 'A altura máxima deve ser maior ou igual à mínima.');
  }
  return { ...entrada, nome };
}

export function validarPasto(entrada: EntradaPasto): EntradaPasto {
  const nome = entrada.nome.trim();
  if (!nome) throw new ErroDominio('validacao', 'Informe o nome do pasto.');
  numeroFinito(entrada.areaHectares, 'a área');
  numeroFinito(entrada.alturaAtualCm, 'a altura atual');
  numeroFinito(entrada.coberturaPercentual, 'a cobertura');
  if (entrada.areaHectares <= 0) {
    throw new ErroDominio('validacao', 'A área deve ser maior que zero.');
  }
  if (!Number.isInteger(entrada.tipoCapimId) || entrada.tipoCapimId <= 0) {
    throw new ErroDominio('validacao', 'Selecione um tipo de capim.');
  }
  if (entrada.alturaAtualCm < 0) {
    throw new ErroDominio('validacao', 'A altura atual não pode ser negativa.');
  }
  if (!Number.isInteger(entrada.coberturaPercentual) || entrada.coberturaPercentual < 0 || entrada.coberturaPercentual > 100) {
    throw new ErroDominio('validacao', 'A cobertura deve ser um percentual inteiro entre 0 e 100.');
  }
  return { ...entrada, nome };
}
