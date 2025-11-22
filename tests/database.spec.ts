import { test, expect } from '@playwright/test';

// This test file uses Node.js context to directly test database connections
// It runs in the Playwright test runner but uses Node APIs

test.describe('Direct Database Connection Tests', () => {
  test('Prisma database connection via API health check', async ({ request }) => {
    // Since we can't directly import Prisma in browser context,
    // we test the database connection through the API
    const response = await request.get('/api/puzzle');
    
    if (!response.ok()) {
      const errorData = await response.json();
      throw new Error(
        `Database connection failed via API: ${errorData.error || 'Unknown error'}\n` +
        `Details: ${errorData.details || 'No details available'}`
      );
    }
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.id).toBeTruthy();
  });

  test('Database returns consistent data structure', async ({ request }) => {
    // Make multiple requests to ensure database is stable
    const requests = Array(5).fill(null).map(() => request.get('/api/puzzle'));
    const responses = await Promise.all(requests);
    
    for (const response of responses) {
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      // Verify all required fields are present
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('puzzle');
      expect(data).toHaveProperty('solution');
      expect(data).toHaveProperty('clues');
      expect(data).toHaveProperty('difficulty');
    }
  });

  test('Database error handling', async ({ request }) => {
    // Test that the API properly handles database errors
    // by using an invalid HTTP method
    const response = await request.delete('/api/puzzle');
    
    expect(response.status()).toBe(405);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});
