import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Comprehensive cake data based on Bakingo structure
const cakeDataByCategory = {
  'Cakes': [
    // Trending Cakes (Ribbon Cakes)
    { name: 'Pink Ribbon Delight', cakeType: 'Ribbon Cakes', flavor: 'Vanilla', deliveryCity: 'Bangalore', basePrice: 599, description: 'Elegant pink ribbon cake with fresh vanilla cream' },
    { name: 'Red Ribbon Celebration', cakeType: 'Ribbon Cakes', flavor: 'Chocolate', deliveryCity: 'Delhi', basePrice: 649, description: 'Beautiful red ribbon chocolate cake' },
    { name: 'Gold Ribbon Luxury', cakeType: 'Ribbon Cakes', flavor: 'Vanilla', deliveryCity: 'Mumbai', basePrice: 699, description: 'Luxurious gold ribbon cake' },
    
    // Fresh Drops
    { name: 'Strawberry Drops', cakeType: 'Fresh Drops', flavor: 'Strawberry', deliveryCity: 'Bangalore', basePrice: 499, description: 'Fresh strawberry drops on vanilla sponge' },
    { name: 'Blueberry Drops', cakeType: 'Fresh Drops', flavor: 'Blueberry', deliveryCity: 'Mumbai', basePrice: 549, description: 'Delicious blueberry fresh drops' },
    { name: 'Mango Drops', cakeType: 'Fresh Drops', flavor: 'Mango', deliveryCity: 'Hyderabad', basePrice: 549, description: 'Tropical mango drops' },
    
    // Gourmet Cakes
    { name: 'Swiss Mocha Gourmet', cakeType: 'Gourmet Cakes', flavor: 'Coffee', deliveryCity: 'Hyderabad', basePrice: 899, description: 'Premium Swiss mocha gourmet cake' },
    { name: 'Hazelnut Delight', cakeType: 'Gourmet Cakes', flavor: 'Hazelnut', deliveryCity: 'Gurgaon', basePrice: 799, description: 'Exclusive hazelnut gourmet creation' },
    { name: 'Pistachio Elegance', cakeType: 'Gourmet Cakes', flavor: 'Pistachio', deliveryCity: 'Delhi', basePrice: 849, description: 'Premium pistachio gourmet cake' },
    
    // Bento Cakes
    { name: 'Bento Box Classic', cakeType: 'Bento Cakes', flavor: 'Chocolate', deliveryCity: 'Bangalore', basePrice: 699, description: 'Japanese-style bento cake with chocolate' },
    { name: 'Matcha Bento', cakeType: 'Bento Cakes', flavor: 'Matcha', deliveryCity: 'Chennai', basePrice: 749, description: 'Traditional matcha bento cake' },
    { name: 'Strawberry Bento', cakeType: 'Bento Cakes', flavor: 'Strawberry', deliveryCity: 'Pune', basePrice: 699, description: 'Fresh strawberry bento cake' },
    
    // Camera Cakes
    { name: 'Photo Perfect Cake', cakeType: 'Camera Cakes', flavor: 'Vanilla', deliveryCity: 'Noida', basePrice: 1299, description: 'Custom photo cake for your memories' },
    { name: 'Polaroid Style Cake', cakeType: 'Camera Cakes', flavor: 'Chocolate', deliveryCity: 'Pune', basePrice: 1399, description: 'Vintage polaroid style photo cake' },
    { name: '3D Photo Cake', cakeType: 'Camera Cakes', flavor: 'Strawberry', deliveryCity: 'Jaipur', basePrice: 1499, description: '3D custom photo cake' },
    
    // Anime Cakes
    { name: 'Anime Hero Cake', cakeType: 'Anime Cakes', flavor: 'Vanilla', deliveryCity: 'Mumbai', basePrice: 999, description: 'Your favorite anime character on cake' },
    { name: 'Manga Character Cake', cakeType: 'Anime Cakes', flavor: 'Chocolate', deliveryCity: 'Bangalore', basePrice: 1099, description: 'Manga-inspired custom cake' },
    { name: 'Chibi Style Cake', cakeType: 'Anime Cakes', flavor: 'Strawberry', deliveryCity: 'Gurgaon', basePrice: 999, description: 'Cute chibi-style anime cake' },
    
    // Labubu Cakes
    { name: 'Cute Labubu Cake', cakeType: 'Labubu Cakes', flavor: 'Strawberry', deliveryCity: 'Delhi', basePrice: 849, description: 'Adorable labubu character cake' },
    { name: 'Labubu Pink Dream', cakeType: 'Labubu Cakes', flavor: 'Vanilla', deliveryCity: 'Hyderabad', basePrice: 799, description: 'Pink Labubu themed cake' },
    { name: 'Labubu Party Cake', cakeType: 'Labubu Cakes', flavor: 'Chocolate', deliveryCity: 'Chennai', basePrice: 799, description: 'Labubu party celebration cake' },
    
    // Cricket Cakes
    { name: 'Cricket Fan Cake', cakeType: 'Cricket Cakes', flavor: 'Chocolate', deliveryCity: 'Bangalore', basePrice: 749, description: 'Perfect cake for cricket lovers' },
    { name: 'Trophy Victory Cake', cakeType: 'Cricket Cakes', flavor: 'Vanilla', deliveryCity: 'Mumbai', basePrice: 699, description: 'Celebrate cricket victory with this cake' },
    { name: 'Cricket Ball Cake', cakeType: 'Cricket Cakes', flavor: 'Strawberry', deliveryCity: 'Delhi', basePrice: 749, description: 'Cricket ball shaped cake' },
    
    // Pinata Cakes
    { name: 'Surprise Pinata Cake', cakeType: 'Pinata Cakes', flavor: 'Vanilla', deliveryCity: 'Gurgaon', basePrice: 899, description: 'Burst of surprise with pinata cake' },
    { name: 'Rainbow Pinata', cakeType: 'Pinata Cakes', flavor: 'Chocolate', deliveryCity: 'Pune', basePrice: 949, description: 'Colorful rainbow pinata cake' },
    { name: 'Candy Pinata Cake', cakeType: 'Pinata Cakes', flavor: 'Strawberry', deliveryCity: 'Noida', basePrice: 999, description: 'Candy-filled pinata cake' },
    
    // Drip Cakes
    { name: 'Chocolate Drip Luxe', cakeType: 'Drip Cakes', flavor: 'Chocolate', deliveryCity: 'Bangalore', basePrice: 799, description: 'Luxurious chocolate drip cake' },
    { name: 'Gold Drip Elegance', cakeType: 'Drip Cakes', flavor: 'Vanilla', deliveryCity: 'Delhi', basePrice: 849, description: 'Elegant gold drip on white cake' },
    { name: 'Rainbow Drip', cakeType: 'Drip Cakes', flavor: 'Vanilla', deliveryCity: 'Mumbai', basePrice: 899, description: 'Colorful rainbow drip cake' },

    // By Type - Bestsellers
    { name: 'Bestseller Chocolate Truffle', cakeType: 'Bestsellers', flavor: 'Chocolate', deliveryCity: 'Mumbai', basePrice: 599, description: 'Our most loved chocolate truffle cake' },
    { name: 'Best-Seller Vanilla', cakeType: 'Bestsellers', flavor: 'Vanilla', deliveryCity: 'Bangalore', basePrice: 549, description: 'Best-selling vanilla cake' },
    { name: 'Popular Strawberry', cakeType: 'Bestsellers', flavor: 'Strawberry', deliveryCity: 'Delhi', basePrice: 599, description: 'Popular strawberry bestseller' },
    
    // Eggless Cakes
    { name: 'Eggless Vanilla Bliss', cakeType: 'Eggless Cakes', flavor: 'Vanilla', deliveryCity: 'Hyderabad', basePrice: 549, description: '100% eggless vanilla cake' },
    { name: 'Eggless Chocolate Heaven', cakeType: 'Eggless Cakes', flavor: 'Chocolate', deliveryCity: 'Chennai', basePrice: 599, description: 'Rich eggless chocolate cake' },
    { name: 'Eggless Strawberry', cakeType: 'Eggless Cakes', flavor: 'Strawberry', deliveryCity: 'Gurgaon', basePrice: 549, description: 'Eggless strawberry cake' },
    
    // Photo Cakes
    { name: 'Photo Memory Cake', cakeType: 'Photo Cakes', flavor: 'Vanilla', deliveryCity: 'Bangalore', basePrice: 1299, description: 'Personalized photo cake' },
    { name: 'HD Photo Print Cake', cakeType: 'Photo Cakes', flavor: 'Chocolate', deliveryCity: 'Mumbai', basePrice: 1399, description: 'HD quality photo print cake' },
    
    // Cheese Cakes
    { name: 'Classic Cheesecake', cakeType: 'Cheese Cakes', flavor: 'Cheesecake', deliveryCity: 'Delhi', basePrice: 699, description: 'Traditional New York cheesecake' },
    { name: 'Strawberry Cheese Cake', cakeType: 'Cheese Cakes', flavor: 'Strawberry', deliveryCity: 'Gurgaon', basePrice: 749, description: 'Strawberry topped cheesecake' },
    { name: 'Blueberry Cheesecake', cakeType: 'Cheese Cakes', flavor: 'Blueberry', deliveryCity: 'Pune', basePrice: 749, description: 'Fresh blueberry cheesecake' },
    
    // Half Cakes
    { name: 'Half Chocolate Cake', cakeType: 'Half Cakes', flavor: 'Chocolate', deliveryCity: 'Noida', basePrice: 349, description: 'Perfect half-size chocolate cake' },
    { name: 'Half Vanilla Cake', cakeType: 'Half Cakes', flavor: 'Vanilla', deliveryCity: 'Pune', basePrice: 299, description: 'Half-size vanilla cake' },
    { name: 'Half Strawberry Cake', cakeType: 'Half Cakes', flavor: 'Strawberry', deliveryCity: 'Chandigarh', basePrice: 349, description: 'Half-size strawberry cake' },
    
    // Heart Shaped Cakes
    { name: 'Red Love Heart', cakeType: 'Heart Shaped Cakes', flavor: 'Chocolate', deliveryCity: 'Mumbai', basePrice: 899, description: 'Heart-shaped romantic cake' },
    { name: 'Pink Love Heart', cakeType: 'Heart Shaped Cakes', flavor: 'Strawberry', deliveryCity: 'Bangalore', basePrice: 849, description: 'Pink heart-shaped strawberry cake' },
    { name: 'White Love Heart', cakeType: 'Heart Shaped Cakes', flavor: 'Vanilla', deliveryCity: 'Delhi', basePrice: 799, description: 'White heart-shaped vanilla cake' },
    
    // Rose Cakes
    { name: 'Rose Garden Cake', cakeType: 'Rose Cakes', flavor: 'Vanilla', deliveryCity: 'Hyderabad', basePrice: 799, description: 'Beautiful rose-decorated cake' },
    { name: 'Red Roses Romance', cakeType: 'Rose Cakes', flavor: 'Chocolate', deliveryCity: 'Chennai', basePrice: 849, description: 'Red roses on chocolate cake' },
    { name: 'Pink Roses Bliss', cakeType: 'Rose Cakes', flavor: 'Strawberry', deliveryCity: 'Jaipur', basePrice: 799, description: 'Pink roses on strawberry cake' },

    // By Flavours
    { name: 'Chocolate Dream', flavor: 'Chocolate', category: 'Cakes', deliveryCity: 'Bangalore', basePrice: 599, description: 'Ultimate chocolate dream cake' },
    { name: 'Butterscotch Crunch', flavor: 'Butterscotch', category: 'Cakes', deliveryCity: 'Delhi', basePrice: 549, description: 'Crunchy butterscotch cake' },
    { name: 'Strawberry Delight', flavor: 'Strawberry', category: 'Cakes', deliveryCity: 'Mumbai', basePrice: 549, description: 'Fresh strawberry cake' },
    { name: 'Pineapple Paradise', flavor: 'Pineapple', category: 'Cakes', deliveryCity: 'Hyderabad', basePrice: 499, description: 'Tropical pineapple cake' },
    { name: 'Kit Kat Crush', flavor: 'Kit Kat', category: 'Cakes', deliveryCity: 'Gurgaon', basePrice: 699, description: 'Kit Kat lover\'s cake' },
    { name: 'Black Forest Dream', flavor: 'Black Forest', category: 'Cakes', deliveryCity: 'Noida', basePrice: 799, description: 'Classic black forest cake' },
    { name: 'Red Velvet Passion', flavor: 'Red Velvet', category: 'Cakes', deliveryCity: 'Pune', basePrice: 649, description: 'Elegant red velvet cake' },
    { name: 'Pure Vanilla', flavor: 'Vanilla', category: 'Cakes', deliveryCity: 'Chennai', basePrice: 449, description: 'Classic pure vanilla cake' },
    { name: 'Fruit Medley Cake', flavor: 'Mixed Fruits', category: 'Cakes', deliveryCity: 'Chandigarh', basePrice: 599, description: 'Assorted fruits cake' },
    { name: 'Blueberry Blast', flavor: 'Blueberry', category: 'Cakes', deliveryCity: 'Jaipur', basePrice: 549, description: 'Fresh blueberry cake' },
  ],
  'Theme Cakes': [
    { name: 'Butterfly Dream', category: 'Theme Cakes', flavor: 'Vanilla', deliveryCity: 'Bangalore', basePrice: 799, description: 'Beautiful butterfly-themed cake' },
    { name: 'Garden Paradise', category: 'Theme Cakes', flavor: 'Strawberry', deliveryCity: 'Delhi', basePrice: 899, description: 'Garden-themed decorated cake' },
    { name: 'Ocean Blue', category: 'Theme Cakes', flavor: 'Blueberry', deliveryCity: 'Mumbai', basePrice: 749, description: 'Ocean-themed blue cake' },
    { name: 'Forest Fantasy', category: 'Theme Cakes', flavor: 'Chocolate', deliveryCity: 'Hyderabad', basePrice: 849, description: 'Forest-themed chocolate cake' },
  ],
  'By Relationship': [
    { name: 'Love Forever Cake', category: 'By Relationship', flavor: 'Chocolate', deliveryCity: 'Bangalore', basePrice: 899, description: 'Perfect cake to express love' },
    { name: 'Friends Forever', category: 'By Relationship', flavor: 'Vanilla', deliveryCity: 'Delhi', basePrice: 749, description: 'Cake for best friends' },
    { name: 'Sister Bond Cake', category: 'By Relationship', flavor: 'Strawberry', deliveryCity: 'Mumbai', basePrice: 799, description: 'Special cake for sister' },
  ],
  'Desserts': [
    { name: 'Chocolate Mousse', category: 'Desserts', flavor: 'Chocolate', deliveryCity: 'Mumbai', basePrice: 399, description: 'Rich chocolate mousse' },
    { name: 'Tiramisu Delight', category: 'Desserts', flavor: 'Coffee', deliveryCity: 'Bangalore', basePrice: 449, description: 'Classic tiramisu dessert' },
    { name: 'Brownie Delight', category: 'Desserts', flavor: 'Chocolate', deliveryCity: 'Delhi', basePrice: 399, description: 'Fudgy brownie dessert' },
  ],
  'Birthday': [
    { name: 'Birthday Bash Chocolate', category: 'Birthday', flavor: 'Chocolate', deliveryCity: 'Hyderabad', basePrice: 799, description: 'Perfect birthday celebration cake' },
    { name: 'Birthday Bliss Vanilla', category: 'Birthday', flavor: 'Vanilla', deliveryCity: 'Gurgaon', basePrice: 699, description: 'Birthday cake with joy' },
    { name: 'Number Cake Birthday', category: 'Birthday', flavor: 'Chocolate', deliveryCity: 'Noida', basePrice: 1099, description: 'Custom number cake for birthday' },
    { name: 'Confetti Birthday Cake', category: 'Birthday', flavor: 'Strawberry', deliveryCity: 'Pune', basePrice: 849, description: 'Confetti-filled birthday cake' },
  ],
  'Hampers': [
    { name: 'Cake & Dessert Hamper', category: 'Hampers', flavor: 'Mixed', deliveryCity: 'Pune', basePrice: 1499, description: 'Delicious cake with desserts hamper' },
    { name: 'Premium Gift Hamper', category: 'Hampers', flavor: 'Mixed', deliveryCity: 'Chennai', basePrice: 1999, description: 'Luxurious premium hamper' },
    { name: 'Sweet Treats Hamper', category: 'Hampers', flavor: 'Mixed', deliveryCity: 'Bangalore', basePrice: 1699, description: 'Complete sweet treats hamper' },
  ],
  'Anniversary': [
    { name: 'Anniversary Chocolate Romance', category: 'Anniversary', flavor: 'Chocolate', deliveryCity: 'Chandigarh', basePrice: 999, description: 'Romantic anniversary cake' },
    { name: 'Golden Anniversary Cake', category: 'Anniversary', flavor: 'Vanilla', deliveryCity: 'Jaipur', basePrice: 899, description: 'Golden anniversary celebration cake' },
    { name: 'Love You Forever', category: 'Anniversary', flavor: 'Strawberry', deliveryCity: 'Delhi', basePrice: 949, description: 'Forever love anniversary cake' },
  ],
  'Occasions': [
    { name: 'Celebration Cake', category: 'Occasions', flavor: 'Vanilla', deliveryCity: 'Bangalore', basePrice: 699, description: 'Perfect for any occasion' },
    { name: 'Festival Special Cake', category: 'Occasions', flavor: 'Chocolate', deliveryCity: 'Delhi', basePrice: 749, description: 'Special festival cake' },
    { name: 'Success Celebration', category: 'Occasions', flavor: 'Strawberry', deliveryCity: 'Mumbai', basePrice: 799, description: 'Celebrate your success' },
  ],
  'Customized Cakes': [
    { name: 'Your Custom Design', category: 'Customized Cakes', flavor: 'Vanilla', deliveryCity: 'Mumbai', basePrice: 1499, description: 'Fully customizable cake' },
    { name: 'Bespoke Creation', category: 'Customized Cakes', flavor: 'Chocolate', deliveryCity: 'Bangalore', basePrice: 1699, description: 'Your dream cake designed' },
    { name: 'Personal Signature Cake', category: 'Customized Cakes', flavor: 'Strawberry', deliveryCity: 'Delhi', basePrice: 1599, description: 'Signature custom cake' },
  ],
};

