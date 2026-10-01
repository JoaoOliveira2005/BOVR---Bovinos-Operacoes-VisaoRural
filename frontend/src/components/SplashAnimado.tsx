import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { cores, fonte } from '../theme/tokens';

type Props = {
  aoConcluir: () => void;
};

const FRASES_CARREGAMENTO = [
  'Inicializando sistema BOVR…',
  'Carregando pastos e vegetação…',
  'Sincronizando dados do rebanho…',
  'Pronto para uso offline!',
];

export function SplashAnimado({ aoConcluir }: Props) {
  const opacidade = useRef(new Animated.Value(0)).current;
  const escalaLogo = useRef(new Animated.Value(0.7)).current;
  const pulsoIcone = useRef(new Animated.Value(1)).current;
  const progresso = useRef(new Animated.Value(0)).current;
  const opacidadeTela = useRef(new Animated.Value(1)).current;

  const [indiceFrase, setIndiceFrase] = useState(0);

  useEffect(() => {
    // Entrada com fade-in e escala suave
    Animated.parallel([
      Animated.timing(opacidade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(escalaLogo, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação contínua de pulso no círculo do bovino
    const animacaoPulso = Animated.loop(
      Animated.sequence([
        Animated.timing(pulsoIcone, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulsoIcone, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animacaoPulso.start();

    // Barra de progresso
    Animated.timing(progresso, {
      toValue: 1,
      duration: 2400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Frases de carregamento
    const intervalFrases = setInterval(() => {
      setIndiceFrase((prev) => (prev < FRASES_CARREGAMENTO.length - 1 ? prev + 1 : prev));
    }, 600);

    // Fade out de saída
    const timerConclusao = setTimeout(() => {
      animacaoPulso.stop();
      Animated.timing(opacidadeTela, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => {
        aoConcluir();
      });
    }, 2500);

    return () => {
      clearInterval(intervalFrases);
      clearTimeout(timerConclusao);
    };
  }, [aoConcluir, escalaLogo, opacidade, opacidadeTela, progresso, pulsoIcone]);

  const larguraBarra = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[estilos.container, { opacity: opacidadeTela }]}>
      <Animated.View
        style={[
          estilos.conteudoCentral,
          {
            opacity: opacidade,
            transform: [{ scale: escalaLogo }],
          },
        ]}
      >
        {/* Círculo com brilho e a vaca dentro */}
        <Animated.View style={[estilos.emblema, { transform: [{ scale: pulsoIcone }] }]}>
          <View style={estilos.auraAura} />
          <MaterialCommunityIcons name="cow" size={52} color="#22C55E" style={estilos.iconeVaca} />
        </Animated.View>

        {/* Nome do aplicativo abaixo do círculo */}
        <Text style={estilos.tituloApp}>BOVR</Text>
        <Text style={estilos.subtituloApp}>Bovinos & Operações Visão Rural</Text>

        {/* Barra de carregamento e mensagens */}
        <View style={estilos.boxProgresso}>
          <View style={estilos.trilhoBarra}>
            <Animated.View style={[estilos.preenchimentoBarra, { width: larguraBarra }]} />
          </View>
          <Text style={estilos.textoStatus}>{FRASES_CARREGAMENTO[indiceFrase]}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: cores.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    paddingHorizontal: 24,
  },
  conteudoCentral: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  emblema: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#16231A',
    borderWidth: 2.5,
    borderColor: '#22C55E55',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  auraAura: {
    position: 'absolute',
    width: 135,
    height: 135,
    borderRadius: 67.5,
    backgroundColor: '#22C55E12',
  },
  iconeVaca: {
    marginTop: 2,
  },
  tituloApp: {
    fontFamily: fonte.semibold,
    fontSize: 38,
    letterSpacing: 3,
    color: cores.tinta,
    textAlign: 'center',
  },
  subtituloApp: {
    fontFamily: fonte.regular,
    fontSize: 14,
    color: cores.cinzaMedio,
    marginTop: 6,
    textAlign: 'center',
  },
  boxProgresso: {
    width: '100%',
    marginTop: 36,
    alignItems: 'center',
    gap: 12,
  },
  trilhoBarra: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E2D23',
    overflow: 'hidden',
  },
  preenchimentoBarra: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  textoStatus: {
    fontFamily: fonte.regular,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
