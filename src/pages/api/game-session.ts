import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSessionFromCookie } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getSessionFromCookie(req);

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method === 'POST') {
    // Save game session
    try {
      const { puzzleId, difficulty, mistakes, timeSpent, completed, boardState, score } = req.body;

      if (!puzzleId || !difficulty) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const gameSessionId = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data: gameSession, error } = await supabaseAdmin
        .from('GameSession')
        .insert({
          id: gameSessionId,
          userId: session.userId,
          puzzleId: String(puzzleId),
          difficulty,
          mistakes: mistakes || 0,
          timeSpent: timeSpent || 0,
          completed: completed || false,
          boardState: boardState ? JSON.stringify(boardState) : null,
          score: score || null,
          startedAt: now,
          completedAt: completed ? now : null,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return res.status(500).json({ error: 'Failed to save game session', details: error });
      }

      return res.status(201).json({
        id: gameSession.id,
        message: 'Game session saved',
      });
    } catch (error) {
      console.error('Save game session error:', error);
      return res.status(500).json({ error: 'Failed to save game session' });
    }
  } else if (req.method === 'GET') {
    // Get user's game sessions
    try {
      const { limit = '10' } = req.query;

      const { data: gameSessions, error } = await supabaseAdmin
        .from('GameSession')
        .select('*')
        .eq('userId', session.userId)
        .order('startedAt', { ascending: false })
        .limit(parseInt(limit as string));

      if (error) {
        console.error('Supabase query error:', error);
        return res.status(500).json({ error: 'Failed to get game sessions', details: error });
      }

      return res.status(200).json({ sessions: gameSessions || [] });
    } catch (error) {
      console.error('Get game sessions error:', error);
      return res.status(500).json({ error: 'Failed to get game sessions' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
