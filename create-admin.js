const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@purblepalace.com';
    const password = 'purble2028';

    // Check if admin already exists
    const existingAdmin = await prisma.account.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log('❌ Admin account already exists with this email');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminId = `admin-${Date.now()}`;

    // Create admin account
    const admin = await prisma.account.create({
      data: {
        id: adminId,
        email,
        password: hashedPassword,
        name: 'Admin',
        phone: '0000000000',
        role: 'admin',
        isVerified: true,
        isActive: true,
      },
    });

    console.log('✅ Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 Admin ID: ${adminId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
