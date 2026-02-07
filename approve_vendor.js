const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveVendor() {
  const account = await prisma.account.findUnique({
    where: { email: 'optimusprime172004@gmail.com' },
    select: { vendorId: true }
  });
  
  if (!account?.vendorId) {
    console.log('❌ Vendor ID not found');
    await prisma.$disconnect();
    return;
  }
  
  const vendor = await prisma.vendor.update({
    where: { id: account.vendorId },
    data: { 
      approvalStatus: 'approved',
      approvedAt: new Date()
    }
  });
  
  console.log('✅ Vendor approved:', vendor.name);
  console.log('   Status:', vendor.approvalStatus);
  console.log('   Delivery Fee:', vendor.deliveryFee);
  await prisma.$disconnect();
}

approveVendor().catch(console.error);
