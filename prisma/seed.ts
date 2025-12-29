// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.cake.deleteMany();
  await prisma.vendor.deleteMany();
  
  console.log('✨ Creating vendors...');

  // Create vendors
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        name: 'Sweet Dreams Bakery',
        slug: 'sweet-dreams-bakery',
        description: 'Premium cakes and pastries made with love',
        logo: '🎂',
        rating: 4.8,
        totalReviews: 245,
        serviceAreas: ['110001', '110006', '110007', '122001', '122002'],
        deliveryFee: {
          '110001': 50,
          '110006': 50,
          '110007': 60,
          '122001': 70,
          '122002': 70
        },
        minOrderAmount: 500,
        preparationTime: 180,
        phone: '+91-9876543210',
        email: 'contact@sweetdreams.com',
        address: {
          street: '123 Bakery Lane',
          area: 'Connaught Place',
          city: 'New Delhi',
          pincode: '110001'
        },
        isActive: true
      }
    }),
    prisma.vendor.create({
      data: {
        name: 'Cake Studio Pro',
        slug: 'cake-studio-pro',
        description: 'Professional custom cakes for all occasions',
        logo: '🍰',
        rating: 4.9,
        totalReviews: 189,
        serviceAreas: ['110016', '110017', '201301', '201303'],
        deliveryFee: {
          '110016': 60,
          '110017': 60,
          '201301': 80,
          '201303': 80
        },
        minOrderAmount: 600,
        preparationTime: 240,
        phone: '+91-9876543211',
        email: 'info@cakestudiopro.com',
        address: {
          street: '456 Sweet Street',
          area: 'South Delhi',
          city: 'New Delhi',
          pincode: '110016'
        },
        isActive: true
      }
    }),
    prisma.vendor.create({
      data: {
        name: 'Divine Delights',
        slug: 'divine-delights',
        description: 'Heavenly cakes that melt in your mouth',
        logo: '🧁',
        rating: 4.7,
        totalReviews: 312,
        serviceAreas: ['122001', '122002', '121001', '121002'],
        deliveryFee: {
          '122001': 40,
          '122002': 40,
          '121001': 50,
          '121002': 50
        },
        minOrderAmount: 400,
        preparationTime: 150,
        phone: '+91-9876543212',
        email: 'hello@divinedelights.com',
        address: {
          street: '789 Cake Avenue',
          area: 'DLF Phase 1',
          city: 'Gurgaon',
          pincode: '122001'
        },
        isActive: true
      }
    }),
    prisma.vendor.create({
      data: {
        name: 'Heavenly Bakes',
        slug: 'heavenly-bakes',
        description: 'Fresh baked goods delivered to your door',
        logo: '✨',
        rating: 4.9,
        totalReviews: 421,
        serviceAreas: ['201001', '201002', '110009'],
        deliveryFee: {
          '201001': 45,
          '201002': 45,
          '110009': 55
        },
        minOrderAmount: 500,
        preparationTime: 120,
        phone: '+91-9876543213',
        email: 'support@heavenlybakes.com',
        address: {
          street: '321 Bakery Road',
          area: 'Indirapuram',
          city: 'Ghaziabad',
          pincode: '201001'
        },
        isActive: true
      }
    }),
    prisma.vendor.create({
      data: {
        name: 'Sugar & Spice',
        slug: 'sugar-and-spice',
        description: 'Everything nice in every slice',
        logo: '🍰',
        rating: 4.6,
        totalReviews: 167,
        serviceAreas: ['201301', '201303', '110024'],
        deliveryFee: {
          '201301': 55,
          '201303': 55,
          '110024': 70
        },
        minOrderAmount: 550,
        preparationTime: 200,
        phone: '+91-9876543214',
        email: 'info@sugarandspice.com',
        address: {
          street: '654 Sweet Lane',
          area: 'Sector 18',
          city: 'Noida',
          pincode: '201301'
        },
        isActive: true
      }
    }),
    prisma.vendor.create({
      data: {
        name: 'Cake Magic',
        slug: 'cake-magic',
        description: 'Where every cake is a magical experience',
        logo: '🎂',
        rating: 4.8,
        totalReviews: 298,
        serviceAreas: ['110001', '121001', '122003'],
        deliveryFee: {
          '110001': 50,
          '121001': 55,
          '122003': 60
        },
        minOrderAmount: 500,
        preparationTime: 180,
        phone: '+91-9876543215',
        email: 'contact@cakemagic.com',
        address: {
          street: '987 Magic Street',
          area: 'Nehru Place',
          city: 'New Delhi',
          pincode: '110001'
        },
        isActive: true
      }
    })
  ]);

  console.log(`✅ Created ${vendors.length} vendors`);
  console.log('🎂 Creating cakes...');

  // Create cakes for each vendor
  const cakes = [
    // Sweet Dreams Bakery
    {
      vendorId: vendors[0].id,
      name: 'Chocolate Truffle',
      slug: 'chocolate-truffle',
      description: 'Rich chocolate cake with chocolate truffle filling',
      basePrice: 650,
      category: 'Birthday',
      images: [],
      flavors: ['Chocolate', 'Dark Chocolate'],
      availableSizes: [
        { size: '500g', price: 650 },
        { size: '1kg', price: 1200 },
        { size: '2kg', price: 2200 }
      ],
      tags: ['bestseller', 'chocolate', 'premium'],
      isCustomizable: true,
      customOptions: {
        toppings: ['chocolate shavings', 'cherries', 'nuts'],
        frostings: ['chocolate ganache', 'whipped cream'],
        messages: true
      },
      popularity: 95,
      isActive: true
    },
    {
      vendorId: vendors[0].id,
      name: 'Pineapple Paradise',
      slug: 'pineapple-paradise',
      description: 'Light and fluffy pineapple cake with fresh cream',
      basePrice: 620,
      category: 'Occasions',
      images: [],
      flavors: ['Pineapple', 'Vanilla'],
      availableSizes: [
        { size: '500g', price: 620 },
        { size: '1kg', price: 1100 },
        { size: '2kg', price: 2000 }
      ],
      tags: ['fruity', 'light'],
      isCustomizable: true,
      customOptions: {
        toppings: ['pineapple chunks', 'cherries'],
        frostings: ['whipped cream', 'buttercream'],
        messages: true
      },
      popularity: 82,
      isActive: true
    },
    // Cake Studio Pro
    {
      vendorId: vendors[1].id,
      name: 'Vanilla Dream',
      slug: 'vanilla-dream',
      description: 'Classic vanilla cake with vanilla buttercream',
      basePrice: 550,
      category: 'Birthday',
      images: [],
      flavors: ['Vanilla', 'French Vanilla'],
      availableSizes: [
        { size: '500g', price: 550 },
        { size: '1kg', price: 1000 },
        { size: '2kg', price: 1900 }
      ],
      tags: ['classic', 'vanilla', 'eggless'],
      isCustomizable: true,
      customOptions: {
        toppings: ['sprinkles', 'edible flowers', 'chocolate chips'],
        frostings: ['vanilla buttercream', 'cream cheese'],
        messages: true
      },
      popularity: 88,
      isActive: true
    },
    // Divine Delights
    {
      vendorId: vendors[2].id,
      name: 'Red Velvet Delight',
      slug: 'red-velvet-delight',
      description: 'Luxurious red velvet cake with cream cheese frosting',
      basePrice: 750,
      category: 'Anniversary',
      images: [],
      flavors: ['Red Velvet'],
      availableSizes: [
        { size: '500g', price: 750 },
        { size: '1kg', price: 1400 },
        { size: '2kg', price: 2600 }
      ],
      tags: ['premium', 'bestseller', 'red-velvet'],
      isCustomizable: true,
      customOptions: {
        toppings: ['red velvet crumbs', 'white chocolate shavings'],
        frostings: ['cream cheese', 'white chocolate ganache'],
        messages: true
      },
      popularity: 92,
      isActive: true
    },
    {
      vendorId: vendors[2].id,
      name: 'Mango Madness',
      slug: 'mango-madness',
      description: 'Tropical mango cake with fresh mango pulp',
      basePrice: 680,
      category: 'Desserts',
      images: [],
      flavors: ['Mango', 'Alphonso Mango'],
      availableSizes: [
        { size: '500g', price: 680 },
        { size: '1kg', price: 1250 },
        { size: '2kg', price: 2300 }
      ],
      tags: ['fruity', 'seasonal', 'eggless'],
      isCustomizable: true,
      customOptions: {
        toppings: ['fresh mango chunks', 'mango glaze'],
        frostings: ['mango cream', 'whipped cream'],
        messages: true
      },
      popularity: 89,
      isActive: true
    },
    // Heavenly Bakes
    {
      vendorId: vendors[3].id,
      name: 'Black Forest',
      slug: 'black-forest',
      description: 'Classic Black Forest with cherries and chocolate shavings',
      basePrice: 700,
      category: 'Birthday',
      images: [],
      flavors: ['Chocolate', 'Cherry'],
      availableSizes: [
        { size: '500g', price: 700 },
        { size: '1kg', price: 1300 },
        { size: '2kg', price: 2400 }
      ],
      tags: ['classic', 'chocolate', 'bestseller'],
      isCustomizable: true,
      customOptions: {
        toppings: ['cherries', 'chocolate shavings', 'chocolate curls'],
        frostings: ['whipped cream', 'chocolate cream'],
        messages: true
      },
      popularity: 90,
      isActive: true
    },
    // Sugar & Spice
    {
      vendorId: vendors[4].id,
      name: 'Strawberry Bliss',
      slug: 'strawberry-bliss',
      description: 'Fresh strawberry cake with strawberry cream',
      basePrice: 600,
      category: 'Occasions',
      images: [],
      flavors: ['Strawberry', 'Vanilla'],
      availableSizes: [
        { size: '500g', price: 600 },
        { size: '1kg', price: 1100 },
        { size: '2kg', price: 2000 }
      ],
      tags: ['fruity', 'light', 'eggless'],
      isCustomizable: true,
      customOptions: {
        toppings: ['fresh strawberries', 'strawberry glaze'],
        frostings: ['strawberry cream', 'vanilla buttercream'],
        messages: true
      },
      popularity: 85,
      isActive: true
    },
    // Cake Magic
    {
      vendorId: vendors[5].id,
      name: 'Butterscotch Heaven',
      slug: 'butterscotch-heaven',
      description: 'Delicious butterscotch cake with crunchy butterscotch chips',
      basePrice: 580,
      category: 'Birthday',
      images: [],
      flavors: ['Butterscotch'],
      availableSizes: [
        { size: '500g', price: 580 },
        { size: '1kg', price: 1050 },
        { size: '2kg', price: 1950 }
      ],
      tags: ['classic', 'crunchy'],
      isCustomizable: true,
      customOptions: {
        toppings: ['butterscotch chips', 'caramel drizzle'],
        frostings: ['butterscotch cream', 'caramel frosting'],
        messages: true
      },
      popularity: 87,
      isActive: true
    }
  ];

  await prisma.cake.createMany({ data: cakes });
  
  console.log(`✅ Created ${cakes.length} cakes`);

  // Create a test user
  console.log('✨ Creating test user...');
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      phone: '+91-9876543210'
    }
  });
  console.log('✅ Created test user:', testUser.email);

  // Create test orders
  console.log('✨ Creating test orders...');
  const vendor1 = vendors[0];
  const cake1 = cakes[0];

  const testOrder = await prisma.order.create({
    data: {
      orderNumber: `ORD-TEST-${Date.now()}`,
      userId: testUser.id,
      vendorId: vendor1.id,
      items: [
        {
          cakeId: cake1.vendorId === vendor1.id ? cake1.id : cakes.find(c => c.vendorId === vendor1.id)?.id || 'cake-1',
          name: cake1.name,
          quantity: 1,
          price: cake1.basePrice,
          customization: {}
        }
      ],
      deliveryAddress: {
        street: '123 Test Street',
        area: 'Test Area',
        city: 'New Delhi',
        landmark: 'Near Test Market',
        pincode: '110001'
      },
      deliveryPincode: '110001',
      status: 'confirmed',
      totalAmount: cake1.basePrice,
      deliveryFee: 50,
      finalAmount: cake1.basePrice + 50,
      paymentMethod: 'online',
      paymentStatus: 'completed',
      vendorAcceptedAt: new Date(),
      preparationStartedAt: new Date(Date.now() + 5 * 60 * 1000),
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000)
    },
    include: {
      vendor: true
    }
  });

  console.log('✅ Created test order:', testOrder.orderNumber);

  // Create order status history
  await prisma.orderStatusHistory.create({
    data: {
      orderId: testOrder.id,
      status: 'confirmed',
      message: 'Order confirmed by ' + vendor1.name,
      createdBy: 'system'
    }
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Add this to package.json:
// "scripts": {
//   "db:seed": "tsx prisma/seed.ts"
// }