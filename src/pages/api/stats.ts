import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSessionFromCookie } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getSessionFromCookie(req);

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Get all completed games
    const { count: completedGames } = await supabaseAdmin
      .from('GameSession')
      .select('*', { count: 'exact', head: true })
      .eq('userId', session.userId)
      .eq('completed', true);

    // Get all games for aggregation
    const { data: allSessions } = await supabaseAdmin
      .from('GameSession')
      .select('mistakes, timeSpent, score, completed')
      .eq('userId', session.userId);

    const totalMistakes = allSessions?.reduce((sum, s) => sum + (s.mistakes || 0), 0) || 0;
    const totalTime = allSessions?.reduce((sum, s) => sum + (s.timeSpent || 0), 0) || 0;
    const bestScore = allSessions
      ?.filter(s => s.completed && s.score != null)
      .reduce((max, s) => Math.max(max, s.score || 0), 0) || 0;

    // Get recent sessions
    const { data: recentSessions } = await supabaseAdmin
      .from('GameSession')
      .select('id, difficulty, mistakes, timeSpent, completed, score, startedAt, completedAt')
      .eq('userId', session.userId)
      .order('startedAt', { ascending: false })
      .limit(5);

    return res.status(200).json({
      stats: {
        completedGames: completedGames || 0,
        totalMistakes,
        totalTime,
        bestScore,
      },
      recentSessions: recentSessions || [],
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'Failed to get stats' });
  }
}
