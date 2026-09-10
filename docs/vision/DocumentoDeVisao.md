### Documento de Visão
- #### Versão do documento: (0.2)

# Gestão de Rebanho Bovino — Aplicativo Android Offline

**Aplicativo Android offline para controle individual e por lotes de bovinos, gestão de pastos, vendas e gastos de uma fazenda**

|                |                                                     |
| -------------- | --------------------------------------------------- |
| **Status**     | Rascunho                                            |
| **Owner**      | Thálisson (Patrocinador / Gerente)                  |
| **Escopo**     | Aplicativo Android: gado, pastos, vendas, gastos, relatórios |
| **Related**    | —                                                   |
| **Audience**   | Equipe de desenvolvimento, stakeholders, avaliadores |

---

## 1. Resumo

Propomos um aplicativo Android totalmente offline que permite a um único usuário gerenciar bovinos (individualmente e por lotes), pastos, vendas e gastos de uma fazenda, com armazenamento local e backup manual. O sistema não enviará notificações, não terá integrações externas e suportará até 500 animais.

---

## 2. Contexto e restrições

O produto atende fazendas pequenas que necessitam de controle básico de rebanho sem depender de internet ou de sistemas complexos. As restrições definidas são:

| Item | Definição |
|------|-----------|
| Plataforma | Android 10 ou superior |
| Internet | Totalmente offline |
| Usuários | Um único usuário |
| Fazendas | Uma fazenda |
| Capacidade | Até 500 cabeças |
| Identificação | Numeração do brinco comum |
| Controle | Individual e por lotes |
| Relatórios | Gado, vendas e gastos |
| Gastos categorias | Água, ração, mão de obra, infraestrutura |
| Notificações | Não haverá |
| Integrações externas | Não haverá |
| Armazenamento | Local, com backup manual |

---

## 3. Definições

Antes de descrever o comportamento, definimos termos que podem ser ambíguos:

- **Animal ativo**: animal com situação "ativo" no sistema (não vendido, morto ou transferido).
- **Lote**: grupo de animais associados para fins de manejo. Um animal pertence a apenas um lote por vez.
- **Pasto**: área física cadastrada com nome, área, tipo de capim e indicadores de qualidade.
- **Qualidade do pasto**: classificação (boa, regular, ruim) calculada com base em altura do capim, condição (verde/parcialmente seco/seco) e cobertura do solo (%).
- **Situação reprodutiva**: estado reprodutivo de fêmea (não avaliada, vazia, prenha, parida).
- **Ocorrência de saúde**: registro de machucado ou tratamento, com data, descrição, tratamento e situação (em tratamento, recuperada, encerrada).

---

## 4. Objetivos e não-objetivos

### Objetivos

- Permitir cadastro individual de bovinos identificados por número de brinco.
- Gerenciar lotes e movimentação entre pastos.
- Registrar vacinas e ocorrências de saúde.
- Controlar vendas e gastos gerais.
- Gerar relatórios de gado, vendas, gastos e resumo financeiro.
- Oferecer backup manual e restauração de dados.
- Operar 100% offline em Android 10+.

### Não-objetivos (explicitamente fora do escopo)

- Integração com internet, servidores externos ou nuvem.
- Integração com balanças, RFID, sistemas contábeis ou governamentais.
- Notificações push ou alertas automáticos.
- Suporte a múltiplos usuários ou múltiplas fazendas.
- Versão para iOS.
- Controle agrícola (plantio, colheita, insumos agrícolas).

---

## 5. Requisitos funcionais

### 5.1 Controle do gado

