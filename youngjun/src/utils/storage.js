export const DAYS = ['월', '화', '수', '목', '금', '토', '일']
export const REST_OPTIONS = [60, 90, 120, 180]

export const EXERCISE_OPTIONS = {
  '헬스장 기구': ['벤치프레스', '스쿼트', '데드리프트', '랫풀다운', '숄더프레스'],
  '맨몸': ['푸시업', '턱걸이', '런지', '플랭크', '버피테스트'],
}

export const DEFAULT_WORKOUTS = [
  {
    id: 'workout-1',
    week: 'current',
    day: '월',
    category: '헬스장 기구',
    exercise: '벤치프레스',
    sets: [
      { id: 'set-1', reps: 8, repDetail: '8', weight: 60, completed: true, type: 'normal' },
      { id: 'set-2', reps: 10, repDetail: '10', weight: 60, completed: true, type: 'normal' },
      { id: 'set-3', reps: 18, repDetail: '10 + 5 + 3', weight: 60, completed: false, type: 'rest-pause' },
    ],
  },
  {
    id: 'workout-2',
    week: 'current',
    day: '수',
    category: '헬스장 기구',
    exercise: '스쿼트',
    sets: [
      { id: 'set-4', reps: 7, repDetail: '7', weight: 110, completed: true, type: 'normal' },
      { id: 'set-5', reps: 7, weight: 110, repDetail: '7', completed: true, type: 'normal' },
      { id: 'set-6', reps: 6, repDetail: '6', weight: 110, completed: false, type: 'normal' },
    ],
  },
  {
    id: 'workout-3',
    week: 'current',
    day: '금',
    category: '맨몸',
    exercise: '푸시업',
    sets: [
      { id: 'set-7', reps: 18, repDetail: '18', weight: 0, completed: true, type: 'normal' },
      { id: 'set-8', reps: 15, repDetail: '15', weight: 0, completed: false, type: 'normal' },
      { id: 'set-9', reps: 12, repDetail: '12', weight: 0, completed: false, type: 'normal' },
    ],
  },
  {
    id: 'workout-4',
    week: 'previous',
    day: '월',
    category: '헬스장 기구',
    exercise: '벤치프레스',
    sets: [
      { id: 'set-10', reps: 7, repDetail: '7', weight: 55, completed: true, type: 'normal' },
      { id: 'set-11', reps: 7, repDetail: '7', weight: 55, completed: true, type: 'normal' },
      { id: 'set-12', reps: 6, repDetail: '6', weight: 55, completed: false, type: 'normal' },
    ],
  },
  {
    id: 'workout-5',
    week: 'previous',
    day: '수',
    category: '헬스장 기구',
    exercise: '스쿼트',
    sets: [
      { id: 'set-13', reps: 6, repDetail: '6', weight: 100, completed: true, type: 'normal' },
      { id: 'set-14', reps: 6, repDetail: '6', weight: 100, completed: false, type: 'normal' },
      { id: 'set-15', reps: 5, repDetail: '5', weight: 100, completed: false, type: 'normal' },
    ],
  },
  {
    id: 'workout-6',
    week: 'previous',
    day: '금',
    category: '맨몸',
    exercise: '푸시업',
    sets: [
      { id: 'set-16', reps: 15, repDetail: '15', weight: 0, completed: true, type: 'normal' },
      { id: 'set-17', reps: 12, repDetail: '12', weight: 0, completed: false, type: 'normal' },
      { id: 'set-18', reps: 10, repDetail: '10', weight: 0, completed: false, type: 'normal' },
    ],
  },
]

export const DEFAULT_WEIGHT_LOGS = [
  { id: 1, date: '2026-08-17', value: 72.6 },
  { id: 2, date: '2026-08-24', value: 72.2 },
  { id: 3, date: '2026-08-31', value: 71.8 },
]

export const DEFAULT_DIET = {
  breakfast: true,
  lunch: true,
  snack: true,
  dinner: false,
  chickenBreast: true,
  carbs: true,
  vegetables: true,
  water: true,
}

export const getTodayDay = () => {
  const index = new Date().getDay()
  return DAYS[(index + 6) % 7]
}

export const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export const loadState = (key, fallback) => {
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const saveState = (key, value) => {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(key, JSON.stringify(value))
}
