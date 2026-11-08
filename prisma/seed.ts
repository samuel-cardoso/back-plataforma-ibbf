import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hierarquia de acesso descrita no ERD "IBBF - Autenticação e Administração
// de Membros": quanto maior o `level`, mais permissões o papel concede.
const roles = [
  { name: 'Pastor Titular', level: 100, description: 'Acesso total à plataforma.' },
  { name: 'Pastor Auxiliar', level: 80, description: 'Liderança pastoral da igreja.' },
  { name: 'Lider', level: 60, description: 'Líder de ministério.' },
  { name: 'Secretaria', level: 40, description: 'Suporte administrativo.' },
  { name: 'Membro', level: 20, description: 'Membro comum, acesso básico.' },
];

// Financeiro: fundos, plano de contas simplificado e conta Caixa iniciais. Tudo editável depois
// pela tesouraria; o seed só cria o que ainda não existe (upsert por nome).
const funds = [
  { name: 'Geral', restricted: false, pixTxid: 'GERAL', sortOrder: 0 },
  { name: 'Missões', restricted: true, pixTxid: 'MISSOES', sortOrder: 1 },
  { name: 'Construção', restricted: true, pixTxid: 'CONSTRUCAO', sortOrder: 2 },
  { name: 'Ação Social', restricted: true, pixTxid: 'ACAOSOCIAL', sortOrder: 3 },
];

const incomeCategories = ['Dízimos', 'Ofertas', 'Ofertas de missões', 'Ofertas designadas', 'Outras receitas'];

const expenseCategories = [
  'Sustento pastoral',
  'Água, luz e telefone',
  'Aluguel',
  'Manutenção e conservação',
  'Sustento missionário',
  'Material de EBD e ministérios',
  'Eventos',
  'Ação social',
  'Tarifas bancárias',
  'Outras despesas',
];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  for (const fund of funds) {
    await prisma.fund.upsert({ where: { name: fund.name }, update: {}, create: fund });
  }

  for (const [type, names] of [['INCOME', incomeCategories], ['EXPENSE', expenseCategories]] as const) {
    for (const name of names) {
      await prisma.financeCategory.upsert({
        where: { type_name: { type, name } },
        update: {},
        create: { type, name },
      });
    }
  }

  await prisma.cashAccount.upsert({
    where: { name: 'Caixa' },
    update: {},
    create: { name: 'Caixa', kind: 'CASH' },
  });
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
