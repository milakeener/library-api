function getPrisma() {
  const { PrismaClient } = require('@prisma/client');
  return new PrismaClient();
}


async function getReviewsForBook(req, res) {
  const bookId = parseInt(req.params.bookId, 10);
  if (Number.isNaN(bookId)) {
    return res.status(400).json({ message: 'Invalid book id' });
  }
  const prisma = getPrisma();
  try {
 
    const bookExists = await prisma.book.findUnique({ where: { id: bookId }, select: { id: true } });
    if (!bookExists) {
      await prisma.$disconnect();
      return res.status(404).json({ message: 'Book not found' });
    }
    const reviews = await prisma.review.findMany({
      where: { bookId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    await prisma.$disconnect();
    return res.json(reviews.map(r => ({
      id: r.id,
      bookId: r.bookId,
      user: r.user,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    })));
  } catch (err) {
    console.error(err);
    try { await prisma.$disconnect(); } catch (e) {}
    return res.status(500).json({ message: 'Server error' });
  }
}


async function createReview(req, res) {
  const { bookId, rating, comment } = req.body || {};
  if (bookId === undefined || rating === undefined) {
    return res.status(400).json({ message: 'bookId and rating are required' });
  }
  const bookIdInt = parseInt(bookId, 10);
  if (Number.isNaN(bookIdInt)) {
    return res.status(400).json({ message: 'bookId must be a number' });
  }
  const ratingInt = parseInt(rating, 10);
  if (Number.isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
    return res.status(400).json({ message: 'rating must be an integer 1-5' });
  }
  const prisma = getPrisma();
  try {
    const book = await prisma.book.findUnique({ where: { id: bookIdInt }, select: { id: true } });
    if (!book) {
      await prisma.$disconnect();
      return res.status(404).json({ message: 'Book not found' });
    }
    const review = await prisma.review.create({
      data: {
        bookId: bookIdInt,
        rating: ratingInt,
        comment: comment ?? null,
        userId: req.user.id,
      },
      include: { user: { select: { id: true, name: true } } },
    });
    await prisma.$disconnect();
    return res.status(201).json({
      id: review.id,
      bookId: review.bookId,
      user: review.user,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    });
  } catch (err) {
    console.error(err);
    try { await prisma.$disconnect(); } catch (e) {}
    return res.status(500).json({ message: 'Server error' });
  }
}


async function updateReview(req, res) {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid review id' });
  }
  const { rating, comment } = req.body || {};
  if (rating === undefined && comment === undefined) {
    return res.status(400).json({ message: 'Nothing to update' });
  }
  const prisma = getPrisma();
  try {
    const review = await prisma.review.findUnique({ where: { id }, include: { user: true } });
    if (!review) {
      await prisma.$disconnect();
      return res.status(404).json({ message: 'Review not found' });
    }
 
    if (req.user.role !== 'ADMIN' && review.userId !== req.user.id) {
      await prisma.$disconnect();
      return res.status(403).json({ message: 'Forbidden' });
    }
    const data = {};
    if (rating !== undefined) {
      const ratingInt = parseInt(rating, 10);
      if (Number.isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
        await prisma.$disconnect();
        return res.status(400).json({ message: 'rating must be integer 1-5' });
      }
      data.rating = ratingInt;
    }
    if (comment !== undefined) data.comment = comment;
    const updated = await prisma.review.update({
      where: { id },
      data,
      include: { user: { select: { id: true, name: true } } },
    });
    await prisma.$disconnect();
    return res.json({
      id: updated.id,
      bookId: updated.bookId,
      user: updated.user,
      rating: updated.rating,
      comment: updated.comment,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') {
      try { await prisma.$disconnect(); } catch (e) {}
      return res.status(404).json({ message: 'Review not found' });
    }
    try { await prisma.$disconnect(); } catch (e) {}
    return res.status(500).json({ message: 'Server error' });
  }
}


async function deleteReview(req, res) {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid review id' });
  }
  const prisma = getPrisma();
  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      await prisma.$disconnect();
      return res.status(404).json({ message: 'Review not found' });
    }
    if (req.user.role !== 'ADMIN' && review.userId !== req.user.id) {
      await prisma.$disconnect();
      return res.status(403).json({ message: 'Forbidden' });
    }
    await prisma.review.delete({ where: { id } });
    await prisma.$disconnect();
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') {
      try { await prisma.$disconnect(); } catch (e) {}
      return res.status(404).json({ message: 'Review not found' });
    }
    try { await prisma.$disconnect(); } catch (e) {}
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getReviewsForBook,
  createReview,
  updateReview,
  deleteReview,
};