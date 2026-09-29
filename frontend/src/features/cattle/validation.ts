import { ErroDominio } from '../../domain/errors';
import type { EntradaAnimal } from './types';

/** Boi vive bem menos que isso; acima disso é quase certo erro de digitação. */
const IDADE_MAXIMA_MESES = 360;

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Verifica que a data existe de fato (rejeita 31/02, por exemplo). */
function dataValida(iso: string): boolean {
  if (!ISO.test(iso)) return false;
  const [ano, mes, dia] = iso.split('-').map(Number);
  const d = new Date(ano, mes - 1, dia);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
}

/**
 * RF-01.3 — valida os dados do cadastro de animal.
 *
 * As mensagens seguem RNF-09: dizem o que está errado **e** o que fazer para
 * corrigir. Uma mensagem que só aponta o problema obriga o usuário a adivinhar.
 */
export function validarAnimal(entrada: EntradaAnimal, hoje = new Date()): EntradaAnimal {
  const brinco = entrada.brinco.trim();
  if (!brinco) {
    throw new ErroDominio('validacao', 'Informe o número do brinco: é por ele que o animal é identificado.');
  }

  if (entrada.sexo !== 'macho' && entrada.sexo !== 'femea') {
    throw new ErroDominio('validacao', 'Selecione o sexo do animal: macho ou fêmea.');
  }

  const raca = entrada.raca.trim();
  if (!raca) {
    throw new ErroDominio('validacao', 'Informe a raça do animal.');
  }

  const temData = entrada.dataNascimento !== null;
  const temIdade = entrada.idadeEstimadaMeses !== null;

  // RF-01.3 pede data de nascimento **ou** idade estimada — um dos dois, nunca
  // os dois, senão a idade teria duas fontes que podem divergir.
  if (!temData && !temIdade) {
    throw new ErroDominio(
      'validacao',
      'Informe a data de nascimento ou, se não souber, a idade estimada do animal.',
    );
  }
  if (temData && temIdade) {
    throw new ErroDominio(
      'validacao',
      'Escolha uma só forma de idade: a data de nascimento ou a idade estimada.',
    );
  }

  if (temData) {
    const iso = entrada.dataNascimento as string;
    if (!dataValida(iso)) {
      throw new ErroDominio('validacao', 'A data de nascimento não existe no calendário. Use o formato DD/MM/AAAA.');
    }
    const nascimento = new Date(`${iso}T00:00:00`);
    if (nascimento.getTime() > hoje.getTime()) {
      throw new ErroDominio('validacao', 'A data de nascimento está no futuro. Confira o dia, o mês e o ano.');
    }
    const limite = new Date(hoje);
    limite.setMonth(limite.getMonth() - IDADE_MAXIMA_MESES);
    if (nascimento.getTime() < limite.getTime()) {
      throw new ErroDominio('validacao', 'A data de nascimento indica mais de 30 anos. Confira o ano informado.');
    }
  }

  if (temIdade) {
    const meses = entrada.idadeEstimadaMeses as number;
    if (!Number.isInteger(meses) || meses < 0) {
      throw new ErroDominio('validacao', 'A idade estimada deve ser informada em meses inteiros.');
    }
    if (meses > IDADE_MAXIMA_MESES) {
      throw new ErroDominio('validacao', 'A idade estimada passa de 30 anos. Confira os anos e meses informados.');
    }
  }

  const observacoes = entrada.observacoes?.trim() || null;
  return { ...entrada, brinco, raca, observacoes };
}
