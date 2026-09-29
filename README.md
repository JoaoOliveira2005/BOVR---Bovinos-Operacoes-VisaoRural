# BOVR — Bovinos, Operações e Visão Rural

Aplicativo Android **offline** para controle individual e por lotes de bovinos,
gestão de pastos, vendas e gastos de uma fazenda.

| | |
|---|---|
| **Plataforma** | Android 10 ou superior |
| **Internet** | Totalmente offline |
| **Capacidade** | Até 500 animais |
| **Usuários** | Um usuário, uma fazenda |
| **Armazenamento** | Local, com backup manual |

## Documentos do projeto

- [`docs/vision/DocumentoDeVisao.md`](docs/vision/DocumentoDeVisao.md) — visão,
  escopo, stakeholders
- [`docs/Requisitos.md`](docs/Requisitos.md) — RFs, RNFs e as perguntas
  esclarecidas (P-01 a P-20)

O código referencia os IDs de requisito destes documentos direto nos comentários.

⚠️ O `DESIGN.md`, que define o padrão visual do app, **ainda não está no
repositório**. Vale subir junto — o front-end inteiro é derivado dele, e sem o
documento não dá para rastrear de onde vieram as decisões de cor e tipografia.

## Testes com Docker

Com Docker Engine e Docker Compose disponíveis, execute na raiz do repositório:

```bash
docker compose up --build --abort-on-container-exit --exit-code-from tests
```

A imagem instala as dependências com `npm ci`, executa a checagem de tipos
(incluindo `backend/`) e depois os testes Jest. Não é necessário instalar Node.js
na máquina. O código e as dependências locais não são alterados pelo container.
Após a execução, remova o container com `docker compose down`.

## Diretórios

- [`frontend/`](frontend/) — aplicativo Expo / React Native.
  **Comece pelo [`frontend/README.md`](frontend/README.md)**: padrão visual,
  navegação e decisões de arquitetura.
- [`backend/`](backend/) — dados locais SQLite e regras de cadastro e consulta de animais. Veja [`backend/README.md`](backend/README.md).