| ID | Requisito |
|----|-----------|
| RF-01 | O sistema deve permitir o cadastro de animais individualmente. |
| RF-01.1 | Quando o usuário informar o número do brinco, o sistema deve verificar se já existe animal ativo com o mesmo número. |
| RF-01.2 | Se existir animal ativo com o mesmo número de brinco, então o sistema deve exibir mensagem de erro e impedir o cadastro. |
| RF-01.3 | O cadastro deve conter número do brinco, sexo, data de nascimento ou idade estimada, raça e observações. |
| RF-01.4 | Onde a data de nascimento estiver disponível, o sistema deve calcular a idade do animal automaticamente. |
| RF-02 | O sistema deve permitir a criação de lotes de animais. |
| RF-02.1 | Enquanto um animal pertencer a um lote, o sistema deve impedir sua vinculação a outro lote. |
| RF-02.2 | Quando o usuário selecionar um animal e um lote, o sistema deve permitir adicionar ou remover o animal do lote. |
| RF-02.3 | O sistema deve armazenar o histórico de todos os lotes aos quais o animal pertenceu. |
| RF-02.4 | Quando o usuário selecionar um lote, o sistema deve permitir aplicar informações de saúde, raça e observações a todos os animais do lote. |
| RF-03 | O sistema deve permitir consultar animais pelo número do brinco, sexo, idade, raça, lote, pasto e situação. |
| RF-04 | O sistema deve apresentar a quantidade total de animais ativos na fazenda. |
| RF-05 | O sistema deve apresentar a quantidade de animais por sexo, lote, pasto e situação. |
| RF-06 | Quando o usuário alterar a situação do animal, o sistema deve permitir classificá-lo como ativo, vendido, morto ou transferido. |
| RF-06.1 | O sistema deve manter animais vendidos, mortos ou transferidos disponíveis para consulta no histórico. |
| RF-07 | Onde o usuário optar por aplicar dados em lote, o sistema deve exigir confirmação da ação antes de executar. |

### 5.2 Reprodução

| ID | Requisito |
|----|-----------|
| RF-08 | O sistema deve permitir o registro da situação reprodutiva do animal. |
| RF-08.1 | O sistema deve permitir registrar a situação reprodutiva das fêmeas como não avaliada, vazia, prenha ou parida. |
| RF-08.2 | Quando o usuário registrar uma fêmea como prenha, o sistema deve solicitar a data da identificação da prenhez. |
| RF-08.3 | Se o usuário tentar alterar a situação de uma fêmea para "vazia" enquanto estiver classificada como "prenha", então o sistema deve solicitar confirmação antes de alterar. |
| RF-09 | Onde o usuário informar a data de cobertura, o sistema deve calcular automaticamente a previsão de parto. |
| RF-10 | Quando o usuário registrar o nascimento de um bezerro, o sistema deve solicitar a identificação da mãe e vincular o bezerro a ela. |

### 5.3 Vacinação e saúde

| ID | Requisito |
|----|-----------|
| RF-11 | O sistema deve permitir registrar a vacinação do animal. |
| RF-11.1 | Quando o usuário registrar uma vacinação, o sistema deve permitir aplicá-la individualmente. |
| RF-11.2 | O registro da vacinação deve conter nome da vacina, data, dose e observações, vinculados ao animal vacinado. |
| RF-11.3 | O sistema deve armazenar o histórico de vacinação de cada animal. |
| RF-12 | O sistema deve permitir registrar ocorrências de saúde. |
| RF-12.1 | Quando o usuário registrar uma ocorrência de saúde, o sistema deve permitir registrar data, descrição, tratamento realizado e situação atual. |
| RF-12.2 | Quando o animal se machucar, o sistema deve permitir registrar uma observação com data do machucado e data do tratamento, vinculada ao log do animal. |
| RF-12.3 | Quando o usuário alterar a situação de uma ocorrência, o sistema deve permitir classificá-la como em tratamento, recuperada ou encerrada. |
| RF-13 | O sistema deve permitir consultar todos os animais que estejam com ocorrências de saúde abertas ou em tratamento. |
| RF-13.1 | O sistema deve permitir filtrar animais por situação de vacinação (vacinados e não vacinados). |
| RF-14 | O sistema não deve enviar notificações sobre vacinas, tratamentos ou outras ocorrências. |

### 5.4 Gestão dos pastos

