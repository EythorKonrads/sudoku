import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test database connection by counting users
    const { count, error } = await supabaseAdmin
      .from('User')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    return res.status(200).json({ 
      status: 'ok',
      database: 'connected',
      userCount: count || 0
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
