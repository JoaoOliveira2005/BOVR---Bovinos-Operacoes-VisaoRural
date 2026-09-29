/**
 * Domínio de bovinos — RF-01 a RF-01.4, RF-06.
 *
 * Espelha a tabela `cattle` do DER (docs/Arquitetura.md). Nomes do domínio em
 * português e colunas em inglês, como nos módulos de pastos e gastos: a
 * tradução acontece no repositório, não aqui.
 */

export type SexoAnimal = 'macho' | 'femea';

/** RF-06 — situação do animal. Vendidos, mortos e transferidos ficam no histórico (RF-06.1). */
export type SituacaoAnimal = 'ativo' | 'vendido' | 'morto' | 'transferido';

export type Animal = {
  id: number;
  /** Brinco — identificação principal do animal (RD-01). Único entre os ativos. */
  brinco: string;
  sexo: SexoAnimal;
  /** `YYYY-MM-DD`. Nulo quando só se sabe a idade estimada (RF-01.3). */
  dataNascimento: string | null;
  /** Alternativa à data de nascimento, em meses (RF-01.3). */
  idadeEstimadaMeses: number | null;
  raca: string;
  observacoes: string | null;
  situacao: SituacaoAnimal;
};

export type EntradaAnimal = Omit<Animal, 'id' | 'situacao'>;

export interface RepositorioAnimais {
  listar(): Promise<Animal[]>;
  obter(id: number): Promise<Animal | null>;
  /**
   * RF-01.1 — procura animal **ativo** com este brinco.
   *
   * Só entre ativos: RF-06.1 mantém vendidos, mortos e transferidos no
   * histórico com o mesmo número, então o brinco pode repetir fora de `ativo`.
   * `ignorarId` existe para a edição não acusar conflito com o próprio animal.
   */
  existeAtivoComBrinco(brinco: string, ignorarId?: number): Promise<boolean>;
  criar(entrada: EntradaAnimal): Promise<number>;
  atualizar(id: number, entrada: EntradaAnimal): Promise<void>;
}
