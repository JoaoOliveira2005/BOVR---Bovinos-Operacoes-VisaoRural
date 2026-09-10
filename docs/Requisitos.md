### Requisitos
- #### Versão do documento: (0.2)

# Escopo do projeto
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

# Critério para qualidade do pasto
- A avaliação utilizará três informações:
    1. Altura do capim em relação ao intervalo adequado para o tipo cadastrado
    2. Condição do capim;
    3. Percentual de cobertura do pasto;

| Critério | Classificação                                                           |
| -------- | ----------------------------------------------------------------------- |
| Boa      | Altura adequada, capim verde e cobertura igual ou superior a 80%        |
| Regular  | Um dos três critérios estiver fora da condição considerada adequada     |
| Ruim     | Dois ou mais critérios estiverem fora da condição considerada adequada  |
- Esses parâmetros deverão poder ser alterados no aplicativo, pois a altura adequada varia conforme o tipo de capim.

# Requisitos funcionais
1. ## Controle do gado
    - **RF-01**: O sistema deve permitir o cadastro de animais individualmente.
        - **RF-01.1**: Quando o usuário informar o número do brinco, o sistema deve verificar se já existe animal ativo com o mesmo número.
        - **RF-01.2**: Se existir animal ativo com o mesmo número de brinco, então o sistema deve exibir mensagem de erro e impedir o cadastro.
        - **RF-01.3**: O cadastro deve conter número do brinco, sexo, data de nascimento ou idade estimada, raça e observações.
        - **RF-01.4**: Onde a data de nascimento estiver disponível, o sistema deve calcular a idade do animal automaticamente.
    - **RF-02**: O sistema deve permitir a criação de lotes de animais.
        - **RF-02.1**: Enquanto um animal pertencer a um lote, o sistema deve impedir sua vinculação a outro lote.
        - **RF-02.2**: Quando o usuário selecionar um animal e um lote, o sistema deve permitir adicionar ou remover o animal do lote.
        - **RF-02.3**: O sistema deve armazenar o histórico de todos os lotes aos quais o animal pertenceu.
        - **RF-02.4**: Quando o usuário selecionar um lote, o sistema deve permitir aplicar informações de saúde, raça e observações a todos os animais do lote.
    - **RF-03**: O sistema deve permitir consultar animais pelo número do brinco, sexo, idade, raça, lote, pasto e situação.
    - **RF-04**: O sistema deve apresentar a quantidade total de animais ativos na fazenda.
    - **RF-05**: O sistema deve apresentar a quantidade de animais por sexo, lote, pasto e situação.
    - **RF-06**: Quando o usuário alterar a situação do animal, o sistema deve permitir classificá-lo como ativo, vendido, morto ou transferido.
        - **RF-06.1**: O sistema deve manter animais vendidos, mortos ou transferidos disponíveis para consulta no histórico.
    - **RF-07**: Onde o usuário optar por aplicar dados em lote, o sistema deve exigir confirmação da ação antes de executar.

2. ## Reprodução
    - **RF-08**: O sistema deve permitir o registro da situação reprodutiva do animal
        - **RF-08.1**: O sistema deve permitir registrar a situação reprodutiva das fêmeas como não avaliada, vazia, prenha ou parida.
        - **RF-08.2**: Quando o usuário registrar uma fêmea como prenha, o sistema deve solicitar a data da identificação da prenhez.
        - **RF-08.3**: Se o usuário tentar alterar a situação de uma fêmea para "vazia" enquanto estiver classificada como "prenha", então o sistema deve solicitar confirmação antes de alterar.
    - **RF-09**: Onde o usuário informar a data de cobertura, o sistema deve calcular automaticamente a previsão de parto.
    - **RF-10**: Quando o usuário registrar o nascimento de um bezerro, o sistema deve solicitar a identificação da mãe e vincular o bezerro a ela.

