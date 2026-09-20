# Product Backlog — BOVR (Bovinos — Operações Visão Rural)

**Versão:** 0.2  
**Autor:** Equipe de desenvolvimento  
**Status:** Draft — aguardando refinement  
**Data:** 2026-09-15  

---

## Visão geral

Este documento contém o Product Backlog completo do BOVR, organizado conforme os conceitos de engenharia de requisitos estudados. Cada item segue o formato **User Story (INVEST)** com **critérios de aceitação (Dado/Quando/Então)**, priorização **MoSCoW**, estimativa em **story points**, **rastreabilidade** às RFs de origem e dependências mapeadas.

### Regras de fluxo

| Coluna | Definição |
|---|---|
| **Backlog** | Item aguardando refinement. Deve satisfazer INVEST + ACs + estimativa + MoSCoW para ir para Ready |
| **Ready** | Item aprovado pelo DoR checklist: claro, testável, sem blockers, dependências mapeadas, stakeholder aprovou |
| **In progress** | Item em desenvolvimento (máximo 2-3 por dev) |
| **In review** | Item com código submetido em PR, aguardando revisão e testes |
| **Done** | Item que satisfaz DoD checklist: revisado, testes passando, ACs atendidas, offline, PT-BR/R$/data, performance OK |

### DoR checklist (para ir para Ready)
- [ ] User Story escrita no formato INVEST
- [ ] Critérios de aceitação definidos e testáveis
- [ ] Estimativa em story points atribuída
- [ ] MoSCoW definido
- [ ] Dependências identificadas
- [ ] Stakeholders aprovaram (decisão documentada)

### DoD checklist (para ir para Done)
- [ ] Código revisado por outro membro da equipe
- [ ] Testes automatizados passando (RNF-15)
- [ ] Funciona 100% offline (RNF-03)
- [ ] PT-BR, R$ com 2 casas decimais, DD/MM/AAAA (RNF-17/18)
- [ ] Critérios de aceitação todos atendidos
- [ ] Performance OK: consultas ≤2s, relatórios ≤5s (RNF-05/06)
- [ ] Dados persistidos após fechar app ou reiniciar (RNF-10/33)

### Item bloqueado
- **B-24** (PIN + bloqueio) → não pode ir para Ready até P-12/P-18 serem resolvidos (proteção do backup).

---

## Sprint 0 — Fundação (Must)

### B-00 — Setup projeto Android + arquitetura offline + DB local
**Must · 13 pts · RNF-01/02/03/10/11/14, RF-31/32/33**

```
- Como desenvolvedor,
- Quero configurar o projeto Android com arquitetura offline e banco de dados local,
- Para que o aplicativo funcione sem internet e persista dados após reinício.

ACs (Dado/Quando/Então):
1. Dado que o app é iniciado, Quando é aberta qualquer tela, Então nenhum endpoint de rede é chamado (RNF-03)
2. Dado que o dispositivo é reiniciado, Quando o app é aberto, Então todos os dados estão disponíveis (RNF-33)
3. Dado que o projeto é configurado, Quando um dado é salvo, Então é salvo localmente no dispositivo (RF-32)

DoR: ✓ Arquitetura definida, DB selecionado
DoD: ✓ Offline funcionando, persistência verificada
```

---

### B-01 — Tela inicial com atalhos + navegação + padrão visual PT-BR/R$/data
**Must · 5 pts · RNF-07/08/09, RNF-17/18**

```
- Como usuário,
- Quero ver uma tela inicial com 5 atalhos para gado, pastos, vendas, gastos e relatórios,
- Para que eu tenha acesso rápido às funcionalidades principais.

ACs (Dado/Quando/Então):
1. Dado que o app é aberto, Quando a tela inicial é exibida, Então existem 5 atalhos funcionais (RNF-08)
2. Dado que o usuário clica em um atalho, Quando a navegação é executada, Então a tela destino é aberta (RNF-08)
3. Dado que ocorre um erro, Quando é exibida mensagem, Então a mensagem explica o problema e indica como corrigi-lo (RNF-09)

DoR: ✓ Layout e navegação definidos
DoD: ✓ Atalhos funcionam, erros são explicativos
```

---

