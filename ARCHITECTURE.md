# Arquitetura da API

A API segue o fluxo do `api-architecture-study`:

```
route → preHandler → controller → use case → repository port → Prisma
```

- `models/`: entidades e regras de domínio.
- `repositories/`: contratos consumidos pelos casos de uso.
- `infrastructure/prisma/`: implementações dos contratos e acesso ao banco.
- `usecases/<contexto>/<recurso>/<ação>/`: DTO, schema Zod, caso de uso e controller.
- `routes/`: verbos, URLs, schemas HTTP e resolução via DI.
- `container.ts`: composição das dependências Awilix.
- `shared/errors/`: erros de domínio traduzidos uma vez no handler global.

O endpoint `GET /health` é o primeiro exemplo completo dessa cadeia. Controllers
não acessam Prisma diretamente.
