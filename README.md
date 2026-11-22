# Projeto Fintech

API de controle financeiro pessoal com usuários, autenticação JWT e lançamentos
de receitas e despesas persistidos em PostgreSQL.

## Arquitetura e acesso

O backend usa Express, TypeScript e Sequelize com PostgreSQL no Supabase.
O Docker gera a imagem de produção em múltiplos estágios; o GitHub Actions
valida e compila o backend, constrói a imagem e aciona o Render.

- API: https://fintech-backend-at2.onrender.com
- Health check: https://fintech-backend-at2.onrender.com/api/health
- Swagger: https://fintech-backend-at2.onrender.com/api/docs

O health check confirma que a API responde; não verifica continuamente o banco.

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

### Migrations em producao

Execute as migrations separadamente antes de iniciar a nova versao da API.
A partir da raiz do repositorio, construa o estagio de migrations:

```sh
docker build --target migration -t fintech-migrations ./backend
docker run --rm --env-file /caminho/seguro/para/variaveis.env fintech-migrations
```

O arquivo de ambiente deve fornecer `DATABASE_URL` ou as variaveis `DB_HOST`,
`DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`, alem de `DB_SSL` quando
necessario. Mantenha credenciais fora do repositorio e do contexto Docker.
O comando executa `sequelize-cli db:migrate --env production`; o Sequelize
registra as migrations aplicadas na tabela `SequelizeMeta`. Nao execute duas
instancias de migration simultaneamente.

### Configuração do Render e do GitHub Actions

1. No Render, crie um **Web Service** com runtime Docker, conecte o repositório
   e selecione a branch `main`. Para o monorepositório, deixe **Root Directory**
   vazio, configure **Dockerfile Path** como `backend/Dockerfile` e **Docker
   Build Context** como `backend`.
2. Em **Auto-Deploy**, selecione **Off** (ou **No**, conforme a interface),
   para que a publicação seja solicitada pelo workflow. Configure **Health
   Check Path** como `/api/health`.
3. Configure `NODE_ENV=production`, `JWT_SECRET` e `DATABASE_URL` ou as
   variáveis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`. Use
   `DB_SSL=true` quando exigido pelo provedor. Não inclua credenciais no Git.
4. Antes de usar as rotas de negócio, execute as migrations conforme o
   procedimento acima, com acesso ao banco de produção. Elas não são executadas
   automaticamente pelo workflow nem pelo contêiner da aplicação.
5. Em **Settings** do serviço Render, obtenha o Deploy Hook e crie no GitHub,
   em **Settings > Secrets and variables > Actions**, o segredo de repositório
   `RENDER_DEPLOY_HOOK_URL` com essa URL. Trate-a como credencial.

O workflow solicita o deploy do commit validado somente em push na `main`,
após type-check, compilação e build Docker. A aceitação do hook apenas inicia
o deploy; acompanhe seu resultado e o health check no painel do Render.
A criação inicial do serviço pode iniciar um deploy: configure-o somente
quando estiver pronto para publicar.

## Roteiro HTTP sem gravação

Os exemplos abaixo são apenas um roteiro; use dados de teste e não
compartilhe senhas ou tokens. A resposta publicada do health check receberá
o campo `entrega` somente após o próximo deploy.

```http
GET https://fintech-backend-at2.onrender.com/api/health

### Login com corpo incompleto: espera-se HTTP 400, sem gravar no banco
POST https://fintech-backend-at2.onrender.com/api/auth/login
Content-Type: application/json

{}

### Sem token: espera-se HTTP 401
GET https://fintech-backend-at2.onrender.com/api/lancamentos

### Com token de um usuário de teste já existente: espera-se HTTP 200
GET https://fintech-backend-at2.onrender.com/api/lancamentos
Authorization: Bearer <TOKEN_DE_TESTE>
```

Para obter um token, `POST /api/auth/login` recebe `email` e `password` de
um usuário existente. `GET /api/users` e `GET /api/users/:id` leem dados
de usuários e atualmente não exigem autenticação; evite expor suas respostas.
As rotas de lançamentos exigem JWT. `POST`, `PUT` e `DELETE` de usuários
ou lançamentos alteram dados e não fazem parte deste roteiro de leitura.
Configure um `JWT_SECRET` forte no Render: o código usa uma chave padrão
quando a variável está ausente.