### B-02 — Modelo base Animal/Lote/Pasto + seed 500 animais para teste de performance
**Must · 8 pts · RNF-04/05/14/15, RF-01/02/02.1**

```
- Como desenvolvedor,
- Quero criar o modelo de dados base (Animal, Lote, Pasto) e seed com 500 animais para teste de performance,
- Para que o sistema suporte até 500 animais e consultas em ≤2s.

ACs (Dado/Quando/Então):
1. Dado que 500 animais são importados, Quando uma consulta é executada, Então o resultado é apresentado em ≤2s (RNF-04, RNF-05)
2. Dado que o modelo base é criado, Quando um animal é cadastrado, Então contém brinco, sexo, DOB, raça, observações (RF-01.3)
3. Dado que um animal pertence a um lote, Quando outro lote é selecionado, Então o sistema impede vínculo duplo (RF-02.1)

DoR: ✓ Modelo validado com PO
DoD: ✓ Import de 500 funciona, consulta ≤2s
```

---

## Sprint 1 — Gado core (Must)

### B-03 — Cadastrar animal individual com validação de brinco duplicado
**Must · 5 pts · RF-01/01.1/01.2/01.3/01.4, RNF-07**

```
- Como fazendeiro,
- Quero cadastrar um animal com número do brinco, sexo, data de nascimento, raça e observações,
- Para que eu possa controlar o rebanho individualmente.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro informa número do brinco, Quando o sistema verifica, Então identifica se existe animal ativo com mesmo número (RF-01.1)
2. Dado que existe animal ativo com mesmo brinco, Quando o cadastro é submetido, Então o sistema exibe mensagem de erro e impede cadastro (RF-01.2)
3. Dado que o animal tem data de nascimento informada, Quando o cadastro é salvo, Então o sistema calcula a idade automaticamente (RF-01.4)
4. Dado que o fazendeiro está cadastrando, Quando o processo termina, Então é concluído em no máximo 3 passos (RNF-07)

DoR: ✓ Tela e validações definidas
DoD: ✓ Cadastro funciona em ≤3 passos, erro de duplicado funciona
```

---

### B-04 — Alterar situação do animal + histórico + contadores
**Must · 3 pts · RF-04/05/06/06.1, RNF-10**

```
- Como fazendeiro,
- Quero alterar a situação de um animal (ativo, vendido, morto, transferido) e manter histórico,
- Para que eu tenha controle do rebanho mesmo após venda ou morte.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro altera situação para vendido, Quando confirmado, Então animal sai da contagem de ativos mas permanece no histórico (RF-06.1)
2. Dado que o fazendeiro consulta a fazenda, Quando solicita quantidade total de ativos, Então o sistema apresenta o valor (RF-04)
3. Dado que o fazendeiro consulta, Quando solicita quantidade por sexo/lote/pasto/situação, Então o sistema apresenta a distribuição (RF-05)

DoR: ✓ Regras de situação validadas
DoD: ✓ Contadores atualizados, histórico preservado
```

---

### B-05 — Consultar/filtrar animais
**Must · 5 pts · RF-03, RNF-05**

```
- Como fazendeiro,
- Quero consultar animais por número do brinco, sexo, idade, raça, lote, pasto e situação,
- Para que eu localize rapidamente qualquer animal no rebanho.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro informa brinco, Quando a consulta é executada, Então o animal é localizado (RF-03)
2. Dado que o fazendeiro aplica filtro por lote, Quando a consulta é executada, Então apenas animais daquele lote são exibidos (RF-03)
3. Dado que a consulta é feita com 500 animais, Quando o resultado é apresentado, Então ocorre em ≤2s (RNF-05)

DoR: ✓ Opções de filtro definidas na UI
DoD: ✓ Filtros funcionam, performance ≤2s
```

---

## Sprint 2 — Lotes + Reprodução

### B-06 — Criar lote + adicionar/remover animais + impedir duplo vínculo
**Must · 3 pts · RF-02/02.1/02.2/02.3**

