const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/hashPassword');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing users
  console.log('Clearing existing users...');
  await prisma.user.deleteMany();

  // Create sample users with different roles
  const users = [
    {
      name: 'Admin User',
      email: 'admin@library.com',
      password: 'Admin123!',
      role: 'ADMIN'
    },
    {
      name: 'Librarian User',
      email: 'librarian@library.com',
      password: 'Librarian123!',
      role: 'LIBRARIAN'
    },
    {
      name: 'Regular User',
      email: 'user@library.com',
      password: 'User123!',
      role: 'USER'
    },
    {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'USER'
    }
  ];

  console.log(`Creating ${users.length} sample users...`);
  for (const user of users) {
    const hashed = await hashPassword(user.password);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashed,
        role: user.role
      }
    });
    console.log(`✓ Created ${user.role}: ${user.email}`);
  }

  console.log('\nSeeding completed successfully!');
  console.log('\nSample credentials:');
  console.log('Admin:     admin@library.com / Admin123!');
  console.log('Librarian: librarian@library.com / Librarian123!');
  console.log('User:      user@library.com / User123!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
