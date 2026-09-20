import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { ServicoPastos } from '../../features/pastures/service';
import { RepositorioPastosSqlite, RepositorioTiposCapimSqlite } from './pastureRepository';

export function useServicoPastos(): ServicoPastos {
  const db = useSQLiteContext();
  return useMemo(
    () => new ServicoPastos(new RepositorioPastosSqlite(db), new RepositorioTiposCapimSqlite(db)),
    [db],
  );
}
