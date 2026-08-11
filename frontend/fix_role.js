const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.platformUser.findMany();
  console.log("Current users:", users.map(u => ({ id: u.id, role: u.role, phone: u.phone })));
  const result = await prisma.platformUser.updateMany({
    where: { role: { equals: 'master', mode: 'insensitive' } },
    data: { role: 'MASTER' }
  });
  console.log('Updated users:', result);
}
run().then(() => process.exit(0)).catch(console.error);
