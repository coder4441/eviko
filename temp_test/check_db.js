const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const sa = await p.superAdmin.findMany();
  console.log('SuperAdmin count:', sa.length, sa.length > 0 ? '✅' : '❌ YOQ!');

  const pu = await p.platformUser.findMany();
  console.log('PlatformUsers:');
  pu.forEach(u => console.log(`  phone=${u.phone} name=${u.name} role=${u.role} status=${u.status}`));
  if (pu.length === 0) console.log('  ❌ Hech qanday platformUser topilmadi!');

  const tenants = await p.tenant.findMany({
    select: { id: true, shopCode: true, shopName: true, adminUsername: true, status: true, expiresAt: true }
  });
  console.log('\nTenants:');
  tenants.forEach(t => console.log(`  ${t.shopCode} | ${t.shopName} | login:${t.adminUsername} | status:${t.status} | expires:${t.expiresAt}`));

  await p.$disconnect();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