```
- Como fazendeiro,
- Quero criar lotes de animais e adicionar/remover animais deles,
- Para que eu organize o manejo do rebanho em grupos.

ACs (Dado/Quando/Então):
1. Dado que um animal pertence a um lote, Quando o usuário tenta vinculá-lo a outro, Então o sistema impede (RF-02.1)
2. Dado que o usuário seleciona animal e lote, Quando adiciona ou remove, Então a operação é executada (RF-02.2)
3. Dado que o histórico é consultado, Quando o sistema exibe, Então todos os lotes anteriores do animal estão disponíveis (RF-02.3)

DoR: ✓ Regras de vínculo definidas
DoD: ✓ Impedimento funciona, histórico atualizado
```

---

### B-07 — Histórico de lotes + aplicação em lote com confirmação
**Should · 5 pts · RF-02.3/02.4/07**

```
- Como fazendeiro,
- Quero aplicar informações de saúde, raça e observações a todos os animais de um lote com confirmação,
- Para que eu atualize múltiplos animais de uma vez com segurança.

ACs (Dado/Quando/Então):
1. Dado que o usuário seleciona um lote, Quando opta por aplicar dados em lote, Então o sistema exige confirmação antes de executar (RF-07)
2. Dado que a confirmação é dada, Quando a ação é executada, Então saúde, raça e observações são aplicados a todos (RF-02.4)
3. Dado que aplicação em lote é feita, Quando o histórico é consultado, Então a ação em lote está registrada (RF-02.3)

DoR: ✓ Modal de confirmação definido
DoD: ✓ Aplicação em lote com confirmação funciona
```

---

### B-08 — Situação reprodutiva de fêmeas + confirmação prenha→vazia
**Must · 5 pts · RF-08/08.1/08.2/08.3**

```
- Como fazendeiro,
- Quero registrar a situação reprodutiva de fêmeas (não avaliada, vazia, prenha, parida) com confirmação ao regressar de prenha para vazia,
- Para que eu controle a reprodução do rebanho com segurança.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro registra fêmea como prenha, Quando solicitado, Então o sistema pede a data da identificação da prenhez (RF-08.2)
2. Dado que uma fêmea está classificada como prenha, Quando o usuário tenta alterar para vazia, Então o sistema solicita confirmação (RF-08.3)
3. Dado que a situação é registrada, Quando o histórico é consultado, Então a situação reprodutiva está disponível (RF-08.1)

DoR: ✓ Opções de situação definidas
DoD: ✓ Confirmação prenha→vazia funciona, histórico preservado
```

---

### B-09 — Previsão de parto via data de cobertura + vínculo bezerro-mãe
**Should · 3 pts · RF-09/10**

```
- Como fazendeiro,
- Quero que o sistema calcule a previsão de parto a partir da data de cobertura e vincule bezerros às mães,
- Para que eu planeje o manejo reprodutivo e acompanhe a linhagem.

ACs (Dado/Quando/Então):
1. Dado que o usuário informa data de cobertura, Quando o sistema calcula, Então apresenta previsão de parto automática (RF-09)
2. Dado que o usuário registra nascimento de bezerro, Quando solicita identificação da mãe, Então o sistema vincula o bezerro à mãe (RF-10)

DoR: ✓ Regras de cálculo de parto validadas
DoD: ✓ Previsão calculada corretamente, vínculo funciona
```

---

## Sprint 3 — Saúde + Pasto base

### B-10 — Vacinação individual + histórico + filtro
**Must · 5 pts · RF-11/11.1/11.2/11.3/13.1/14**

```
- Como fazendeiro,
- Quero registrar vacinação de animal com nome da vacina, data, dose e observações, e filtrar vacinados/não vacinados,
- Para que eu mantenha o controle de saúde preventiva do rebanho.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro registra vacinação, Quando o registro é salvo, Então contém nome, data, dose e observações vinculados ao animal (RF-11.2)
2. Dado que o histórico é consultado, Quando o sistema exibe, Então mostra histórico completo de vacinação do animal (RF-11.3)
3. Dado que o fazendeiro filtra, Quando solicita vacinados/não vacinados, Então o sistema apresenta o filtro (RF-13.1)
4. Dado que o processo é executado, Quando verificado, Então nenhuma notificação é enviada (RF-14)

DoR: ✓ Campos de vacinação definidos
DoD: ✓ Registro funciona, histórico disponível, sem notificações
```

---

### B-11 — Ocorrências de saúde + machucado como observação/log
**Must · 5 pts · RF-12/12.1/12.2/12.3**

