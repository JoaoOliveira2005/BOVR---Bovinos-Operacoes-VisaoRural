### Requisitos
- #### Versão do documento: (0.1)

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
    - **RF-02**: Quando o usuário informar o número do brinco, o sistema deve verificar se já existe animal ativo com o mesmo número.
    - **RF-02b**: Se existir animal ativo com o mesmo número de brinco, então o sistema deve exibir mensagem de erro e impedir o cadastro.
    - **RF-03**: O cadastro deve conter número do brinco, sexo, data de nascimento ou idade estimada, raça e observações.
    - **RF-03b**: Onde a data de nascimento estiver disponível, o sistema deve calcular a idade do animal automaticamente.
    - **RF-04**: O sistema deve permitir a criação de lotes de animais.
    - **RF-05**: Enquanto um animal pertencer a um lote, o sistema deve impedir sua vinculação a outro lote.
    - **RF-06**: Quando o usuário selecionar um animal e um lote, o sistema deve permitir adicionar ou remover o animal do lote.
    - **RF-07**: O sistema deve armazenar o histórico de todos os lotes aos quais o animal pertenceu.
    - **RF-08**: O sistema deve permitir consultar animais pelo número do brinco, sexo, idade, raça, lote, pasto e situação.
    - **RF-09**: O sistema deve apresentar a quantidade total de animais ativos na fazenda.
    - **RF-10**: O sistema deve apresentar a quantidade de animais por sexo, lote, pasto e situação.
    - **RF-11**: Quando o usuário alterar a situação do animal, o sistema deve permitir classificá-lo como ativo, vendido, morto ou transferido.
    - **RF-12**: O sistema deve manter animais vendidos, mortos ou transferidos disponíveis para consulta no histórico.
    - **RF-13b**: Quando o usuário selecionar um lote, o sistema deve permitir aplicar informações a todos os animais do lote.
    - **RF-13c**: Onde o usuário optar por aplicar dados em lote, o sistema deve confirmar a ação antes de executar.

    > ※ RF-13 é ambíguo. Visitar Seção "Perguntas a Serem Esclarecidas" — P-01

2. ## Reprodução
    - **RF-14**: O sistema deve permitir registrar a situação reprodutiva das fêmeas como não avaliada, vazia, prenha ou parida.
    - **RF-15**: Quando o usuário registrar uma fêmea como prenha, o sistema deve solicitar a data da identificação da prenhez.
    - **RF-16**: Onde o usuário informar a data de cobertura, o sistema deve calcular automaticamente a previsão de parto.
    - **RF-17**: Quando o usuário registrar o nascimento de um bezerro, o sistema deve solicitar a identificação da mãe e vincular o bezerro a ela.
    - **RF-18**: Se o usuário tentar alterar a situação de uma fêmea para "vazia" enquanto estiver classificada como "prenha", então o sistema deve solicitar confirmação antes de alterar.

3. ## Vacinação e saúde
    - **RF-19**: Quando o usuário registrar uma vacinação, o sistema deve permitir aplicá-la individualmente ou por lote.
    - **RF-20**: O registro da vacinação deve conter nome da vacina, data, dose e observações.

    > ※ RF-20 é incompleto (falta referência ao animal vacinado). Visitar Seção "Perguntas a Serem Esclarecidas" — P-20

    - **RF-21**: O sistema deve armazenar o histórico de vacinação de cada animal.
    - **RF-22**: Quando o usuário registrar uma ocorrência de saúde, o sistema deve permitir descrever o machucado com data, descrição e tratamento.
    - **RF-23**: Uma ocorrência de saúde deve conter data, descrição, tratamento realizado e situação atual.
    - **RF-24**: Quando o usuário alterar a situação de uma ocorrência, o sistema deve permitir classificá-la como em tratamento, recuperada ou encerrada.
    - **RF-25**: O sistema deve permitir consultar todos os animais que estejam machucados ou em tratamento.
    - **RF-26**: O sistema não deve enviar notificações sobre vacinas, tratamentos ou outras ocorrências.

    > ※ RF-22 e RF-23 possuem sobreposição conceitual. Visitar Seção "Perguntas a Serem Esclarecidas" — P-04 e P-13

