import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyPassword } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const { data: user } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    setSessionCookie(res, {
      userId: user.id,
      isGuest: user.isGuest,
    });

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
}
