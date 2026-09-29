export type CodigoErroDominio =
  | 'validacao'
  | 'duplicado'
  | 'nao_encontrado'
  | 'protegido'
  | 'em_uso'
  | 'persistencia';

export class ErroDominio extends Error {
  constructor(
    public readonly codigo: CodigoErroDominio,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'ErroDominio';
  }
}

export function mensagemErro(erro: unknown): string {
  if (erro instanceof ErroDominio) return erro.message;
  return 'Não foi possível concluir a operação. Tente novamente.';
}
