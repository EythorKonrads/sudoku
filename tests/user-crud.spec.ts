import { test, expect } from '@playwright/test';

/**
 * User CRUD Test Suite
 * 
 * These tests demonstrate the full CRUD lifecycle for users.
 * The delete functionality is not exposed in the UI but available via API for testing.
 */

test.describe('User CRUD Operations', () => {
  let testUserId: string;
  const timestamp = Date.now().toString().slice(-6); // Use last 6 digits to keep username short
  const testUser = {
    username: `test${timestamp}`,
    email: `test_${Date.now()}@example.com`,
    password: 'testpassword123',
  };

  test('CREATE: Should create a new user', async ({ request }) => {
    const response = await request.post('/api/auth/signup', {
      data: testUser,
    });

    expect(response.status()).toBe(201);
    const data = await response.json();
    
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe(testUser.username);
    expect(data.user.email).toBe(testUser.email);
    expect(data.user.isGuest).toBe(false);
    
    testUserId = data.user.id;
  });

  test('READ: Should retrieve user info via /me endpoint', async ({ request }) => {
    // First login to get session
    const loginResponse = await request.post(`/api/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password,
      },
    });

    expect(loginResponse.status()).toBe(200);
    
    // Get user info
    const meResponse = await request.get(`/api/auth/me`);
    expect(meResponse.status()).toBe(200);
    
    const data = await meResponse.json();
    expect(data.user.username).toBe(testUser.username);
    expect(data.user.email).toBe(testUser.email);
  });

  test('UPDATE: Should upgrade guest to registered user', async ({ request }) => {
    // Create a guest user
    const guestResponse = await request.post(`/api/auth/guest`);
    expect(guestResponse.status()).toBe(201);
    const guestData = await guestResponse.json();
    
    // Upgrade to registered user
    const timestamp = Date.now().toString().slice(-6);
    const upgradeUser = {
      username: `up${timestamp}`,
      email: `upgraded_${Date.now()}@example.com`,
      password: 'upgradepassword123',
    };
    
    const upgradeResponse = await request.post(`/api/auth/upgrade`, {
      data: upgradeUser,
    });
    
    expect(upgradeResponse.status()).toBe(200);
    const upgradeData = await upgradeResponse.json();
    
    expect(upgradeData.user.username).toBe(upgradeUser.username);
    expect(upgradeData.user.email).toBe(upgradeUser.email);
    expect(upgradeData.user.isGuest).toBe(false);
    expect(upgradeData.user.id).toBe(guestData.user.id); // Same ID, upgraded
    
    // Cleanup: delete the upgraded user
    await request.delete(`/api/auth/delete`, {
      data: { userId: upgradeData.user.id },
    });
  });

  test('DELETE: Should delete user by userId', async ({ request }) => {
    // Create a user to delete
    const timestamp = Date.now().toString().slice(-6);
    const createResponse = await request.post(`/api/auth/signup`, {
      data: {
        username: `del${timestamp}`,
        email: `deleteme_${Date.now()}@example.com`,
        password: 'deletepassword123',
      },
    });
    
    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();
    
    // Delete the user
    const deleteResponse = await request.delete(`/api/auth/delete`, {
      data: { userId: createData.user.id },
    });
    
    expect(deleteResponse.status()).toBe(200);
    const deleteData = await deleteResponse.json();
    
    expect(deleteData.message).toBe('User deleted successfully');
    expect(deleteData.deletedUser.id).toBe(createData.user.id);
  });

  test('DELETE: Should delete user by email', async ({ request }) => {
    // Create a user to delete
    const timestamp = Date.now().toString().slice(-6);
    const email = `deleteme_email_${Date.now()}@example.com`;
    const createResponse = await request.post(`/api/auth/signup`, {
      data: {
        username: `em${timestamp}`,
        email,
        password: 'deletepassword123',
      },
    });
    
    expect(createResponse.status()).toBe(201);
    
    // Delete by email
    const deleteResponse = await request.delete(`/api/auth/delete`, {
      data: { email },
    });
    
    expect(deleteResponse.status()).toBe(200);
    const deleteData = await deleteResponse.json();
    
    expect(deleteData.message).toBe('User deleted successfully');
    expect(deleteData.deletedUser.email).toBe(email);
  });

  test('DELETE: Should delete user by username', async ({ request }) => {
    // Create a user to delete
    const timestamp = Date.now().toString().slice(-6);
    const username = `un${timestamp}`;
    const createResponse = await request.post(`/api/auth/signup`, {
      data: {
        username,
        email: `deleteme_username_${Date.now()}@example.com`,
        password: 'deletepassword123',
      },
    });
    
    expect(createResponse.status()).toBe(201);
    
    // Delete by username
    const deleteResponse = await request.delete(`/api/auth/delete`, {
      data: { username },
    });
    
    expect(deleteResponse.status()).toBe(200);
    const deleteData = await deleteResponse.json();
    
    expect(deleteData.message).toBe('User deleted successfully');
    expect(deleteData.deletedUser.username).toBe(username);
  });

  test('DELETE: Should return 404 for non-existent user', async ({ request }) => {
    const deleteResponse = await request.delete(`/api/auth/delete`, {
      data: { userId: 'non-existent-id-12345' },
    });
    
    expect(deleteResponse.status()).toBe(404);
    const data = await deleteResponse.json();
    expect(data.error).toBe('User not found');
  });

  test('DELETE: Should require at least one identifier', async ({ request }) => {
    const deleteResponse = await request.delete(`/api/auth/delete`, {
      data: {},
    });
    
    expect(deleteResponse.status()).toBe(400);
    const data = await deleteResponse.json();
    expect(data.error).toContain('identifier required');
  });

  // Cleanup the test user created in the first test
  test.afterAll(async ({ request }) => {
    if (testUserId) {
      try {
        await request.delete(`/api/auth/delete`, {
          data: { userId: testUserId },
        });
      } catch {
        console.log('Cleanup failed, user may already be deleted');
      }
    }
  });
});