```
- Como fazendeiro,
- Quero registrar ocorrências de saúde (data, descrição, tratamento, situação) e observações de machucado no log do animal,
- Para que eu acompanhe tratamentos e o histórico de saúde.

ACs (Dado/Quando/Então):
1. Dado que ocorre uma ocorrência de saúde, Quando registrada, Então contém data, descrição, tratamento e situação atual (RF-12.1)
2. Dado que o animal se machuca, Quando registrado, Então é observação com data do machucado e tratamento no log (RF-12.2)
3. Dado que situação é alterada, Quando classificada, Então pode ser em tratamento, recuperada ou encerrada (RF-12.3)

DoR: ✓ Situações de ocorrência validadas
DoD: ✓ Registro e classificação funcionam
```

---

### B-12 — Consultar animais em tratamento + sem notificações
**Should · 3 pts · RF-13/14**

```
- Como fazendeiro,
- Quero consultar todos os animais com ocorrências de saúde abertas ou em tratamento,
- Para que eu saiba quais animais precisam de atenção.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro consulta ocorrências, Quando solicita, Então lista animais com ocorrências abertas ou em tratamento (RF-13)
2. Dado que o sistema opera, Quando verificado, Então não envia nenhuma notificação sobre vacinas ou tratamentos (RF-14)

DoR: ✓ Lista de ocorrências abertas definida
DoD: ✓ Filtro funciona, sem notificações
```

---

### B-13 — CRUD de pastos + tipos de capim (altura mínima/máxima)
**Must · 5 pts · RF-15/15.1/15.4/16/16.3, RD-05/06**

```
- Como fazendeiro,
- Quero cadastrar pastos com nome, área, tipo de capim, altura, condição de umidade, cobertura e registrar tipos de capim com altura mínima/máxima adequada,
- Para que eu tenha controle da qualidade da forragem.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro cadastra pasto, Quando salvo, Então contém nome, área em hectares, tipo de capim, altura, condição e cobertura (RF-15.1)
2. Dado que o usuário cadastra tipo de capim, Quando define altura ideal, Então registra mínimo e máximo considerados adequados (RF-16.3)
3. Dado que a cobertura é informada, Quando registrada, Então é um percentual entre 0% e 100% (RF-15.4)

DoR: ✓ Campos e unidades definidos (ha, cm, %)
DoD: ✓ CRUD funciona, limites de cobertura validados
```

---

### B-14 — Classificação automática de qualidade do pasto + leitura datada
**Should · 3 pts · RF-15.2/15.3/15.4/16/16.1/16.2**

```
- Como fazendeiro,
- Quero que o sistema calcule a classificação de qualidade do pasto (boa/regular/ruim) com base em altura, condição e cobertura, e registre a data da leitura,
- Para que eu saiba em que condição estão meus pastos.

ACs (Dado/Quando/Então):
1. Dado que dados do pasto são registrados, Quando salvos, Então o sistema calcula classificação Boa/Regular/Ruim (RF-15.2)
2. Dado que a classificação é calculada, Quando o registro é salvo, Então contém data da leitura realizada (RF-15.3)
3. Dado que classificação é Boa, Quando verificada, Então altura adequada + capim verde + cobertura ≥80% (critério de qualidade)

DoR: ✓ Regra de classificação validada
DoD: ✓ Classificação automática funciona, data registrada
```

---

## Sprint 4 — Pasto movimento + Vendas

### B-15 — Movimentação de animal/lote entre pastos + histórico de rotação
**Must · 5 pts · RF-17/17.1/17.2**

```
- Como fazendeiro,
- Quero mover animais ou lotes entre pastos de destino, registrando origem, destino e data, com histórico de rotação,
- Para que eu controle a rotatividade dos pastos e onde os animais estão.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro seleciona animal/lote e pasto de destino, Quando move, Então registra pasto de origem, destino e data (RF-17.1)
2. Dado que a movimentação é registrada, Quando o histórico é consultado, Então mostra todas as rotações (RF-17.2)

DoR: ✓ Tela de movimentação definida
DoD: ✓ Movimentação funciona, histórico registrado
```

---

