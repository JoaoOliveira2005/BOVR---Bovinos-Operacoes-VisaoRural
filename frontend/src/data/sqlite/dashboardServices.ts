import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { ServicoDashboard } from '../../features/dashboard/service';
import { RepositorioDashboardSqlite } from './dashboardRepository';

export function useServicoDashboard(): ServicoDashboard {
  const db = useSQLiteContext();
  return useMemo(() => new ServicoDashboard(new RepositorioDashboardSqlite(db)), [db]);
}
