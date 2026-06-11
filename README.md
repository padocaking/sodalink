# Sodalink

Plataforma de pedidos de bebidas não alcoólicas. Monorepo com dois projetos independentes:

- **`frontend/`** — React 19 + TypeScript + Vite + Tailwind CSS v4
- **`backend/`** — Express 5 + TypeScript + Prisma 6 + MySQL

## Pré-requisitos

- Node.js 20+
- MySQL 8 rodando na porta 3306

## Como rodar o projeto

### 1. Banco de dados

Crie o banco no MySQL:

```sql
CREATE DATABASE sodalink;
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # edite DATABASE_URL com seu usuário/senha do MySQL
npm install
npm run db:migrate     # cria as tabelas
npm run db:seed        # popula com dados de exemplo
npm run dev            # API em http://localhost:3001
```

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev            # app em http://localhost:5173
```

### 4. Login

Acesse http://localhost:5173 e entre com o usuário criado pelo seed:

- **Email:** `contato@empresa.com.br`
- **Senha:** `senha123`

## Comandos úteis

| Comando | Onde | O que faz |
|---|---|---|
| `npm run dev` | frontend/backend | Servidor de desenvolvimento |
| `npm run build` | frontend/backend | Build de produção |
| `npm run lint` | frontend | ESLint |
| `npm run db:studio` | backend | GUI do banco (Prisma Studio) |
| `npm run db:reset` | backend | Reseta o banco (migra + seed) |

## API

- `POST /api/auth/login` — autenticação (retorna JWT + dados do usuário)
- `GET /api/products` — lista produtos (filtros: `categoryId`, `search`, `featured`)
- `GET /api/products/:slug` — detalhe do produto
- `GET /api/health` — status da API e do banco
