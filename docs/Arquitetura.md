# Arquitetura do BOVR

O BOVR é um aplicativo Android de usuário único, totalmente offline. A interface
não acessa SQL diretamente: cada tela chama casos de uso, que dependem de
contratos de repositório implementados pela camada SQLite.

```mermaid
flowchart TB
    U[Usuário único<br/>Android 10+] --> R[Expo Router]

    subgraph UI["Apresentação — React Native"]
        R --> HOME[Tela inicial]
        R --> GADO[Gado]
        R --> PASTOS[Pastos]
        R --> VENDAS[Vendas]
        R --> GASTOS[Gastos]
        R --> REL[Relatórios]
        R --> SEG[PIN e backup]
        PASTOS --> PF[Formulários e hooks de Pastos]
        GASTOS --> GF[Formulários e hooks de Gastos]
    end

    subgraph APP["Aplicação"]
        PF --> PU[Casos de uso de Pastos]
        GF --> GU[Casos de uso de Gastos]
        HOME --> RU[Consultas de resumo]
    end

    subgraph DOMAIN["Domínio"]
        PU --> PD[Entidades e validações de Pasto]
        GU --> GD[Entidades e validações financeiras]
        RU --> RI[Contratos de repositórios]
        PD --> RI
        GD --> RI
    end

    subgraph DATA["Dados locais"]
        RI --> REPO[Repositórios SQLite]
        REPO --> MAP[Mapeadores domínio ↔ banco]
        MAP --> MIG[Migrations e seeds idempotentes]
        MIG --> DB[(Expo SQLite<br/>bovr.db)]
        DB --> BKP[Arquivo de backup local — futuro]
    end

    subgraph PLATFORM["Plataforma"]
        DB --> ANDROID[Armazenamento protegido pelo Android]
        ANDROID --> DEVICE[Dispositivo local]
    end

    X[Sem API, servidor, nuvem<br/>ou chamadas de rede] -. restrição .-> APP
```

## Decisões

- Expo SDK 57, React Native, TypeScript e Expo Router formam a plataforma.
- Expo SQLite é a única fonte persistente de dados; chaves estrangeiras ficam
  habilitadas e o banco opera em modo WAL.
- Dinheiro é armazenado como centavos inteiros e datas como `YYYY-MM-DD`.
- As categorias Água, Ração, Mão de obra e Infraestrutura são seeds protegidos.
- Registros auxiliares em uso não são excluídos em cascata.
- Não há backend, sincronização, telemetria, notificações ou chamadas de rede.
