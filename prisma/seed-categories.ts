import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cakeImages = {
  birthday: [
    'https://images.unsplash.com/photo-1558636508-e0db3814a69e?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
  ],
  wedding: [
    'https://images.unsplash.com/photo-1565958011504-98d14e64f272?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1619451334792-150fd619a7f6?w=500&h=500&fit=crop',
  ],
  anniversary: [
    'https://images.unsplash.com/photo-1585080472049-f289083caea8?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
  ],
  occasions: [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1558636508-e0db3814a69e?w=500&h=500&fit=crop',
  ],
  desserts: [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1585080472049-f289083caea8?w=500&h=500&fit=crop',
  ],
  customized: [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
  ],
  hampers: [
    'https://images.unsplash.com/photo-1558636508-e0db3814a69e?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
  ],
};

const cakesData = [
  // Birthday Cakes
  {
    name: 'Chocolate Truffle Birthday',
    category: 'Birthday',
    description: 'Rich dark chocolate cake with truffle coating and colorful sprinkles',
    basePrice: 599,
    flavors: ['Chocolate'],
    tags: ['chocolate', 'popular', 'bestseller'],
    popularity: 95,
    isCustomizable: true,
  },
  {
    name: 'Rainbow Layer Cake',
    category: 'Birthday',
    description: 'Vibrant rainbow layers with vanilla cream and buttercream frosting',
    basePrice: 649,
    flavors: ['Vanilla', 'Strawberry'],
    tags: ['colorful', 'kids', 'fun'],
    popularity: 88,
    isCustomizable: true,
  },
  {
    name: 'Strawberry Shortcake',
    category: 'Birthday',
    description: 'Fresh strawberry layers with whipped cream and sponge cake',
    basePrice: 499,
    flavors: ['Strawberry', 'Vanilla'],
    tags: ['strawberry', 'fresh', 'light'],
    popularity: 82,
    isCustomizable: true,
  },
  {
    name: 'Black Forest Gateau',
    category: 'Birthday',
    description: 'Classic black forest with cherries, chocolate, and cream',
    basePrice: 749,
    flavors: ['Chocolate', 'Cherry'],
    tags: ['premium', 'chocolate', 'classic'],
    popularity: 90,
    isCustomizable: false,
  },
  {
    name: 'Butter Scotch Cake',
    category: 'Birthday',
    description: 'Buttery cake with butterscotch sauce and almond bits',
    basePrice: 549,
    flavors: ['Butterscotch'],
    tags: ['butterscotch', 'caramel', 'sweet'],
    popularity: 78,
    isCustomizable: true,
  },
  {
    name: 'Vanilla Dream Birthday',
    category: 'Birthday',
    description: 'Fluffy vanilla sponge with vanilla cream and fresh fruits',
    basePrice: 449,
    flavors: ['Vanilla'],
    tags: ['vanilla', 'classic', 'light'],
    popularity: 85,
    isCustomizable: true,
  },

  // Wedding Cakes
  {
    name: 'Royal White Wedding',
    category: 'Wedding',
    description: 'Elegant white cake with gold leaf and fresh flowers',
    basePrice: 1999,
    flavors: ['Vanilla', 'White Chocolate'],
    tags: ['wedding', 'elegant', 'premium'],
    popularity: 92,
    isCustomizable: true,
  },
  {
    name: 'Champagne Celebration',
    category: 'Wedding',
    description: 'Light champagne-flavored cake with pearl sugar and edible glitter',
    basePrice: 2299,
    flavors: ['Champagne', 'Vanilla'],
    tags: ['wedding', 'luxury', 'celebration'],
    popularity: 89,
    isCustomizable: false,
  },
  {
    name: 'Rose Garden Wedding',
    category: 'Wedding',
    description: 'Pink rose-flavored cake with fondant roses and pearls',
    basePrice: 2199,
    flavors: ['Rose', 'Vanilla'],
    tags: ['wedding', 'romantic', 'pink'],
    popularity: 87,
    isCustomizable: true,
  },
  {
    name: 'Marble Elegance',
    category: 'Wedding',
    description: 'Marbled chocolate and vanilla with sophisticated design',
    basePrice: 1899,
    flavors: ['Chocolate', 'Vanilla'],
    tags: ['wedding', 'classic', 'elegant'],
    popularity: 85,
    isCustomizable: false,
  },

  // Anniversary Cakes
  {
    name: 'Dark Chocolate Anniversary',
    category: 'Anniversary',
    description: 'Dark chocolate cake with romantic messaging and gold accents',
    basePrice: 799,
    flavors: ['Dark Chocolate'],
    tags: ['anniversary', 'romantic', 'chocolate'],
    popularity: 88,
    isCustomizable: true,
  },
  {
    name: 'Red Velvet Romance',
    category: 'Anniversary',
    description: 'Rich red velvet cake with cream cheese frosting and rose petals',
    basePrice: 699,
    flavors: ['Red Velvet'],
    tags: ['anniversary', 'romantic', 'red'],
    popularity: 91,
    isCustomizable: true,
  },
  {
    name: 'Eggless Chocolate Anniversary',
    category: 'Anniversary',
    description: 'Luxurious eggless chocolate cake, perfect for all celebrations',
    basePrice: 649,
    flavors: ['Chocolate'],
    tags: ['eggless', 'vegan', 'chocolate'],
    popularity: 79,
    isCustomizable: true,
  },
  {
    name: 'Vanilla Silk Anniversary',
    category: 'Anniversary',
    description: 'Silky vanilla cake with delicate fondant work',
    basePrice: 599,
    flavors: ['Vanilla'],
    tags: ['anniversary', 'elegant', 'vanilla'],
    popularity: 80,
    isCustomizable: true,
  },

  // Occasions Cakes
  {
    name: 'Congratulations Cake',
    category: 'Occasions',
    description: 'Celebratory cake perfect for achievements and milestones',
    basePrice: 549,
    flavors: ['Chocolate', 'Vanilla'],
    tags: ['celebration', 'occasion', 'colorful'],
    popularity: 84,
    isCustomizable: true,
  },
  {
    name: 'Graduation Glory',
    category: 'Occasions',
    description: 'Educational themed cake with cap and gown decorations',
    basePrice: 649,
    flavors: ['Chocolate', 'Vanilla'],
    tags: ['graduation', 'celebration', 'academic'],
    popularity: 81,
    isCustomizable: true,
  },
  {
    name: 'Housewarming Paradise',
    category: 'Occasions',
    description: 'Warm and welcoming cake for new beginnings',
    basePrice: 599,
    flavors: ['Vanilla', 'Marble'],
    tags: ['housewarming', 'celebration', 'new'],
    popularity: 78,
    isCustomizable: true,
  },
  {
    name: 'Promotion Success',
    category: 'Occasions',
    description: 'Golden cake celebrating career achievements',
    basePrice: 699,
    flavors: ['Butterscotch', 'Chocolate'],
    tags: ['promotion', 'success', 'celebration'],
    popularity: 76,
    isCustomizable: true,
  },

  // Desserts
  {
    name: 'Chocolate Lava Dessert',
    category: 'Desserts',
    description: 'Warm chocolate cake with molten center and vanilla ice cream',
    basePrice: 399,
    flavors: ['Chocolate'],
    tags: ['dessert', 'chocolate', 'warm'],
    popularity: 92,
    isCustomizable: false,
  },
  {
    name: 'Cheesecake Delight',
    category: 'Desserts',
    description: 'Creamy New York style cheesecake with berry toppings',
    basePrice: 449,
    flavors: ['Cream Cheese', 'Vanilla'],
    tags: ['dessert', 'cheesecake', 'creamy'],
    popularity: 89,
    isCustomizable: false,
  },
  {
    name: 'Brownie Sundae Tower',
    category: 'Desserts',
    description: 'Fudgy brownie with ice cream and chocolate sauce',
    basePrice: 349,
    flavors: ['Chocolate'],
    tags: ['dessert', 'brownie', 'indulgent'],
    popularity: 87,
    isCustomizable: false,
  },
  {
    name: 'Tiramisu Elegance',
    category: 'Desserts',
    description: 'Traditional Italian tiramisu with layers of mascarpone and cocoa',
    basePrice: 499,
    flavors: ['Coffee', 'Mascarpone'],
    tags: ['dessert', 'tiramisu', 'italian'],
    popularity: 85,
    isCustomizable: false,
  },
  {
    name: 'Mousse Magic',
    category: 'Desserts',
    description: 'Light and airy chocolate mousse with fresh berries',
    basePrice: 379,
    flavors: ['Chocolate'],
    tags: ['dessert', 'mousse', 'light'],
    popularity: 80,
    isCustomizable: false,
  },

  // Customized Cakes
  {
    name: 'Custom Photo Cake',
    category: 'Customized',
    description: 'Your photo printed on an edible sheet on premium cake',
    basePrice: 899,
    flavors: ['Vanilla', 'Chocolate'],
    tags: ['custom', 'photo', 'personalized'],
    popularity: 93,
    isCustomizable: true,
  },
  {
    name: 'Name & Message Custom',
    category: 'Customized',
    description: 'Personalized cake with your custom message and design',
    basePrice: 749,
    flavors: ['Chocolate', 'Vanilla'],
    tags: ['custom', 'message', 'personalized'],
    popularity: 90,
    isCustomizable: true,
  },
  {
    name: 'Shape Customization',
    category: 'Customized',
    description: 'Heart, star, or any shape you desire with custom flavors',
    basePrice: 799,
    flavors: ['All Available'],
    tags: ['custom', 'shape', 'unique'],
    popularity: 88,
    isCustomizable: true,
  },
  {
    name: 'Theme Based Custom',
    category: 'Customized',
    description: 'Design a cake based on your favorite theme or character',
    basePrice: 999,
    flavors: ['Your Choice'],
    tags: ['custom', 'theme', 'design'],
    popularity: 85,
    isCustomizable: true,
  },

  // Hampers
  {
    name: 'Deluxe Chocolate Hamper',
    category: 'Hampers',
    description: 'Assorted chocolate cakes, brownies, and truffles gift set',
    basePrice: 1299,
    flavors: ['Chocolate'],
    tags: ['hamper', 'gift', 'premium'],
    popularity: 86,
    isCustomizable: false,
  },
  {
    name: 'Festival Celebration Hamper',
    category: 'Hampers',
    description: 'Mixed cake flavors with dry fruits and premium packaging',
    basePrice: 1599,
    flavors: ['Mixed'],
    tags: ['hamper', 'festival', 'gift'],
    popularity: 84,
    isCustomizable: false,
  },
  {
    name: 'Corporate Gifting Pack',
    category: 'Hampers',
    description: 'Professional hamper perfect for corporate events and clients',
    basePrice: 1999,
    flavors: ['Mixed'],
    tags: ['hamper', 'corporate', 'gift'],
    popularity: 81,
    isCustomizable: true,
  },
  {
    name: 'Family Love Bundle',
    category: 'Hampers',
    description: 'Multiple mini cakes for the whole family to enjoy',
    basePrice: 1099,
    flavors: ['Assorted'],
    tags: ['hamper', 'family', 'variety'],
    popularity: 79,
    isCustomizable: false,
  },
];