| ID | Requisito |
|----|-----------|
| RF-15 | O sistema deve permitir o cadastro dos pastos existentes na fazenda. |
| RF-15.1 | O cadastro do pasto deve conter nome, área em hectares, tipo de capim, altura atual do capim, condição de umidade e cobertura do solo. |
| RF-15.2 | Quando o usuário registrar os dados de um pasto, o sistema deve calcular a classificação de qualidade como ruim, regular ou boa. |
| RF-15.3 | O registro de qualidade do pasto deve conter a data da leitura realizada pelo usuário. |
| RF-15.4 | A cobertura do pasto deve ser informada como percentual de área coberta por capim, entre 0% e 100%. |
| RF-16 | O sistema deve permitir registrar a condição ideal do capim de cada pasto. |
| RF-16.1 | A altura do capim deve ser registrada em centímetros. |
| RF-16.2 | A condição do capim deve ser classificada como verde, parcialmente seco ou seco. |
| RF-16.3 | Onde o usuário cadastrar um tipo de capim, o sistema deve permitir registrar a altura mínima e máxima considerada adequada. |
| RF-17 | Quando o usuário selecionar um animal ou lote e um pasto de destino, o sistema deve permitir a movimentação entre pastos. |
| RF-17.1 | Cada movimentação deve registrar pasto de origem, pasto de destino e data. |
| RF-17.2 | O sistema deve registrar o histórico de rotação dos pastos. |
| RF-18 | O sistema deve monitorar o estado atual de cada pasto. |
| RF-18.1 | O sistema deve mostrar a quantidade de animais presentes em cada pasto. |
| RF-18.2 | O sistema deve calcular o tempo de permanência do animal ou lote no pasto, apresentado em dias. |
| RF-18.3 | O sistema deve calcular o período de descanso do pasto entre a saída e a entrada de animais, apresentado em dias. |

**Critério de qualidade do pasto:**

| Classificação | Critério |
|---------------|----------|
| Boa | Altura adequada, capim verde e cobertura ≥ 80%. |
| Regular | Um dos três critérios fora da condição adequada. |
| Ruim | Dois ou mais critérios fora da condição adequada. |

A altura adequada deverá poder ser alterada no aplicativo, pois varia conforme o tipo de capim.

### 5.5 Vendas

| ID | Requisito |
|----|-----------|
| RF-19 | O sistema deve permitir o registro de vendas realizadas. |
| RF-19.1 | A venda deve conter data, animais vendidos, comprador (texto livre), peso individual de cada animal, valor bruto e observações. Todos os campos são obrigatórios. |
| RF-19.2 | O sistema deve calcular automaticamente a quantidade de animais incluídos na venda. |
| RF-19.3 | Quando a venda for confirmada pelo usuário, o sistema deve alterar automaticamente a situação de todos os animais vendidos para "vendido" e excluí-los da contagem de cabeças ativas. |
| RF-20 | O sistema deve permitir consultar vendas. |
| RF-20.1 | O sistema deve disponibilizar o histórico completo de vendas. |
| RF-20.2 | O sistema deve permitir filtrar vendas por período, comprador, animal ou lote. |
| RF-21 | O sistema deve permitir o registro de vendas planejadas. |
| RF-21.1 | A venda planejada deve conter data prevista, animais ou lote e valor estimado. |
| RF-21.2 | A venda planejada é separada da venda realizada e não converte automaticamente. |
| RF-21.3 | O sistema não deve enviar notificações sobre vendas planejadas. |

### 5.6 Gastos gerais

| ID | Requisito |
|----|-----------|
| RF-22 | O sistema deve permitir o registro de gastos gerais da fazenda. |
| RF-22.1 | Cada gasto deve possuir descrição, categoria, valor e data. |
| RF-22.2 | As categorias iniciais devem ser: água, ração, mão de obra e infraestrutura. |
| RF-22.3 | O sistema deve permitir ao usuário criar novas categorias de gastos. |
| RF-22.4 | O sistema deve permitir cadastrar subcategorias dentro de cada categoria de gastos. |
| RF-23 | Quando o usuário selecionar um gasto registrado, o sistema deve permitir editá-lo ou excluí-lo. |
| RF-24 | O sistema deve permitir consultar gastos. |
| RF-24.1 | O sistema deve permitir filtrar gastos por período e categoria. |
| RF-24.2 | O sistema deve calcular o total gasto por categoria. |
| RF-24.3 | O sistema deve calcular o total geral de gastos da fazenda. |
| RF-25 | Quando o usuário solicitar o resultado financeiro, o sistema deve calcular valor bruto das vendas menos gastos gerais. |
| RF-25.1 | Quando nenhum período for selecionado, o sistema deve considerar todo o histórico de vendas e gastos. |

### 5.7 Relatórios

