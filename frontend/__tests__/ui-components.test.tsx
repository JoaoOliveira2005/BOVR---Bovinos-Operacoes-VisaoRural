import { fireEvent, render } from '@testing-library/react-native';

import { Campo } from '../src/components/Campo';
import { Seletor } from '../src/components/Seletor';

describe('componentes de formulário', () => {
  it('expõe o rótulo e envia o texto digitado', async () => {
    const aoAlterar = jest.fn();
    const tela = await render(<Campo rotulo="Descrição" value="" onChangeText={aoAlterar} />);
    fireEvent.changeText(tela.getByLabelText('Descrição'), 'Ração');
    expect(aoAlterar).toHaveBeenCalledWith('Ração');
  });

  it('expõe opções como radio e informa a seleção', async () => {
    const selecionar = jest.fn();
    const tela = await render(
      <Seletor
        rotulo="Condição"
        valor="verde"
        opcoes={[{ valor: 'verde', rotulo: 'Verde' }, { valor: 'seco', rotulo: 'Seco' }]}
        aoSelecionar={selecionar}
      />,
    );
    fireEvent.press(tela.getByRole('radio', { name: 'Seco' }));
    expect(selecionar).toHaveBeenCalledWith('seco');
  });
});
