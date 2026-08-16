const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('2931014', 10);
    
    // Create PlatformUser (Super Admin)
    await prisma.platformUser.upsert({
        where: { phone: '+998772931014' },
        update: { passwordHash: passwordHash },
        create: {
            name: 'Xatamov Kamoliddin',
            phone: '+998772931014',
            passwordHash: passwordHash,
            role: 'master',
            status: 'active'
        }
    });
    
    // Also create a Tenant for them just in case
    await prisma.tenant.upsert({
        where: { shopCode: 'SHOP001' },
        update: {
            adminUsername: '+998772931014',
            adminPasswordHash: passwordHash,
        },
        create: {
            shopCode: 'SHOP001',
            shopName: 'Asosiy Baza',
            ownerName: 'Xatamov Kamoliddin',
            phone: '+998772931014',
            email: 'admin@eviko.uz',
            address: 'Toshkent',
            plan: 'pro',
            status: 'active',
            adminUsername: '+998772931014',
            adminPasswordHash: passwordHash,
        }
    });

    console.log('? User created');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
