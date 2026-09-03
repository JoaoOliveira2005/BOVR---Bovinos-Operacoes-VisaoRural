### Requisitos
---
# Sistema Simulador de Roteamento de Ordens
- ### Versão do documento: (0.0)

## Escopo do projeto
- Desenvolvimento de um aplicativo Android para controle individual e por lotes de bovinos, gerenciamento de pastos, registro de vendas e controle de gastos gerais da fazenda.
- O aplicativo deverá:
    - Funcionar integralmente sem internet;
    - Armazenar os dados localmente no aparelho;
    - Atender uma única fazenda;
    - Possuir apenas um usuário;
    - Suportar até 500 animais;
    - Identificar os animais pela numeração do brinco comum;
    - Gerar relatórios de controle do gado, vendas e gastos;
    - Não depender de integrações externas;
    - Não enviar notificações.

## Critério para qualidade do pasto
- A avaliação utilizará três informações:
    1. Altura do capim em relação ao intervalo adequado para o tipo cadastrado
    2. Condição do capim;
    3. Percentual de cobertura do pasto;

| Critério | Classificação                                                           |
| -------- | ----------------------------------------------------------------------- |
| Boa      | Altura adequada, capim verde e cobertura igual ou superior a 80%        |
| Regular  | Um dos três critérios estiver fora da condição considerada adequada     |
| Ruim     | Dois ou mais critérios estiverem fora da condição considerada adequada  |

- Esses parâmetros deverão poder ser alterados no aplicativo, pois a altura adequada varia conforme o tipo de capim;

## Requisitos funcionais
1. ### Controle do gado
    - **RF-01**: O sistema deverá permitir cadastrar cada animal individualmente utilizando o número do brinco como identificação principal.
    - **RF-02**: O sistema não deverá permitir dois animais ativos com o mesmo número de brinco.
    - **RF-03**: O cadastro deverá conter número do brinco, sexo, data de nascimento ou idade estimada, raça e observações.
    - **RF-04**: O sistema deverá permitir criar lotes de animais.
    - **RF-05**: Um animal poderá pertencer a apenas um lote por vez.
    - **RF-06**: O sistema deverá permitir adicionar e remover animais de um lote.
    - **RF-07**: O sistema deverá armazenar o histórico dos lotes aos quais o animal pertenceu.
    - **RF-08**: O sistema deverá permitir consultar animais pelo número do brinco, sexo, idade, raça, lote, pasto e situação.
    - **RF-09**: O sistema deverá apresentar a quantidade total de animais ativos na fazenda.
    - **RF-10**: O sistema deverá apresentar a quantidade de animais por sexo, lote, pasto e situação.
    - **RF-11**: O sistema deverá permitir classificar o animal como ativo, vendido, morto ou transferido.
    - **RF-12**: Animais vendidos, mortos ou transferidos deverão continuar disponíveis no histórico.
    - **RF-13**: O sistema deverá permitir cadastrar informações individualmente ou aplicar informações a todos os animais de um lote.

2. ### Reprodução
    - **RF-14**: O sistema deverá permitir registrar a situação reprodutiva das fêmeas como não avaliada, vazia, prenha ou parida.
    - **RF-15**: Para uma fêmea prenha, o sistema deverá registrar a data da identificação da prenhez.
    - **RF-16**: O sistema deverá permitir registrar uma previsão de parto.
    - **RF-17**: O sistema deverá permitir registrar o nascimento de um bezerro e relacioná-lo à sua mãe.
    - **RF-18**: Uma fêmea não poderá possuir simultaneamente as situações “prenha” e “vazia”.

3. ### Vacinação e saúde
    - **RF-19**: O sistema deverá registrar as vacinas aplicadas individualmente ou por lote.
    - **RF-20**: O registro da vacinação deverá conter nome da vacina, data, dose e observações.
    - **RF-21**: O sistema deverá armazenar o histórico de vacinação de cada animal.
    - **RF-22**: O sistema deverá permitir registrar se um animal está machucado.
    - **RF-23**: Uma ocorrência de saúde deverá conter data, descrição, tratamento realizado e situação atual.
    - **RF-24**: O sistema deverá permitir classificar uma ocorrência como em tratamento, recuperada ou encerrada.
    - **RF-25**: O sistema deverá permitir consultar todos os animais que estejam machucados ou em tratamento.
    - **RF-26**: O sistema não deverá enviar notificações sobre vacinas, tratamentos ou outras ocorrências.

