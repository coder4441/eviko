import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 10,
    select: {
      id: true,
      phone: true,
      role: true,
      tenantId: true
    }
  });
  console.log("USERS:", JSON.stringify(users, null, 2));

  // If there are no users, create one
  if (users.length === 0) {
      console.log("No users found. Creating a test POS cashier...");
      const tenant = await prisma.tenant.findFirst();
      if (!tenant) {
          console.log("No tenants exist either!");
          return;
      }
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('pos123', 10);
      
      const newPos = await prisma.user.create({
          data: {
              phone: '+998909998877',
              passwordHash: hash,
              role: 'CASHIER', // Agent yoki Kassir bo'lishi mumkin
              tenantId: tenant.id,
              firstName: 'Test',
              lastName: 'Kassir'
          }
      });
      console.log("Created POS User:", newPos);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
