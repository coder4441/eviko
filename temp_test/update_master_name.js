const { PrismaClient } = require('@prisma/client');

const p = new PrismaClient();

async function updateMasterName() {
  try {
    const master = await p.platformUser.findFirst({
      where: { role: 'MASTER' }
    });
    
    if (master) {
      await p.platformUser.update({
        where: { id: master.id },
        data: {
          name: "Xatamov Kamoliddin Shirinboy O'g'li"
        }
      });
      console.log("Master user name updated successfully.");
    } else {
      console.log("Master user not found!");
    }
  } catch (err) {
    console.error(err);
  } finally {
    p.$disconnect();
  }
}

updateMasterName();
