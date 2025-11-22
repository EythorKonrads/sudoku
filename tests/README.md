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

## Test Execution Order

The tests are organized into projects that run in a specific order:

1. **Setup Project** (`setup.spec.ts`) - Runs first, validates environment variables
2. **Chromium Project** (all other tests) - Runs after setup passes, tests database and API functionality

This ensures that if your environment is misconfigured, you'll get immediate feedback before attempting to run the full test suite.