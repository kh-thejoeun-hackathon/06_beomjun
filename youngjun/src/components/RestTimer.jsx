import { REST_OPTIONS } from '../utils/storage'

export default function RestTimer({
  selectedRestSeconds,
  setSelectedRestSeconds,
  timerSeconds,
  isRunning,
  setIsRunning,
  setTimerSeconds,
}) {
  return (
    <div className="timer-box">
      <div className="timer-display">
        {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
        {String(timerSeconds % 60).padStart(2, '0')}
      </div>

      <div className="rest-options">
        {REST_OPTIONS.map((seconds) => (
          <button
            key={seconds}
            type="button"
            className={`rest-option ${selectedRestSeconds === seconds ? 'selected' : ''}`}
            onClick={() => {
              setSelectedRestSeconds(seconds)
              if (!isRunning) {
                setTimerSeconds(seconds)
              }
            }}
          >
            {seconds}초
          </button>
        ))}
      </div>

      <div className="timer-controls">
        <button type="button" className="primary-button small" onClick={() => setIsRunning((current) => !current)}>
          {isRunning ? '일시정지' : '시작'}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setIsRunning(false)
            setTimerSeconds(selectedRestSeconds)
          }}
        >
          초기화
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setTimerSeconds((current) => Math.min(current + 30, 1800))}
        >
          +30초
        </button>
      </div>
    </div>
  )
}