| ID | Requisito |
|----|-----------|
| RF-26 | O sistema deve gerar o relatório de controle do gado. |
| RF-26.1 | O relatório deve apresentar quantidade total de animais, animais por sexo, situação, lote e pasto. |
| RF-26.2 | Onde o usuário solicitar, o sistema deve incluir no relatório informações de reprodução, vacinação e saúde. |
| RF-27 | O sistema deve gerar o relatório de vendas por período. |
| RF-27.1 | O relatório deve apresentar animais vendidos, comprador, data, quantidade e valor bruto. |
| RF-28 | O sistema deve gerar o relatório de gastos por período. |
| RF-28.1 | O relatório deve apresentar os valores por categoria (água, ração, mão de obra, infraestrutura). |
| RF-29 | O sistema deve gerar um resumo financeiro contendo vendas, gastos e resultado. |
| RF-30 | O sistema deve permitir a visualização e exportação dos relatórios. |
| RF-30.1 | O sistema deve permitir a visualização dos relatórios na tela do aplicativo. |
| RF-30.2 | Quando o usuário solicitar, o sistema deve exportar o relatório em formato PDF. |

### 5.8 Armazenamento e backup

| ID | Requisito |
|----|-----------|
| RF-31 | O sistema deve operar integralmente sem conexão com a internet. |
| RF-32 | Os dados devem ser armazenados localmente no dispositivo Android. |
| RF-33 | O sistema deve manter os dados disponíveis após o aplicativo ser fechado ou o aparelho ser reiniciado. |
| RF-34 | Quando o usuário solicitar, o sistema deve criar um arquivo de backup na pasta específica do aplicativo. |
| RF-35 | Quando o usuário selecionar um arquivo de backup válido (pasta específica do aplicativo), o sistema deve restaurar os dados. |
| RF-35.1 | Onde o usuário iniciar uma restauração, o sistema deve solicitar confirmação antes de executar. |
| RF-36 | O sistema deve informar a data e o horário do último backup realizado. |

---

## 6. Requisitos não funcionais

| ID | Categoria | Requisito |
|----|-----------|-----------|
| RNF-01 | Plataforma | O aplicativo deve ser desenvolvido exclusivamente para Android. |
| RNF-02 | Compatibilidade | O aplicativo deve funcionar no Android 10 ou superior. |
| RNF-03 | Operação offline | Nenhuma funcionalidade deve exigir conexão com a internet. |
| RNF-04 | Capacidade | O aplicativo deve suportar pelo menos 500 animais cadastrados. |
| RNF-05 | Desempenho | Consultas com até 500 animais devem ser apresentadas em até 2 segundos. |
| RNF-06 | Desempenho | Relatórios devem ser gerados em até 5 segundos. |
| RNF-07 | Usabilidade | O cadastro de um novo animal deve ser concluído em no máximo três passos de tela. |
| RNF-08 | Usabilidade | A tela inicial deve apresentar atalhos para gado, pastos, vendas, gastos e relatórios. |
| RNF-09 | Usabilidade | Quando ocorrer um erro, o sistema deve exibir mensagem que explique o problema e indique como corrigi-lo. |
| RNF-10 | Confiabilidade | Uma operação somente deve ser apresentada como concluída após ser salva no aparelho. |
| RNF-11 | Segurança | Os dados do aplicativo devem permanecer protegidos pelo mecanismo de segurança do Android. |
| RNF-12 | Segurança | O aplicativo deve permitir configurar senha ou PIN de acesso. |
| RNF-13 | Segurança | O arquivo de backup deve ser protegido contra alterações não autorizadas. (A ser discutido o mecanismo de proteção.) |
| RNF-13b | Segurança | Se houver tentativa de acesso com PIN incorreto 3 vezes consecutivas, então o sistema deve bloquear o acesso por 5 minutos. |
| RNF-14 | Manutenibilidade | O código deve ser dividido em componentes com responsabilidades definidas e baixo acoplamento. |
| RNF-15 | Manutenibilidade | Os cálculos financeiros e as regras relacionadas aos animais devem possuir testes automatizados. |
| RNF-16 | Portabilidade | O backup deve poder ser copiado para outro dispositivo Android compatível. |
| RNF-17 | Interface | O aplicativo deve utilizar textos em português brasileiro. |
| RNF-18 | Interface | Valores financeiros devem ser apresentados em reais, com duas casas decimais, e datas no formato DD/MM/AAAA. |

---

## 7. Requisitos de domínio

| ID | Requisito |
|----|-----------|
| RD-01 | Número do brinco é a identificação principal do animal. |
| RD-02 | Controle individual e por lotes coexistem no mesmo sistema. |
| RD-03 | Animal pertence a apenas um lote e um pasto por vez. |
| RD-04 | Pesos registrados em quilogramas. |
| RD-05 | Área dos pastos registrada em hectares. |
| RD-06 | Altura do capim registrada em centímetros. |

