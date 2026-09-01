import { DAYS } from '../utils/storage'

export default function DayTabs({ selectedDay, setSelectedDay }) {
  return (
    <div className="day-tabs" aria-label="요일 선택">
      {DAYS.map((day) => (
        <button
          key={day}
          type="button"
          className={`day-tab ${selectedDay === day ? 'active' : ''}`}
          onClick={() => setSelectedDay(day)}
        >
          {day}
        </button>
      ))}
    </div>
  )
}
