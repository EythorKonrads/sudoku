import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateGuestToken } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const guestToken = generateGuestToken();
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    const { data: user, error } = await supabaseAdmin
      .from('User')
      .insert({
        id: userId,
        isGuest: true,
        guestToken,
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
      isGuest: true,
    });

    return res.status(201).json({
      user: {
        id: user.id,
        isGuest: user.isGuest,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Guest creation error:', error);
    return res.status(500).json({ error: 'Failed to create guest user' });
  }
}
