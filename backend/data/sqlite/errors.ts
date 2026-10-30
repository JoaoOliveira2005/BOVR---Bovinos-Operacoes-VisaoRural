import { ErroDominio } from '../../../frontend/src/domain/errors';

export function converterErroSqlite(erro: unknown, contexto: string): never {
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  if (mensagem.includes('UNIQUE constraint failed')) {
    throw new ErroDominio('duplicado', `${contexto} já existe.`);
  }
  if (mensagem.includes('FOREIGN KEY constraint failed')) {
    throw new ErroDominio(
      'em_uso',
      `${contexto} possui vínculos obrigatórios e não pode ser processado no momento.`,
    );
  }
  if (mensagem.includes('CHECK constraint failed')) {
    throw new ErroDominio('validacao', `Dados inválidos para ${contexto.toLowerCase()}: verifique os valores informados.`);
  }
  throw new ErroDominio('persistencia', `Não foi possível salvar ${contexto.toLowerCase()}: ${mensagem}`);
}