3. ## Vacinação e saúde
    - **RF-11**: O sistema deve permitir registrar a vacinação do animal
        - **RF-11.1**: Quando o usuário registrar uma vacinação, o sistema deve permitir aplicá-la individualmente.
        - **RF-11.2**: O registro da vacinação deve conter nome da vacina, data, dose e observações, vinculados ao animal vacinado.
        - **RF-11.3**: O sistema deve armazenar o histórico de vacinação de cada animal.
    - **RF-12**: O sistema deve permitir registrar ocorrências de saúde
        - **RF-12.1**: Quando o usuário registrar uma ocorrência de saúde, o sistema deve permitir registrar data, descrição, tratamento realizado e situação atual.
        - **RF-12.2**: Quando o animal se machucar, o sistema deve permitir registrar uma observação com data do machucado e data do tratamento, vinculada ao log do animal.
        - **RF-12.3**: Quando o usuário alterar a situação de uma ocorrência, o sistema deve permitir classificá-la como em tratamento, recuperada ou encerrada.
    - **RF-13**: O sistema deve permitir consultar todos os animais que estejam com ocorrências de saúde abertas ou em tratamento.
        - **RF-13.1**: O sistema deve permitir filtrar animais por situação de vacinação (vacinados e não vacinados).
    - **RF-14**: O sistema não deve enviar notificações sobre vacinas, tratamentos ou outras ocorrências.

4. ## Gestão dos pastos
    - **RF-15**: O sistema deve permitir o cadastro dos pastos existentes na fazenda.
        - **RF-15.1**: O cadastro do pasto deve conter nome, área em hectares, tipo de capim, altura atual do capim, condição de umidade e cobertura do solo.
        - **RF-15.2**: Quando o usuário registrar os dados de um pasto, o sistema deve calcular a classificação de qualidade como ruim, regular ou boa.
        - **RF-15.3**: O registro de qualidade do pasto deve conter a data da leitura realizada pelo usuário.
        - **RF-15.4**: A cobertura do pasto deve ser informada como percentual de área coberta por capim, entre 0% e 100%.
    - **RF-16**: O sistema deve permitir registrar a condição ideal do capim de cada pasto
        - **RF-16.1**: A altura do capim deve ser registrada em centímetros.
        - **RF-16.2**: A condição do capim deve ser classificada como verde, parcialmente seco ou seco.
        - **RF-16.3**: Onde o usuário cadastrar um tipo de capim, o sistema deve permitir registrar a altura mínima e máxima considerada adequada.
    - **RF-17**: Quando o usuário selecionar um animal ou lote e um pasto de destino, o sistema deve permitir a movimentação entre pastos.
        - **RF-17.1**: Cada movimentação deve registrar pasto de origem, pasto de destino e data.
        - **RF-17.2**: O sistema deve registrar o histórico de rotação dos pastos.
    - **RF-18**: O sistema deve monitorar o estado atual de cada pasto
        - **RF-18.1**: O sistema deve mostrar a quantidade de animais presentes em cada pasto.
        - **RF-18.2**: O sistema deve calcular o tempo de permanência do animal ou lote no pasto, apresentado em dias.
        - **RF-18.3**: O sistema deve calcular o período de descanso do pasto entre a saída e a entrada de animais, apresentado em dias.

5. ## Vendas
    - **RF-19**: O sistema deve permitir o registro de vendas realizadas.
        - **RF-19.1**: A venda deve conter data, animais vendidos, comprador (texto livre), peso individual de cada animal, valor bruto e observações. Todos os campos são obrigatórios.
        - **RF-19.2**: O sistema deve calcular automaticamente a quantidade de animais incluídos na venda.
        - **RF-19.3**: Quando a venda for confirmada pelo usuário, o sistema deve alterar automaticamente a situação de todos os animais vendidos para "vendido" e excluí-los da contagem de cabeças ativas.
    - **RF-20**: O sistema deve permitir consultar vendas.
        - **RF-20.1**: O sistema deve disponibilizar o histórico completo de vendas.
        - **RF-20.2**: O sistema deve permitir filtrar vendas por período, comprador, animal ou lote.
    - **RF-21**: O sistema deve permitir o registro de vendas planejadas.
        - **RF-21.1**: A venda planejada deve conter data prevista, animais ou lote e valor estimado.
        - **RF-21.2**: A venda planejada é separada da venda realizada e não converte automaticamente.
        - **RF-21.3**: O sistema não deve enviar notificações sobre vendas planejadas.

