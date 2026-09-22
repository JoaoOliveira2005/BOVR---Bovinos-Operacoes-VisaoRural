import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../src/components/Botao';
import { Campo } from '../src/components/Campo';
import { Cartao } from '../src/components/Cartao';
import { EstadoTela } from '../src/components/EstadoTela';
import { Seletor } from '../src/components/Seletor';
import { Tela } from '../src/components/Tela';
import { useServicoGastos } from '../src/data/sqlite/expenseServices';
import { mensagemErro } from '../src/domain/errors';
import type { CategoriaGasto, SubcategoriaGasto } from '../src/features/expenses/types';
import { cores, espaco, tipografia } from '../src/theme/tokens';

export default function TelaCategoriasGasto() {
  const servico = useServicoGastos();
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubcategoriaGasto[]>([]);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [categoriaEditando, setCategoriaEditando] = useState<number>();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
  const [nomeSubcategoria, setNomeSubcategoria] = useState('');
  const [subcategoriaEditando, setSubcategoriaEditando] = useState<number>();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [cats, subs] = await Promise.all([servico.listarCategorias(), servico.listarSubcategorias()]);
      setCategorias(cats); setSubcategorias(subs);
      setCategoriaSelecionada((atual) => atual ?? cats[0]?.id ?? null);
    } catch (causa) { Alert.alert('Não foi possível carregar', mensagemErro(causa)); }
    finally { setCarregando(false); }
  }, [servico]);
  useFocusEffect(useCallback(() => { void carregar(); }, [carregar]));

  const subsSelecionadas = useMemo(
    () => subcategorias.filter((sub) => sub.categoriaId === categoriaSelecionada),
    [categoriaSelecionada, subcategorias],
  );
  const limparCategoria = () => { setCategoriaEditando(undefined); setNomeCategoria(''); };
  const limparSubcategoria = () => { setSubcategoriaEditando(undefined); setNomeSubcategoria(''); };

  const salvarCategoria = async () => {
    setSalvando(true);
    try {
      if (categoriaEditando) await servico.atualizarCategoria(categoriaEditando, nomeCategoria);
      else await servico.criarCategoria(nomeCategoria);
      limparCategoria(); await carregar();
    } catch (causa) { Alert.alert('Revise os dados', mensagemErro(causa)); }
    finally { setSalvando(false); }
  };
  const salvarSubcategoria = async () => {
    if (!categoriaSelecionada) return;
    setSalvando(true);
    try {
      if (subcategoriaEditando) await servico.atualizarSubcategoria(subcategoriaEditando, nomeSubcategoria);
      else await servico.criarSubcategoria(categoriaSelecionada, nomeSubcategoria);
      limparSubcategoria(); await carregar();
    } catch (causa) { Alert.alert('Revise os dados', mensagemErro(causa)); }
    finally { setSalvando(false); }
  };

  const confirmarExclusao = (tipo: 'categoria' | 'subcategoria', id: number, nome: string) => {
    Alert.alert(`Excluir ${tipo}?`, `“${nome}” só pode ser excluída se não estiver em uso.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          if (tipo === 'categoria') await servico.excluirCategoria(id); else await servico.excluirSubcategoria(id);
          await carregar();
        } catch (causa) { Alert.alert('Não foi possível excluir', mensagemErro(causa)); }
      } },
    ]);
  };

  if (carregando) return <Tela><EstadoTela mensagem="Carregando categorias…" carregando /></Tela>;
  return (
    <Tela>
      <Cartao style={estilos.bloco}>
        <Text style={estilos.titulo}>Categorias</Text>
        <Campo rotulo={categoriaEditando ? 'Editar categoria' : 'Nova categoria'} value={nomeCategoria} onChangeText={setNomeCategoria} />
        <Botao titulo={categoriaEditando ? 'Salvar alterações' : 'Criar categoria'} carregando={salvando} onPress={salvarCategoria} />
        {categoriaEditando ? <Botao titulo="Cancelar edição" variante="secundario" onPress={limparCategoria} /> : null}
      </Cartao>
      {categorias.map((categoria) => (
        <Cartao key={categoria.id} style={estilos.item}>
          <View style={estilos.info}>
            <Text style={estilos.nome}>{categoria.nome}</Text>
            {categoria.protegida ? <Text style={estilos.protegida}>Categoria inicial protegida</Text> : null}
          </View>
          {!categoria.protegida ? <View style={estilos.botoes}>
            <Botao titulo="Editar" variante="secundario" onPress={() => { setCategoriaEditando(categoria.id); setNomeCategoria(categoria.nome); }} />
            <Botao titulo="Excluir" variante="perigo" onPress={() => confirmarExclusao('categoria', categoria.id, categoria.nome)} />
          </View> : null}
        </Cartao>
      ))}

      <Cartao style={estilos.bloco}>
        <Text style={estilos.titulo}>Subcategorias</Text>
        <Seletor rotulo="Categoria pai" valor={categoriaSelecionada} opcoes={categorias.map((cat) => ({ valor: cat.id, rotulo: cat.nome }))} aoSelecionar={(valor) => { setCategoriaSelecionada(valor); limparSubcategoria(); }} />
        <Campo rotulo={subcategoriaEditando ? 'Editar subcategoria' : 'Nova subcategoria'} value={nomeSubcategoria} onChangeText={setNomeSubcategoria} />
        <Botao titulo={subcategoriaEditando ? 'Salvar alterações' : 'Criar subcategoria'} carregando={salvando} disabled={!categoriaSelecionada} onPress={salvarSubcategoria} />
        {subcategoriaEditando ? <Botao titulo="Cancelar edição" variante="secundario" onPress={limparSubcategoria} /> : null}
      </Cartao>
      {subsSelecionadas.length === 0 ? <EstadoTela mensagem="Nenhuma subcategoria nesta categoria." /> : null}
      {subsSelecionadas.map((sub) => (
        <Cartao key={sub.id} style={estilos.item}>
          <Text style={estilos.nome}>{sub.nome}</Text>
          <View style={estilos.botoes}>
            <Botao titulo="Editar" variante="secundario" onPress={() => { setSubcategoriaEditando(sub.id); setNomeSubcategoria(sub.nome); }} />
            <Botao titulo="Excluir" variante="perigo" onPress={() => confirmarExclusao('subcategoria', sub.id, sub.nome)} />
          </View>
        </Cartao>
      ))}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  bloco: { gap: espaco.lg }, item: { gap: espaco.lg },
  titulo: { ...tipografia.subheading, color: cores.tinta }, info: { gap: espaco.xs },
  nome: { ...tipografia.bodyMedia, color: cores.tinta },
  protegida: { ...tipografia.caption, letterSpacing: 0, color: cores.cinzaMedio },
  botoes: { gap: espaco.sm },
});
