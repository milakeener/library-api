# library-api
ITIS 4166-051 Team 19 Final Project

Library Management System API built with Node.js, Express, Prisma, and PostgreSQL.

## Features
- User authentication with JWT
- Role-based authorization (USER, LIBRARIAN, ADMIN)
- RESTful API endpoints for users, books, authors, and reviews
- OpenAPI documentation with Swagger UI

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Testing:** Jest + Supertest
- **Documentation:** OpenAPI 3.0.3 + Swagger UI

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/milakeener/library-api.git
cd library-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your PostgreSQL connection string and JWT secret.

### 4. Run database migrations
```bash
npx prisma migrate deploy
```

### 5. Seed the database (optional)
```bash
npm run seed
```

This creates sample users:
- Admin: `admin@library.com / Admin123!`
- Librarian: `librarian@library.com / Librarian123!`
- User: `user@library.com / User123!`

### 6. Start the server
```bash
npm start
```

API will be running at `http://localhost:3000`

## API Documentation
View interactive API docs at: `http://localhost:3000/api-docs`

## Testing
```bash
npm test
```

## Deployment (Render)

### Build Command:
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run seed
```

### Start Command:
```bash
npm start
```

### Environment Variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Set to `production`

## Team Members
Team 19 - ITIS 4166-051
