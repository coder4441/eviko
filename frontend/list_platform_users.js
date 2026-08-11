const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.platformUser.findMany({ select: { id:true, name:true, phone:true, role:true, agentCode:true } })
  .then(r => { r.forEach(u => console.log(u)); p.$disconnect(); })
  .catch(e => { console.error(e); p.$disconnect(); });
