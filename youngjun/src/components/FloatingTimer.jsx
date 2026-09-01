export default function FloatingTimer({ timerSeconds, isRunning, setIsRunning, setTimerSeconds, onClose }) {
  return (
    <div className="floating-timer">
      <div className="floating-header">
        <span>휴식 타이머</span>
        <button type="button" className="mini-close" onClick={onClose}>
          종료
        </button>
      </div>

      <div className="floating-time">
        {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
      </div>

      <div className="floating-actions">
        <button type="button" className="primary-button small" onClick={() => setIsRunning((current) => !current)}>
          {isRunning ? '일시정지' : '재개'}
        </button>
        <button
          type="button"
          className="secondary-button small"
          onClick={() => setTimerSeconds((current) => current + 30)}
        >
          +30초
        </button>
      </div>
    </div>
  )
}
