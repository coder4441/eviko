const { PrismaClient } = require('@prisma/client');

async function migrate() {
    const prisma = new PrismaClient();

    try {
        console.log('Migrating PlatformUser.permissions...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "PlatformUser" ALTER COLUMN "permissions" DROP DEFAULT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "PlatformUser" ALTER COLUMN "permissions" TYPE JSONB USING permissions::jsonb;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "PlatformUser" ALTER COLUMN "permissions" SET DEFAULT '[]'::jsonb;`);

        console.log('Migrating Tenant.settings...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Tenant" ALTER COLUMN "settings" TYPE JSONB USING settings::jsonb;`);

        console.log('Migrating Staff.permissions...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Staff" ALTER COLUMN "permissions" TYPE JSONB USING permissions::jsonb;`);

        console.log('Migrating Staff.staffMeta...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Staff" ALTER COLUMN "staffMeta" DROP DEFAULT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Staff" ALTER COLUMN "staffMeta" TYPE JSONB USING "staffMeta"::jsonb;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Staff" ALTER COLUMN "staffMeta" SET DEFAULT '{}'::jsonb;`);

        console.log('Success!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