### B-16 — Painel de pasto: lotação + permanência/descanso em dias
**Should · 3 pts · RF-18/18.1/18.2/18.3, P-14/P-15**

```
- Como fazendeiro,
- Quero ver a quantidade de animais em cada pasto, o tempo de permanência e o período de descanso entre saída e entrada,
- Para que eu gerencie a capacidade dos pastos e a rotatividade.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro seleciona um pasto, Quando consulta, Então mostra quantidade de animais presentes (RF-18.1)
2. Dado que animal/lote está no pasto, Quando consulta, Então calcula tempo de permanência em dias (RF-18.2)
3. Dado que pasto ficou vazio, Quando novo animal entra, Então calcula período de descanso em dias (RF-18.3)

DoR: ✓ Critérios de cálculo de dias definidos
DoD: ✓ Contagem e cálculo funcionam corretamente
```

---

### B-17 — Registrar venda realizada + baixa automática dos animais vendidos
**Must · 8 pts · RF-19/19.1/19.2/19.3, RD-04**

```
- Como fazendeiro,
- Quero registrar venda com data, animais vendidos, comprador (texto livre), peso individual de cada animal, valor bruto e observações, para que a venda seja formalizada e os animais saiam do rebanho ativo.
- 
ACs (Dado/Quando/Então):
1. Dado que o fazendeiro preenche venda, Quando todos os campos são informados, Então o sistema permite salvar (RF-19.1 — todos obrigatórios)
2. Dado que a venda é salva, Quando o sistema calcula, Então apresenta quantidade de animais incluídos (RF-19.2)
3. Dado que a venda é confirmada, Quando o fazendeiro confirma, Então todos os animais vendidos têm situação alterada para "vendido" e saem da contagem de ativos (RF-19.3)
4. Dado que peso é informado, Quando salvo, Então é peso individual de cada animal em kg (RD-04)

DoR: ✓ Todos os campos obrigatórios validados na UI
DoD: ✓ Venda funciona, baixa automática, todos os campos obrigatórios
```

---

### B-18 — Consultar vendas + vendas planejadas separadas
**Should · 3 pts · RF-20/20.1/20.2/21/21.1/21.2/21.3**

```
- Como fazendeiro,
- Quero consultar o histórico de vendas por período, comprador, animal ou lote, com vendas planejadas mantidas separadas,
- Para que eu tenha visão completa do histórico comercial.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro consulta vendas, Quando filtra por período/comprador/animal/lote, Então o histórico completo é apresentado (RF-20.1, RF-20.2)
2. Dado que há vendas planejadas, Quando visualizadas, Então são separadas das vendas realizadas e não convertem automaticamente (RF-21.2)
3. Dado que vendas planejadas existem, Quando verificado, Então nenhuma notificação é enviada (RF-21.3)

DoR: ✓ Filtros de consulta definidos
DoD: ✓ Consulta funciona, planejadas separadas, sem notificações
```

---

## Sprint 5 — Financeiro + Relatórios

### B-19 — CRUD de gastos + categorias e subcategorias
**Must · 5 pts · RF-22/22.1/22.2/22.3/22.4/23, P-17**

```
- Como fazendeiro,
- Quero registrar gastos com descrição, categoria, valor e data, criando novas categorias e subcategorias, e editar/excluir gastos,
- Para que eu tenha controle financeiro detalhado da fazenda.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro registra gasto, Quando salvo, Então contém descrição, categoria, valor e data (RF-22.1)
2. Dado que o fazendeiro cria categoria, Quando salva, Então pode criar subcategorias dentro da categoria (RF-22.4)
3. Dado que um gasto existe, Quando selecionado, Então permite editar ou excluir (RF-23)
4. Dado que categorias iniciais são criadas, Quando verificadas, Então são água, ração, mão de obra, infraestrutura (RF-22.2)

DoR: ✓ Formulários de gasto definidos
DoD: ✓ CRUD funciona, subcategorias criáveis
```

---

### B-20 — Consulta de gastos + totais por categoria + resultado financeiro
**Must · 5 pts · RF-24/24.1/24.2/24.3/25/25.1**

