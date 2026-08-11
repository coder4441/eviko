const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.tenant.findMany({
  select: { id:true, shopName:true, ownerName:true, phone:true, status:true, agentCode:true, createdAt:true, billingId:true, plan:true }
}).then(r => {
  console.log('=== BARCHA TASHKILOTLAR ===');
  r.forEach((t,i) => {
    console.log(`\n[${i+1}] ${t.shopName}`);
    console.log(`    Egasi: ${t.ownerName}`);
    console.log(`    Tel: ${t.phone}`);
    console.log(`    Status: ${t.status}`);
    console.log(`    Agent: ${t.agentCode || 'YOQ'}`);
    console.log(`    Billing ID: ${t.billingId}`);
    console.log(`    Tarif: ${t.plan}`);
    console.log(`    Yaratilgan: ${t.createdAt}`);
  });
  console.log('\nJami:', r.length);
  p.$disconnect();
}).catch(e => { console.error(e.message); p.$disconnect(); });
