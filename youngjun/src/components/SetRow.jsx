export default function SetRow({ index, set, workoutId, updateWorkoutSet, toggleSetCompletion }) {
  return (
    <div className={`set-item ${set.completed ? 'completed' : ''}`}>
      <div className="set-index">{index + 1}세트</div>

      <div className="set-main-content">
        <div className="set-type-row">
          <select
            value={set.type}
            onChange={(event) => updateWorkoutSet(workoutId, set.id, 'type', event.target.value)}
          >
            <option value="normal">일반</option>
            <option value="rest-pause">레스트-포즈</option>
          </select>
        </div>

        <div className="set-inputs">
          <label>
            <span>{set.type === 'rest-pause' ? '총 반복' : '반복'}</span>
            <input
              type="number"
              min="0"
              value={set.reps}
              onChange={(event) => updateWorkoutSet(workoutId, set.id, 'reps', event.target.value)}
            />
          </label>

          <label>
            <span>중량</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={set.weight}
              onChange={(event) => updateWorkoutSet(workoutId, set.id, 'weight', event.target.value)}
            />
          </label>
        </div>

        {set.type === 'rest-pause' && (
          <>
            <label className="rep-detail-label">
              <span>세부 반복</span>
              <input
                type="text"
                value={set.repDetail}
                onChange={(event) => updateWorkoutSet(workoutId, set.id, 'repDetail', event.target.value)}
                placeholder="예: 10 + 5 + 3"
              />
            </label>
            <div className="rep-detail-summary">
              {set.repDetail ? `${set.repDetail} = 총 ${set.reps}회` : `총 ${set.reps}회`}
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        className={`complete-toggle ${set.completed ? 'is-complete' : ''}`}
        onClick={() => toggleSetCompletion(workoutId, set.id)}
      >
        {set.completed ? '완료됨' : '세트 완료'}
      </button>
    </div>
  )
}
