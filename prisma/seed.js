const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/hashPassword');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data in FK-safe order
  console.log('Clearing existing users...');
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
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

  // Fetch one of the users to use for the review (Regular User)
  const regularUser = await prisma.user.findUnique({
    where: { email: 'user@library.com' },
  });

  // Create an author
  console.log('\nCreating sample author...');
  const author = await prisma.author.create({
    data: {
      name: 'Frank Herbert',
      bio: 'American science-fiction author best known for the novel Dune.',
    },
  });
  console.log(`✓ Created author: ${author.name} (id: ${author.id})`);

  // Create a book linked to that author
  console.log('\nCreating sample book...');
  const book = await prisma.book.create({
    data: {
      title: 'Dune',
      genre: 'Science Fiction',
      authorId: author.id,
      reviewScore: 4.5,
    },
  });
  console.log(`✓ Created book: ${book.title} (id: ${book.id})`);

  // Create a review linked to the book and the regular user
  console.log('\nCreating sample review...');
  const review = await prisma.review.create({
    data: {
      rating: 5,
      comment: 'An incredible sci-fi epic with deep world-building.',
      bookId: book.id,
      userId: regularUser.id,
    },
  });
  console.log(
    `✓ Created review (rating: ${review.rating}) for book id ${book.id} by user id ${regularUser.id}`
  );

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