4. ### Gestão dos pastos
    - **RF-27**: O sistema deverá permitir cadastrar os pastos existentes na fazenda.
    - **RF-28**: O cadastro do pasto deverá conter nome, área em hectares, tipo de capim, altura atual do capim, condição de umidade e cobertura do solo.
    - **RF-29**: A altura do capim deverá ser registrada em centímetros.
    - **RF-30**: A condição do capim deverá ser classificada como verde, parcialmente seco ou seco.
    - **RF-31**: A cobertura do pasto deverá ser informada como percentual de área coberta por capim, entre 0% e 100%.
    - **RF-32**: O sistema deverá permitir registrar a altura mínima e máxima considerada adequada para cada tipo de capim.
    - **RF-33**: O sistema deverá classificar a qualidade do pasto como ruim, regular ou boa, conforme os dados cadastrados.
    - **RF-34**: O sistema deverá mostrar quantos animais estão presentes em cada pasto.
    - **RF-35**: O sistema deverá permitir movimentar um animal ou lote entre pastos.
    - **RF-36**: Cada movimentação deverá registrar pasto de origem, pasto de destino e data.
    - **RF-37**: O sistema deverá calcular o tempo de permanência do animal ou lote no pasto.
    - **RF-38**: O sistema deverá registrar o histórico de rotação dos pastos.
    - **RF-39**: O sistema deverá calcular o período de descanso do pasto entre a saída e a entrada de animais.

5. ### Vendas
    - **RF-40**: O sistema deverá permitir registrar uma venda de um animal ou lote.
    - **RF-41**: A venda deverá conter data, animais vendidos, comprador, peso total, valor bruto e observações.
    - **RF-42**: O sistema deverá calcular a quantidade de animais incluídos na venda.
    - **RF-43**: Após a conclusão da venda, os animais deverão receber automaticamente a situação “vendido”.
    - **RF-44**: Animais vendidos não deverão aparecer na quantidade atual de cabeças da fazenda.
    - **RF-45**: O sistema deverá disponibilizar o histórico de vendas.
    - **RF-46**: O sistema deverá permitir consultar vendas por período, comprador, animal ou lote.
    - **RF-47**: O sistema deverá permitir registrar uma próxima venda planejada.
    - **RF-48**: O planejamento da venda deverá conter data prevista, animais ou lote e valor estimado.
    - **RF-49**: O sistema não deverá enviar notificações sobre vendas planejadas.

6. ### Gastos gerais
    - **RF-50**: O sistema deverá permitir registrar gastos gerais da fazenda.
    - **RF-51**: Cada gasto deverá possuir descrição, categoria, valor e data.
    - **RF-52**: As categorias disponíveis deverão ser: água, ração, mão de obra e infraestrutura.
    - **RF-53**: O sistema deverá permitir cadastrar outros gastos dentro dessas quatro categorias.
    - **RF-54**: O sistema deverá permitir editar e excluir um gasto registrado incorretamente.
    - **RF-55**: O sistema deverá permitir consultar gastos por período e categoria.
    - **RF-56**: O sistema deverá calcular o total gasto por categoria.
    - **RF-57**: O sistema deverá calcular o total geral de gastos da fazenda.
    - **RF-58**: O sistema deverá calcular o resultado financeiro pela fórmula: valor bruto das vendas menos gastos gerais.

7. ### Relatórios
    - **RF-59**: O sistema deverá gerar relatório de controle do gado.
    - **RF-60**: O relatório de controle do gado deverá apresentar quantidade total de animais, animais por sexo, situação, lote e pasto.
    - **RF-61**: O relatório de controle do gado deverá permitir incluir informações de reprodução, vacinação e saúde.
    - **RF-62**: O sistema deverá gerar relatório de vendas por período.
    - **RF-63**: O relatório de vendas deverá apresentar animais vendidos, comprador, data, quantidade e valor bruto.
    - **RF-64**: O sistema deverá gerar relatório de gastos por período.
    - **RF-65**: O relatório de gastos deverá apresentar os valores de água, ração, mão de obra e infraestrutura.
    - **RF-66**: O sistema deverá gerar um resumo financeiro contendo vendas, gastos e resultado.
    - **RF-67**: Os relatórios deverão poder ser visualizados na tela do aplicativo.
    - **RF-68**: Os relatórios deverão poder ser exportados em formato PDF.

