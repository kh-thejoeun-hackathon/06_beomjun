export const parseRepDetail = (value = '') => {
  const matches = String(value ?? '').match(/\d+(?:\.\d+)?/g)
  if (!matches) return 0

  return matches.reduce((sum, item) => sum + Number(item), 0)
}

export const formatRepDetail = (value = '') => {
  const compact = String(value ?? '').replace(/x|×/gi, '+').replace(/,/g, '+').replace(/\s+/g, '')
  const parts = compact.split('+').map((item) => item.trim()).filter(Boolean)

  if (parts.length === 0) return ''

  return parts.map((item) => Number(item)).join(' + ')
}

export const normalizeSet = (set) => {
  const type = set.type === 'rest-pause' ? 'rest-pause' : 'normal'
  const reps = Number(set.reps ?? parseRepDetail(set.repDetail ?? '')) || 0
  const repDetail = type === 'rest-pause' ? formatRepDetail(set.repDetail ?? String(reps)) : String(reps || 0)

  return {
    id: set.id || crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    reps,
    repDetail,
    weight: Number(set.weight) || 0,
    completed: Boolean(set.completed),
    type,
  }
}

export const normalizeWorkout = (workout) => ({
  ...workout,
  sets: Array.isArray(workout.sets) ? workout.sets.map(normalizeSet) : [],
})

export const buildSet = (reps = 0, weight = 0, completed = false, type = 'normal', repDetail = '') => {
  const normalizedType = type === 'rest-pause' ? 'rest-pause' : 'normal'
  const resolvedReps = Number(reps) || 0
  const resolvedRepDetail = normalizedType === 'rest-pause'
    ? formatRepDetail(repDetail || String(resolvedReps))
    : String(resolvedReps)

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    reps: resolvedReps,
    repDetail: resolvedRepDetail,
    weight: Number(weight) || 0,
    completed,
    type: normalizedType,
  }
}

export const getSetTotalReps = (set) => {
  if (set.type === 'rest-pause') {
    return Number(set.reps) || parseRepDetail(set.repDetail)
  }

  return Number(set.reps) || 0
}

export const getWorkoutProgress = (workout) => {
  const totalCount = workout.sets.length || 0
  const completeCount = workout.sets.filter((set) => set.completed).length

  return {
    totalCount,
    completeCount,
    progressPercent: totalCount === 0 ? 0 : (completeCount / totalCount) * 100,
  }
}

export const getAnalysis = (workouts) => {
  const currentEntries = workouts.filter((entry) => entry.week === 'current')
  const previousEntries = workouts.filter((entry) => entry.week === 'previous')

  const totalRepsCurrent = currentEntries.reduce(
    (sum, entry) => sum + entry.sets.reduce((setSum, set) => setSum + getSetTotalReps(set), 0),
    0,
  )
  const totalRepsPrevious = previousEntries.reduce(
    (sum, entry) => sum + entry.sets.reduce((setSum, set) => setSum + getSetTotalReps(set), 0),
    0,
  )

  const exerciseNames = [...new Set(currentEntries.map((entry) => entry.exercise))]
  const improvedExercises = exerciseNames.filter((name) => {
    const current = currentEntries
      .filter((entry) => entry.exercise === name)
      .reduce((sum, entry) => sum + entry.sets.reduce((total, set) => total + getSetTotalReps(set), 0), 0)
    const previous = previousEntries
      .filter((entry) => entry.exercise === name)
      .reduce((sum, entry) => sum + entry.sets.reduce((total, set) => total + getSetTotalReps(set), 0), 0)
    return current > previous
  }).length

  const continuousPR = Math.max(
    0,
    ...workouts.flatMap((entry) =>
      entry.sets.filter((set) => set.type === 'normal').map((set) => Number(set.reps) || 0),
    ),
  )

  const restPausePR = Math.max(
    0,
    ...workouts.flatMap((entry) =>
      entry.sets.filter((set) => set.type === 'rest-pause').map((set) => getSetTotalReps(set)),
    ),
  )

  const improvementRate = totalRepsPrevious === 0 ? 0 : ((totalRepsCurrent - totalRepsPrevious) / totalRepsPrevious) * 100

  const exerciseComparison = [...new Set(workouts.map((entry) => entry.exercise))]
    .map((exercise) => {
      const previousTotal = previousEntries
        .filter((entry) => entry.exercise === exercise)
        .reduce((sum, entry) => sum + entry.sets.reduce((total, set) => total + getSetTotalReps(set), 0), 0)
      const currentTotal = currentEntries
        .filter((entry) => entry.exercise === exercise)
        .reduce((sum, entry) => sum + entry.sets.reduce((total, set) => total + getSetTotalReps(set), 0), 0)

      const delta = currentTotal - previousTotal
      const percent = previousTotal === 0 ? 0 : (delta / previousTotal) * 100

      return {
        exercise,
        previous: previousTotal,
        current: currentTotal,
        delta,
        percent,
      }
    })
    .filter((item) => item.previous > 0 || item.current > 0)
    .sort((a, b) => b.current - a.current)

  return {
    currentReps: totalRepsCurrent,
    previousReps: totalRepsPrevious,
    improvedExercises,
    improvementRate,
    personalBest: {
      continuous: continuousPR,
      restPause: restPausePR,
    },
    exerciseComparison,
  }
}
