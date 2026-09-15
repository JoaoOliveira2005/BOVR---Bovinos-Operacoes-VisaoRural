/**
 * Formatacao de exibicao — RNF-18.
 *
 * Valores financeiros em reais com duas casas decimais e datas em DD/MM/AAAA.
 * A formatação é feita manualmente em vez de via `Intl` porque o suporte a
 * locale do Hermes varia entre builds do Android, e o formato pt-BR aqui é
 * requisito, não preferência do aparelho.
 */

/** Converte 1234.5 em "R$ 1.234,50". */
export function moeda(valor: number): string {
  const negativo = valor < 0;
  const [inteiro, centavos] = Math.abs(valor).toFixed(2).split('.');
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negativo ? '-' : ''}R$ ${comMilhar},${centavos}`;
}

/** Converte uma Date em "15/09/2026". */
export function data(valor: Date): string {
  const dia = String(valor.getDate()).padStart(2, '0');
  const mes = String(valor.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${valor.getFullYear()}`;
}

/** Converte uma Date em "15/09/2026 às 14:30". Usado no registro do último backup (RF-36). */
export function dataHora(valor: Date): string {
  const hora = String(valor.getHours()).padStart(2, '0');
  const minuto = String(valor.getMinutes()).padStart(2, '0');
  return `${data(valor)} às ${hora}:${minuto}`;
}

/** Concorda o substantivo com a quantidade: `plural(1, 'animal', 'animais')`. */
export function plural(quantidade: number, singular: string, muitos: string): string {
  return quantidade === 1 ? singular : muitos;
}