8. ### Armazenamento e backup
    - **RF-69**: Todas as funcionalidades deverão operar sem conexão com a internet.
    - **RF-70**: Os dados deverão ser armazenados localmente no dispositivo Android.
    - **RF-71**: O sistema deverá manter os dados disponíveis após o aplicativo ser fechado ou o aparelho ser reiniciado.
    - **RF-72**: O sistema deverá permitir criar manualmente um arquivo de backup.
    - **RF-73**: O sistema deverá permitir restaurar os dados utilizando um arquivo de backup válido.
    - **RF-74**: Antes da restauração, o sistema deverá solicitar confirmação do usuário.
    - **RF-75**: O sistema deverá informar a data e o horário do último backup realizado.

## Requisitos não funcionais
1. ### Plataforma
    - **RNF-01**: O aplicativo deverá ser desenvolvido exclusivamente para Android.
2. ### Compatibilidade
    - **RNF-02**: O aplicativo deverá funcionar no Android 10 ou superior.
3. ### Operação offline
    - **RNF-03**: Nenhuma funcionalidade deverá exigir conexão com a internet.
4. ### Capacidade
    - **RNF-04**: O aplicativo deverá suportar pelo menos 500 animais cadastrados.
5. ### Desempenho
    - **RNF-05**: Consultas com até 500 animais deverão ser apresentadas em até 2 segundos.
    - **RNF-06**: Relatórios deverão ser gerados em até 5 segundos.
6. ### Usabilidade
    - **RNF-07**: O cadastro de um novo animal deverá ser concluído em, no máximo, três telas.
    - **RNF-08**: A tela inicial deverá apresentar atalhos para gado, pastos, vendas, gastos e relatórios.
    - **RNF-09**: As mensagens de erro deverão explicar o problema e indicar como corrigi-lo.
7. ### Confiabilidade
    - **RNF-10**: Uma operação somente deverá ser apresentada como concluída após ser salva no aparelho.
8. ### Segurança
    - **RNF-11**: Os dados do aplicativo deverão permanecer protegidos pelo mecanismo de segurança do Android.
    - **RNF-12**: O aplicativo deverá permitir configurar senha ou PIN de acesso.
    - **RNF-13**: O arquivo de backup deverá ser protegido contra alterações não autorizadas.
9. ### Manutenibilidade
    - **RNF-14**: O código deverá ser dividido em componentes com responsabilidades definidas e baixo acoplamento.
    - **RNF-15**: Os cálculos financeiros e as regras relacionadas aos animais deverão possuir testes automatizados.
10. ### Portabilidade dos dados
    - **RNF-16**: O backup deverá poder ser copiado para outro dispositivo Android compatível.
11. ### Interface
    - **RNF-17**: O aplicativo deverá utilizar textos em português brasileiro.
    - **RNF-18**: Valores financeiros deverão ser apresentados em reais e datas no formato DD/MM/AAAA.

## Requisitos de domínio
- **RD-01**: O número do brinco será a identificação principal do animal.
- **RD-02**: O sistema deverá trabalhar com controle individual e controle por lotes.
- **RD-03**: Um animal poderá pertencer a apenas um lote e um pasto por vez.
- **RD-04**: O histórico do animal deverá permanecer armazenado após venda, morte ou transferência.
- **RD-05**: A idade deverá ser calculada pela data de nascimento, quando essa informação estiver disponível.
- **RD-06**: Pesos deverão ser registrados em quilogramas.
- **RD-07**: A área dos pastos deverá ser registrada em hectares.
- **RD-08**: A altura do capim deverá ser registrada em centímetros.
- **RD-09**: A altura adequada deverá ser configurada conforme o tipo de capim.
- **RD-10**: A qualidade do pasto deverá considerar altura, condição do capim e percentual de cobertura.
- **RD-11**: Valores financeiros deverão ser registrados em reais, com duas casas decimais.
- **RD-12**: Animais vendidos, mortos ou transferidos não deverão ser contabilizados como cabeças ativas.
- **RD-13**: Não haverá integração com balanças, RFID, sistemas contábeis ou sistemas governamentais.
- **RD-14**: Não haverá sincronização com servidores externos ou armazenamento obrigatório em nuvem.

## Resumo da configuração definida
- **Plataforma**: Android
- **Internet**: Totalmente offline
- **Usuários**: Um usuário
- **Fazendas**: Uma fazenda
- **Capacidade**: Até 500 cabeças
- **Identificação**: Numeração do brinco comum
- **Controle**: Individual e por lotes
- **Relatórios**: Gado, vendas e gastos
- **Gastos**: Água, ração, mão de obra e infraestrutura
- **Notificações**: Não haverá
- **Integrações externas**: Não haverá
- **Armazenamento**: Local, com backup manual