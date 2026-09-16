import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, layout, paleta, raio, sombra, tipografia, toque, type Modulo } from '../theme/tokens';

type Props = {
  modulo: Modulo;
  titulo: string;
  /** Linha de apoio: o que o usuário encontra ao entrar no módulo. */
  descricao: string;
  icone: React.ComponentProps<typeof Feather>['name'];
  href: string;
};

/**
 * Atalho da tela inicial — RNF-08.
 *
 * A cor do módulo tinge apenas o ícone e o selo de 40px; o cartão, o título e
 * a descrição continuam acromáticos. O usuário aprende a associar tom a área
 * do app sem que a tela vire um mosaico. Ícones são Feather — traço fino e
 * geométrico, o mais próximo do Lucide que o DESIGN.md descreve.
 *
 * Navega via `useRouter` em vez de `<Link asChild>`: o Link sobrescreve a prop
 * `style` do filho, o que derruba o fundo, a borda e o layout em linha.
 */
export function AtalhoCard({ modulo, titulo, descricao, icone, href }: Props) {
  const router = useRouter();
  const tom = paleta.modulo[modulo];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${descricao}`}
      onPress={() => router.push(href)}
      style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}
    >
      <View style={[estilos.selo, { backgroundColor: tom.suave }]}>
        <Feather name={icone} size={20} color={tom.base} />
      </View>

      <View style={estilos.texto}>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={estilos.descricao}>{descricao}</Text>
      </View>

      <Feather name="chevron-right" size={18} color={cores.cinzaMedio} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    minHeight: toque.alvoMinimo,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.lg,
    padding: layout.paddingCartao,
    backgroundColor: cores.paper,
    borderRadius: raio.cartao,
    borderWidth: 1,
    borderColor: cores.fio,
    ...sombra.cartao,
  },
  /** Sem cor de destaque no toque: o feedback é tonal, um degrau de superfície. */
  pressionado: {
    backgroundColor: cores.superficieAlt,
  },
  selo: {
    width: 40,
    height: 40,
    borderRadius: raio.aninhado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    ...tipografia.bodyMedia,
    color: cores.tinta,
  },
  descricao: {
    ...tipografia.caption,
    letterSpacing: 0,
    color: cores.cinzaMedio,
  },
});
