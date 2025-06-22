# Users Manager - Conéctar

## Introdução
Uma ferramenta interna para gerenciar usuários da Conéctar, com foco em segurança e escalabilidade.

## Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- Variáveis de ambiente em `.env`

## Instalação
1. Clone o repositório: `git clone <url>`
2. Instale as dependências: `cd backend && npm install` e `cd frontend && npm install`
3. Configure o `.env` com as variáveis necessárias.
4. Crie o banco de dados e migre o schema (ex.: `npx typeorm migration:run`).

## Execução
- Backend: `npm run start:dev`
- Frontend: `npm run dev`

## Estrutura do Projeto
- `src/auth`: Endpoits auth e google.
- `src/users`: Crud users.
- `src/domain`: Entidades e interfaces.
- `src/application`: Casos de uso (use cases).
- `src/infrastructure`: Implementações (controladores, repositórios).
- `src/seed`: Criação de conta para admin.
- `test`: Testes.

## Funcionalidades
- CRUD de usuários com permissões (admin/user).
- Filtros e ordenação.
- Notificações de usuários inativos.
- Logout funcional.

## Testes
Execute `npm run test` para rodar os testes unitários.

## Decisões de Design
- Uso de JWT com cookies HTTP-only para segurança.
- TypeORM para persistência escalável.

## Decisões de Design

- JWT armazenado em cookies HTTP-only para segurança contra XSS e CSRF
- Banco de dados PostgreSQL com TypeORM e suporte a migrações
- Arquitetura limpa separando domínio, aplicação e infraestrutura
