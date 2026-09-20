import { ErroDominio } from '../../domain/errors';

export function converterErroSqlite(erro: unknown, contexto: string): never {
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  if (mensagem.includes('UNIQUE constraint failed')) {
    throw new ErroDominio('duplicado', `${contexto} já existe.`);
  }
  if (mensagem.includes('FOREIGN KEY constraint failed')) {
    throw new ErroDominio(
      'em_uso',
      `${contexto} está em uso. Reassocie os registros relacionados antes de excluir.`,
    );
  }
  throw new ErroDominio('persistencia', `Não foi possível salvar ${contexto.toLowerCase()}.`);
}
