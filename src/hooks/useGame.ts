import { useState, useCallback, useEffect, useRef } from 'react';
import { PuzzleData, Board, CellData } from '@/types/game';

export const useGame = (puzzleData: PuzzleData | null) => {
  const initializeBoard = useCallback((): Board => {
    if (!puzzleData) {
      return Array(9).fill(null).map(() =>
        Array(9).fill(null).map(() => ({
          value: null,
          isInitial: false,
          isError: false,
        }))
      );
    }

    const board: Board = [];
    for (let i = 0; i < 9; i++) {
      board[i] = [];
      for (let j = 0; j < 9; j++) {
        const index = i * 9 + j;
        const char = puzzleData.puzzle[index];
        const value = char === '.' ? null : parseInt(char);
        board[i][j] = {
          value,
          isInitial: value !== null,
          isError: false,
        };
      }
    }
    return board;
  }, [puzzleData]);

  const [board, setBoard] = useState<Board>(initializeBoard());
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const mistakeCountedRef = useRef<Set<string>>(new Set());

  // Re-initialize board when puzzle data changes
  useEffect(() => {
    setBoard(initializeBoard());
    setSelectedCell(null);
    setMistakeCount(0);
    mistakeCountedRef.current = new Set();
  }, [initializeBoard]);

  const selectCell = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const setValue = useCallback((row: number, col: number, value: number | null) => {
    if (!puzzleData) return;

    setBoard((prevBoard) => {
      const newBoard = prevBoard.map(r => r.map(c => ({ ...c })));
      
      // Don't allow changing initial values
      if (newBoard[row][col].isInitial) {
        return prevBoard;
      }

      const wasError = newBoard[row][col].isError;
      newBoard[row][col].value = value;

      // Check if the value is correct
      if (value !== null) {
        const index = row * 9 + col;
        const correctValue = parseInt(puzzleData.solution[index]);
        const isWrong = value !== correctValue;
        newBoard[row][col].isError = isWrong;
        
        // Only increment mistake count if this is a new mistake
        if (isWrong && !wasError) {
          const mistakeKey = `${row}-${col}-${value}`;
          if (!mistakeCountedRef.current.has(mistakeKey)) {
            mistakeCountedRef.current.add(mistakeKey);
            setMistakeCount(prev => prev + 1);
          }
        }
      } else {
        newBoard[row][col].isError = false;
      }

      return newBoard;
    });
  }, [puzzleData]);

  const handleNumberInput = useCallback((num: number | null) => {
    if (!selectedCell) return;
    setValue(selectedCell.row, selectedCell.col, num);
  }, [selectedCell, setValue]);

  const checkWin = useCallback((): boolean => {
    if (!puzzleData) return false;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const index = i * 9 + j;
        const correctValue = parseInt(puzzleData.solution[index]);
        if (board[i][j].value !== correctValue) {
          return false;
        }
      }
    }
    return true;
  }, [board, puzzleData]);

  const cheat = useCallback(() => {
    if (!puzzleData) return;

    setBoard((prevBoard) => {
      const newBoard = prevBoard.map(r => r.map(c => ({ ...c })));
      
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          const index = i * 9 + j;
          const correctValue = parseInt(puzzleData.solution[index]);
          if (!newBoard[i][j].isInitial) {
            newBoard[i][j].value = correctValue;
            newBoard[i][j].isError = false;
          }
        }
      }
      
      return newBoard;
    });
  }, [puzzleData]);

  return {
    board,
    selectedCell,
    selectCell,
    setValue,
    handleNumberInput,
    checkWin,
    initializeBoard,
    mistakeCount,
    cheat,
  };
};
