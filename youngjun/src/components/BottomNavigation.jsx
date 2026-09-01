const NAV_ITEMS = [
  { key: 'workout', label: '운동', icon: '💪' },
  { key: 'analysis', label: '분석', icon: '📊' },
  { key: 'weight', label: '체중', icon: '⚖️' },
  { key: 'diet', label: '식단', icon: '🍽️' },
]

export default function BottomNavigation({ activePage, onChangePage }) {
  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      {NAV_ITEMS.map(({ key, label, icon }) => (
        <button
          key={key}
          type="button"
          className={`bottom-nav-item ${activePage === key ? 'active' : ''}`}
          onClick={() => onChangePage(key)}
        >
          <span className="nav-icon" aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
