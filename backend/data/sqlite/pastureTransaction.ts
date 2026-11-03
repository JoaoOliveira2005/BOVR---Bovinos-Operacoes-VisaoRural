import type { SQLiteDatabase } from 'expo-sqlite';

// Serializa transações deste módulo no mesmo handle (inclusive no fallback web).
const filas = new WeakMap<SQLiteDatabase, Promise<unknown>>();
export type AbrirConexaoPastos = () => Promise<SQLiteDatabase>;

export async function transacaoPastos<T>(
  db: SQLiteDatabase, abrirConexao: AbrirConexaoPastos | undefined, executar: (tx: SQLiteDatabase) => Promise<T>,
): Promise<T> {
  const anterior = filas.get(db) ?? Promise.resolve();
  const operacao = anterior.catch(() => undefined).then(async () => {
    // No nativo, a conexão separada evita que gravações de outros módulos entrem
    // nesta transação. FK precisa ser ativada ANTES do BEGIN em cada conexão.
    const tx = abrirConexao ? await abrirConexao() : db;
    try {
      await tx.execAsync('PRAGMA foreign_keys = ON;').catch(() => undefined);
      await tx.execAsync('BEGIN IMMEDIATE;');
      try {
        const resultado = await executar(tx);
        await tx.execAsync('COMMIT;');
        return resultado;
      } catch (erro) {
        await tx.execAsync('ROLLBACK;').catch(() => undefined);
        throw erro;
      }
    } finally { if (abrirConexao) await tx.closeAsync(); }
  });
  filas.set(db, operacao);
  try { return await operacao; }
  finally { if (filas.get(db) === operacao) filas.delete(db); }
}
