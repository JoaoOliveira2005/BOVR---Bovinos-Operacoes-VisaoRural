/**
 * Dados de exemplo — PROVISORIO.
 *
 * A tela inicial precisa mostrar números reais para que o layout possa ser
 * avaliado, mas a camada de dados (RF-32, armazenamento local) ainda não
 * existe. Tudo aqui é fictício e deve sair quando o repositório local entrar:
 * troque as leituras de `resumoFazenda` pela consulta ao banco e apague este
 * arquivo.
 */
export const resumoFazenda = {
  nomeFazenda: 'Fazenda Santa Rita',
  /** RF-04 — quantidade total de animais ativos. */
  animaisAtivos: 342,
  /** RF-18.1 — pastos cadastrados e quantos estão ocupados. */
  pastosAtivos: 7,
  /** RF-13 — animais com ocorrência de saúde aberta ou em tratamento. */
  emTratamento: 4,
  /** RF-25 — vendas brutas menos gastos gerais, sobre todo o histórico (RF-25.1). */
  resultadoAcumulado: 18450.0,
  /** RF-36 — data e hora do último backup realizado. */
  ultimoBackup: new Date(2026, 8, 12, 19, 5),
};
