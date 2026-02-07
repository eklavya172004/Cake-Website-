const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'customer@purblepalace.in' }
    });
    console.log('Customer User found:', user?.email, user?.name);

    if (user) {
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        take: 3
      });
      console.log('Customer has', orders.length, 'orders');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check().then(() => process.exit(0));
