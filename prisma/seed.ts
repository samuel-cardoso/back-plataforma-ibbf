import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hierarquia de acesso descrita no ERD "IBBF - Autenticação e Administração
// de Membros": quanto maior o `level`, mais permissões o papel concede.
const roles = [
  { name: 'Admin', level: 100, description: 'Acesso total à plataforma.' },
  { name: 'Pastor', level: 80, description: 'Liderança pastoral da igreja.' },
  { name: 'Lider', level: 60, description: 'Líder de ministério.' },
  { name: 'Secretaria', level: 40, description: 'Suporte administrativo.' },
  { name: 'Membro', level: 20, description: 'Membro comum, acesso básico.' },
];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
