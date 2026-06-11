# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sodalink is a Brazilian non-alcoholic beverage e-commerce/ordering platform. The UI is in Portuguese (pt-BR). It's a monorepo with two independent sub-projects (`frontend/` and `backend/`) — no shared package.json or monorepo tooling. Each is installed and run independently.

## Commands

### Frontend (run from `frontend/`)

```bash
npm run dev       # Vite dev server on port 5173
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run preview   # vite preview (serves production build)
```

### Backend (run from `backend/`)

```bash
npm run dev         # nodemon + tsx hot-reload on port 3001
npm run build       # tsc → dist/
npm run start       # node dist/server.js
npm run db:migrate  # prisma migrate dev
npm run db:seed     # prisma db seed (prisma/seed.ts)
npm run db:studio   # prisma studio GUI
npm run db:reset    # prisma migrate reset
```

### First-time Setup

1. Start MySQL on port 3306 with a `sodalink` database
2. Copy `backend/.env.example` → `backend/.env` and fill in credentials
3. `cd backend && npm install && npm run db:migrate && npm run db:seed`
4. `cd frontend && npm install`
5. Run backend and frontend dev servers in separate terminals

No test framework is configured yet.

## Architecture

### Frontend (`frontend/`)

- **React 19 + TypeScript + Vite 8** with React Router DOM 7 (`BrowserRouter`)
- **Tailwind CSS v4** — CSS-first config in `src/index.css` (no `tailwind.config.js`), theme extended via `@theme {}` blocks
- **SVG icons** in `src/icons/` imported as React components via `?react` suffix (vite-plugin-svgr); static icons imported as URLs
- **Material Icons** loaded from CDN, used as `<span className="material-icons">name</span>`
- Routes: `/` (Home), `/pedido` (Order), `/conta` (User)
- `App.tsx` is the root layout: slide-out side drawer + `Header` + `BottomNav` + route outlet
- No state management library — local `useState` only
- No API client layer yet — frontend uses hardcoded sample data
- Brand colors: red (`red-600`) primary, dark brown (`#5c2e2e`) secondary

### Backend (`backend/`)

- **Express 5 + TypeScript** with **Prisma 6** ORM on **MySQL**
- Entry point: `src/server.ts`
- Env validation via Zod in `src/config/env.ts` (crashes on invalid env)
- Prisma client singleton in `src/config/database.ts`
- Routes in `src/routes/` — currently `products.ts` with `GET /api/products` and `GET /api/products/:slug`
- Health check at `GET /api/health`
- Auth infrastructure exists (bcrypt, jsonwebtoken deps) but is not yet wired into routes
- Prisma queries are written directly in route handlers (no service/repository layer)

### Database Schema (Prisma)

Models: User, RefreshToken, Address, Category (self-referential tree), Product, CartItem, Favorite, Order, OrderItem, Boleto, Banner

Key enums: OrderStatus (PENDING→CANCELLED), PaymentMethod, BoletoStatus, DocumentType (CPF/CNPJ)

Schema at `backend/prisma/schema.prisma`, seed data at `backend/prisma/seed.ts`.

## Conventions

- All TypeScript — `.tsx` for components, `.ts` for backend
- Portuguese for UI labels, route paths, and seed data
- Tailwind classes inline in JSX, no CSS modules
- Types/interfaces defined in the same file that owns them
- Named exports for pages/utilities; default exports for React components
