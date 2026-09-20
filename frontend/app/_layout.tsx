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
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { inicializarBanco } from '../src/data/sqlite/database';
import { cores, fonte, tipografia } from '../src/theme/tokens';

// Segura a splash ate a Geist estar pronta, senao a primeira renderizacao sai
// na fonte do sistema e o texto salta de lugar quando a fonte troca.
SplashScreen.preventAutoHideAsync();

/**
 * Navegacao raiz do BOVR.
 *
 * Padrao escolhido: pilha (stack) com a tela inicial como centro. RNF-08 exige
 * que a tela inicial apresente os atalhos dos cinco modulos, entao ela e o hub
 * — uma barra de abas competiria com esses atalhos e duplicaria a navegacao.
 * P-11 fecha a conta: o cadastro de animal cabe em inicio -> gado -> cadastro,
 * os tres passos do RNF-07 contando a tela inicial como primeiro.
 *
 * O cabecalho segue a estrutura do DESIGN.md — tinta preta, sem sombra, sem
 * barra colorida — sobre o chao verde do app.
 */
export default function LayoutRaiz() {
  const [fontesCarregadas, erroFonte] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
  });

  useEffect(() => {
    if (fontesCarregadas || erroFonte) {
      SplashScreen.hideAsync();
    }
  }, [fontesCarregadas, erroFonte]);

  // `erroFonte` tambem libera a tela: e melhor renderizar na fonte do sistema
  // do que deixar o usuario preso numa splash que nunca sai.
  if (!fontesCarregadas && !erroFonte) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SQLiteProvider databaseName="bovr.db" onInit={inicializarBanco}>
        <Stack
          screenOptions={{
          // Mesmo tom do chao: com o canvas verde, um cabecalho branco criava
          // uma emenda visivel na altura da barra de status.
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
          <Stack.Screen name="pastos" options={{ title: 'Pastos' }} />
          <Stack.Screen name="pasto-form" options={{ title: 'Cadastro de pasto' }} />
          <Stack.Screen name="tipos-capim" options={{ title: 'Tipos de capim' }} />
          <Stack.Screen name="vendas" options={{ title: 'Vendas' }} />
          <Stack.Screen name="gastos" options={{ title: 'Gastos' }} />
          <Stack.Screen name="gasto-form" options={{ title: 'Registro de gasto' }} />
          <Stack.Screen name="categorias-gasto" options={{ title: 'Categorias de gasto' }} />
          <Stack.Screen name="relatorios" options={{ title: 'Relatórios' }} />
        </Stack>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
