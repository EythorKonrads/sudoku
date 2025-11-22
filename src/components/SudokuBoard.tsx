import { useEffect, useState } from 'react'
import { PuzzleData } from '@/types/game'
import { useGame } from '@/hooks/useGame'
import { useGameSession } from '@/hooks/useGameSession'
import { useAuth } from '@/contexts/AuthContext'
import { calculateScore } from '@/lib/scoring'
import Cell from './Cell'
import NumberPad from './NumberPad'
import WinPopup from './WinPopup'
import styles from './SudokuBoard.module.scss'

const SudokuBoard: React.FC = () => {
  const { user } = useAuth()
  const { saveGameSession } = useGameSession()
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasWon, setHasWon] = useState(false)
  const [showWinPopup, setShowWinPopup] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [finalTime, setFinalTime] = useState(0)
  const [finalScore, setFinalScore] = useState(0)

  const { board, selectedCell, selectCell, handleNumberInput, checkWin, mistakeCount, cheat } = useGame(puzzle)

  const loadNewPuzzle = (difficulty?: string) => {
    setIsLoading(true)
    const url = difficulty ? `/api/puzzle?difficulty=${difficulty}` : '/api/puzzle'
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPuzzle(data)
        console.log('Fetched puzzle:', data)
        setIsLoading(false)
        // Reset game state
        setHasWon(false)
        setShowWinPopup(false)
        setStartTime(null)
        setElapsedTime(0)
        setFinalTime(0)
        setFinalScore(0)
      })
      .catch(error => {
        console.error('Failed to fetch puzzle:', error)
        setIsLoading(false)
      })
  }

  // Start timer when puzzle loads
  useEffect(() => {
    if (puzzle && !startTime) {
      setStartTime(Date.now())
    }
  }, [puzzle, startTime])

  // Update elapsed time every second
  useEffect(() => {
    if (!startTime || hasWon) return

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, hasWon])

  useEffect(() => {
    loadNewPuzzle()
  }, [])

  useEffect(() => {
    if (puzzle && !hasWon) {
      const won = checkWin()
      if (won) {
        setHasWon(true)
        setFinalTime(elapsedTime)
        const score = calculateScore(elapsedTime, mistakeCount)
        setFinalScore(score)
        
        // Save game session
        if (user) {
          saveGameSession({
            puzzleId: puzzle.id,
            difficulty: puzzle.difficulty,
            mistakes: mistakeCount,
            timeSpent: elapsedTime,
            completed: true,
            score,
          }).catch(err => console.error('Failed to save game session:', err))
        }
        
        setTimeout(() => {
          setShowWinPopup(true)
        }, 100)
      }
    }
  }, [board, checkWin, puzzle, hasWon, mistakeCount, elapsedTime, user, saveGameSession])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCellClick = (row: number, col: number) => {
    if (!board[row][col].isInitial) {
      selectCell(row, col)
    }
  }

  if (isLoading) {
    return (
      <div className={styles['sudoku-board__loading']}>
        <p>Loading puzzle...</p>
      </div>
    )
  }

  if (!puzzle) {
    return (
      <div className={styles['sudoku-board__error']}>
        <p>Failed to load puzzle</p>
      </div>
    )
  }

  return (
    <div className={styles['sudoku-board']}>
      <div className={styles['sudoku-board__header']}>
        <h1 className={styles['sudoku-board__title']}>Sudoku</h1>
        <div className={styles['sudoku-board__info']}>
          <p>Difficulty: <span>{puzzle.difficulty}</span></p>
          <p>Clues: <span>{puzzle.clues}</span></p>
          <p>Mistakes: <span>{mistakeCount}</span></p>
          <p>Time: <span>{formatTime(elapsedTime)}</span></p>
        </div>
        <button 
          className={styles['sudoku-board__cheat-button']}
          onClick={cheat}
          style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
        >
          🔧 Cheat (Dev)
        </button>
      </div>

      <div className={styles['sudoku-board__container']}>
        <div className={styles['sudoku-board__grid']}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                value={cell.value}
                isInitial={cell.isInitial}
                isSelected={
                  selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                }
                isError={cell.isError}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                row={rowIndex}
                col={colIndex}
              />
            ))
          )}
        </div>
      </div>

      <NumberPad
        onNumberClick={handleNumberInput}
        disabled={selectedCell === null || (selectedCell && board[selectedCell.row][selectedCell.col].isInitial)}
      />

      {selectedCell && (
        <p className={styles['sudoku-board__selected-info']}>
          Selected: Row {selectedCell.row + 1}, Column {selectedCell.col + 1}
        </p>
      )}

      {showWinPopup && (
        <WinPopup 
          mistakeCount={mistakeCount}
          completionTime={finalTime}
          score={finalScore}
          onClose={() => loadNewPuzzle(puzzle?.difficulty)}
        />
      )}
    </div>
  );
};

export default SudokuBoard;
