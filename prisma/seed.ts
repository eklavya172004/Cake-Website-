import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('��� Starting database seed...');

  // Clear existing data
  await prisma.order.deleteMany({});
  await prisma.cake.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.vendor.deleteMany({});

  // Create vendors
  console.log('Creating vendors...');
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'Sweet Delights Bakery',
      slug: 'sweet-delights',
      preparationTime: 30,
      minOrderAmount: 500,
      isActive: true,
      approvalStatus: 'approved',
      rating: 4.8,
      totalReviews: 45,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: 'Cake Paradise',
      slug: 'cake-paradise',
      preparationTime: 45,
      minOrderAmount: 1000,
      isActive: true,
      approvalStatus: 'approved',
      rating: 4.6,
      totalReviews: 32,
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      name: 'Artisan Cakes',
      slug: 'artisan-cakes',
      preparationTime: 60,
      minOrderAmount: 1500,
      isActive: true,
      approvalStatus: 'approved',
      rating: 4.7,
      totalReviews: 28,
    },
  });

  // Create cakes
  console.log('Creating cakes...');
  const cakeData = [
    { name: 'Chocolate Decadence', category: 'Chocolate', basePrice: 500 },
    { name: 'Vanilla Dream', category: 'Vanilla', basePrice: 450 },
    { name: 'Red Velvet Romance', category: 'Fruit', basePrice: 550 },
    { name: 'Strawberry Bliss', category: 'Fruit', basePrice: 600 },
    { name: 'Black Forest', category: 'Chocolate', basePrice: 700 },
  ];

  const cakes = [];
  for (const vendorId of [vendor1.id, vendor2.id, vendor3.id]) {
    for (const data of cakeData) {
      const cake = await prisma.cake.create({
        data: {
          name: data.name,
          slug: data.name.toLowerCase().replace(/\s/g, '-'),
          vendorId,
          description: `A delicious ${data.category} cake made fresh daily`,
          basePrice: data.basePrice,
          category: data.category,
          images: [],
          isActive: true,
          availableSizes: {
            half: data.basePrice,
            full: data.basePrice + 200,
            custom: data.basePrice + 500,
          },
          flavors: ['Original'],
          isCustomizable: false,
          customOptions: {},
          tags: [],
        },
      });
      cakes.push(cake);
    }
  }

  // Create users
  console.log('Creating users...');
  const customer = await prisma.user.create({
    data: {
      name: 'Customer User',
      email: 'customer@purblepalace.in',
      phone: '1234567890',
    },
  });

  // Create accounts
  console.log('Creating accounts...');
  const adminHash = await bcrypt.hash('admin123', 10);
  const vendorHash = await bcrypt.hash('vendor123', 10);

  const adminAccount = await prisma.account.create({
    data: {
      email: 'admin@purblepalace.in',
      password: adminHash,
      name: 'Admin User',
      role: 'admin',
      isAdmin: true,
      adminRole: 'super_admin',
      adminPermissions: ['all'],
    },
  });

  const vendorAccount = await prisma.account.create({
    data: {
      email: 'vendor@purblepalace.in',
      password: vendorHash,
      name: 'Vendor User',
      role: 'vendor',
      vendorId: vendor1.id,
    },
  });

  // Create orders
  console.log('Creating orders...');
  const now = new Date();
  const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

  for (let i = 0; i < 50; i++) {
    const randomVendor = [vendor1, vendor2, vendor3][Math.floor(Math.random() * 3)];
    const randomCake = cakes[Math.floor(Math.random() * cakes.length)];

    await prisma.order.create({
      data: {
        orderNumber: `ORD-2025-${String(1000 + i).padStart(4, '0')}`,
        userId: customer.id,
        vendorId: randomVendor.id,
        items: [
          {
            cakeId: randomCake.id,
            name: randomCake.name,
            quantity: 1,
            customization: {},
            price: parseFloat(randomCake.basePrice.toString()),
          },
        ],
        deliveryAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
        },
        deliveryPincode: '10001',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        totalAmount: parseFloat(randomCake.basePrice.toString()),
        deliveryFee: 50,
        discount: 0,
        finalAmount: parseFloat(randomCake.basePrice.toString()) + 50,
        paymentMethod: Math.random() > 0.5 ? 'online' : 'cod',
        paymentStatus: 'completed',
        createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('\nTest Credentials:');
  console.log('  Admin: admin@purblepalace.in / admin123');
  console.log('  Vendor: vendor@purblepalace.in / vendor123');
  console.log('  Customer: customer@purblepalace.in (any password)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
