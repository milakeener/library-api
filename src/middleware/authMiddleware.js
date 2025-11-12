const { verifyToken } = require('../utils/generateToken');

function getPrisma() {
	const { PrismaClient } = require('@prisma/client');
	return new PrismaClient();
}
async function authenticate(req, res, next) {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing or invalid token' });
	const token = auth.split(' ')[1];
		try {
			const payload = verifyToken(token);
			const prisma = getPrisma();
			const user = await prisma.user.findUnique({ where: { id: payload.id } });
			if (!user) {
				await prisma.$disconnect();
				return res.status(401).json({ message: 'User not found' });
			}
			req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
			await prisma.$disconnect();
			next();
		} catch (err) {
			return res.status(401).json({ message: 'Invalid token' });
		}
}

function authorizeRoles(...allowed) {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
		if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
		next();
	};
}

function ensureOwnershipOrRole(getResourceUserIdFn) {
	return async (req, res, next) => {
		if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
		if (req.user.role === 'ADMIN') return next();
		try {
			const ownerId = await getResourceUserIdFn(req);
			if (ownerId === req.user.id) return next();
			return res.status(403).json({ message: 'Forbidden' });
		} catch (err) {
			return res.status(500).json({ message: 'Server error' });
		}
	};
}

module.exports = { authenticate, authorizeRoles, ensureOwnershipOrRole };
