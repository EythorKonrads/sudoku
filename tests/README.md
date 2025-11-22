# E2E Tests for Sudoku App

This directory contains end-to-end tests that verify the database setup and API functionality.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```env
# Database connection
DATABASE_URL="postgresql://user:password@host:port/database"

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run the Tests

```bash
npm run test:e2e
```

The tests will automatically:
1. Run the setup test first to verify environment configuration
2. Start the dev server on port 3000 (if not already running)
3. Execute all database and API tests

You can also check the environment setup separately:
```bash
npm run test:setup
```