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
npm run db:seed           # popula as roles (Admin, Pastor, Lider, Secretaria, Membro)
npm run dev               # http://localhost:3010
```

`GET /health` deve responder 200. Docs em `/docs` (Swagger UI, com todos os endpoints, schemas e regras de autorização documentados).

## Scripts

- `npm run dev` — servidor em modo watch
- `npm run build` / `npm start` — build de produção
- `npm run typecheck` — checagem de tipos
- `npm test` — testes (vitest)
- `npm run db:migrate` / `db:migrate:deploy` / `db:studio` / `db:seed` — Prisma
- `npm run docker:up` / `docker:down` — Postgres via Docker Compose

## Testando com Insomnia

Importe [`insomnia/IBBF-API.insomnia.json`](./insomnia/IBBF-API.insomnia.json) no Insomnia
(File → Import). A coleção já vem organizada por recurso (Auth, Member, Family, Ministry),
com exemplos de corpo, descrições de cada rota (regras de negócio, permissões e códigos de
erro) e um ambiente com `base_url`, `access_token`, `refresh_token`, `member_id`, `family_id`
e `ministry_id` prontos para preencher — o próprio workspace importado traz o passo a passo
na descrição.
