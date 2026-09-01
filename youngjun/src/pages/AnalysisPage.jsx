import StatCard from '../components/StatCard'

export default function AnalysisPage({ analysis }) {
  return (
    <div className="page-stack">
      <section className="panel page-panel">
        <div className="section-header">
          <h2>자동 비교</h2>
          <span className="pill accent">전주 대비</span>
        </div>

        <div className="stats-grid">
          <StatCard label="이번 주 총 반복" value={`${analysis.currentReps}`} />
          <StatCard label="지난주 총 반복" value={`${analysis.previousReps}`} />
          <StatCard label="향상한 운동 종목" value={`${analysis.improvedExercises}개`} accent />
          <StatCard
            label="전체 향상률"
            value={`${analysis.improvementRate >= 0 ? '+' : ''}${analysis.improvementRate.toFixed(1)}%`}
            accent
          />
        </div>
      </section>

      <section className="panel page-panel">
        <div className="section-header">
          <h2>개인 최고 PR</h2>
          <span className="pill">기록</span>
        </div>

        <div className="stats-grid">
          <StatCard label="연속 반복 PR" value={`${analysis.personalBest.continuous}회`} />
          <StatCard label="레스트-포즈 총 반복 PR" value={`${analysis.personalBest.restPause}회`} />
        </div>
      </section>

      <section className="panel page-panel">
        <div className="section-header">
          <h2>운동 종목별 비교</h2>
          <span className="pill">리뷰</span>
        </div>

        <div className="comparison-list">
          {analysis.exerciseComparison.length === 0 ? (
            <div className="empty-workout-panel small-panel">
              <p>운동 기록이 없어서 비교 데이터가 아직 없어요.</p>
            </div>
          ) : (
            analysis.exerciseComparison.map((item) => (
              <div key={item.exercise} className="comparison-item">
                <div className="comparison-header">
                  <strong>{item.exercise}</strong>
                  <span className={item.delta >= 0 ? 'positive' : 'negative'}>
                    {item.delta >= 0 ? '+' : ''}{item.delta}회 / {item.percent >= 0 ? '+' : ''}{item.percent.toFixed(1)}%
                  </span>
                </div>
                <div className="comparison-detail">
                  <span>지난주 {item.previous}회</span>
                  <span>→</span>
                  <span>이번주 {item.current}회</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