6. ## Gastos gerais
    - **RF-22**: O sistema deve permitir o registro de gastos gerais da fazenda.
        - **RF-22.1**: Cada gasto deve possuir descrição, categoria, valor e data.
        - **RF-22.2**: As categorias iniciais devem ser: água, ração, mão de obra e infraestrutura.
        - **RF-22.3**: O sistema deve permitir ao usuário criar novas categorias de gastos.
        - **RF-22.4**: O sistema deve permitir cadastrar subcategorias dentro de cada categoria de gastos.
    - **RF-23**: Quando o usuário selecionar um gasto registrado, o sistema deve permitir editá-lo ou excluí-lo.
    - **RF-24**: O sistema deve permitir consultar gastos.
        - **RF-24.1**: O sistema deve permitir filtrar gastos por período e categoria.
        - **RF-24.2**: O sistema deve calcular o total gasto por categoria.
        - **RF-24.3**: O sistema deve calcular o total geral de gastos da fazenda.
    - **RF-25**: Quando o usuário solicitar o resultado financeiro, o sistema deve calcular valor bruto das vendas menos gastos gerais.
        - **RF-25.1**: Quando nenhum período for selecionado, o sistema deve considerar todo o histórico de vendas e gastos.

7. ## Relatórios
    - **RF-26**: O sistema deve gerar o relatório de controle do gado.
        - **RF-26.1**: O relatório deve apresentar quantidade total de animais, animais por sexo, situação, lote e pasto.
        - **RF-26.2**: Onde o usuário solicitar, o sistema deve incluir no relatório informações de reprodução, vacinação e saúde.
    - **RF-27**: O sistema deve gerar o relatório de vendas por período.
        - **RF-27.1**: O relatório deve apresentar animais vendidos, comprador, data, quantidade e valor bruto.
    - **RF-28**: O sistema deve gerar o relatório de gastos por período.
        - **RF-28.1**: O relatório deve apresentar os valores por categoria (água, ração, mão de obra, infraestrutura).
    - **RF-29**: O sistema deve gerar um resumo financeiro contendo vendas, gastos e resultado.
    - **RF-30**: O sistema deve permitir a visualização e exportação dos relatórios.
        - **RF-30.1**: O sistema deve permitir a visualização dos relatórios na tela do aplicativo.
        - **RF-30.2**: Quando o usuário solicitar, o sistema deve exportar o relatório em formato PDF.

8. ## Armazenamento e backup
    - **RF-31**: O sistema deve operar integralmente sem conexão com a internet.
    - **RF-32**: Os dados devem ser armazenados localmente no dispositivo Android.
    - **RF-33**: O sistema deve manter os dados disponíveis após o aplicativo ser fechado ou o aparelho ser reiniciado.
    - **RF-34**: Quando o usuário solicitar, o sistema deve criar um arquivo de backup na pasta específica do aplicativo.
    - **RF-35**: Quando o usuário selecionar um arquivo de backup válido (pasta específica do aplicativo), o sistema deve restaurar os dados.
        - **RF-35.1**: Onde o usuário iniciar uma restauração, o sistema deve solicitar confirmação antes de executar.
    - **RF-36**: O sistema deve informar a data e o horário do último backup realizado.

# Requisitos não funcionais
1. ## Plataforma
    - **RNF-01**: O aplicativo deve ser desenvolvido exclusivamente para Android.
2. ## Compatibilidade
    - **RNF-02**: O aplicativo deve funcionar no Android 10 ou superior.
3. ## Operação offline
    - **RNF-03**: Nenhuma funcionalidade deve exigir conexão com a internet.
4. ## Capacidade
    - **RNF-04**: O aplicativo deve suportar pelo menos 500 animais cadastrados.
5. ## Desempenho
    - **RNF-05**: Consultas com até 500 animais devem ser apresentadas em até 2 segundos.
    - **RNF-06**: Relatórios devem ser gerados em até 5 segundos.
