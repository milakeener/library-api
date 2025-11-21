function getPrisma() {
  const { PrismaClient } = require('@prisma/client');
  return new PrismaClient();
}

// GET /authors
async function getAllAuthors(req, res) {
  const prisma = getPrisma();
  try {
    const authors = await prisma.author.findMany({
      include: {
        books: true,
      },
    });
    await prisma.$disconnect();
    return res.json(authors);
  } catch (err) {
    console.error(err);
    try { await prisma.$disconnect(); } catch (e) {}
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /authors/:id
async function getAuthorById(req, res) {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid author id' });
  }

  const prisma = getPrisma();
  try {
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    await prisma.$disconnect();

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.json(author);
  } catch (err) {
    console.error(err);
    try { await prisma.$disconnect(); } catch (e) {}
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /authors
async function createAuthor(req, res) {
  const { name, bio } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  const prisma = getPrisma();
  try {
    const newAuthor = await prisma.author.create({
      data: {
        name,
        bio: bio ?? null,
      },
    });

    await prisma.$disconnect();
    return res.status(201).json(newAuthor);
  } catch (err) {
    console.error(err);
    try { await prisma.$disconnect(); } catch (e) {}
    return res.status(500).json({ message: 'Server error' });
  }
}

// PUT /authors/:id
async function updateAuthor(req, res) {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid author id' });
  }

  const { name, bio } = req.body || {};

  if (name === undefined && bio === undefined) {
    return res
      .status(400)
      .json({ message: 'At least one of name or bio must be provided' });
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (bio !== undefined) data.bio = bio;

  const prisma = getPrisma();
  try {
    const updatedAuthor = await prisma.author.update({
      where: { id },
      data,
    });

    await prisma.$disconnect();
    return res.json(updatedAuthor);
  } catch (err) {
    console.error(err);
    // Prisma's "record not found" code
    if (err.code === 'P2025') {
      try { await prisma.$disconnect(); } catch (e) {}
      return res.status(404).json({ message: 'Author not found' });
    }
    try { await prisma.$disconnect(); } catch (e) {}
    return res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /authors/:id
async function deleteAuthor(req, res) {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid author id' });
  }

  const prisma = getPrisma();
  try {
    // Prevent deleting an author that still has books
    const booksCount = await prisma.book.count({
      where: { authorId: id },
    });

    if (booksCount > 0) {
      await prisma.$disconnect();
      return res.status(400).json({
        message: 'Cannot delete author with existing books',
      });
    }

    await prisma.author.delete({
      where: { id },
    });

    await prisma.$disconnect();
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') {
      try { await prisma.$disconnect(); } catch (e) {}
      return res.status(404).json({ message: 'Author not found' });
    }
    try { await prisma.$disconnect(); } catch (e) {}
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};