async function main() {
  console.log('🚀 Starting comprehensive database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.order.deleteMany({});
  await prisma.cake.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.vendor.deleteMany({});

  // Create vendors
  console.log('Creating vendors...');
  const vendors = [];
  const vendorNames = ['Sweet Delights Bakery', 'Cake Paradise', 'Artisan Cakes', 'The Cake Studio', 'Heavenly Bakes', 'Sugar Rush Bakery'];
  
  for (let i = 0; i < vendorNames.length; i++) {
    const vendor = await prisma.vendor.create({
      data: {
        name: vendorNames[i],
        slug: vendorNames[i].toLowerCase().replace(/\s/g, '-'),
        preparationTime: 30 + i * 10,
        minOrderAmount: 500,
        isActive: true,
        approvalStatus: 'approved',
        rating: 4.5 + Math.random() * 0.5,
        totalReviews: 20 + Math.floor(Math.random() * 50),
      },
    });
    vendors.push(vendor);
  }

  // Create cakes for all categories
  console.log('Creating cakes for all categories...');
  let cakeCount = 0;
  
  for (const [category, cakes] of Object.entries(cakeDataByCategory)) {
    console.log(`  Creating cakes for "${category}" (${cakes.length} items)...`);
    
    for (const cakeData of cakes) {
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      
      await prisma.cake.create({
        data: {
          name: cakeData.name,
          slug: `${cakeData.name.toLowerCase().replace(/\s/g, '-')}-${vendor.id.slice(0, 5)}`,
          vendorId: vendor.id,
          description: cakeData.description,
          basePrice: cakeData.basePrice,
          category: category,
          cakeType: (cakeData as any).cakeType || undefined,
          flavor: cakeData.flavor,
          deliveryCity: cakeData.deliveryCity,
          images: [
            'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
          ],
          isActive: true,
          availableSizes: {
            half: Math.round(cakeData.basePrice * 0.6),
            full: cakeData.basePrice,
            custom: cakeData.basePrice + 300,
          },
          flavors: [cakeData.flavor],
          isCustomizable: Math.random() > 0.3,
          customOptions: {
            toppings: ['Sprinkles', 'Chocolate Chips', 'Fruits', 'Nuts'],
            frostings: ['Buttercream', 'Fondant', 'Whipped Cream', 'Ganache'],
            messages: true,
          },
          tags: ['popular', 'bestseller', 'trending', 'new'].filter(() => Math.random() > 0.6),
          popularity: Math.floor(Math.random() * 100),
          rating: 4.0 + Math.random() * 1.0,
          reviewCount: Math.floor(Math.random() * 100),
        },
      });
      cakeCount++;
    }
  }

  console.log(`✅ Created ${cakeCount} cakes across all categories`);

  // Create users
  console.log('Creating users...');
  await prisma.user.create({
    data: {
      name: 'Customer User',
      email: 'customer@purblepalace.in',
      phone: '9876543210',
    },
  });

  // Create accounts
  console.log('Creating accounts...');
  const adminHash = await bcrypt.hash('admin123', 10);
  const vendorHash = await bcrypt.hash('vendor123', 10);

  await prisma.account.create({
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

  await prisma.account.create({
    data: {
      email: 'vendor@purblepalace.in',
      password: vendorHash,
      name: 'Vendor User',
      role: 'vendor',
      vendorId: vendors[0].id,
    },
  });

  console.log('\n✅ Seed completed successfully!');
  console.log('\nTest Credentials:');
  console.log('  Admin: admin@purblepalace.in / admin123');
  console.log('  Vendor: vendor@purblepalace.in / vendor123');
  console.log('\nDatabase populated with:');
  console.log(`  - ${vendors.length} vendors`);
  console.log(`  - ${cakeCount} cakes`);
  console.log(`  - 1 customer user`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
