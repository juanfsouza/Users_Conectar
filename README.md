<div align="center">
    
# Users Manager - Conéctar Backend

</div>

## Introdução
Uma ferramenta interna para gerenciar usuários da Conéctar, com foco em segurança e escalabilidade.

## Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- Variáveis de ambiente em `.env`

## 🛠 Instalação
1. Clone o repositório: `git clone https://github.com/juanfsouza/Users_Conectar`
2. Instale as dependências: `cd backend && npm install`
3. Configure o `.env` com as variáveis necessárias.
4. Crie o banco de dados e migre o schema (ex.: `npx typeorm migration:run`).

## Execução
- Backend: `npm run start:dev`

## 🏗️ Estrutura do Projeto
- `src/auth`: Endpoits auth e google.
- `src/users`: Crud users.
- `src/domain`: Entidades e interfaces.
- `src/application`: Casos de uso (use cases).
- `src/infrastructure`: Implementações (controladores, repositórios).
- `src/seed`: Criação de conta para admin.
- `test`: Testes.

## 🚀 Funcionalidades
- CRUD de usuários com permissões (admin/user).
- Filtros e ordenação.
- Notificações de usuários inativos.
- Logout funcional.
- Login Google
- Swagger para documentação

## Alguns Endpoints de Exemplo:

### Cadastro de Usuários (User)
- **Endpoint:** `POST https://users-conectar.onrender.com/api/auth/register`
- **Endpoint Local:** `POST /api/auth/register`
- **Exemplo de Requisição:**
    ```json
    {
      "name": "example",
      "email": "example@example.com",
      "password": "example",
    }
    ```
### Cadastro de Usuários (Admin)
- **Endpoint:** `POST https://users-conectar.onrender.com/api/auth/create-admin`
- **Endpoint Local:** `POST /api/auth/create-admin`
- **Exemplo de Requisição:**
    ```json
    {
      "name": "example",
      "email": "example@example.com",
      "password": "example",
    }
    ```
    
### Login de Usuários (User & Admin)
- **Endpoint:** `POST https://users-conectar.onrender.com/api/auth/login`
- **Endpoint Local:** `POST /api/auth/login`
- **Exemplo de Requisição:**
    ```json
    {
      "email": "example@example.com",
      "password": "securepassword",
    }
    ```

### Usuários inativos (Admin)
- **Endpoint:** `GET https://users-conectar.onrender.com/api/users/inactive`
- **Endpoint Local:** `GET /api/users/inactive`
- **Exemplo de Requisição:**
    ```json
   
      ACCESS TOKEN
    
    ```

### Todos os Usuários (Admin)
- **Endpoint:** `GET https://users-conectar.onrender.com/api/users`
- **Endpoint Local:** `GET /api/users`
- **Exemplo de Requisição:**
    ```json
    
      ACCESS TOKEN
    
    ```
### Um Usuários (User & Admin)
- **Endpoint:** `GET https://users-conectar.onrender.com/api/auth/me`
- **Endpoint Local:** `GET /api/users/me`
- **Exemplo de Requisição:**
    ```json
    
      ACCESS TOKEN
    
    ```
### Atualizar Usuário (Admin)
- **Endpoint:** `PATCH https://users-conectar.onrender.com/api/users/id`
- **Endpoint Local:** `PATCH /api/users/id`
- **Exemplo de Requisição:**
    ```json
    {
      "name": "example",
      "email": "example@example.com",
      "password": "example",
      "role": "admin ou user",
    }
    ```
    
### Atualizar Usuário (Admin)
- **Endpoint:** `DELETE https://users-conectar.onrender.com/api/users/id`
- **Endpoint Local:** `DELETE /api/users/id`
- **Exemplo de Requisição:**
    ```json
    
      ACCESS TOKEN
    
    ```

## Testes
Execute `npm run test` para rodar os testes unitários.

## 🎯 Decisões de Design

- JWT armazenado em cookies HTTP-only para segurança contra XSS e CSRF
- Banco de dados PostgreSQL com TypeORM e suporte a migrações
- Arquitetura limpa separando domínio, aplicação e infraestrutura
- Uso de JWT com cookies HTTP-only para segurança.
- TypeORM para persistência escalável.

## 📦 Deploy

- Frontend Vercel: https://users-manager-frontend.vercel.app/
- Backend Render: https://users-conectar.onrender.com

⚠️ OBS: provavelmente backend não vai ta funcionando por causa das regras do render, mas se for testar me manda uma mensagem no whatsapp que eu faço restart do servidor.

Conta: Admin
```json
  "email": "admin123@example.com"
  "password": "admin123@"
```

![ezgif-860a11f584795e](https://github.com/user-attachments/assets/18f1a976-b2ce-4db6-b1f3-517b47c7260e)

![Screenshot_8](https://github.com/user-attachments/assets/04b40257-6d98-4627-97bc-3ca66e20701a)

![Screenshot_2](https://github.com/user-attachments/assets/9554a8e8-7c16-401b-bae1-9949058ca6f5)

![Screenshot_3](https://github.com/user-attachments/assets/79f81553-df19-4024-916d-92acd42f1fb7)

