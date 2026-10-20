import { openDatabaseAsync, useSQLiteContext } from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useMemo } from 'react';
import { Platform } from 'react-native';

import { ServicoPastos } from '../../../frontend/src/features/pastures/service';
import { RepositorioPastosSqlite, RepositorioTiposCapimSqlite } from './pastureRepository';
import { ServicoManejoPastos } from '../../features/pastures/service';
import { RepositorioManejoPastosSqlite } from './pastureManagementRepository';
import type { AbrirConexaoPastos } from './pastureTransaction';

function conexaoParaTransacao(db: SQLiteDatabase): AbrirConexaoPastos | undefined {
  if (Platform.OS === 'web') return undefined;
  const separador = db.databasePath.lastIndexOf('/');
  const nome = db.databasePath.slice(separador + 1);
  const diretorio = db.databasePath.slice(0, separador);
  return () => openDatabaseAsync(nome, { ...db.options, useNewConnection: true }, diretorio);
}

export function useServicoPastos(): ServicoPastos {
  const db = useSQLiteContext();
  return useMemo(
    () => new ServicoPastos(new RepositorioPastosSqlite(db, conexaoParaTransacao(db)),
      new RepositorioTiposCapimSqlite(db, conexaoParaTransacao(db))),
    [db],
  );
}

export function useServicoManejoPastos(): ServicoManejoPastos {
  const db = useSQLiteContext();
  return useMemo(() => new ServicoManejoPastos(new RepositorioManejoPastosSqlite(db, conexaoParaTransacao(db))), [db]);
}
