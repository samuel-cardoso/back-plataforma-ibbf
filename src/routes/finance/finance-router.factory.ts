import type { FastifyInstance } from 'fastify';
import { FINANCE_READ_ROLES, FINANCE_ROLE_MANAGER_MIN_LEVEL } from '@/shared/constants';
import { financeErrorSchema } from '@/usecases/finance/shared/finance-schemas';
import type { FinanceMeController } from '@/usecases/finance/finance-me/finance-me.controller';
import { financeMeResponseSchema } from '@/usecases/finance/finance-me/finance-me.schema';
import type { FinanceUserListController } from '@/usecases/finance/finance-user-list/finance-user-list.controller';
import { financeUserListResponseSchema } from '@/usecases/finance/finance-user-list/finance-user-list.schema';
import type { FinanceRoleAssignController } from '@/usecases/finance/finance-role-assign/finance-role-assign.controller';
import { financeRoleAssignResponseSchema, financeRoleAssignSchema, financeRoleParamsSchema } from '@/usecases/finance/finance-role-assign/finance-role-assign.schema';
import type { FinanceRoleRevokeController } from '@/usecases/finance/finance-role-revoke/finance-role-revoke.controller';
import { financeRoleRevokeResponseSchema } from '@/usecases/finance/finance-role-revoke/finance-role-revoke.schema';
import type { FundListController } from '@/usecases/finance/fund-list/fund-list.controller';
import { fundListQuerySchema, fundListResponseSchema } from '@/usecases/finance/fund-list/fund-list.schema';
import type { FundCreateController } from '@/usecases/finance/fund-create/fund-create.controller';
import { fundCreateResponseSchema, fundCreateSchema, fundErrorSchema } from '@/usecases/finance/fund-create/fund-create.schema';
import type { FundUpdateController } from '@/usecases/finance/fund-update/fund-update.controller';
import { fundUpdateErrorSchema, fundUpdateParamsSchema, fundUpdateResponseSchema, fundUpdateSchema } from '@/usecases/finance/fund-update/fund-update.schema';
import type { FinanceCategoryListController } from '@/usecases/finance/finance-category-list/finance-category-list.controller';
import { financeCategoryListQuerySchema, financeCategoryListResponseSchema } from '@/usecases/finance/finance-category-list/finance-category-list.schema';
import type { FinanceCategoryCreateController } from '@/usecases/finance/finance-category-create/finance-category-create.controller';
import { financeCategoryCreateResponseSchema, financeCategoryCreateSchema, financeCategoryErrorSchema } from '@/usecases/finance/finance-category-create/finance-category-create.schema';
import type { FinanceCategoryUpdateController } from '@/usecases/finance/finance-category-update/finance-category-update.controller';
import { financeCategoryUpdateErrorSchema, financeCategoryUpdateParamsSchema, financeCategoryUpdateResponseSchema, financeCategoryUpdateSchema } from '@/usecases/finance/finance-category-update/finance-category-update.schema';
import type { CashAccountListController } from '@/usecases/finance/cash-account-list/cash-account-list.controller';
import { cashAccountListQuerySchema, cashAccountListResponseSchema } from '@/usecases/finance/cash-account-list/cash-account-list.schema';
import type { CashAccountCreateController } from '@/usecases/finance/cash-account-create/cash-account-create.controller';
import { cashAccountCreateResponseSchema, cashAccountCreateSchema, cashAccountErrorSchema } from '@/usecases/finance/cash-account-create/cash-account-create.schema';
import type { CashAccountUpdateController } from '@/usecases/finance/cash-account-update/cash-account-update.controller';
import { cashAccountUpdateErrorSchema, cashAccountUpdateParamsSchema, cashAccountUpdateResponseSchema, cashAccountUpdateSchema } from '@/usecases/finance/cash-account-update/cash-account-update.schema';
import type { FinanceTransactionListController } from '@/usecases/finance/finance-transaction-list/finance-transaction-list.controller';
import { financeTransactionListQuerySchema, financeTransactionListResponseSchema } from '@/usecases/finance/finance-transaction-list/finance-transaction-list.schema';
import type { FinanceTransactionCreateController } from '@/usecases/finance/finance-transaction-create/finance-transaction-create.controller';
import { financeTransactionCreateResponseSchema, financeTransactionCreateSchema } from '@/usecases/finance/finance-transaction-create/finance-transaction-create.schema';
import type { FinanceTransactionReverseController } from '@/usecases/finance/finance-transaction-reverse/finance-transaction-reverse.controller';
import { financeTransactionReverseParamsSchema, financeTransactionReverseResponseSchema, financeTransactionReverseSchema } from '@/usecases/finance/finance-transaction-reverse/finance-transaction-reverse.schema';
import type { FinanceTransferCreateController } from '@/usecases/finance/finance-transfer-create/finance-transfer-create.controller';
import { financeTransferCreateResponseSchema, financeTransferCreateSchema } from '@/usecases/finance/finance-transfer-create/finance-transfer-create.schema';
import type { FinanceSummaryController } from '@/usecases/finance/finance-summary/finance-summary.controller';
import { financeSummaryQuerySchema, financeSummaryResponseSchema } from '@/usecases/finance/finance-summary/finance-summary.schema';
import type { FinancePeriodListController } from '@/usecases/finance/finance-period-list/finance-period-list.controller';
import { financePeriodListQuerySchema, financePeriodListResponseSchema } from '@/usecases/finance/finance-period-list/finance-period-list.schema';
import type { FinancePeriodCloseController } from '@/usecases/finance/finance-period-close/finance-period-close.controller';
import type { FinancePeriodReopenController } from '@/usecases/finance/finance-period-reopen/finance-period-reopen.controller';
import { financePeriodParamsSchema, financePeriodReopenSchema, financePeriodResponseSchema } from '@/usecases/finance/finance-period-reopen/finance-period-reopen.schema';

