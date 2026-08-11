const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const p = new PrismaClient();

async function updateMaster() {
  try {
    const hash = await bcrypt.hash("kamol1014", 10);
    
    // Check if there is already a master user
    const master = await p.platformUser.findFirst({
      where: { role: 'MASTER' }
    });
    
    if (master) {
      await p.platformUser.update({
        where: { id: master.id },
        data: {
          phone: "+998500023778",
          name: "Kamoliddin (Super Admin)",
          passwordHash: hash
        }
      });
      console.log("Master user updated in DB.");
    } else {
      await p.platformUser.create({
        data: {
          phone: "+998500023778",
          name: "Kamoliddin (Super Admin)",
          passwordHash: hash,
          role: "MASTER"
        }
      });
      console.log("Master user created in DB.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    p.$disconnect();
  }
}

updateMaster();
