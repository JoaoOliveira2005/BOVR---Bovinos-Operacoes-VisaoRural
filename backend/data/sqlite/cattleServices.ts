import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { ServicoAnimais } from '../../features/cattle/service';
import { RepositorioAnimaisSqlite } from './cattleRepository';

export function useServicoAnimais(): ServicoAnimais {
  const db = useSQLiteContext();
  return useMemo(() => new ServicoAnimais(new RepositorioAnimaisSqlite(db)), [db]);
}
