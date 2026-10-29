export type CondicaoCapim = 'green' | 'partly_dry' | 'dry';
export type QualidadePasto = 'good' | 'fair' | 'poor';

export type EntradaLeituraPasto = {
  pastoId: number;
  dataLeitura: string;
  alturaAtualCm: number;
  condicaoCapim: CondicaoCapim;
  coberturaPercentual: number;
};

export type LeituraPasto = EntradaLeituraPasto & {
  id: number;
  tipoCapimId: number;
  alturaMinimaCm: number;
  alturaMaximaCm: number;
  qualidade: QualidadePasto;
};

export type EntradaMovimentoPasto = { pastoDestinoId: number | null; dataMovimento: string };
export type MovimentoPasto = EntradaMovimentoPasto & {
  id: number;
  animalId: number;
  loteId: number | null;
  pastoOrigemId: number | null;
};
export type FiltroMovimentos = { pastoId?: number; animalId?: number; loteId?: number };
export type PermanenciaAnimal = {
  animalId: number;
  brinco: string;
  loteId: number | null;
  dataEntrada: string;
  diasPermanencia: number;
};
export type DescansoPasto = {
  id: number;
  pastoId: number;
  dataInicio: string;
  dataFim: string | null;
  diasDescanso: number;
};
export type PainelPasto = {
  pastoId: number;
  quantidadeAnimais: number;
  animais: PermanenciaAnimal[];
  // Lotes divididos são apresentados por pasto; o intervalo evita uma duração fictícia.
  lotes: { loteId: number; quantidadeAnimais: number; diasMinimos: number; diasMaximos: number }[];
  descansoAtual: DescansoPasto | null;
  ultimoDescansoConcluido: DescansoPasto | null;
};

export interface RepositorioManejoPastos {
  registrarLeitura(entrada: EntradaLeituraPasto): Promise<number>;
  listarLeituras(pastoId: number): Promise<LeituraPasto[]>;
  moverAnimal(animalId: number, entrada: EntradaMovimentoPasto): Promise<number[]>;
  moverLote(loteId: number, entrada: EntradaMovimentoPasto): Promise<number[]>;
  listarMovimentos(filtro: FiltroMovimentos): Promise<MovimentoPasto[]>;
  obterPainel(pastoId: number, dataReferencia: string): Promise<PainelPasto>;
  listarDescansos(pastoId: number, dataReferencia: string): Promise<DescansoPasto[]>;
}