async function seedVendors() {
  console.log('Creating vendors...');

  const vendors = await Promise.all([
    prisma.vendor.upsert({
      where: { slug: 'sweet-dreams-bakery' },
      update: {},
      create: {
        name: 'Sweet Dreams Bakery',
        slug: 'sweet-dreams-bakery',
        description: 'Premium artisanal cakes and pastries since 2015',
        minOrderAmount: 299,
        preparationTime: 180,
        isActive: true,
        rating: 4.8,
        totalReviews: 245,
        verificationStatus: 'verified',
      },
    }),
    prisma.vendor.upsert({
      where: { slug: 'cake-studio-pro' },
      update: {},
      create: {
        name: 'Cake Studio Pro',
        slug: 'cake-studio-pro',
        description: 'Modern cake designs with premium ingredients',
        minOrderAmount: 399,
        preparationTime: 240,
        isActive: true,
        rating: 4.7,
        totalReviews: 189,
        verificationStatus: 'verified',
      },
    }),
    prisma.vendor.upsert({
      where: { slug: 'divine-delights' },
      update: {},
      create: {
        name: 'Divine Delights',
        slug: 'divine-delights',
        description: 'Luxurious cakes for special occasions',
        minOrderAmount: 499,
        preparationTime: 300,
        isActive: true,
        rating: 4.9,
        totalReviews: 312,
        verificationStatus: 'verified',
      },
    }),
    prisma.vendor.upsert({
      where: { slug: 'bakers-paradise' },
      update: {},
      create: {
        name: "Baker's Paradise",
        slug: 'bakers-paradise',
        description: 'Traditional and modern cake varieties',
        minOrderAmount: 349,
        preparationTime: 200,
        isActive: true,
        rating: 4.6,
        totalReviews: 156,
        verificationStatus: 'verified',
      },
    }),
    prisma.vendor.upsert({
      where: { slug: 'sugar-spice' },
      update: {},
      create: {
        name: 'Sugar & Spice',
        slug: 'sugar-spice',
        description: 'Eggless and vegan cake options available',
        minOrderAmount: 299,
        preparationTime: 150,
        isActive: true,
        rating: 4.7,
        totalReviews: 203,
        verificationStatus: 'verified',
      },
    }),
  ]);

  return vendors;
}

