import { PrismaClient, Role, Status } from '@prisma/client';
import { hashSync } from 'bcrypt';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  if (
    !(await prisma.user.findUnique({ where: { email: 'lars@roth-kl.de' } }))
  ) {
    const user = await prisma.user.create({
      data: {
        name: 'Supporterino',
        email: 'lars@roth-kl.de',
        password: hashSync('TestPassword', 10),
        role: Role.ADMIN,
        status: Status.ACTIVE,
      },
    });

    console.log(`User ${user.name} created with ID ${user.id}`);
  }
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
