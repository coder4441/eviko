const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('kamol1014', 10);
  await prisma.platformUser.update({
    where: { phone: '+998775000244' },
    data: { passwordHash: hash }
  });
  console.log("Password updated successfully.");
}
main();
