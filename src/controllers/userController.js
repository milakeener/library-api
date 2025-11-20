const { hashPassword, comparePasswords } = require('../utils/hashPassword');
const { generateToken } = require('../utils/generateToken');

function getPrisma() {
	const { PrismaClient } = require('@prisma/client');
	return new PrismaClient();
}

async function signup(req, res) {
	const { name, email, password } = req.body || {};
	if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password required' });
		const prisma = getPrisma();
		try {
			const existing = await prisma.user.findUnique({ where: { email } });
			if (existing) {
				await prisma.$disconnect();
				return res.status(409).json({ message: 'Email already in use' });
			}
			const hashed = await hashPassword(password);
			const user = await prisma.user.create({ data: { name, email, password: hashed } });
			await prisma.$disconnect();
			return res.status(201).json({ id: user.id, name: user.name, email: user.email });
		} catch (err) {
			console.error(err);
			try { await prisma.$disconnect(); } catch (e) {}
			return res.status(500).json({ message: 'Server error' });
		}
}

async function login(req, res) {
	const { email, password } = req.body || {};
	if (!email || !password) return res.status(400).json({ message: 'email and password required' });
		const prisma = getPrisma();
		try {
			const user = await prisma.user.findUnique({ where: { email } });
			if (!user) {
				await prisma.$disconnect();
				return res.status(401).json({ message: 'Invalid credentials' });
			}
			const ok = await comparePasswords(password, user.password);
			if (!ok) {
				await prisma.$disconnect();
				return res.status(401).json({ message: 'Invalid credentials' });
			}
			const token = generateToken({ id: user.id, role: user.role });
			await prisma.$disconnect();
			return res.json({ accessToken: token });
		} catch (err) {
			console.error(err);
			try { await prisma.$disconnect(); } catch (e) {}
			return res.status(500).json({ message: 'Server error' });
		}
}

async function getMe(req, res) {
	if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
	return res.json(req.user);
}

module.exports = { signup, login, getMe };
