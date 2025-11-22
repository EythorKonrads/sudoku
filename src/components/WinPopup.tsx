import styles from './WinPopup.module.scss'

interface WinPopupProps {
  mistakeCount: number
  completionTime: number
  score: number
  onClose: () => void
}

const WinPopup: React.FC<WinPopupProps> = ({ mistakeCount, completionTime, score, onClose }) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return (
    <div className={styles['win-popup__overlay']} onClick={onClose}>
      <div className={styles['win-popup__content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['win-popup__header']}>
          <h2>🎉 Congratulations! 🎉</h2>
        </div>
        <div className={styles['win-popup__body']}>
          <p>You solved the puzzle!</p>
          <div className={styles['win-popup__score']}>
            <span className={styles['win-popup__score-label']}>Score</span>
            <span className={styles['win-popup__score-value']}>{score.toLocaleString()}</span>
            <span className={styles['win-popup__score-max']}>/ 10,000</span>
          </div>
          <p className={styles['win-popup__time']}>
            Time: <span>{formatTime(completionTime)}</span>
          </p>
          <p className={styles['win-popup__mistakes']}>
            Mistakes: <span>{mistakeCount}</span>
          </p>
        </div>
        <div className={styles['win-popup__footer']}>
          <button 
            className={styles['win-popup__close-button']}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default WinPopup
