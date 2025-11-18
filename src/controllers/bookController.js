function getPrisma() {
	const { PrismaClient } = require('@prisma/client');
	return new PrismaClient();
}

// GET /books
async function getAllBooks(req, res) {
	const prisma = getPrisma();
	try {
		const books = await prisma.book.findMany({
			include: {
				author: true,
				reviews: true,
			},
		});
		await prisma.$disconnect();
		return res.json(books);
	} catch (err) {
		console.error(err);
		try { await prisma.$disconnect(); } catch (e) {}
		return res.status(500).json({ message: 'Server error' });
	}
}

// GET /books/:id
async function getBookById(req, res) {
	const id = parseInt(req.params.id, 10);
	if (Number.isNaN(id)) {
		return res.status(400).json({ message: 'Invalid book id' });
	}

	const prisma = getPrisma();
	try {
		const book = await prisma.book.findUnique({
			where: { id },
			include: {
				author: true,
				reviews: true,
			},
		});

		if (!book) {
			await prisma.$disconnect();
			return res.status(404).json({ message: 'Book not found' });
		}

		await prisma.$disconnect();
		return res.json(book);
	} catch (err) {
		console.error(err);
		try { await prisma.$disconnect(); } catch (e) {}
		return res.status(500).json({ message: 'Server error' });
	}
}

// POST /books
async function createBook(req, res) {
  const { title, genre, authorId, reviewScore } = req.body || {};

  if (!title || authorId === undefined) {
    return res.status(400).json({ message: 'title and authorId are required' });
  }

  const authorIdInt = parseInt(authorId, 10);
  if (Number.isNaN(authorIdInt)) {
    return res.status(400).json({ message: 'authorId must be a number' });
  }

  const prisma = getPrisma();
  try {
    const existingAuthor = await prisma.author.findUnique({
      where: { id: authorIdInt },
    });

    if (!existingAuthor) {
      await prisma.$disconnect();
      return res.status(400).json({ message: 'authorId does not refer to a valid author' });
    }

    const newBook = await prisma.book.create({
      data: {
        title,
        genre: genre ?? null,
        authorId: authorIdInt,
        // optional – if omitted, Prisma default(0) is used
        ...(reviewScore !== undefined && { reviewScore }),
      },
    });

    await prisma.$disconnect();
    return res.status(201).json(newBook);
  } catch (err) {
    console.error(err);
    try { await prisma.$disconnect(); } catch (e) {}
    return res.status(500).json({ message: 'Server error' });
  }
}

// PUT /books/:id
async function updateBook(req, res) {
	const id = parseInt(req.params.id, 10);
	if (Number.isNaN(id)) {
		return res.status(400).json({ message: 'Invalid book id' });
	}

	const { title, genre, authorId, reviewScore } = req.body || {};

	const data = {};

	if (title !== undefined) data.title = title;
	if (genre !== undefined) data.genre = genre;
	if (authorId !== undefined) {
		const authorIdInt = parseInt(authorId, 10);
		if (Number.isNaN(authorIdInt)) {
			return res.status(400).json({ message: 'authorId must be a number' });
		}
		data.authorId = authorIdInt;
	}
	if (reviewScore !== undefined) data.reviewScore = reviewScore;

	if (Object.keys(data).length === 0) {
		return res.status(400).json({ message: 'No fields provided to update' });
	}

	const prisma = getPrisma();
	try {
		const updated = await prisma.book.update({
			where: { id },
			data,
		});

		await prisma.$disconnect();
		return res.json(updated);
	} catch (err) {
		console.error(err);
		// Prisma "record not found" error
		if (err.code === 'P2025') {
			try { await prisma.$disconnect(); } catch (e) {}
			return res.status(404).json({ message: 'Book not found' });
		}
		try { await prisma.$disconnect(); } catch (e) {}
		return res.status(500).json({ message: 'Server error' });
	}
}

// DELETE /books/:id
async function deleteBook(req, res) {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid book id' });
  }

  const prisma = getPrisma();
  try {
    // First delete all reviews for this book to satisfy FK constraint
    await prisma.review.deleteMany({
      where: { bookId: id },
    });

    // Then delete the book itself
    await prisma.book.delete({
      where: { id },
    });

    await prisma.$disconnect();
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') {
      try { await prisma.$disconnect(); } catch (e) {}
      return res.status(404).json({ message: 'Book not found' });
    }
    try { await prisma.$disconnect(); } catch (e) {}
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
	getAllBooks,
	getBookById,
	createBook,
	updateBook,
	deleteBook,
};