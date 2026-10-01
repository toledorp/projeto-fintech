# Projeto Fintech

API de controle financeiro pessoal com usuários, autenticação JWT e lançamentos
de receitas e despesas persistidos em PostgreSQL.

## Requisitos

- Node.js
- pnpm 11+
- Uma instância PostgreSQL, como o Supabase

## Configuração local

Instale as dependências:

```powershell
pnpm install
pnpm --dir backend install
```

Crie `backend/.env` a partir de `backend/.env.example` e preencha a conexão do
Supabase. A senha deve ser a senha do banco PostgreSQL, não a senha da conta:

```env
DB_HOST=db.PROJECT_REF.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_DO_BANCO
DB_SSL=true
JWT_SECRET=uma-chave-longa-e-segura
```

No painel do Supabase, use **Connect > Direct connection** para obter os dados
de conexão. Se a senha tiver caracteres especiais, faça URL encode ou use a
variável `DATABASE_URL` no formato URI.

## Executar a API

A partir da raiz do projeto:

```powershell
pnpm --dir backend exec sequelize-cli db:migrate
pnpm run dev
```

O servidor fica disponível em `http://localhost:3000`.

Health check:

```text
http://localhost:3000/api/health
```

Documentação Swagger:

```text
http://localhost:3000/api/docs
```

Para executar o frontend em outro terminal:

```powershell
pnpm run dev:app
```

## Testar com Postman

1. `GET http://localhost:3000/api/health`
2. Crie um usuário com `POST http://localhost:3000/api/users`:

```json
{
  "nome": "Mariana Souza",
  "email": "mariana.souza@email.com",
  "password": "12345678"
}
```

3. Faça login em `POST http://localhost:3000/api/auth/login` usando o mesmo
   email e senha. Copie o token JWT retornado.
4. Nas rotas de lançamentos, selecione **Authorization > Bearer Token** e cole
   o JWT.
5. Crie um lançamento em `POST http://localhost:3000/api/lancamentos`:

```json
{
  "descricao": "Salário",
  "valor": 3500,
  "tipo": "RECEITA",
  "categoria": "Trabalho",
  "data_lancamento": "2026-09-22"
}
```

As demais rotas são `GET`, `GET /:id`, `PUT /:id` e `DELETE /:id` em
`/api/lancamentos`. Os dados são isolados por usuário autenticado.

## Testes e scripts

```powershell
pnpm --dir backend run type-check
pnpm --dir backend run test:run
pnpm --dir backend run lint
pnpm --dir backend run build
```

Scripts da raiz:

| Comando                 | Descrição                  |
| ----------------------- | -------------------------- |
| `pnpm run dev`          | Inicia a API em modo watch |
| `pnpm run dev:app`      | Inicia o frontend Vite     |
| `pnpm run compose:up`   | Sobe os serviços Docker    |
| `pnpm run compose:down` | Derruba os serviços Docker |
| `pnpm run compose:logs` | Exibe os logs Docker       |

## Docker

Com Docker Desktop instalado e iniciado:

```powershell
docker compose up --build
```
