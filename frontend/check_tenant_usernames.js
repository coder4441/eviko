const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.tenant.findMany({ select: { shopName:true, adminUsername:true, phone:true } })
  .then(r => { r.forEach(t => console.log(t)); p.$disconnect(); })
  .catch(e => { console.error(e); p.$disconnect(); });
