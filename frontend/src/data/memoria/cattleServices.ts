/**
 * PROVISÓRIO — ponto de troca para o backend.
 *
 * Quando o repositório SQLite de animais existir (Issue #3), este arquivo sai e
 * entra `src/data/sqlite/cattleServices.ts`, no mesmo formato do de pastos:
 *
 *     export function useServicoAnimais(): ServicoAnimais {
 *       const db = useSQLiteContext();
 *       return useMemo(() => new ServicoAnimais(new RepositorioAnimaisSqlite(db)), [db]);
 *     }
 *
 * As telas importam só `useServicoAnimais` — elas não sabem de onde vêm os
 * dados, então a troca não as alcança.
 */
import { useMemo } from 'react';

import { ServicoAnimais } from '../../features/cattle/service';
import { RepositorioAnimaisMemoria } from './cattleRepository';

export function useServicoAnimais(): ServicoAnimais {
  return useMemo(() => new ServicoAnimais(new RepositorioAnimaisMemoria()), []);
}
