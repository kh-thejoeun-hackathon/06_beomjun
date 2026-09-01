import SetRow from './SetRow'

export default function ExerciseCard({ workout, deleteWorkout, addSetToWorkout, updateWorkoutSet, toggleSetCompletion }) {
  const completedSets = workout.sets.filter((set) => set.completed).length

  return (
    <article className="exercise-card">
      <div className="exercise-topline">
        <div className="exercise-name-wrap">
          <h3>{workout.exercise}</h3>
        </div>
        <span className="tag">{workout.category}</span>
      </div>

      <div className="exercise-meta">
        <div className="progress-inline">
          <span>완료 {completedSets}/{workout.sets.length}세트</span>
          <div className="mini-progress-bar">
            <span style={{ width: `${workout.sets.length ? (completedSets / workout.sets.length) * 100 : 0}%` }} />
          </div>
        </div>

        <button type="button" className="ghost-button" onClick={() => deleteWorkout(workout.id)}>
          운동 삭제
        </button>
      </div>

      <div className="set-list">
        {workout.sets.map((set, index) => (
          <SetRow
            key={set.id}
            index={index}
            set={set}
            workoutId={workout.id}
            updateWorkoutSet={updateWorkoutSet}
            toggleSetCompletion={toggleSetCompletion}
          />
        ))}
      </div>

      <button type="button" className="add-set-button" onClick={() => addSetToWorkout(workout.id)}>
        + 세트 추가
      </button>
    </article>
  )
}