```
- Como fazendeiro,
- Quero consultar gastos filtrados por período e categoria, ver totais por categoria e resultado financeiro (vendas - gastos),
- Para que eu tenha visão clara da saúde financeira da fazenda.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro consulta gastos, Quando filtra por período e categoria, Então apresenta os gastos filtrados (RF-24.1)
2. Dado que o sistema calcula, Quando solicita total por categoria, Então apresenta valor por categoria (RF-24.2)
3. Dado que o sistema calcula, Quando solicita resultado financeiro, Então apresenta valor bruto das vendas menos gastos gerais (RF-25)
4. Dado que nenhum período é selecionado, Quando calculado, Então considera todo o histórico de vendas e gastos (RF-25.1)

DoR: ✓ Fórmulas de cálculo validadas
DoD: ✓ Todos os cálculos corretos, resultado financeiro funciona
```

---

### B-21 — Relatórios de controle do gado, vendas, gastos e resumo financeiro em tela
**Must · 8 pts · RF-26/26.1/26.2/27/27.1/28/28.1/29/30.1**

```
- Como fazendeiro,
- Quero visualizar relatórios de controle do gado, vendas por período, gastos por período e resumo financeiro na tela do aplicativo,
- Para que eu tenha visões gerenciais completas sem precisar exportar.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro solicita relatório de controle do gado, Quando gerado, Então apresenta total de animais, por sexo, situação, lote e pasto (RF-26.1)
2. Dado que inclui reprodução/vacinação/saúde, Quando solicitado, Então o relatório inclui essas informações (RF-26.2)
3. Dado que relatório de vendas é solicitado, Quando gerado, Então apresenta animais vendidos, comprador, data, quantidade e valor bruto (RF-27.1)
4. Dado que relatório de gastos é solicitado, Quando gerado, Então apresenta valores por categoria (RF-28.1)
5. Dado que resumo financeiro é solicitado, Quando gerado, Então apresenta vendas, gastos e resultado (RF-29)
6. Dado que relatório é visualizado, Quando exibido, Então é permitida a visualização na tela do app (RF-30.1)

DoR: ✓ Fontes de dados para relatórios definidas
DoD: ✓ Todos os relatórios funcionam em tela
```

---

### B-22 — Exportar relatórios em formato PDF
**Should · 5 pts · RF-30/30.2, RNF-06**

```
- Como fazendeiro,
- Quero exportar qualquer relatório em formato PDF,
- Para que eu possa compartilhar ou armazenar relatórios fora do aplicativo.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro solicita exportação, Quando executado, Então o relatório é exportado em PDF (RF-30.2)
2. Dado que PDF é gerado, Quando verificado, Então ocorre em ≤5 segundos (RNF-06)

DoR: ✓ Biblioteca de PDF selecionada
DoD: ✓ Export funciona em ≤5s
```

---

## Sprint 6 — Backup/Segurança + Hardening

### B-23 — Backup manual + restauração com confirmação + data do último backup
**Must · 8 pts · RF-31/32/33/34/35/35.1/36**

```
- Como fazendeiro,
- Quero criar backup manual dos dados na pasta específica do app, restaurar backup com confirmação e ver data/hora do último backup,
- Para que eu proteja meus dados contra perda.

ACs (Dado/Quando/Então):
1. Dado que o fazendeiro solicita backup, Quando executado, Então cria arquivo na pasta específica do aplicativo (RF-34)
2. Dado que o fazendeiro seleciona backup válido, Quando restaura, Então o sistema solicita confirmação antes de executar (RF-35.1)
3. Dado que backup é criado ou restaurado, Quando verificado, Então o sistema informa data e hora do último backup realizado (RF-36)
4. Dado que backup é criado, Quando persistido, Então os dados continuam disponíveis após fechar app ou reiniciar dispositivo (RF-33)

⚠️ BLOQUEADO: DoR pendente — depende de P-12 (proteção do backup) e P-18 (o que define backup válido)
DoD: ✓ Backup cria arquivo, restauração com confirmação, data informada
```

---

### B-24 — PIN de acesso + bloqueio após 3 tentativas + hardening do backup
**Must · 5 pts · RNF-11/12/13/13b**

