import { Alert, Platform } from 'react-native';

export type BotaoAlerta = {
  text?: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void | Promise<void>;
};

/**
 * Exibe alerta compatível com Web (onde Alert.alert nativo do react-native-web é no-op)
 * e com Android/iOS (usando Alert.alert nativo).
 */
export function alerta(
  titulo: string,
  mensagem?: string,
  botoes?: BotaoAlerta[],
): void {
  if (Platform.OS === 'web') {
    const texto = [titulo, mensagem].filter(Boolean).join('\n\n');

    if (!botoes || botoes.length === 0) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(texto);
      }
      return;
    }

    if (botoes.length === 1) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(texto);
      }
      void botoes[0]?.onPress?.();
      return;
    }

    // Identifica ação de confirmação e ação de cancelamento
    const botaoCancelar = botoes.find((b) => b.style === 'cancel');
    const botaoAcao =
      botoes.find((b) => b.style === 'destructive' || (b.style !== 'cancel' && b !== botaoCancelar)) ??
      botoes[botoes.length - 1];

    const confirmou = typeof window !== 'undefined' && window.confirm ? window.confirm(texto) : true;
    if (confirmou) {
      void botaoAcao?.onPress?.();
    } else {
      void botaoCancelar?.onPress?.();
    }
    return;
  }

  Alert.alert(titulo, mensagem, botoes);
}

// Polyfill global para react-native-web para que chamadas diretas a Alert.alert também funcionem
if (Platform.OS === 'web') {
  Alert.alert = ((
    title: string,
    message?: string,
    buttons?: BotaoAlerta[],
  ) => {
    alerta(title, message, buttons);
  }) as typeof Alert.alert;
}