4. ## Gestão dos pastos
    - **RF-27**: O sistema deve permitir o cadastro dos pastos existentes na fazenda.
    - **RF-28**: O cadastro do pasto deve conter nome, área em hectares, tipo de capim, altura atual do capim, condição de umidade e cobertura do solo.
    - **RF-29**: A altura do capim deve ser registrada em centímetros.
    - **RF-30**: A condição do capim deve ser classificada como verde, parcialmente seco ou seco.
    - **RF-31**: A cobertura do pasto deve ser informada como percentual de área coberta por capim, entre 0% e 100%.
    - **RF-32**: Onde o usuário cadastrar um tipo de capim, o sistema deve permitir registrar a altura mínima e máxima considerada adequada.
    - **RF-33**: Quando os dados do pasto estiverem completos, o sistema deve classificar automaticamente a qualidade como ruim, regular ou boa.
    - **RF-34**: O sistema deve mostrar a quantidade de animais presentes em cada pasto.
    - **RF-35**: Quando o usuário selecionar um animal ou lote e um pasto de destino, o sistema deve permitir a movimentação entre pastos.
    - **RF-36**: Cada movimentação deve registrar pasto de origem, pasto de destino e data.
    - **RF-37**: O sistema deve calcular o tempo de permanência do animal ou lote no pasto.
    - **RF-38**: O sistema deve registrar o histórico de rotação dos pastos.
    - **RF-39**: O sistema deve calcular o período de descanso do pasto entre a saída e a entrada de animais.

    > ※ RF-37 e RF-39 são incompletos (unidade de medida não definida). Visitar Seção "Perguntas a Serem Esclarecidas" — P-14 e P-15

5. ## Vendas
    - **RF-40**: Quando o usuário iniciar um registro de venda, o sistema deve permitir selecionar animais ou lotes para venda.
    - **RF-41**: A venda deve conter data, animais vendidos, comprador, peso total, valor bruto e observações.
    - **RF-42**: O sistema deve calcular automaticamente a quantidade de animais incluídos na venda.
    - **RF-43**: Quando a venda for confirmada pelo usuário, o sistema deve alterar automaticamente a situação de todos os animais vendidos para "vendido".
    - **RF-44**: Enquanto um animal estiver com situação "vendido", o sistema deve excluí-lo da contagem de cabeças ativas.
    - **RF-45**: O sistema deve disponibilizar o histórico completo de vendas.
    - **RF-46**: O sistema deve permitir consultar vendas por período, comprador, animal ou lote.
    - **RF-47**: Onde o usuário desejar planejar uma venda futura, o sistema deve permitir registrar uma venda planejada.
    - **RF-48**: O planejamento da venda deve conter data prevista, animais ou lote e valor estimado.
    - **RF-49**: O sistema não deve enviar notificações sobre vendas planejadas.

    > ※ RF-47/RF-48 são ambíguos. Visitar Seção "Perguntas a Serem Esclarecidas" — P-07

6. ## Gastos gerais
    - **RF-50**: O sistema deve permitir o registro de gastos gerais da fazenda.
    - **RF-51**: Cada gasto deve possuir descrição, categoria, valor e data.
    - **RF-52**: As categorias disponíveis devem ser: água, ração, mão de obra e infraestrutura.

    > ※ RF-52 é incompleto (não define se categorias são fixas ou expansíveis). Visitar Seção "Perguntas a Serem Esclarecidas" — P-17
    - **RF-53**: O sistema deve permitir cadastrar múltiplos gastos dentro de cada uma das quatro categorias.
    - **RF-54**: Quando o usuário selecionar um gasto registrado, o sistema deve permitir editá-lo ou excluí-lo.
    - **RF-55**: O sistema deve permitir consultar gastos por período e categoria.
    - **RF-56**: O sistema deve calcular o total gasto por categoria.
    - **RF-57**: O sistema deve calcular o total geral de gastos da fazenda.
    - **RF-58**: Quando o usuário solicitar o resultado financeiro, o sistema deve calcular valor bruto das vendas menos gastos gerais do período selecionado.

    > ※ RF-53 e RF-58 são ambíguos. Visitar Seção "Perguntas a Serem Esclarecidas" — P-08, P-09 e P-16

