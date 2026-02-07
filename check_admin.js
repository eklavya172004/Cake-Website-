const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  const admins = await prisma.account.findMany({
    where: { role: 'admin' }
  });
  
  if (admins.length === 0) {
    console.log('❌ No admin accounts found in database');
  } else {
    console.log('✅ Admin accounts found:');
    admins.forEach(admin => {
      console.log(`  - Email: ${admin.email}`);
      console.log(`    Password: ${admin.password ? 'SET ✓' : 'NULL ✗'}`);
      console.log(`    Active: ${admin.isActive}`);
    });
  }
  
  await prisma.$disconnect();
}

checkAdmin().catch(console.error);
