import StatCard from '../components/StatCard'

export default function WeightPage({
  weights,
  weightInput,
  setWeightInput,
  handleWeightSubmit,
  weightDate,
  setWeightDate,
}) {
  const latestWeight = weights.at(-1)?.value ?? 0
  const firstWeight = weights[0]?.value ?? latestWeight
  const weekDelta = weights.length >= 2 ? latestWeight - weights[weights.length - 2].value : 0
  const startDelta = latestWeight - firstWeight

  return (
    <div className="page-stack">
      <section className="panel page-panel">
        <div className="section-header">
          <h2>체중 기록</h2>
          <span className="pill">매주 공복</span>
        </div>

        <div className="weight-hero">
          <span className="eyebrow small">현재 체중</span>
          <strong>{latestWeight.toFixed(1)}kg</strong>
        </div>

        <div className="stats-grid weight-grid">
          <StatCard label="현재 체중" value={`${latestWeight.toFixed(1)}kg`} accent />
          <StatCard label="지난주 대비" value={`${weekDelta >= 0 ? '+' : ''}${weekDelta.toFixed(1)}kg`} />
          <StatCard label="시작 대비" value={`${startDelta >= 0 ? '+' : ''}${startDelta.toFixed(1)}kg`} />
        </div>
      </section>

      <section className="panel page-panel">
        <div className="section-header">
          <h2>기록 추가</h2>
          <span className="pill">오늘</span>
        </div>

        <form className="mini-form" onSubmit={handleWeightSubmit}>
          <input
            type="date"
            value={weightDate}
            onChange={(event) => setWeightDate(event.target.value)}
            className="date-input"
          />
          <input
            type="number"
            step="0.1"
            value={weightInput}
            onChange={(event) => setWeightInput(event.target.value)}
            placeholder="체중 입력"
          />
          <button type="submit" className="primary-button wide-button">체중 기록 추가</button>
        </form>
      </section>

      <section className="panel page-panel">
        <div className="section-header">
          <h2>최근 체중 기록</h2>
          <span className="pill">{weights.length}개</span>
        </div>

        <div className="weight-list">
          {weights.map((entry) => (
            <div key={entry.id} className="weight-row">
              <span>{entry.date}</span>
              <strong>{entry.value.toFixed(1)}kg</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