async function seedCakes() {
  console.log('Creating cakes...');

  const vendors = await prisma.vendor.findMany();
  let vendorIndex = 0;

  for (const cakeData of cakesData) {
    const vendor = vendors[vendorIndex % vendors.length];
    const imageArray = cakeImages[cakeData.category.toLowerCase().replace(' ', '-') as keyof typeof cakeImages] || cakeImages.birthday;

    try {
      await prisma.cake.upsert({
        where: {
          vendorId_slug: {
            vendorId: vendor.id,
            slug: cakeData.name.toLowerCase().replace(/\s+/g, '-'),
          },
        },
        update: {},
        create: {
          vendorId: vendor.id,
          name: cakeData.name,
          slug: cakeData.name.toLowerCase().replace(/\s+/g, '-'),
          description: cakeData.description,
          basePrice: cakeData.basePrice,
          category: cakeData.category,
          flavors: cakeData.flavors,
          images: imageArray,
          tags: cakeData.tags,
          popularity: cakeData.popularity,
          isCustomizable: cakeData.isCustomizable,
          isActive: true,
          availableSizes: [
            { size: '0.5kg', price: Math.round(cakeData.basePrice * 0.7) },
            { size: '1kg', price: cakeData.basePrice },
            { size: '1.5kg', price: Math.round(cakeData.basePrice * 1.4) },
            { size: '2kg', price: Math.round(cakeData.basePrice * 1.8) },
          ],
        },
      });

      console.log(`✓ Created: ${cakeData.name}`);
    } catch (error) {
      console.error(`Error creating cake ${cakeData.name}:`, error);
    }

    vendorIndex++;
  }
}

