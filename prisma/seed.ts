import { PrismaClient } from '@prisma/client';
import { hashPasswordSync } from '../src/common/utils/password';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: {
      id: 1,
    },
    update: {
      name: 'Admin',
    },
    create: {
      email: 'admin@gmail.com',
      name: 'Admin',
      is_admin: true,
      email_confirmed: true,
      credentials: {
        create: {
          hash: hashPasswordSync('Password@123456'),
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
