export default function StatCard({ label, value, accent = false, meta = null, className = '' }) {
  return (
    <div className={`stat-card ${accent ? 'accent-card' : ''} ${className}`.trim()}>
      <span>{label}</span>
      <strong>{value}</strong>
      {meta ? <small>{meta}</small> : null}
    </div>
  )
}
