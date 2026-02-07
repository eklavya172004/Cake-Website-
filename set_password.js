const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    const email = 'optimusprime172004@gmail.com';
    const newPassword = 'vendor123';

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log(`\n🔄 Setting password for: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Hashed: ${hashedPassword}\n`);

    const account = await prisma.account.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log('✅ Password updated successfully!');
    console.log(`   Email: ${account.email}`);
    console.log(`   Role: ${account.role}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
