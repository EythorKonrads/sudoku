# E2E Tests for Sudoku App

This directory contains end-to-end tests that verify the database setup and API functionality.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run the Tests

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