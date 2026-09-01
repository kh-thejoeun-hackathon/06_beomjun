export default function DietPage({ diet, toggleDiet }) {
  const entries = [
    { key: 'breakfast', label: '아침' },
    { key: 'lunch', label: '점심' },
    { key: 'snack', label: '간식' },
    { key: 'dinner', label: '저녁' },
    { key: 'chickenBreast', label: '닭가슴살' },
    { key: 'carbs', label: '탄수화물' },
    { key: 'vegetables', label: '채소' },
    { key: 'water', label: '수분' },
  ]

  const completedCount = entries.filter(({ key }) => diet[key]).length
  const progress = (completedCount / entries.length) * 100

  return (
    <div className="page-stack">
      <section className="panel page-panel">
        <div className="section-header">
          <h2>식단 체크</h2>
          <span className="pill">{completedCount} / {entries.length} 완료</span>
        </div>

        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="panel page-panel">
        <div className="diet-grid">
          {entries.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`diet-item ${diet[key] ? 'checked' : ''}`}
              onClick={() => toggleDiet(key)}
            >
              <span className="checkmark">{diet[key] ? '✓' : ''}</span>
              {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
