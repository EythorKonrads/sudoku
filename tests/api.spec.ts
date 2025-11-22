import { test, expect } from '@playwright/test';

test.describe('Database Setup Verification', () => {
  test('API endpoint should return puzzle data from Prisma', async ({ request }) => {
    // Test the /api/puzzle endpoint which uses Prisma internally
    const response = await request.get('/api/puzzle');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeTruthy();
    expect(data.id).toBeTruthy();
    expect(data.puzzle).toBeTruthy();
    expect(data.solution).toBeTruthy();
    expect(typeof data.puzzle).toBe('string');
    expect(typeof data.solution).toBe('string');
  });

  test('Puzzle data should follow correct format', async ({ request }) => {
    // Verify that puzzle data follows expected format
    const response = await request.get('/api/puzzle');
    expect(response.ok()).toBeTruthy();
    
    const puzzle = await response.json();
    
    expect(puzzle).toBeTruthy();
    // Puzzle should be 81 characters (9x9 grid)
    expect(puzzle.puzzle.length).toBe(81);
    expect(puzzle.solution.length).toBe(81);
    
    // Puzzle should only contain numbers 1-9 and dots for empty cells
    expect(puzzle.puzzle).toMatch(/^[1-9.]+$/);
    expect(puzzle.solution).toMatch(/^[1-9]+$/);
    
    // ID should be a number
    expect(typeof puzzle.id).toBe('number');
    
    // Difficulty can be a string (easy/medium/hard) or a numeric rating
    if (puzzle.difficulty) {
      const knownDifficulties = ['easy', 'medium', 'hard', 'expert', 'evil', 'Easy', 'Medium', 'Hard', 'Expert', 'Evil'];
      const isKnownDifficulty = knownDifficulties.includes(puzzle.difficulty);
      const isNumericRating = !isNaN(parseFloat(puzzle.difficulty)) && parseFloat(puzzle.difficulty) >= 0;
      
      expect(isKnownDifficulty || isNumericRating).toBeTruthy();
    }
    
    // Clues should be a reasonable number (17-80) if present
    if (puzzle.clues !== null && puzzle.clues !== undefined) {
      expect(puzzle.clues).toBeGreaterThanOrEqual(17);
      expect(puzzle.clues).toBeLessThanOrEqual(80);
    }
  });

  test('API should handle errors gracefully', async ({ request }) => {
    // Test that the API returns proper error responses
    const response = await request.post('/api/puzzle');
    
    expect(response.status()).toBe(405);
    const data = await response.json();
    expect(data.error).toBe('Method not allowed');
  });

  test('Database connection should work via API', async ({ request }) => {
    // Verify database is accessible by making multiple requests
    const responses = await Promise.all([
      request.get('/api/puzzle'),
      request.get('/api/puzzle'),
      request.get('/api/puzzle')
    ]);
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });
    
    // Should return puzzle data (could be the same or different puzzles)
    const puzzles = await Promise.all(responses.map(r => r.json()));
    puzzles.forEach(puzzle => {
      expect(puzzle.id).toBeTruthy();
      expect(puzzle.puzzle).toBeTruthy();
      expect(puzzle.solution).toBeTruthy();
    });
  });
});
