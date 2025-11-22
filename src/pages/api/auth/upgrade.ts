import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword, isValidEmail, isValidPassword, isValidUsername } from '@/lib/auth';
import { getSessionFromCookie, setSessionCookie } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = getSessionFromCookie(req);

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

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

    // Check if the current user is a guest
    const { data: user } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('id', session.userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isGuest) {
      return res.status(400).json({ error: 'User is not a guest' });
    }

    // Check if email is already taken by another user
    const { data: existingEmail } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .neq('id', session.userId)
      .maybeSingle();

    if (existingEmail) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Check if username is already taken by another user
    const { data: existingUsername } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('username', username)
      .neq('id', session.userId)
      .maybeSingle();

    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Upgrade guest to full user
    const passwordHash = await hashPassword(password);

    const { data: updatedUser, error } = await supabaseAdmin
      .from('User')
      .update({
        username,
        email,
        passwordHash,
        isGuest: false,
        guestToken: null,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update session cookie
    setSessionCookie(res, {
      userId: updatedUser.id,
      isGuest: false,
    });

    return res.status(200).json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        isGuest: updatedUser.isGuest,
      },
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    return res.status(500).json({ error: 'Failed to upgrade guest account' });
  }
}
