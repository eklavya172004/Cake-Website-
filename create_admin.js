const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@purblepalace.in';
    const password = 'admin123';
    
    // Check if admin already exists
    const existing = await prisma.account.findUnique({ where: { email } });
    if (existing) {
      console.log('❌ Admin account already exists:', email);
      await prisma.$disconnect();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin account
    const admin = await prisma.account.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isAdmin: true,
        adminRole: 'super_admin',
        isActive: true,
        isVerified: true,
      }
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Role:', admin.role);
    console.log('   Admin Role:', admin.adminRole);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
