import { useEffect, useMemo, useState } from 'react'
import './App.css'
import BottomNavigation from './components/BottomNavigation'
import FloatingTimer from './components/FloatingTimer'
import AnalysisPage from './pages/AnalysisPage'
import DietPage from './pages/DietPage'
import WeightPage from './pages/WeightPage'
import WorkoutPage from './pages/WorkoutPage'
import { DEFAULT_DIET, DEFAULT_WEIGHT_LOGS, DEFAULT_WORKOUTS, EXERCISE_OPTIONS, getTodayDay, loadState, saveState } from './utils/storage'
import { buildSet, formatRepDetail, getAnalysis, normalizeWorkout, parseRepDetail } from './utils/workoutAnalysis'

function App() {
  const [activePage, setActivePage] = useState('workout')
  const [workouts, setWorkouts] = useState(() =>
    loadState('youngjun-workouts-v3', DEFAULT_WORKOUTS).map(normalizeWorkout),
  )
  const [weights, setWeights] = useState(() => loadState('youngjun-weights', DEFAULT_WEIGHT_LOGS))
  const [diet, setDiet] = useState(() => loadState('youngjun-diet', DEFAULT_DIET))
  const [selectedDay, setSelectedDay] = useState(() => getTodayDay())
  const [selectedRestSeconds, setSelectedRestSeconds] = useState(90)
  const [timerSeconds, setTimerSeconds] = useState(90)
  const [isRunning, setIsRunning] = useState(false)
  const [weightInput, setWeightInput] = useState('71.8')
  const [weightDate, setWeightDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [workoutForm, setWorkoutForm] = useState({
    category: '헬스장 기구',
    exercise: EXERCISE_OPTIONS['헬스장 기구'][0],
  })

  useEffect(() => {
    saveState('youngjun-workouts-v3', workouts)
  }, [workouts])

  useEffect(() => {
    saveState('youngjun-weights', weights)
  }, [weights])

  useEffect(() => {
    saveState('youngjun-diet', diet)
  }, [diet])

  useEffect(() => {
    if (!isRunning) return

    const timerId = window.setInterval(() => {
      setTimerSeconds((current) => {
        if (current <= 1) {
          setIsRunning(false)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isRunning])

  const selectedDayWorkouts = useMemo(
    () => workouts.filter((entry) => entry.week === 'current' && entry.day === selectedDay),
    [selectedDay, workouts],
  )

  const analysis = useMemo(() => getAnalysis(workouts), [workouts])
  const latestWeight = weights.at(-1)?.value ?? 0
  const completedDiet = Object.values(diet).filter(Boolean).length

  const startTimer = (seconds = selectedRestSeconds) => {
    setTimerSeconds(seconds)
    setIsRunning(true)
  }

  const handleAddWorkout = (event) => {
    event.preventDefault()

    if (!workoutForm.exercise) return

    const nextWorkout = {
      id: `workout-${Date.now()}`,
      week: 'current',
      day: selectedDay,
      category: workoutForm.category,
      exercise: workoutForm.exercise,
      sets: [buildSet(8, 0, false, 'normal')],
    }

    setWorkouts((current) => [...current, nextWorkout])
    setWorkoutForm((current) => ({
      ...current,
      exercise: EXERCISE_OPTIONS[current.category][0],
    }))
  }

  const updateWorkoutSet = (workoutId, setId, field, value) => {
    setWorkouts((current) =>
      current.map((workout) => {
        if (workout.id !== workoutId) return workout

        return {
          ...workout,
          sets: workout.sets.map((set) => {
            if (set.id !== setId) return set

            if (field === 'type') {
              const nextType = value === 'rest-pause' ? 'rest-pause' : 'normal'
              const nextRepDetail = nextType === 'rest-pause'
                ? formatRepDetail(set.repDetail || String(set.reps || 0))
                : String(set.reps || 0)

              return {
                ...set,
                type: nextType,
                repDetail: nextRepDetail,
                reps: nextType === 'rest-pause' ? Number(set.reps) || parseRepDetail(nextRepDetail) : Number(set.reps) || 0,
              }
            }

            if (field === 'repDetail') {
              const nextRepDetail = formatRepDetail(value)
              const nextReps = parseRepDetail(nextRepDetail)
              return {
                ...set,
                repDetail: nextRepDetail,
                reps: nextReps,
              }
            }

            if (field === 'reps') {
              return {
                ...set,
                reps: Number(value) || 0,
                repDetail: set.type === 'rest-pause' ? formatRepDetail(String(value)) : String(Number(value) || 0),
              }
            }

            return {
              ...set,
              [field]: field === 'weight' ? Number(value) : value,
            }
          }),
        }
      }),
    )
  }

  const toggleSetCompletion = (workoutId, setId) => {
    setWorkouts((current) =>
      current.map((workout) => {
        if (workout.id !== workoutId) return workout

        return {
          ...workout,
          sets: workout.sets.map((set) => {
            if (set.id !== setId) return set

            const isCompleted = !set.completed
            if (isCompleted) {
              startTimer(selectedRestSeconds)
            }

            return { ...set, completed: isCompleted }
          }),
        }
      }),
    )
  }

  const addSetToWorkout = (workoutId) => {
    setWorkouts((current) =>
      current.map((workout) =>
        workout.id === workoutId
          ? { ...workout, sets: [...workout.sets, buildSet(8, 0, false, 'normal')] }
          : workout,
      ),
    )
  }

  const deleteWorkout = (workoutId) => {
    setWorkouts((current) => current.filter((workout) => workout.id !== workoutId))
  }

  const handleWeightSubmit = (event) => {
    event.preventDefault()

    const value = Number(weightInput)
    if (Number.isNaN(value)) return

    const dateValue = weightDate || new Date().toISOString().slice(0, 10)

    setWeights((current) => [...current, { id: Date.now(), date: dateValue, value }])
    setWeightInput(String(value))
    setWeightDate(dateValue)
  }

  const toggleDiet = (key) => {
    setDiet((current) => ({ ...current, [key]: !current[key] }))
  }

  const renderPage = () => {
    switch (activePage) {
      case 'analysis':
        return <AnalysisPage analysis={analysis} />
      case 'weight':
        return (
          <WeightPage
            weights={weights}
            weightInput={weightInput}
            setWeightInput={setWeightInput}
            handleWeightSubmit={handleWeightSubmit}
            weightDate={weightDate}
            setWeightDate={setWeightDate}
          />
        )
      case 'diet':
        return <DietPage diet={diet} toggleDiet={toggleDiet} />
      case 'workout':
      default:
        return (
          <WorkoutPage
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            selectedDayWorkouts={selectedDayWorkouts}
            workoutForm={workoutForm}
            setWorkoutForm={setWorkoutForm}
            handleAddWorkout={handleAddWorkout}
            deleteWorkout={deleteWorkout}
            addSetToWorkout={addSetToWorkout}
            updateWorkoutSet={updateWorkoutSet}
            toggleSetCompletion={toggleSetCompletion}
            selectedRestSeconds={selectedRestSeconds}
            setSelectedRestSeconds={setSelectedRestSeconds}
            timerSeconds={timerSeconds}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
            setTimerSeconds={setTimerSeconds}
          />
        )
    }
  }

  const pageTitleMap = {
    workout: '운동 기록 & 휴식 타이머',
    analysis: '분석',
    weight: '체중 기록',
    diet: '식단 체크',
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Workout Manager</p>
          <h1>{pageTitleMap[activePage]}</h1>
        </div>

        <div className="header-badges">
          <span className="badge success">총 반복 {analysis.currentReps}</span>
          <span className="badge">체중 {latestWeight.toFixed(1)}kg</span>
        </div>
      </header>

      <main className="page-shell">
        {renderPage()}
      </main>

      {isRunning && (
        <FloatingTimer
          timerSeconds={timerSeconds}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          setTimerSeconds={setTimerSeconds}
          onClose={() => setIsRunning(false)}
        />
      )}

      <BottomNavigation activePage={activePage} onChangePage={setActivePage} />
    </div>
  )
}

export default App
