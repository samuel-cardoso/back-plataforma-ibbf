# back-plataforma-ibbf

Backend da Plataforma IBBF. Fastify + Prisma + Zod + Awilix, seguindo a
arquitetura descrita em [ARCHITECTURE.md](./ARCHITECTURE.md) (mesmo padrão do
halley-api).

## Rodando localmente

```bash
cp .env.example .env

npm install
npm run docker:up        # sobe o Postgres local
npm run db:generate
npm run db:migrate
npm run dev               # http://localhost:3010
```

`GET /health` deve responder 200. Docs em `/docs` (Swagger UI).

## Scripts

- `npm run dev` — servidor em modo watch
- `npm run build` / `npm start` — build de produção
- `npm run typecheck` — checagem de tipos
- `npm test` — testes (vitest)
- `npm run db:migrate` / `db:migrate:deploy` / `db:studio` — Prisma
- `npm run docker:up` / `docker:down` — Postgres via Docker Compose
