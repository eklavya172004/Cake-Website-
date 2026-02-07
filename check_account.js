const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAccount() {
  const account = await prisma.account.findUnique({
    where: { email: 'optimusprime172004@gmail.com' },
    include: { vendor: true }
  });
  
  if (!account) {
    console.log('❌ Account NOT found in database');
    return;
  }
  
  console.log('✅ Account FOUND:');
  console.log('  Email:', account.email);
  console.log('  Role:', account.role);
  console.log('  Password Hash:', account.password ? 'SET' : 'NULL');
  console.log('  Vendor ID:', account.vendorId);
  console.log('  Is Active:', account.isActive);
  console.log('  Is Verified:', account.isVerified);
  
  if (account.vendor) {
    console.log('  \nVendor Info:');
    console.log('    Name:', account.vendor.name);
    console.log('    Approval Status:', account.vendor.approvalStatus);
    console.log('    Is Active:', account.vendor.isActive);
  }
  
  await prisma.$disconnect();
}

checkAccount().catch(console.error);