6. ## Usabilidade
    - **RNF-07**: O cadastro de um novo animal deve ser concluído em no máximo três passos de tela.
    - **RNF-08**: A tela inicial deve apresentar atalhos para gado, pastos, vendas, gastos e relatórios.
    - **RNF-09**: Quando ocorrer um erro, o sistema deve exibir mensagem que explique o problema e indique como corrigi-lo.
7. ## Confiabilidade
    - **RNF-10**: Uma operação somente deve ser apresentada como concluída após ser salva no aparelho.
8. ## Segurança
    - **RNF-11**: Os dados do aplicativo devem permanecer protegidos pelo mecanismo de segurança do Android.
    - **RNF-12**: O aplicativo deve permitir configurar senha ou PIN de acesso.
    - **RNF-13**: O arquivo de backup deve ser protegido contra alterações não autorizadas. (A ser discutido o mecanismo de proteção.)
    - **RNF-13b**: Se houver tentativa de acesso com PIN incorreto 3 vezes consecutivas, então o sistema deve bloquear o acesso por 5 minutos.
9. ## Manutenibilidade
    - **RNF-14**: O código deve ser dividido em componentes com responsabilidades definidas e baixo acoplamento.
    - **RNF-15**: Os cálculos financeiros e as regras relacionadas aos animais devem possuir testes automatizados.
10. ## Portabilidade dos dados
    - **RNF-16**: O backup deve poder ser copiado para outro dispositivo Android compatível.
11. ## Interface
    - **RNF-17**: O aplicativo deve utilizar textos em português brasileiro.
    - **RNF-18**: Valores financeiros devem ser apresentados em reais, com duas casas decimais, e datas no formato DD/MM/AAAA.

# Requisitos de domínio
- **RD-01**: O número do brinco será a identificação principal do animal.
- **RD-02**: O sistema deverá trabalhar com controle individual e controle por lotes.
- **RD-03**: Um animal poderá pertencer a apenas um lote e um pasto por vez.
- **RD-04**: Pesos deverão ser registrados em quilogramas.
- **RD-05**: A área dos pastos deverá ser registrada em hectares.
- **RD-06**: A altura do capim deverá ser registrada em centímetros.

# Resumo da configuração definida
- **Plataforma**: Android
- **Internet**: Totalmente offline
- **Usuários**: Um usuário
- **Fazendas**: Uma fazenda
- **Capacidade**: Até 500 cabeças
- **Identificação**: Numeração do brinco comum
- **Controle**: Individual e por lotes
- **Relatórios**: Gado, vendas e gastos
- **Gastos**: Água, ração, mão de obra, infraestrutura (categorias iniciais, expansíveis pelo usuário)
- **Notificações**: Não haverá
- **Integrações externas**: Não haverá
- **Armazenamento**: Local, com backup manual

# Perguntas a Serem Esclarecidas

