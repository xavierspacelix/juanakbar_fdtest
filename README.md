# Juan Akbar FDTest - Book Management App

A monorepo application built with **Turborepo**, featuring a **Next.js** (TypeScript) frontend in `apps/frontend` and an **Express.js** (TypeScript) backend in `apps/backend`. The app uses **Prisma** for database management, with the schema defined in `packages/prisma`. It supports CRUD operations for managing books, including title, author, description, rating, and thumbnail upload, with JWT-based authentication via `httpOnly` cookies.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running the Project](#running-the-project)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Authentication](#authentication)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Tech Stack

- **Frontend**: Next.js (TypeScript), Shadcn/ui, React Hot Toast, @tanstack/react-query, react-hook-form, zod
- **Backend**: Express.js (TypeScript), Prisma
- **Monorepo**: Turborepo
- **Database**: PostgreSQL
- **Other**: Axios, loglevel, Lucide Icons, Tailwind CSS, Headless UI, Heroicons

## Project Structure

```
juanakbar_fdtest/
├── apps/
│   ├── backend/              # Express.js backend
│   │   ├── src/              # Backend source code
│   │   ├── package.json      # Backend dependencies
│   │   └── tsconfig.json     # Backend TypeScript config
│   ├── frontend/             # Next.js frontend
│   │   ├── src/              # Frontend source code
│   │   ├── package.json      # Frontend dependencies
│   │   └── tsconfig.json     # Frontend TypeScript config
├── packages/
│   ├── prisma/               # Prisma schema and migrations
│   │   ├── schema.prisma     # Prisma schema definition
│   │   ├── migrations/       # Database migrations
│   │   └── package.json      # Prisma package config
├── package.json              # Root package.json (Turborepo)
├── turbo.json                # Turborepo configuration
└── README.md                 # This file
```

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v10.9.2 or higher
- **PostgreSQL**: v14 or higher
- **Git**: For cloning the repository
- **Docker** (optional): For running PostgreSQL in a container

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/xavierspacelix/juanakbar_fdtest
   cd juanakbar_fdtest
   ```

2. **Install Dependencies**
   Install all dependencies at the root level using Turborepo:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   - For `apps/backend/.env`:
     ```env
     DATABASE_URL="postgresql://postgres:root@localhost:5432/juanakbar_fdtest"
     JWT_ACCESS_SECRET="supersecret"
     JWT_REFRESH_SECRET="supersecretrefresh"
     APP_URL="http://localhost:4000"
     APP_FRONTEND_URL="http://localhost:3000"
     NODE_ENV=development
     EMAIL_FROM="no-reply@example.com"
     ```
   - For `apps/frontend/.env.local`:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:4000/api
     ```

   **Notes**:
   - Replace `DATABASE_URL` with your PostgreSQL connection string if different.
   - Use secure values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in production.
   - Configure `EMAIL_FROM` for email notifications (e.g., with an SMTP service).

4. **Set Up PostgreSQL**
   - Install and start PostgreSQL locally, or use Docker:
     ```bash
     docker run -d --name postgres -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=root -e POSTGRES_DB=juanakbar_fdtest postgres:14
     ```
   - Verify the database is accessible using the `DATABASE_URL`.

5. **Run Prisma Migrations**
   Apply the database schema defined in `packages/prisma/schema.prisma`:

   ```bash
   npm run db:migrate
   ```

6. **Generate Prisma Client**
   Generate the Prisma client for the backend:
   ```bash
   npm run db:generate
   ```

## Running the Project

1. **Development Mode**
   Run both backend and frontend in development mode using Turborepo:

   ```bash
   npm run dev
   ```

   - **Frontend**: Runs on `http://localhost:3000`
   - **Backend**: Runs on `http://localhost:4000`

2. **Individual Apps**
   - Backend only:
     ```bash
     cd apps/backend
     npm run dev
     ```
   - Frontend only:
     ```bash
     cd apps/frontend
     npm run dev
     ```

3. **Build for Production**
   Build all apps:
   ```bash
   npm run build
   ```
   Start the production server:
   ```bash
   npm run start
   ```

## Environment Variables

| Variable              | Description                            | Example                                                      |
| --------------------- | -------------------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`        | PostgreSQL connection string (backend) | `postgresql://postgres:root@localhost:5432/juanakbar_fdtest` |
| `JWT_ACCESS_SECRET`   | Secret for JWT access tokens           | `supersecret`                                                |
| `JWT_REFRESH_SECRET`  | Secret for JWT refresh tokens          | `supersecretrefresh`                                         |
| `APP_URL`             | Backend URL                            | `http://localhost:4000`                                      |
| `APP_FRONTEND_URL`    | Frontend URL                           | `http://localhost:3000`                                      |
| `NODE_ENV`            | Environment (development/production)   | `development`                                                |
| `EMAIL_FROM`          | Sender email for notifications         | `no-reply@example.com`                                       |
| `NEXT_PUBLIC_API_URL` | Backend API URL (frontend)             | `http://localhost:4000/api`                                  |

## Database Setup

- The Prisma schema is located in `packages/prisma/schema.prisma`.
- Example schema snippet:

  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  model User {
    id             Int      @id @default(autoincrement())
    name           String
    email          String   @unique
    password       String
    avatar         String?
    emailVerified  DateTime?
    createdAt      DateTime @default(now())
    updatedAt      DateTime @updatedAt
    books          Book[]
    emailVerification EmailVerification?
    passwordReset     PasswordReset[]
    refreshTokens     RefreshToken[]
  }

  model EmailVerification {
    id        Int      @id @default(autoincrement())
    tokenHash String   @unique
    user      User     @relation(fields: [userId], references: [id])
    userId    Int      @unique
    expiresAt DateTime
    createdAt DateTime @default(now())
  }

  model PasswordReset {
    id        Int      @id @default(autoincrement())
    tokenHash String   @unique
    user      User     @relation(fields: [userId], references: [id])
    userId    Int
    expiresAt DateTime
    createdAt DateTime @default(now())
  }

  model RefreshToken {
    id        Int      @id @default(autoincrement())
    tokenHash String   @unique
    user      User     @relation(fields: [userId], references: [id])
    userId    Int
    expiresAt DateTime
    createdAt DateTime @default(now())
  }

  model Book {
    id          Int      @id @default(autoincrement())
    title       String
    author      String
    description String?
    thumbnail   String?
    rating      Int       @default(0)
    uploadedAt  DateTime  @default(now())
    uploaderId  Int
    uploader    User      @relation(fields: [uploaderId], references: [id])
  }

  ```

- Run migrations:
  ```bash
  npm run db:migrate
  ```
- Generate Prisma client:
  ```bash
  npm run db:generate
  ```
- Inspect the database with Prisma Studio:
  ```bash
  npx prisma studio --schema=packages/prisma/schema.prisma
  ```

## Authentication

- The backend uses JWT-based authentication with `httpOnly` cookies for `accessToken` and `refreshToken`.
- To authenticate:
  1. Log in via the frontend (e.g., `http://localhost:3000/login`) or send a `POST /api/auth/login` request with credentials (e.g., `{ "email": "user@example.com", "password": "password" }`).
  2. The backend sets `httpOnly` cookies (`accessToken` and `refreshToken`) in the response.
  3. The browser automatically includes these cookies in subsequent requests to `http://localhost:4000/api`.
- Ensure the backend is configured to handle `httpOnly` cookies with CORS:

  ```javascript
  // In apps/backend/src/index.ts
  import cors from "cors";

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  ```

- Protected endpoints (e.g., `POST /api/books`, `PUT /api/books/:id`, `DELETE /api/books/:id`) require a valid `accessToken` cookie.

## Available Scripts

In the root directory:

- `npm run dev`: Run all apps in development mode.
- `npm run build`: Build all apps for production.
- `npm run start`: Start all apps in production mode.
- `npm run lint`: Run ESLint across all apps.
- `npm run format`: Format code with Prettier.
- `npm run check-types`: Check TypeScript types.
- `npm run db:generate`: Generate Prisma client.
- `npm run db:migrate`: Apply database migrations.
- `npm run db:deploy`: Deploy migrations in production.

## Troubleshooting

- **Database Connection Error**:
  - Verify `DATABASE_URL` in `apps/backend/.env`.
  - Ensure PostgreSQL is running and accessible (`psql -h localhost -U postgres -d juanakbar_fdtest`).
  - Run `npm run db:migrate` to apply migrations.
- **Frontend API Error**:
  - Check `NEXT_PUBLIC_API_URL` in `apps/frontend/.env.local`.
  - Ensure the backend is running on `http://localhost:4000`.
- **Authentication Error (401/403)**:
  - Verify `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in `apps/backend/.env`.
  - Ensure you are logged in (check for `httpOnly` cookies in browser DevTools > Application > Cookies).
  - Test login endpoint: `POST http://localhost:4000/api/auth/login`.
  - Ensure CORS is configured with `credentials: true` in the backend.
- **Thumbnail Upload Fails**:
  - Ensure the backend uses `multer` for `multipart/form-data`.
  - Check file size limits and allowed extensions (e.g., JPG, PNG).
- **Logs**:
  - Check browser console for frontend logs (via `loglevel`).
  - Check terminal for backend logs.
- **TypeScript Errors**:
  - Run `npm run check-types` to identify type issues.
  - Ensure all dependencies are installed (`npm install`).

Use `husky` and `lint-staged` for pre-commit checks:

- Linting with ESLint
- Formatting with Prettier
- Type checking with TypeScript

---

Built with 💻 by Juan Akbar Indrian
