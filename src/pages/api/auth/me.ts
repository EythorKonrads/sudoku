import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSessionFromCookie, setSessionCookie } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = getSessionFromCookie(req);

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: user } = await supabaseAdmin
      .from('User')
      .select('id, username, email, isGuest, createdAt')
      .eq('id', session.userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Refresh the session cookie to extend expiration (rolling expiration)
    setSessionCookie(res, {
      userId: session.userId,
      isGuest: session.isGuest,
    });

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to get user' });
  }
}
