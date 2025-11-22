import React from 'react';
import styles from './Cell.module.scss';

interface CellProps {
  value: number | null;
  isInitial: boolean;
  isSelected: boolean;
  isError: boolean;
  onClick: () => void;
  row: number;
  col: number;
}

const Cell: React.FC<CellProps> = ({
  value,
  isInitial,
  isSelected,
  isError,
  onClick,
  row,
  col,
}) => {
  const isTopBorder = row % 3 === 0;
  const isLeftBorder = col % 3 === 0;

  const classNames = [
    styles.cell,
    isSelected && styles['cell--selected'],
    isInitial && styles['cell--initial'],
    !isInitial && styles['cell--user-input'],
    isError && styles['cell--error'],
    isTopBorder && styles['cell--border-top'],
    isLeftBorder && styles['cell--border-left'],
    row === 8 && styles['cell--border-bottom'],
    col === 8 && styles['cell--border-right'],
  ].filter(Boolean).join(' ');

  return (
    <div onClick={onClick} className={classNames}>
      {value || ''}
    </div>
  );
};

export default Cell;