```
- Como fazendeiro,
- Quero configurar senha/PIN de acesso, com bloqueio de 5 minutos após 3 tentativas incorretas consecutivas, e proteção do arquivo de backup,
- Para que meus dados estejam seguros contra acesso não autorizado.

ACs (Dado/Quando/Então):
1. Dado que o usuário configura PIN, Quando acessa o app, Então é solicitado PIN antes de acessar (RNF-12)
2. Dado que há 3 tentativas incorretas consecutivas, Quando o 3º erro ocorre, Então o sistema bloqueia acesso por 5 minutos (RNF-13b)
3. Dado que arquivo de backup é criado, Quando protegido, Então é protegido contra alterações não autorizadas (RNF-13)

⚠️ BLOQUEADO: DoR pendente — depende de P-12/P-18 para definir mecanismo de proteção do backup (RNF-13)
DoD: ✓ PIN funciona, bloqueio após 3 erros, backup protegido
```

---

### B-25 — Testes automatizados das regras de animal + cálculos financeiros + testes de performance
**Must · 8 pts · RNF-05/06/15**

```
- Como desenvolvedor,
- Quero criar testes automatizados para as regras relacionadas aos animais e cálculos financeiros, e garantir performance conforme os limites,
- Para que o código tenha qualidade e as regras sejam verificáveis (RNF-15).

ACs (Dado/Quando/Então):
1. Dado que regras de animal são implementadas, Quando testadas, Então testes automatizados verificam validações (RNF-15)
2. Dado que cálculos financeiros são implementados, Quando testados, Então testes automatizam vendas, gastos e resultado (RNF-15)
3. Dado que consultas com 500 animais, Quando executadas, Então ocorrem em ≤2 segundos (RNF-05)
4. Dado que relatórios são gerados, Quando executados, Então ocorrem em ≤5 segundos (RNF-06)

DoR: ✓ Plano de testes definido
DoD: ✓ Suite de testes passando = item concluído (DoD implícito)
```

---

## Resumo consolidado

### Por sprint

| Sprint | Itens | Must | Should | Story Points |
|---|---|---|---|---|
| **S0** Fundação | B-00, B-01, B-02 | 3 | 0 | 26 |
| **S1** Gado core | B-03, B-04, B-05 | 3 | 0 | 13 |
| **S2** Lotes + Reprodução | B-06, B-07, B-08, B-09 | 3 | 1 | 16 |
| **S3** Saúde + Pasto base | B-10, B-11, B-12, B-13, B-14 | 3 | 2 | 16 |
| **S4** Pasto + Vendas | B-15, B-16, B-17, B-18 | 2 | 2 | 19 |
| **S5** Financeiro + Relatórios | B-19, B-20, B-21, B-22 | 3 | 1 | 26 |
| **S6** Backup/Segurança + Hardening | B-23, B-24, B-25 | 3 | 0 | 21 |
| **Total** | **25 itens** | **20** | **6** | **137 pts** |

### Dependências críticas

| Item | Depende de | Bloqueio |
|---|---|---|
| B-02 | B-00 (setup + DB) | Não pode ser feito sem base |
| Todos os B-xx | B-01 (interface base) | Navegação depende da tela inicial |
| **B-24** | **P-12/P-18** | **Não pode ir para Ready até decisões pendentes** |
| B-23 | B-24 (RNF-13) | Proteção do backup depende de PIN |

### Decisões pendentes

| ID | Descrição | Status | Impacto |
|---|---|---|---|
| P-12 | Como o arquivo de backup deve ser protegido contra alterações não autorizadas? | ⏳ Pendente | B-24, B-23 |
| P-18 | O que define um arquivo de backup como "válido"? | ⏳ Pendente | B-23 |

### Regras

- Nenhum item vai para `Ready` sem satisfazer o **DoR checklist** completo
- Nenhum item vai para `Done` sem satisfazer o **DoD checklist** completo
- **B-24** permanece em `Backlog` até P-12/P-18 serem respondidos
- Se velocidade < 13 pts/sprint, recomenda-se quebrar B-17 (8 pts) em dois itens menores
- NÃO adicionar notificações (RF-14/RF-21.3), NÃO permitir múltiplos usuários sem reavaliar modelagem

---

*Documento baseado nas aulas de Engenharia de Requisitos e nos conceitos estudados (EARS, INVEST, MoSCoW, DEEP, DoR/DoD, V&V).*
