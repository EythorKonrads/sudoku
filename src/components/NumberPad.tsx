import React from 'react';
import styles from './NumberPad.module.scss';

interface NumberPadProps {
  onNumberClick: (num: number | null) => void;
  disabled: boolean;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, disabled }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className={styles['number-pad']}>
      <div className={styles['number-pad__grid']}>
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            disabled={disabled}
            className={styles['number-pad__button']}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => onNumberClick(null)}
          disabled={disabled}
          className={`${styles['number-pad__button']} ${styles['number-pad__button--clear']}`}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default NumberPad;
