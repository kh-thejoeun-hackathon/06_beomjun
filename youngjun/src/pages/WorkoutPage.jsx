import DayTabs from '../components/DayTabs'
import ExerciseCard from '../components/ExerciseCard'
import RestTimer from '../components/RestTimer'
import { EXERCISE_OPTIONS } from '../utils/storage'

export default function WorkoutPage({
  selectedDay,
  setSelectedDay,
  selectedDayWorkouts,
  workoutForm,
  setWorkoutForm,
  handleAddWorkout,
  deleteWorkout,
  addSetToWorkout,
  updateWorkoutSet,
  toggleSetCompletion,
  selectedRestSeconds,
  setSelectedRestSeconds,
  timerSeconds,
  isRunning,
  setIsRunning,
  setTimerSeconds,
}) {
  return (
    <div className="page-stack">
      <section className="panel page-panel">
        <div className="section-header">
          <h2>운동 기록</h2>
          <span className="pill">{selectedDay}</span>
        </div>

        <DayTabs selectedDay={selectedDay} setSelectedDay={setSelectedDay} />

        <form className="record-form" onSubmit={handleAddWorkout}>
          <div className="form-row compact-row">
            <label>
              유형
              <select
                value={workoutForm.category}
                onChange={(event) => {
                  const nextCategory = event.target.value
                  const nextExercise = EXERCISE_OPTIONS[nextCategory][0]
                  setWorkoutForm((current) => ({ ...current, category: nextCategory, exercise: nextExercise }))
                }}
              >
                {Object.keys(EXERCISE_OPTIONS).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              운동 종목
              <select
                value={workoutForm.exercise}
                onChange={(event) => setWorkoutForm((current) => ({ ...current, exercise: event.target.value }))}
              >
                {EXERCISE_OPTIONS[workoutForm.category].map((exercise) => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))}
              </select>
            </label>

            <button type="submit" className="primary-button wide-button">운동 추가</button>
          </div>
        </form>

        <div className="selected-day-workouts">
          {selectedDayWorkouts.length === 0 ? (
            <div className="empty-workout-panel">
              <p>{selectedDay}요일에는 아직 기록된 운동이 없어요.</p>
            </div>
          ) : (
            selectedDayWorkouts.map((workout) => (
              <ExerciseCard
                key={workout.id}
                workout={workout}
                deleteWorkout={deleteWorkout}
                addSetToWorkout={addSetToWorkout}
                updateWorkoutSet={updateWorkoutSet}
                toggleSetCompletion={toggleSetCompletion}
              />
            ))
          )}
        </div>
      </section>

      <section className="panel page-panel timer-panel">
        <div className="section-header">
          <h2>휴식 타이머</h2>
          <span className="pill">SET</span>
        </div>

        <RestTimer
          selectedRestSeconds={selectedRestSeconds}
          setSelectedRestSeconds={setSelectedRestSeconds}
          timerSeconds={timerSeconds}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          setTimerSeconds={setTimerSeconds}
        />
      </section>
    </div>
  )
}