---

## 8. Principais funcionalidades

| # | Funcionalidade | Descrição |
|---|----------------|-----------|
| F01 | Controle do Gado | Cadastro, edição, consulta, lotes, classificação e histórico de bovinos. |
| F02 | Reprodução | Situação reprodutiva, prenhez, previsão de parto, nascimento de bezerro. |
| F03 | Vacinação e Saúde | Registro de vacinas e ocorrências de saúde, com histórico e classificação. |
| F04 | Gestão dos Pastos | Cadastro, qualidade, movimentação, rotação e descanso de pastos. |
| F05 | Vendas | Registro de vendas realizadas e planejamento de vendas futuras. |
| F06 | Gastos Gerais | Registro, edição, exclusão e consulta de gastos por categoria. |
| F07 | Relatórios | Relatórios de gado, vendas, gastos e resumo financeiro (tela e PDF). |
| F08 | Armazenamento e Backup | Backup manual, restauração e proteção de dados localmente. |

---

## 9. Stakeholders

1. **Patrocinador**
   > Fornece financiamento e recursos, detendo poder de decisão
   - Thálisson

2. **Clientes / Utilizadores Finais**
   > Quem utiliza o software, define necessidades e valida o produto
   - Fazendeiros

3. **Gerente de Projeto**
   > Responsável pelo planeamento e execução
   - Thálisson
   - Lucas

4. **Equipe de Desenvolvimento**
   > Desenvolvedores, designers, testadores, analistas
   - Front: Kayke, Marcelo, João Gabriel
   - Back: Guilherme, João

5. **PMO (Escritório de Projetos)**
   > Gere padrões, processos e recursos

6. **Fornecedores / Parceiros**
   > Fornecem infraestrutura ou serviços essenciais

7. **Sistemas de Referência e Benchmark**
   > Definem padrões de comparação e inspiração técnica para a interface
   - Leigado Gado Leiteiro e Corte
   - CowMaster - Manejo de Rebanho
   - BovPilot: Gestão de Rebanhos
   - $uplementa Certo
   - Farmleo: Gestão de Gado!
   - Rebanho Fácil: Gado & Fazenda

8. **Órgãos Reguladores**
   > Garantem conformidade legal e técnica (monitoramento externo)

9. **Personas**
   > Representações dos clientes ideais que ajudarão na definição de requisitos

---

## 10. Benefícios esperados

- Controle centralizado de rebanho, pastos, vendas e gastos em um único app offline.
- Redução de perdas por falta de registro de vacinas e ocorrências de saúde.
- Visão financeira consolidada (vendas menos gastos) sem dependência de planilhas externas.
- Gestão de pastos com critérios de qualidade parametrizáveis.
- Histórico completo preservado mesmo após venda ou morte de animais.

---

## 11. Custos e trade-offs

| Aspecto | Custo identificado |
|---------|-------------------|
| Offline total | Sem possibilidade de acesso remoto, backup automático ou sincronização entre dispositivos. |
| Usuário único | Sem suporte a múltiplos acessos simultâneos ou controle de permissões por perfil. |
| Sem notificações | O usuário deve lembrar de verificar prazos de vacinas e vendas planejadas manualmente. |
| Backup manual | Risco de perda de dados se o usuário não criar backups regularmente. |
| Android only | Exclui usuários com iOS ou outros sistemas operacionais. |

---

## 12. Riscos residuais e o que NÃO fazer

- **NÃO** adicionar funcionalidade de notificações para "melhorar a experiência" — contradiz o requisito RF-14/RF-21.3.
- **NÃO** introduzir chamadas de rede ou dependência de serviços externos em nenhum módulo.
- **NÃO** permitir múltiplos usuários sem reavaliar toda a modelagem de dados e segurança.
- **NÃO** simplificar a qualidade do pasto removendo um dos três critérios (altura, condição, cobertura) — os três são necessários conforme RF-15.2.
- **NÃO** remover o campo de histórico de lotes do animal (RF-02.3) por parecer "desnecessário" — é essencial para auditoria.
- **NÃO** alterar a fórmula de resultado financeiro (RF-25) sem aprovação do patrocinador.

---

*Este documento é um rascunho (proposta). As seções de requisitos e definições são fatos extraídos do material fornecido. As seções de benefícios, custos e riscos são propostas que dependem de validação com o patrocinador e a equipe. Input é bem-vindo em qualquer seção.*