7. ## Relatórios
    - **RF-59**: O sistema deve gerar o relatório de controle do gado.
    - **RF-60**: O relatório de controle do gado deve apresentar quantidade total de animais, animais por sexo, situação, lote e pasto.
    - **RF-61**: Onde o usuário solicitar, o sistema deve incluir no relatório informações de reprodução, vacinação e saúde.
    - **RF-62**: O sistema deve gerar o relatório de vendas por período.
    - **RF-63**: O relatório de vendas deve apresentar animais vendidos, comprador, data, quantidade e valor bruto.
    - **RF-64**: O sistema deve gerar o relatório de gastos por período.
    - **RF-65**: O relatório de gastos deve apresentar os valores por categoria (água, ração, mão de obra, infraestrutura).
    - **RF-66**: O sistema deve gerar um resumo financeiro contendo vendas, gastos e resultado.
    - **RF-67**: O sistema deve permitir a visualização dos relatórios na tela do aplicativo.
    - **RF-68**: Quando o usuário solicitar, o sistema deve exportar o relatório em formato PDF.

8. ## Armazenamento e backup
    - **RF-69**: O sistema deve operar integralmente sem conexão com a internet.
    - **RF-70**: Os dados devem ser armazenados localmente no dispositivo Android.
    - **RF-71**: O sistema deve manter os dados disponíveis após o aplicativo ser fechado ou o aparelho ser reiniciado.
    - **RF-72**: Quando o usuário solicitar, o sistema deve criar um arquivo de backup.
    - **RF-73**: Quando o usuário selecionar um arquivo de backup válido, o sistema deve restaurar os dados.
    - **RF-74**: Onde o usuário iniciar uma restauração, o sistema deve solicitar confirmação antes de executar.
    - **RF-75**: O sistema deve informar a data e o horário do último backup realizado.

    > ※ RF-72 e RF-73 são ambíguos. Visitar Seção "Perguntas a Serem Esclarecidas" — P-10 e P-18

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
    - **RNF-05b**: Se o tempo de resposta de uma consulta exceder 2 segundos, então o sistema deve exibir indicador de carregamento.
    - **RNF-06**: Relatórios devem ser gerados em até 5 segundos.
    - **RNF-06b**: Se o tempo de geração de relatório exceder 5 segundos, então o sistema deve exibir indicador de progresso.

    > ※ RNF-05b e RNF-06b são inconsistentes com RNF-05 e RNF-06 (indicador não resolve o requisito de desempenho). Visitar Seção "Perguntas a Serem Esclarecidas" — P-19
6. ## Usabilidade
    - **RNF-07**: O cadastro de um novo animal deve ser concluído em no máximo três passos de tela.
    - **RNF-08**: A tela inicial deve apresentar atalhos para gado, pastos, vendas, gastos e relatórios.
    - **RNF-09**: Quando ocorrer um erro, o sistema deve exibir mensagem que explique o problema e indique como corrigi-lo.
7. ## Confiabilidade
    - **RNF-10**: Uma operação somente deve ser apresentada como concluída após ser salva no aparelho.
8. ## Segurança
    - **RNF-11**: Os dados do aplicativo devem permanecer protegidos pelo mecanismo de segurança do Android.
    - **RNF-12**: O aplicativo deve permitir configurar senha ou PIN de acesso.
    - **RNF-13**: O arquivo de backup deve ser protegido contra alterações não autorizadas.
    - **RNF-13b**: Se houver tentativa de acesso com PIN incorreto 3 vezes consecutivas, então o sistema deve bloquear o acesso por 5 minutos.
9. ## Manutenibilidade
    - **RNF-14**: O código deve ser dividido em componentes com responsabilidades definidas e baixo acoplamento.
    - **RNF-15**: Os cálculos financeiros e as regras relacionadas aos animais devem possuir testes automatizados.
10. ## Portabilidade dos dados
    - **RNF-16**: O backup deve poder ser copiado para outro dispositivo Android compatível.
11. ## Interface
    - **RNF-17**: O aplicativo deve utilizar textos em português brasileiro.
    - **RNF-18**: Valores financeiros devem ser apresentados em reais, com duas casas decimais, e datas no formato DD/MM/AAAA.

    > ※ RNF-07 e RNF-13 são ambíguos. Visitar Seção "Perguntas a Serem Esclarecidas" — P-11 e P-12

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
- **Gastos**: Água, ração, mão de obra e infraestrutura
- **Notificações**: Não haverá
- **Integrações externas**: Não haverá
- **Armazenamento**: Local, com backup manual

# Perguntas a Serem Esclarecidas

