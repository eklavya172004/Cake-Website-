const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getVendorId() {
  const vendor = await prisma.vendor.findFirst({
    where: { name: 'Sweet Delights Bakery' }
  });
  console.log('First Vendor ID:', vendor?.id);
  const account = await prisma.account.findFirst({
    where: { email: 'vendor@purblepalace.in' }
  });
  console.log('Account vendor connection:', account?.vendorId);
  await prisma.$disconnect();
}

getVendorId();
