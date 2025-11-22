import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

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

    const puzzle = await prisma.sudoku_450_000.findFirst({
      where: {
        difficulty: difficultyValue
      },
      skip: Math.floor(Math.random() * 100) // Add some randomness
    })

    if (!puzzle) {
      return res.status(404).json({ error: 'No puzzle found' })
    }

    // Convert BigInt fields to numbers for JSON serialization
    const serializedPuzzle = {
      ...puzzle,
      id: Number(puzzle.id),
      clues: puzzle.clues ? Number(puzzle.clues) : null,
    }

    return res.status(200).json(serializedPuzzle)
  } catch (error) {
    console.error('Fetch puzzle error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch puzzle',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