| ID  | Requisito | Pergunta | Resposta | Status |
|-----|-----------|----------|----------|--------|
| P-01 | RF-13 | Quais informações podem ser aplicadas em lote? Apenas vacinas e saúde, ou também dados como raça, observações e situação? | — | ⏳ Pendente |
| P-02 | RF-15 | A data da identificação da prenhez é a data do exame/veterinário ou a data em que o usuário registrou no app? | — | ⏳ Pendente |
| P-03 | RF-16 | A previsão de parto é digitada manualmente pelo usuário ou o sistema calcula automaticamente a partir da data de cobertura (ex: 9 meses)? | — | ⏳ Pendente |
| P-04 | RF-22/23 | "Machucado" (RF-22) é uma ocorrência de saúde separada ou a mesma coisa que "ocorrência de saúde" (RF-23)? Qual a diferença prática? | — | ⏳ Pendente |
| P-05 | RF-33 | A classificação de qualidade do pasto é automática (recalcula ao salvar os dados) ou o usuário precisa solicitar explicitamente? | — | ⏳ Pendente |
| P-06 | RF-41 | Todos os campos da venda (data, animais, comprador, peso, valor, observações) são obrigatórios? O peso total é a soma dos pesos individuais ou um valor digitado? O campo "comprador" é texto livre ou cadastro prévio? | — | ⏳ Pendente |
| P-07 | RF-47/48 | Uma venda planejada pode se tornar uma venda realizada (转化) ou são coisas totalmente separadas? A venda planejada deve aparecer em algum relatório? | — | ⏳ Pendente |
| P-08 | RF-53 | O que significa "cadastrar outros gastos dentro dessas quatro categorias"? É permitir subcategorias dentro de água/ração/mão de obra/infraestrutura, ou apenas cadastrar múltiplos registros na mesma categoria? | — | ⏳ Pendente |
| P-09 | RF-58 | A fórmula "valor bruto das vendas menos gastos gerais" considera vendas e gastos de que período? Se o usuário consultar um período específico, o cálculo deve filtrar por esse período? | — | ⏳ Pendente |
| P-10 | RF-72/73 | Qual o formato do arquivo de backup (JSON, ZIP, proprietário)? Onde o arquivo é salvo (pasta de downloads, pasta específica do app)? O usuário pode escolher o local? | — | ⏳ Pendente |
| P-11 | RNF-07 | "Três telas" no cadastro de animal conta com a tela inicial? É "três telas" no sentido de "três passos" ou literalmente três telas diferentes? | — | ⏳ Pendente |
| P-12 | RNF-13 | Como o arquivo de backup deve ser protegido contra alterações não autorizadas? Criptografia? Formato proprietário? Ou apenas verificação de integridade (hash)? | — | ⏳ Pendente |
| P-13 | RF-22/23 | Unificar "machucado" e "ocorrência de saúde" em um único conceito de "ocorrência de saúde"? Ou "machucado" deve permanecer como um tipo específico de ocorrência? | — | ⏳ Pendente |
| P-14 | RF-37 | O tempo de permanência no pasto deve ser exibido em dias, horas ou em formato combinado (ex: "5 dias e 3 horas")? | — | ⏳ Pendente |
| P-15 | RF-39 | O período de descanso do pasto deve ser exibido em dias? | — | ⏳ Pendente |
| P-16 | RF-58 | Se o usuário não selecionar um período, o resultado financeiro deve considerar todo o histórico de vendas e gastos? | — | ⏳ Pendente |
| P-17 | RF-52 | As quatro categorias de gastos são fixas ou o sistema deve permitir que o usuário crie novas categorias? | — | ⏳ Pendente |
| P-18 | RF-73 | O que define um arquivo de backup como "válido"? Formato correto, integridade (hash), versão compatível — ou os três critérios? | — | ⏳ Pendente |
| P-19 | RNF-05b/06b | Os requisitos RNF-05b e RNF-06b (exibir indicador de carregamento ao exceder o limite) contradizem os requisitos de desempenho RNF-05/06. Devemos remover os indicadores e manter apenas os limites de desempenho, ou manter os indicadores como comportamento adicional? | — | ⏳ Pendente |
| P-20 | RF-20 | O registro de vacinação deve conter também a referência ao(s) animal(is) vacinado(s), ou essa vinculação já está implícita em RF-19 (aplicação individual ou por lote)? | — | ⏳ Pendente |
