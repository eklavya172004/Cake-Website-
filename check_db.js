const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  console.log('=== DATABASE DATA VERIFICATION ===\n');
  
  const vendors = await prisma.vendor.findMany();
  console.log(`✓ Vendors: ${vendors.length}`);
  vendors.forEach(v => console.log(`  - ${v.name}`));
  
  const cakes = await prisma.cake.findMany();
  console.log(`\n✓ Cakes: ${cakes.length}`);
  
  const accounts = await prisma.account.findMany();
  console.log(`\n✓ Accounts: ${accounts.length}`);
  accounts.forEach(a => console.log(`  - ${a.email} (${a.role})`));
  
  const orders = await prisma.order.findMany();
  console.log(`\n✓ Orders: ${orders.length}`);
  const statusCount = {};
  orders.forEach(o => {
    statusCount[o.status] = (statusCount[o.status] || 0) + 1;
  });
  console.log('  Status breakdown:', statusCount);
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
  console.log(`  Total Revenue: ₹${totalRevenue}`);
  
  await prisma.$disconnect();
}

checkData().catch(e => console.error(e));
