// Calculate score based on time and errors
// Formula: Start with 10,000 points
// - Time penalty: Lose points based on time (faster = better)
//   Optimal time: 3 minutes (180s) = 0 penalty
//   After 3 min: -20 points per second
// - Error penalty: -500 points per error
// Minimum score: 0
export const calculateScore = (timeInSeconds: number, errors: number): number => {
  const MAX_SCORE = 10000
  const OPTIMAL_TIME = 180 // 3 minutes
  const TIME_PENALTY_RATE = 20 // points lost per second after optimal time
  const ERROR_PENALTY = 500 // points lost per error
  
  let score = MAX_SCORE
  
  // Time penalty (only after optimal time)
  if (timeInSeconds > OPTIMAL_TIME) {
    const extraTime = timeInSeconds - OPTIMAL_TIME
    score -= extraTime * TIME_PENALTY_RATE
  }
  
  // Error penalty
  score -= errors * ERROR_PENALTY
  
  // Ensure score doesn't go below 0
  return Math.max(0, Math.round(score))
}
