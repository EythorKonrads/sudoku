# Sudoku Game

A Next.js-based Sudoku application with Prisma ORM and Supabase PostgreSQL database.

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma 7 with PostgreSQL adapter
- **Styling**: SCSS
- **Testing**: Playwright

## Database Configuration

This project uses Prisma as the ORM to interact with a Supabase PostgreSQL database. The setup includes:

- Prisma Client with `@prisma/adapter-pg` for PostgreSQL connection
- Connection pooling via `pg` driver
- Supabase authentication via `@supabase/ssr` and `@supabase/supabase-js`

### Environment Variables

Create a `.env` file in the root directory:

```bash
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma Client:

```bash
npx prisma generate
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)

## Testing

Run end-to-end tests with Playwright:

```bash
npm run test:e2e
```


