import { EmBreve } from '../src/components/EmBreve';

export default function TelaGastos() {
  return (
    <EmBreve
      titulo="Gastos Gerais"
      requisitos={[
        'RF-22  Registro por descrição, categoria, valor e data',
        'RF-22.3  Categorias e subcategorias criadas pelo usuário',
        'RF-24  Filtro por período e total por categoria',
        'RF-25  Resultado financeiro: vendas menos gastos',
      ]}
    />
  );
}