async function seedReviews() {
  console.log('Adding reviews...');

  const cakes = await prisma.cake.findMany();
  const reviewTexts = [
    'Absolutely delicious! Will order again.',
    'Best cake I have ever tasted!',
    'Perfect presentation and taste.',
    'Highly recommended for special occasions.',
    'Amazing quality and fresh ingredients.',
    'Customer service was excellent.',
    'Exactly as shown in the picture.',
    'Worth every penny!',
    'Delivered on time and in perfect condition.',
    'My guests loved it!',
  ];

  for (const cake of cakes) {
    const reviewCount = Math.floor(Math.random() * 15) + 5; // 5-20 reviews per cake

    for (let i = 0; i < reviewCount; i++) {
      try {
        await prisma.cakeReview.create({
          data: {
            cakeId: cake.id,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
            userName: `Customer${Math.floor(Math.random() * 10000)}`,
            userEmail: `customer${Math.floor(Math.random() * 10000)}@example.com`,
          },
        });
      } catch (error) {
        // Ignore duplicate reviews
      }
    }
  }

  console.log('✓ Added reviews to cakes');
}

async function main() {
  try {
    console.log('🌱 Starting database seed...\n');

    await seedVendors();
    console.log('✓ Vendors created\n');

    await seedCakes();
    console.log('✓ Cakes created\n');

    await seedReviews();
    console.log('✓ Reviews created\n');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
