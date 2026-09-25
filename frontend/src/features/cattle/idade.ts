/**
 * Cálculo e exibição de idade — RF-01.4.
 *
 * O sistema calcula a idade automaticamente quando há data de nascimento.
 * Mantido separado da validação porque a tela também usa isto para mostrar a
 * idade enquanto o usuário digita, antes de qualquer salvamento.
 */

/** Idade em meses completos entre a data de nascimento e hoje. */
export function idadeEmMeses(dataNascimentoIso: string, hoje = new Date()): number {
  const [ano, mes, dia] = dataNascimentoIso.split('-').map(Number);
  let meses = (hoje.getFullYear() - ano) * 12 + (hoje.getMonth() + 1 - mes);
  // Ainda não fez "mesversário": o mês corrente não conta.
  if (hoje.getDate() < dia) meses -= 1;
  return Math.max(0, meses);
}

/** Converte meses em texto legível: 0 → "recém-nascido", 14 → "1 ano e 2 meses". */
export function descreverIdade(meses: number): string {
  if (meses <= 0) return 'recém-nascido';
  const anos = Math.floor(meses / 12);
  const restantes = meses % 12;
  const partes: string[] = [];
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
  if (restantes > 0) partes.push(`${restantes} ${restantes === 1 ? 'mês' : 'meses'}`);
  return partes.join(' e ');
}

/** Idade do animal, venha ela da data de nascimento ou da estimativa. */
export function idadeDoAnimal(
  animal: { dataNascimento: string | null; idadeEstimadaMeses: number | null },
  hoje = new Date(),
): { meses: number; estimada: boolean } | null {
  if (animal.dataNascimento) {
    return { meses: idadeEmMeses(animal.dataNascimento, hoje), estimada: false };
  }
  if (animal.idadeEstimadaMeses !== null) {
    return { meses: animal.idadeEstimadaMeses, estimada: true };
  }
  return null;
}
