import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { ServicoVendas } from '../../features/sales/service';
import { RepositorioVendasSqlite } from './saleRepository';

export function useServicoVendas(): ServicoVendas {
  const db = useSQLiteContext();
  return useMemo(() => new ServicoVendas(new RepositorioVendasSqlite(db)), [db]);
}
