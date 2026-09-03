### Documento de visão
---
# Sistema Simulador de Roteamento de Ordens
- ### Versão do documento: (0.0)


## 1. Introdução

#### 1. Propósito
- Esse aplicativo serve para controle de gado, pasto e vendas

#### 2. Escopo

- Desenvolvimento de um aplicativo Android para controle individual e por lotes de bovinos, gerenciamento de pastos, registro de vendas e controle de gastos gerais da fazenda.

- **Dentro do escopo:**
   - Armazenar os dados localmente no aparelho;
   - Identificar os animais pela numeração do brinco comum;
   - Gerar relatórios de controle do gado, vendas e gastos;


- **Restrições e premissas:**
   - Possuir apenas um usuário;
   - Atender uma única fazenda;
   - Suportar até 500 animais;
   - Não enviar notificações.
   - Não depender de integrações externas;
   - Funcionar integralmente sem internet;

#### 3. Definições, Acrônimos e Abreviações

---

## 2. Descrição Geral

#### 1. Perspectiva do Produto
- O produto deve se posicionar como um aplicativo offline com salvamento local de dados para fazendas pequenas para controle de gado, pasto e vendas. Ele deve operar apenas no Android.

#### 2. Funções do Produto
- Controlar gado, pasto e vendas

#### 3. Características dos Usuários
- Fazendeiros

#### 4. Restrições
- Inicialmente, o aplicativo deve operar exclusivamente offline, com possibilidade de expansão no futuro.

#### 5. Requisitos Não Funcionais

| ID | Categoria | Descrição |
|---|---|---|
| RNF01 | Plataforma | O aplicativo deverá ser desenvolvido exclusivamente para Android |
| RNF02 | Compatibilidade | O aplicativo deverá funcionar no Android 10 ou superior. |
| RNF03 | Operação Offline | Nenhuma funcionalidade deverá exigir conexão com a internet |
| RNF04 | Capacidade | O aplicativo deverá suportar pelo menos 500 animais cadastrados |
| RNF05 | Desempenho | Consultas com até 500 animais deverão ser apresentadas em até 2 segundos |
| RNF06 | Usabilidade |  |
| RNF07 | Segurança |  |
| RNF08 | Confiabilidade |  |
| RNF09 | Manutenibilidade |  |
| RNF10 | Portabilidade dos dados |  |
| RNF11 | Interface |  |

#### 5. Requisitos de Domínio

| ID | Requisito |
| --- | --- |
| RD01 |  |
| RD02 |  |
| RD03 |  |
| RD04 |  |
| RD05 |  |
| RD06 |  |
| RD07 |  |
| RD08 |  |
| RD09 |  |
| RD10 |  |
---

## 3. Stakeholders

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
   - Front:
      - Kayke
      - Marcelo
      - João Gabriel
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

## 4. Visão do Produto
- O produto deve se posicionar como um aplicativo offline para controle de gado, pasto e vendas.

---

## 5. Objetivos do Sistema
- Controle de gado, pasto e vendas

---

## 6. Principais Funcionalidades

| # | Funcionalidade | Descrição |
|---|---|---|
| F01 | Controle do Gado | 1. Cadastro e edição de animais (NumBrinco, Sexo, DataNascimento/IdadeEstimada, Raça, Observações, Histórico de lotes), 2. Criar lotes, 3. Adicionar/Remover animais de um lote, 4. Consulta e filtragem (NumBrinco, idade, raça, lote, pasto, situação), 5. Quantidade de animais ativos na fazenda, 6. Classificação do animal (Ativo, vendido, morto, transferido) |
| F02 | Reprodução |  |
| F03 | Vacinação e saúde |  |
| F04 | Gestão dos pastos |  |
| F05 | Vendas |  |
| F06 | Gastos gerais |  |
| F07 | Relatórios |  |
| F08 | Armazenamento e Backup |  |
|  | Consultar gado | Numeração, gênero, idade, prenha, vacina, machucado |
|  | Controle de vendas | Histórico de vendas, Próxima venda, relatório (Valor bruto-gastos) |
|  | Controle de pastos | Contagem de cabeças, Qualidade, Tempo de permanência, manejo (proteção) |
|  | Controle de gastos | Água, ração, mão de obra, infraestrutura |

---

## 7. Benefícios Esperados
- Controle de gado, pasto e vendas

---

## 8. Itens Fora do Escopo
- Integração com a internet / Servidor externo
- Aplicativo para IOS
- Agricultura

---

## 9. Referências