# Sudoku Game

A Next.js-based Sudoku application with Supabase PostgreSQL database.

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: SCSS
- **Testing**: Playwright

## Database Configuration

This project uses Supabase for database and authentication:

- Direct database queries via `@supabase/supabase-js`
- Server-side authentication via `@supabase/ssr`

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

## Testing

Run end-to-end tests with Playwright:

```bash
npm run test:e2e
```


