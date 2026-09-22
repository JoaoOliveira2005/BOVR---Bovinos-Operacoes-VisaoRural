import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { ServicoGastos } from '../../features/expenses/service';
import { RepositorioCategoriasGastoSqlite, RepositorioGastosSqlite } from './expenseRepository';

export function useServicoGastos(): ServicoGastos {
  const db = useSQLiteContext();
  return useMemo(
    () => new ServicoGastos(new RepositorioGastosSqlite(db), new RepositorioCategoriasGastoSqlite(db)),
    [db],
  );
}
