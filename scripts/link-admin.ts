import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = '808beatstore@gmail.com'.toLowerCase().trim();
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      name: '808 Beat Store Admin',
    },
    create: {
      email,
      name: '808 Beat Store Admin',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin Account Linked Successfully:');
  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch((e) => {
    console.error('Error linking admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
