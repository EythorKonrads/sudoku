import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { difficulty } = req.query
    const difficultyValue = difficulty ? String(difficulty) : '0.0'

    // Get random offset
    const randomOffset = Math.floor(Math.random() * 100)

    const { data: puzzle, error } = await supabaseAdmin
      .from('sudoku-450,000')
      .select('*')
      .eq('difficulty', difficultyValue)
      .range(randomOffset, randomOffset)
      .single()

    if (error || !puzzle) {
      return res.status(404).json({ error: 'No puzzle found' })
    }

    return res.status(200).json(puzzle)
  } catch (error) {
    console.error('Fetch puzzle error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch puzzle',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