/**
 * Financeiro. O acesso é por papel financeiro (`authorizeFinance`), não pelo `level` da hierarquia —
 * exceto atribuir papéis e reabrir mês, reservados ao Pastor Titular (FINANCE_ROLE_MANAGER_MIN_LEVEL).
 */
export async function financeRoutes(server: FastifyInstance) {
  server.get('/me', {
    preHandler: [server.authenticate()],
    schema: {
      tags: ['Finance'],
      summary: 'Get my finance permissions',
      description: `Papel financeiro do usuário logado e se ele pode atribuir papéis. Requer apenas autenticação.`,
      security: [{ bearerAuth: [] }],
      response: { 200: financeMeResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceMeController>('financeMeController');
    return controller.handle(request, reply);
  });

  server.get('/users', {
    preHandler: [server.authenticate(), server.authorize(FINANCE_ROLE_MANAGER_MIN_LEVEL)],
    schema: {
      tags: ['Finance'],
      summary: 'List users with finance roles',
      description: `Todos os usuários e o papel financeiro de cada um. Requer level >= ${FINANCE_ROLE_MANAGER_MIN_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      response: { 200: financeUserListResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceUserListController>('financeUserListController');
    return controller.handle(request, reply);
  });

  server.put('/users/:userId/role', {
    preHandler: [server.authenticate(), server.authorize(FINANCE_ROLE_MANAGER_MIN_LEVEL)],
    schema: {
      tags: ['Finance'],
      summary: 'Assign a finance role',
      description: `Atribui ou altera o papel financeiro de um usuário. Requer level >= ${FINANCE_ROLE_MANAGER_MIN_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      params: financeRoleParamsSchema,
      body: financeRoleAssignSchema,
      response: { 200: financeRoleAssignResponseSchema, 400: financeErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceRoleAssignController>('financeRoleAssignController');
    return controller.handle(request, reply);
  });

  server.delete('/users/:userId/role', {
    preHandler: [server.authenticate(), server.authorize(FINANCE_ROLE_MANAGER_MIN_LEVEL)],
    schema: {
      tags: ['Finance'],
      summary: 'Revoke a finance role',
      description: `Remove o acesso do usuário ao financeiro. Requer level >= ${FINANCE_ROLE_MANAGER_MIN_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      params: financeRoleParamsSchema,
      response: { 200: financeRoleRevokeResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceRoleRevokeController>('financeRoleRevokeController');
    return controller.handle(request, reply);
  });

  server.get('/funds', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER', 'FISCAL_COUNCIL', 'PASTOR_VIEWER', 'COUNTER'])],
    schema: {
      tags: ['Finance'],
      summary: 'List funds',
      description: `Fundos (Geral, Missões, ...). Requer qualquer papel financeiro.`,
      security: [{ bearerAuth: [] }],
      querystring: fundListQuerySchema,
      response: { 200: fundListResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FundListController>('fundListController');
    return controller.handle(request, reply);
  });

  server.post('/funds', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER'])],
    schema: {
      tags: ['Finance'],
      summary: 'Create a fund',
      description: `Cria um fundo. Requer papel TREASURER.`,
      security: [{ bearerAuth: [] }],
      body: fundCreateSchema,
      response: { 201: fundCreateResponseSchema, 400: fundErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FundCreateController>('fundCreateController');
    return controller.handle(request, reply);
  });

  server.patch('/funds/:id', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER'])],
    schema: {
      tags: ['Finance'],
      summary: 'Update a fund',
      description: `Atualiza nome, status, txid Pix ou ordem. \`restricted\` não muda. Requer papel TREASURER.`,
      security: [{ bearerAuth: [] }],
      params: fundUpdateParamsSchema,
      body: fundUpdateSchema,
      response: { 200: fundUpdateResponseSchema, 400: fundUpdateErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FundUpdateController>('fundUpdateController');
    return controller.handle(request, reply);
  });

  server.get('/categories', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER', 'FISCAL_COUNCIL', 'PASTOR_VIEWER', 'COUNTER'])],
    schema: {
      tags: ['Finance'],
      summary: 'List finance categories',
      description: `Plano de contas. Requer qualquer papel financeiro.`,
      security: [{ bearerAuth: [] }],
      querystring: financeCategoryListQuerySchema,
      response: { 200: financeCategoryListResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceCategoryListController>('financeCategoryListController');
    return controller.handle(request, reply);
  });

  server.post('/categories', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER'])],
    schema: {
      tags: ['Finance'],
      summary: 'Create a finance category',
      description: `Requer papel TREASURER.`,
      security: [{ bearerAuth: [] }],
      body: financeCategoryCreateSchema,
      response: { 201: financeCategoryCreateResponseSchema, 400: financeCategoryErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceCategoryCreateController>('financeCategoryCreateController');
    return controller.handle(request, reply);
  });

  server.patch('/categories/:id', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER'])],
    schema: {
      tags: ['Finance'],
      summary: 'Update a finance category',
      description: `Requer papel TREASURER.`,
      security: [{ bearerAuth: [] }],
      params: financeCategoryUpdateParamsSchema,
      body: financeCategoryUpdateSchema,
      response: { 200: financeCategoryUpdateResponseSchema, 400: financeCategoryUpdateErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceCategoryUpdateController>('financeCategoryUpdateController');
    return controller.handle(request, reply);
  });

  server.get('/accounts', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER', 'FISCAL_COUNCIL', 'PASTOR_VIEWER', 'COUNTER'])],
    schema: {
      tags: ['Finance'],
      summary: 'List cash accounts',
      description: `Caixa e contas bancárias. Requer qualquer papel financeiro.`,
      security: [{ bearerAuth: [] }],
      querystring: cashAccountListQuerySchema,
      response: { 200: cashAccountListResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<CashAccountListController>('cashAccountListController');
    return controller.handle(request, reply);
  });

  server.post('/accounts', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER'])],
    schema: {
      tags: ['Finance'],
      summary: 'Create a cash account',
      description: `Requer papel TREASURER.`,
      security: [{ bearerAuth: [] }],
      body: cashAccountCreateSchema,
      response: { 201: cashAccountCreateResponseSchema, 400: cashAccountErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<CashAccountCreateController>('cashAccountCreateController');
    return controller.handle(request, reply);
  });

  server.patch('/accounts/:id', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER'])],
    schema: {
      tags: ['Finance'],
      summary: 'Update a cash account',
      description: `Requer papel TREASURER.`,
      security: [{ bearerAuth: [] }],
      params: cashAccountUpdateParamsSchema,
      body: cashAccountUpdateSchema,
      response: { 200: cashAccountUpdateResponseSchema, 400: cashAccountUpdateErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<CashAccountUpdateController>('cashAccountUpdateController');
    return controller.handle(request, reply);
  });

  server.get('/transactions', {
    preHandler: [server.authenticate(), server.authorizeFinance([...FINANCE_READ_ROLES])],
    schema: {
      tags: ['Finance'],
      summary: 'List transactions',
      description: `Livro-caixa paginado. O membro vinculado só aparece para quem tem \`canViewIndividualGiving\` (e a consulta é registrada). Requer TREASURER, FISCAL_COUNCIL ou PASTOR_VIEWER.`,
      security: [{ bearerAuth: [] }],
      querystring: financeTransactionListQuerySchema,
      response: { 200: financeTransactionListResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceTransactionListController>('financeTransactionListController');
    return controller.handle(request, reply);
  });

  server.post('/transactions', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER'])],
    schema: {
      tags: ['Finance'],
      summary: 'Create a transaction',
      description: `Lança entrada, despesa ou saldo inicial. Bloqueado em mês fechado (\`FINANCE.PERIOD_CLOSED\`) e quando deixaria fundo restrito negativo (\`FINANCE.FUND_INSUFFICIENT\`). Requer papel TREASURER.`,
      security: [{ bearerAuth: [] }],
      body: financeTransactionCreateSchema,
      response: { 201: financeTransactionCreateResponseSchema, 400: financeErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceTransactionCreateController>('financeTransactionCreateController');
    return controller.handle(request, reply);
  });

  server.post('/transactions/:id/reverse', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER'])],
    schema: {
      tags: ['Finance'],
      summary: 'Reverse a transaction',
      description: `Estorna um lançamento (lançamentos nunca são editados). Requer papel TREASURER.`,
      security: [{ bearerAuth: [] }],
      params: financeTransactionReverseParamsSchema,
      body: financeTransactionReverseSchema,
      response: { 201: financeTransactionReverseResponseSchema, 400: financeErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceTransactionReverseController>('financeTransactionReverseController');
    return controller.handle(request, reply);
  });

  server.post('/transfers', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER'])],
    schema: {
      tags: ['Finance'],
      summary: 'Create a transfer',
      description: `Transfere entre contas (ex.: depósito do caixa) e/ou entre fundos (exige \`approvalReference\`). Requer papel TREASURER.`,
      security: [{ bearerAuth: [] }],
      body: financeTransferCreateSchema,
      response: { 201: financeTransferCreateResponseSchema, 400: financeErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceTransferCreateController>('financeTransferCreateController');
    return controller.handle(request, reply);
  });

  server.get('/summary', {
    preHandler: [server.authenticate(), server.authorizeFinance([...FINANCE_READ_ROLES])],
    schema: {
      tags: ['Finance'],
      summary: 'Get finance summary',
      description: `Saldos por fundo e conta e totais do mês. Só agregados. Requer TREASURER, FISCAL_COUNCIL ou PASTOR_VIEWER.`,
      security: [{ bearerAuth: [] }],
      querystring: financeSummaryQuerySchema,
      response: { 200: financeSummaryResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinanceSummaryController>('financeSummaryController');
    return controller.handle(request, reply);
  });

  server.get('/periods', {
    preHandler: [server.authenticate(), server.authorizeFinance([...FINANCE_READ_ROLES])],
    schema: {
      tags: ['Finance'],
      summary: 'List periods',
      description: `Status dos 12 meses do ano. Requer TREASURER, FISCAL_COUNCIL ou PASTOR_VIEWER.`,
      security: [{ bearerAuth: [] }],
      querystring: financePeriodListQuerySchema,
      response: { 200: financePeriodListResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinancePeriodListController>('financePeriodListController');
    return controller.handle(request, reply);
  });

  server.post('/periods/:year/:month/close', {
    preHandler: [server.authenticate(), server.authorizeFinance(['TREASURER'])],
    schema: {
      tags: ['Finance'],
      summary: 'Close a period',
      description: `Fecha o mês para lançamentos. Requer papel TREASURER.`,
      security: [{ bearerAuth: [] }],
      params: financePeriodParamsSchema,
      response: { 200: financePeriodResponseSchema, 400: financeErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinancePeriodCloseController>('financePeriodCloseController');
    return controller.handle(request, reply);
  });

  server.post('/periods/:year/:month/reopen', {
    preHandler: [server.authenticate(), server.authorize(FINANCE_ROLE_MANAGER_MIN_LEVEL)],
    schema: {
      tags: ['Finance'],
      summary: 'Reopen a period',
      description: `Reabre um mês fechado, com motivo registrado. Requer level >= ${FINANCE_ROLE_MANAGER_MIN_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      params: financePeriodParamsSchema,
      body: financePeriodReopenSchema,
      response: { 200: financePeriodResponseSchema, 400: financeErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FinancePeriodReopenController>('financePeriodReopenController');
    return controller.handle(request, reply);
  });
}
