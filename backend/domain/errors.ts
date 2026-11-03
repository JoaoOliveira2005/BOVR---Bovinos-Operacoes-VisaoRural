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
    Object.setPrototypeOf(this, ErroDominio.prototype);
  }
}

export function mensagemErro(erro: unknown): string {
  if (erro instanceof ErroDominio) return erro.message;
  if (
    typeof erro === 'object' &&
    erro !== null &&
    'message' in erro &&
    typeof (erro as { message?: unknown }).message === 'string'
  ) {
    return (erro as { message: string }).message;
  }
  if (typeof erro === 'string' && erro.trim().length > 0) return erro;
  return 'Não foi possível concluir a operação. Tente novamente.';
}
