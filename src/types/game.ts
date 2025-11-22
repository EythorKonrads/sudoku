export interface PuzzleData {
  id: number;
  puzzle: string;
  solution: string;
  clues: number;
  difficulty: string;
}

export type CellValue = number | null;

export interface CellData {
  value: CellValue;
  isInitial: boolean;
  isError: boolean;
}

export type Board = CellData[][];
