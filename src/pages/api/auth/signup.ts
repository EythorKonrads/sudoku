import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword, isValidEmail, isValidPassword, isValidUsername } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters, alphanumeric and underscores only' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if email already exists
    const { data: existingEmail } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Check if username already exists
    const { data: existingUsername } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);

    // Generate a unique ID using UUID
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    const { data: user, error } = await supabaseAdmin
      .from('User')
      .insert({
        id: userId,
        username,
        email,
        passwordHash,
        isGuest: false,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    setSessionCookie(res, {
      userId: user.id,
      isGuest: false,
    });

    return res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    return res.status(500).json({ error: errorMessage, details: error });
  }
}
