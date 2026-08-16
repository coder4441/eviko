const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  const u = await p.platformUser.findFirst({ where: { role: 'MASTER' } });
  console.log('Master user:', u?.name);
  console.log('Status:', u?.status);
  console.log('Permissions:', u?.permissions);
  console.log('Role:', u?.role);
  await p.$disconnect();
}
check().catch(console.error);
