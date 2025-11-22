import { test as setup } from '@playwright/test';

/**
 * Setup tests to verify environment configuration before running main tests
 * This ensures that the application has the necessary environment variables
 */

setup('verify environment configuration', async () => {
  // Check critical environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}\n` +
      'Some tests may fail. Please ensure your .env.local file is configured.'
    );
  }

  // Optional: Check Next.js public variables (these get bundled at build time)
  const publicVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingPublicVars = publicVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingPublicVars.length > 0) {
    console.warn(
      `⚠️  Warning: Missing public environment variables: ${missingPublicVars.join(', ')}\n` +
      'Supabase features may not work correctly.'
    );
  }
});
