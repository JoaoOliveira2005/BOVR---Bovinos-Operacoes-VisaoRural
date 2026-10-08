import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  useFonts,
} from '@expo-google-fonts/geist';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { inicializarBanco } from '../../backend/data/sqlite/database';
import { SplashAnimado } from '../src/components/SplashAnimado';
import { cores, fonte, tipografia } from '../src/theme/tokens';

// Segura a splash ate a Geist estar pronta, senao a primeira renderizacao sai
// na fonte do sistema e o texto salta de lugar quando a fonte troca.
SplashScreen.preventAutoHideAsync();

export default function LayoutRaiz() {
  const [exibirSplash, setExibirSplash] = useState(true);
  const [fontesCarregadas, erroFonte] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
  });

  useEffect(() => {
    if (fontesCarregadas || erroFonte) {
      void SplashScreen.hideAsync();
    }
  }, [fontesCarregadas, erroFonte]);

  // `erroFonte` tambem libera a tela: e melhor renderizar na fonte do sistema
  // do que deixar o usuario preso numa splash que nunca sai.
  if (!fontesCarregadas && !erroFonte) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {exibirSplash ? (
        <SplashAnimado aoConcluir={() => setExibirSplash(false)} />
      ) : null}
      <SQLiteProvider databaseName="bovr.db" onInit={inicializarBanco}>
        <Stack
          screenOptions={{
            // Mesmo tom do chao, para o cabecalho nao criar uma emenda visivel
            // na altura da barra de status.
            headerStyle: { backgroundColor: cores.canvas },
            headerTintColor: cores.tinta,
            headerTitleStyle: {
              fontFamily: fonte.semibold,
              fontSize: tipografia.subheading.fontSize,
            },
            headerShadowVisible: false,
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: cores.canvas },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="gado" options={{ title: 'Gado' }} />
          <Stack.Screen name="animal-form" options={{ title: 'Cadastro de animal' }} />
          <Stack.Screen name="pastos" options={{ title: 'Pastos' }} />
          <Stack.Screen name="pasto-form" options={{ title: 'Cadastro de pasto' }} />
          <Stack.Screen name="tipos-capim" options={{ title: 'Tipos de capim' }} />
          <Stack.Screen name="vendas" options={{ title: 'Vendas' }} />
          <Stack.Screen name="venda-form" options={{ title: 'Registro de venda' }} />
          <Stack.Screen name="gastos" options={{ title: 'Gastos' }} />
          <Stack.Screen name="gasto-form" options={{ title: 'Registro de gasto' }} />
          <Stack.Screen name="categorias-gasto" options={{ title: 'Categorias de gasto' }} />
          <Stack.Screen name="relatorios" options={{ title: 'Relatórios' }} />
        </Stack>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
