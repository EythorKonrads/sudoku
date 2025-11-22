import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateGuestToken(): string {
  return randomBytes(32).toString('hex');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters
  return password.length >= 8;
}

export function isValidUsername(username: string): boolean {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Delete a user by ID, email, or username.
 * This is intended for testing purposes only.
 * 
 * @param identifier - Object with userId, email, or username
 * @returns The deleted user data
 */
export async function deleteUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  identifier: { userId?: string; email?: string; username?: string }
): Promise<{ id: string; username: string; email: string; isGuest: boolean }> {
  const { userId, email, username } = identifier;

  if (!userId && !email && !username) {
    throw new Error('At least one identifier required (userId, email, or username)');
  }

  // Find the user
  let query = supabase.from('User').select('id, username, email, isGuest');

  if (userId) {
    query = query.eq('id', userId);
  } else if (email) {
    query = query.eq('email', email);
  } else if (username) {
    query = query.eq('username', username);
  }

  const { data: user, error: fetchError } = await query.maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!user) {
    throw new Error('User not found');
  }

  // Delete associated game sessions first
  const { error: sessionsError } = await supabase
    .from('GameSession')
    .delete()
    .eq('userId', user.id);

  if (sessionsError) {
    throw sessionsError;
  }

  // Delete the user
  const { error: deleteError } = await supabase
    .from('User')
    .delete()
    .eq('id', user.id);

  if (deleteError) {
    throw deleteError;
  }

  return user;
}