| ID  | Requisito | Pergunta | Resposta | Status |
|-----|-----------|----------|----------|--------|
| P-01 | RF-02.4 | Quais informações podem ser aplicadas em lote? Apenas vacinas e saúde, ou também dados como raça, observações e situação? | Informações: saúde, raça e observações (caixa de texto). | ✅ Respondida |
| P-02 | RF-08.2 | A data da identificação da prenhez é a data do exame/veterinário ou a data em que o usuário registrou no app? | A data que o usuário registrar. | ✅ Respondida |
| P-03 | RF-09 | A previsão de parto é digitada manualmente pelo usuário ou o sistema calcula automaticamente a partir da data de cobertura (ex: 9 meses)? | Data de cobertura. | ✅ Respondida |
| P-04 | RF-12 / RF-12.2 | "Machucado" é uma ocorrência de saúde separada ou a mesma coisa que "ocorrência de saúde"? Qual a diferença prática? | Machucado seria uma observação que pode ser checada. Caso o animal se machuque, deve ser possível informar quando ele foi tratado. Essa informação deve permanecer em um log/registro do animal para controle. | ✅ Respondida |
| P-05 | RF-15.2 | A classificação de qualidade do pasto é automática (recalcula ao salvar os dados) ou o usuário precisa solicitar explicitamente? | O usuário fará a leitura manualmente. Essa leitura deve ter uma data, tendo em vista que essa informação pode ficar defasada. | ✅ Respondida |
| P-06 | RF-19.1 | Todos os campos da venda (data, animais, comprador, peso, valor, observações) são obrigatórios? O peso total é a soma dos pesos individuais ou um valor digitado? O campo "comprador" é texto livre ou cadastro prévio? | Todos os campos são obrigatórios. O peso é individual. O comprador será um texto livre. | ✅ Respondida |
| P-07 | RF-21 | Uma venda planejada pode se tornar uma venda realizada ou são coisas totalmente separadas? A venda planejada deve aparecer em algum relatório? | Será considerado apenas vendas realizadas. Esse input normalmente acontecerá após a venda já ter sido realizada. | ✅ Respondida |
| P-08 | RF-22.4 | O que significa "cadastrar outros gastos dentro dessas quatro categorias"? É permitir subcategorias dentro de água/ração/mão de obra/infraestrutura, ou apenas cadastrar múltiplos registros na mesma categoria? | É permitir subcategorias, assim será possível ter maior controle. | ✅ Respondida |
| P-09 | RF-25 | A fórmula "valor bruto das vendas menos gastos gerais" considera vendas e gastos de que período? Se o usuário consultar um período específico, o cálculo deve filtrar por esse período? | O período de venda de gado costuma ser longo (1-2 anos), sendo assim, a métrica do período é esse. Calculado geralmente quando há novos bezerros. | ✅ Respondida |
| P-10 | RF-34 / RF-35 | Qual o formato do arquivo de backup (JSON, ZIP, proprietário)? Onde o arquivo é salvo (pasta de downloads, pasta específica do app)? O usuário pode escolher o local? | Os dados serão armazenados dentro do app. Pasta específica do app. | ✅ Respondida |
| P-11 | RNF-07 | "Três telas" no cadastro de animal conta com a tela inicial? É "três telas" no sentido de "três passos" ou literalmente três telas diferentes? | Três passos. A tela inicial conta como primeiro passo. | ✅ Respondida |
| P-12 | RNF-13 | Como o arquivo de backup deve ser protegido contra alterações não autorizadas? Criptografia? Formato proprietário? Ou apenas verificação de integridade (hash)? | A ser discutido. | ⏳ Pendente |
| P-13 | RF-12 / RF-12.2 | Unificar "machucado" e "ocorrência de saúde" em um único conceito de "ocorrência de saúde"? Ou "machucado" deve permanecer como um tipo específico de ocorrência? | Machucado deve ser mais uma observação do que de fato uma ocorrência. | ✅ Respondida |
| P-14 | RF-18.2 | O tempo de permanência no pasto deve ser exibido em dias, horas ou em formato combinado (ex: "5 dias e 3 horas")? | Dias. | ✅ Respondida |
| P-15 | RF-18.3 | O período de descanso do pasto deve ser exibido em dias? | Sim. | ✅ Respondida |
| P-16 | RF-25 | Se o usuário não selecionar um período, o resultado financeiro deve considerar todo o histórico de vendas e gastos? | Sim, incluindo o gasto atual. | ✅ Respondida |
| P-17 | RF-22.2 / RF-22.3 | As quatro categorias de gastos são fixas ou o sistema deve permitir que o usuário crie novas categorias? | O sistema permite novas categorias. | ✅ Respondida |
| P-18 | RF-35 | O que define um arquivo de backup como "válido"? Formato correto, integridade (hash), versão compatível — ou os três critérios? | Discutir. | ⏳ Pendente |
| P-19 | RNF-05b/06b | Os requisitos RNF-05b e RNF-06b (exibir indicador de carregamento ao exceder o limite) contradizem os requisitos de desempenho RNF-05/06. Devemos remover os indicadores e manter apenas os limites de desempenho, ou manter os indicadores como comportamento adicional? | Manter o limite de desempenho. | ✅ Respondida |
| P-20 | RF-11.2 | O registro de vacinação deve conter também a referência ao(s) animal(is) vacinado(s), ou essa vinculação já está implícita em RF-11 (aplicação individual)? | O registro de vacinação deve ser feito individualmente. Deve ser possível fazer um filtro para saber quais animais estão vacinados. | ✅ Respondida |
