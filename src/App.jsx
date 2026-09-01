import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "fitness-tracker-v1";
const DEFAULT_REST_SECONDS = 90;
const DIET_FIELDS = [
  "아침",
  "점심",
  "간식",
  "저녁",
  "닭가슴살",
  "탄수화물",
  "채소",
  "수분",
];

const DEFAULT_PROGRAM = {
  name: "12주 근력 루틴",
  durationWeeks: 12,
  days: ["월", "수", "금"],
  exercises: [
    "벤치프레스",
    "스쿼트",
    "데드리프트",
    "숄더프레스",
    "랫풀다운",
    "바벨로우",
  ],
};

const SAMPLE_WORKOUTS = [
  {
    id: "sample-1",
    date: "2026-08-31",
    week: 1,
    day: "월",
    exercise: "벤치프레스",
    targetSets: 4,
    sets: [
      { weight: 50, reps: 10 },
      { weight: 50, reps: 10 },
      { weight: 55, reps: 8 },
      { weight: 55, reps: 8 },
    ],
    completedSets: 4,
    createdAt: "2026-08-31T10:00:00.000Z",
  },
  {
    id: "sample-2",
    date: "2026-09-02",
    week: 1,
    day: "수",
    exercise: "스쿼트",
    targetSets: 4,
    sets: [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 },
      { weight: 65, reps: 8 },
      { weight: 65, reps: 8 },
    ],
    completedSets: 4,
    createdAt: "2026-09-02T10:00:00.000Z",
  },
  {
    id: "sample-3",
    date: "2026-09-04",
    week: 1,
    day: "금",
    exercise: "데드리프트",
    targetSets: 3,
    sets: [
      { weight: 80, reps: 8 },
      { weight: 80, reps: 8 },
      { weight: 85, reps: 7 },
    ],
    completedSets: 3,
    createdAt: "2026-09-04T10:00:00.000Z",
  },
  {
    id: "sample-4",
    date: "2026-09-07",
    week: 2,
    day: "월",
    exercise: "벤치프레스",
    targetSets: 4,
    sets: [
      { weight: 55, reps: 10 },
      { weight: 55, reps: 10 },
      { weight: 60, reps: 9 },
      { weight: 60, reps: 8 },
    ],
    completedSets: 4,
    createdAt: "2026-09-07T10:00:00.000Z",
  },
];

const SAMPLE_WEIGHT_HISTORY = [
  { week: 1, weight: 72.5 },
  { week: 2, weight: 72.1 },
  { week: 3, weight: 71.8 },
  { week: 4, weight: 71.4 },
];

const SAMPLE_EVALUATIONS = {
  1: {
    good: "첫 주부터 루틴을 꾸준히 지켰다.",
    hard: "초반에는 세트 간 휴식이 부족해 힘들었다.",
    goal: "다음 주에는 반복 횟수 유지와 휴식 시간 조절을 더 신경쓴다.",
  },
};

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildEmptyDiet() {
  return Object.fromEntries(DIET_FIELDS.map((item) => [item, false]));
}

function buildDefaultData() {
  const today = new Date().toISOString().slice(0, 10);

  return {
    workouts: SAMPLE_WORKOUTS,
    weights: SAMPLE_WEIGHT_HISTORY,
    evaluations: SAMPLE_EVALUATIONS,
    dietByDate: {
      [today]: buildEmptyDiet(),
    },
    restSeconds: DEFAULT_REST_SECONDS,
    timerChoice: DEFAULT_REST_SECONDS,
    user: { startWeight: 73, currentWeight: 71.4, goalWeight: 68 },
    program: DEFAULT_PROGRAM,
  };
}

function normalizeDietMap(raw) {
  const base = buildEmptyDiet();
  if (!raw || typeof raw !== "object")
    return { [new Date().toISOString().slice(0, 10)]: base };

  const normalized = {};
  Object.entries(raw).forEach(([date, value]) => {
    normalized[date] = {
      ...base,
      ...(value && typeof value === "object" ? value : {}),
    };
  });

  return normalized;
}

function normalizeStoredData(raw) {
  const base = buildDefaultData();
  if (!raw || typeof raw !== "object") return base;

  const dietByDate =
    raw.dietByDate && typeof raw.dietByDate === "object"
      ? normalizeDietMap(raw.dietByDate)
      : base.dietByDate;

  return {
    workouts: Array.isArray(raw.workouts) ? raw.workouts : base.workouts,
    weights: Array.isArray(raw.weights) ? raw.weights : base.weights,
    evaluations:
      raw.evaluations &&
      typeof raw.evaluations === "object" &&
      !Array.isArray(raw.evaluations)
        ? raw.evaluations
        : base.evaluations,
    dietByDate,
    restSeconds: safeNumber(raw.restSeconds, base.restSeconds),
    timerChoice: safeNumber(
      raw.timerChoice,
      safeNumber(raw.restSeconds, base.timerChoice),
    ),
    user: { ...base.user, ...(raw.user || {}) },
    program: { ...base.program, ...(raw.program || {}) },
  };
}

function loadStoredData() {
  if (typeof window === "undefined") return buildDefaultData();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return buildDefaultData();
    return normalizeStoredData(JSON.parse(stored));
  } catch {
    return buildDefaultData();
  }
}

function saveData(data) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

function formatNumber(value) {
  return Number(value || 0).toFixed(1);
}

function getLatestWeight(weights) {
  return weights.length ? weights[weights.length - 1].weight : 0;
}

function getWorkoutTotalReps(workout) {
  if (!workout || !Array.isArray(workout.sets)) return 0;
  return workout.sets.reduce((sum, set) => sum + safeNumber(set.reps, 0), 0);
}

function getWeeklySummary(workouts, week) {
  const entries = workouts.filter((workout) => workout.week === week);
  const uniqueSessions = new Set(
    entries.map(
      (workout) => `${workout.week}-${workout.day}-${workout.exercise}`,
    ),
  );

  return {
    sessions: uniqueSessions.size,
    reps: entries.reduce(
      (sum, workout) => sum + getWorkoutTotalReps(workout),
      0,
    ),
  };
}

function getSessionByKey(workouts, week, day, exercise) {
  return (
    workouts.find(
      (workout) =>
        workout.week === week &&
        workout.day === day &&
        workout.exercise === exercise,
    ) || null
  );
}

function getExerciseRecords(workouts, week, exercise) {
  return workouts.filter(
    (workout) => workout.week === week && workout.exercise === exercise,
  );
}

function getPreviousExerciseComparison(
  workouts,
  selectedWeek,
  selectedExercise,
) {
  const currentWeekRecords = getExerciseRecords(
    workouts,
    selectedWeek,
    selectedExercise,
  );
  const previousWeekRecords = getExerciseRecords(
    workouts,
    selectedWeek - 1,
    selectedExercise,
  );

  const currentTotal = currentWeekRecords.reduce(
    (sum, workout) => sum + getWorkoutTotalReps(workout),
    0,
  );
  const previousTotal = previousWeekRecords.reduce(
    (sum, workout) => sum + getWorkoutTotalReps(workout),
    0,
  );

  const currentMaxWeight = Math.max(
    0,
    ...currentWeekRecords.flatMap((workout) =>
      workout.sets.map((set) => Number(set.weight) || 0),
    ),
  );
  const previousMaxWeight = Math.max(
    0,
    ...previousWeekRecords.flatMap((workout) =>
      workout.sets.map((set) => Number(set.weight) || 0),
    ),
  );

  if (selectedWeek <= 1 || previousWeekRecords.length === 0) {
    return {
      message: "비교할 이전 기록이 없습니다.",
      previousTotal: 0,
      currentTotal,
      difference: 0,
      improvementRate: 0,
      previousMaxWeight: 0,
      currentMaxWeight,
      weightChange: 0,
      prLabel: "-",
    };
  }

  const difference = currentTotal - previousTotal;
  const improvementRate =
    previousTotal === 0 ? 0 : (difference / previousTotal) * 100;
  const weightChange = currentMaxWeight - previousMaxWeight;

  const historicalMaxWeight = Math.max(
    0,
    ...workouts
      .filter(
        (workout) =>
          workout.exercise === selectedExercise && workout.week < selectedWeek,
      )
      .flatMap((workout) => workout.sets.map((set) => Number(set.weight) || 0)),
  );

  const maxHistoryWeight = Math.max(historicalMaxWeight, previousMaxWeight);
  const isNewPr = currentMaxWeight > maxHistoryWeight && currentMaxWeight > 0;
  const prLabel = isNewPr
    ? `NEW PR ${currentMaxWeight}kg (+${currentMaxWeight - maxHistoryWeight}kg)`
    : `최고 ${maxHistoryWeight || currentMaxWeight || 0}kg`;

  return {
    message: "",
    previousTotal,
    currentTotal,
    difference,
    improvementRate,
    previousMaxWeight,
    currentMaxWeight,
    weightChange,
    prLabel,
  };
}

function getWeightChartPoints(weights) {
  if (!weights.length) return "0,70 100,70";

  const values = weights.map((entry) => entry.weight);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const paddedMin = min - 1;
  const paddedMax = max + 1;
  const paddedRange = Math.max(paddedMax - paddedMin, 1);

  return weights
    .map((entry, index) => {
      const x = (index / Math.max(weights.length - 1, 1)) * 100;
      const y = 100 - ((entry.weight - paddedMin) / paddedRange) * 80 - 10;
      return `${x},${y}`;
    })
    .join(" ");
}

function getRepChartPoints(workouts) {
  const weeks = Array.from({ length: 12 }, (_, index) => index + 1);
  const availableWeeks = weeks.filter((week) =>
    workouts.some((workout) => workout.week === week),
  );

  if (!availableWeeks.length) {
    return "0,70 100,70";
  }

  const totals = availableWeeks.map(
    (week) => getWeeklySummary(workouts, week).reps,
  );
  const max = Math.max(...totals, 1);

  return availableWeeks
    .map((week, index) => {
      const x = (index / Math.max(availableWeeks.length - 1, 1)) * 100;
      const y = 100 - (getWeeklySummary(workouts, week).reps / max) * 80 - 10;
      return `${x},${y}`;
    })
    .join(" ");
}

function App() {
  const [data, setData] = useState(() => loadStoredData());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState("월");
  const [selectedExercise, setSelectedExercise] = useState(
    DEFAULT_PROGRAM.exercises[0],
  );
  const [targetSets, setTargetSets] = useState(4);
  const [setWeight, setSetWeight] = useState("");
  const [setReps, setSetReps] = useState("");
  const [baseWeight, setBaseWeight] = useState(
    () => getLatestWeight(loadStoredData().weights) || 73,
  );
  const [weightWeek, setWeightWeek] = useState(1);
  const [dietDate, setDietDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [reviewWeek, setReviewWeek] = useState(1);
  const [reviewForm, setReviewForm] = useState({
    good: "",
    hard: "",
    goal: "",
  });
  const [restSeconds, setRestSeconds] = useState(DEFAULT_REST_SECONDS);
  const [timerChoice, setTimerChoice] = useState(DEFAULT_REST_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "휴식 완료 - 다음 세트를 시작하세요",
  );

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setData((previous) => ({
        ...previous,
        restSeconds: timerChoice,
        timerChoice,
      }));
    }
  }, [timerChoice]);

  useEffect(() => {
    setRestSeconds(data.restSeconds || DEFAULT_REST_SECONDS);
    setTimerChoice(
      data.timerChoice || data.restSeconds || DEFAULT_REST_SECONDS,
    );
    setBaseWeight(
      getLatestWeight(data.weights) || data.user?.currentWeight || 73,
    );
  }, [data]);

  useEffect(() => {
    if (!timerRunning) return undefined;

    const interval = setInterval(() => {
      setRestSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          setStatusMessage("휴식 완료 - 다음 세트를 시작하세요");
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    setReviewForm(
      data.evaluations?.[String(reviewWeek)] || {
        good: "",
        hard: "",
        goal: "",
      },
    );
  }, [data.evaluations, reviewWeek]);

  const currentWorkout = useMemo(
    () =>
      getSessionByKey(
        data.workouts,
        selectedWeek,
        selectedDay,
        selectedExercise,
      ),
    [data.workouts, selectedWeek, selectedDay, selectedExercise],
  );

  const completedSets = currentWorkout ? currentWorkout.sets.length : 0;
  const isWorkoutComplete =
    completedSets >= (currentWorkout?.targetSets || targetSets);

  useEffect(() => {
    setTargetSets(currentWorkout?.targetSets || 4);
  }, [selectedWeek, selectedDay, selectedExercise, currentWorkout?.targetSets]);

  const currentComparison = useMemo(
    () =>
      getPreviousExerciseComparison(
        data.workouts,
        selectedWeek,
        selectedExercise,
      ),
    [data.workouts, selectedWeek, selectedExercise],
  );

  const latestWeight = getLatestWeight(data.weights);
  const startWeight = data.user?.startWeight || 73;
  const goalWeight = data.user?.goalWeight || 68;
  const weightDifferenceFromStart = latestWeight - startWeight;
  const goalGap = goalWeight - latestWeight;
  const totalThisWeek = getWeeklySummary(data.workouts, selectedWeek);
  const totalDietComplete = Object.values(
    data.dietByDate[dietDate] || buildEmptyDiet(),
  ).filter(Boolean).length;

  const dashboardCards = useMemo(
    () => [
      {
        label: "현재 체중",
        value: `${formatNumber(latestWeight)}kg`,
        accent: "blue",
      },
      {
        label: "시작 체중 대비 변화",
        value: `${weightDifferenceFromStart >= 0 ? "+" : ""}${formatNumber(weightDifferenceFromStart)}kg`,
        accent: "green",
      },
      {
        label: "목표 체중",
        value: `${formatNumber(goalWeight)}kg`,
        accent: "purple",
      },
      {
        label: "목표 달성률",
        value: `${Math.max(0, Math.min(100, ((startWeight - latestWeight) / Math.max(startWeight - goalWeight, 1)) * 100)).toFixed(0)}%`,
        accent: "orange",
      },
      {
        label: "이번 주 총 운동 횟수",
        value: `${totalThisWeek.sessions}회`,
        accent: "red",
      },
      {
        label: "이번 주 총 반복 횟수",
        value: `${totalThisWeek.reps}회`,
        accent: "navy",
      },
      {
        label: "개인 최고 기록(PR)",
        value: currentComparison.prLabel,
        accent: "gold",
      },
    ],
    [
      latestWeight,
      weightDifferenceFromStart,
      goalWeight,
      startWeight,
      totalThisWeek,
      currentComparison.prLabel,
    ],
  );

  const handleWorkoutComplete = () => {
    const parsedWeight = safeNumber(setWeight, 0);
    const parsedReps = safeNumber(setReps, 0);

    if (parsedWeight <= 0 || parsedReps <= 0) {
      window.alert("중량과 반복 횟수는 0보다 큰 값이어야 합니다.");
      return;
    }

    const target = Math.max(1, Number(targetSets) || 1);
    const existing = getSessionByKey(
      data.workouts,
      selectedWeek,
      selectedDay,
      selectedExercise,
    );

    if (existing && existing.sets.length >= target) {
      return;
    }

    const nextSet = { weight: parsedWeight, reps: parsedReps };

    setData((previous) => {
      const nextWorkouts = [...previous.workouts];
      const session = getSessionByKey(
        nextWorkouts,
        selectedWeek,
        selectedDay,
        selectedExercise,
      );

      if (session) {
        const updatedSets = [...session.sets, nextSet];
        const updated = {
          ...session,
          sets: updatedSets.slice(0, target),
          completedSets: updatedSets.slice(0, target).length,
          date: new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString(),
        };

        return {
          ...previous,
          workouts: nextWorkouts.map((item) =>
            item.id === session.id ? updated : item,
          ),
        };
      }

      const createdWorkout = {
        id: `workout-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        week: selectedWeek,
        day: selectedDay,
        exercise: selectedExercise,
        targetSets: target,
        sets: [nextSet],
        completedSets: 1,
        createdAt: new Date().toISOString(),
      };

      return {
        ...previous,
        workouts: [...previous.workouts, createdWorkout],
      };
    });

    setSetWeight("");
    setSetReps("");
    setRestSeconds(timerChoice);
    setTimerRunning(true);
    setStatusMessage("휴식 타이머가 시작되었습니다.");
  };

  const handleCancelLastSet = () => {
    const session = getSessionByKey(
      data.workouts,
      selectedWeek,
      selectedDay,
      selectedExercise,
    );
    if (!session || session.sets.length === 0) return;

    const updatedSets = session.sets.slice(0, -1);

    setData((previous) => {
      const nextWorkouts = previous.workouts.filter(
        (workout) => workout.id !== session.id,
      );
      if (updatedSets.length === 0) {
        return { ...previous, workouts: nextWorkouts };
      }

      return {
        ...previous,
        workouts: previous.workouts.map((workout) =>
          workout.id === session.id
            ? {
                ...workout,
                sets: updatedSets,
                completedSets: updatedSets.length,
              }
            : workout,
        ),
      };
    });
  };

  const handleWeightSave = () => {
    const nextWeight = safeNumber(baseWeight, 0);
    if (nextWeight <= 0) {
      window.alert("체중은 0보다 큰 값이어야 합니다.");
      return;
    }

    setData((previous) => {
      const nextWeights = [...previous.weights];
      const existing = nextWeights.find((entry) => entry.week === weightWeek);

      if (existing) {
        existing.weight = nextWeight;
      } else {
        nextWeights.push({ week: weightWeek, weight: nextWeight });
      }

      return {
        ...previous,
        weights: nextWeights.sort((a, b) => a.week - b.week),
        user: {
          ...previous.user,
          currentWeight: nextWeight,
        },
      };
    });
  };

  const handleDietToggle = (key) => {
    setData((previous) => {
      const dateMap = {
        ...(previous.dietByDate[dietDate] || buildEmptyDiet()),
      };
      dateMap[key] = !dateMap[key];
      return {
        ...previous,
        dietByDate: {
          ...previous.dietByDate,
          [dietDate]: dateMap,
        },
      };
    });
  };

  const handleReviewSave = () => {
    const content = Object.values(reviewForm).every(
      (value) => !String(value).trim(),
    );
    if (content) return;

    setData((previous) => ({
      ...previous,
      evaluations: {
        ...previous.evaluations,
        [String(reviewWeek)]: {
          ...reviewForm,
          good: reviewForm.good.trim(),
          hard: reviewForm.hard.trim(),
          goal: reviewForm.goal.trim(),
        },
      },
    }));
  };

  const startTimer = () => {
    if (restSeconds <= 0) {
      setRestSeconds(timerChoice);
    }
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const restartTimer = () => {
    setTimerRunning(false);
    setRestSeconds(timerChoice);
    setTimerRunning(true);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setRestSeconds(timerChoice);
  };

  const resetDemoData = () => {
    const shouldReset = window.confirm(
      "데모 데이터를 초기화하고 기본 샘플 상태로 되돌리겠습니까?",
    );
    if (!shouldReset) return;

    const nextData = buildDefaultData();
    setData(nextData);
    setTimerChoice(nextData.timerChoice || DEFAULT_REST_SECONDS);
    setRestSeconds(nextData.restSeconds || DEFAULT_REST_SECONDS);
    setSelectedWeek(1);
    setSelectedDay("월");
    setSelectedExercise(DEFAULT_PROGRAM.exercises[0]);
    setDietDate(new Date().toISOString().slice(0, 10));
    setReviewWeek(1);
    setBaseWeight(
      getLatestWeight(nextData.weights) || nextData.user.currentWeight || 73,
    );
  };

  const renderDashboard = () => (
    <div className="panel-grid">
      <div className="cards-grid">
        {dashboardCards.map((card) => (
          <div key={card.label} className={`info-card ${card.accent}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="chart-panel">
        <h3>주차별 체중 변화</h3>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="chart-svg"
        >
          <polyline
            fill="none"
            stroke="#49a6ff"
            strokeWidth="3"
            points={getWeightChartPoints(data.weights)}
          />
          {data.weights.map((entry, index) => {
            const x = (index / Math.max(data.weights.length - 1, 1)) * 100;
            return (
              <g key={`weight-${entry.week}`}>
                <circle cx={x} cy={50} r="1.5" fill="#49a6ff" />
                <text
                  x={x}
                  y="96"
                  textAnchor="middle"
                  fill="#c9d9f3"
                  fontSize="5"
                >
                  {entry.week}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="chart-panel">
        <h3>주차별 총 반복 횟수 변화</h3>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="chart-svg"
        >
          <polyline
            fill="none"
            stroke="#3ddc97"
            strokeWidth="3"
            points={getRepChartPoints(data.workouts)}
          />
          {Array.from({ length: 12 }, (_, index) => index + 1)
            .filter((week) =>
              data.workouts.some((workout) => workout.week === week),
            )
            .map((week, index, arr) => {
              const x = (index / Math.max(arr.length - 1, 1)) * 100;
              return (
                <g key={`rep-${week}`}>
                  <circle cx={x} cy={50} r="1.5" fill="#3ddc97" />
                  <text
                    x={x}
                    y="96"
                    textAnchor="middle"
                    fill="#c9d9f3"
                    fontSize="5"
                  >
                    {week}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>
    </div>
  );

  const renderWorkout = () => {
    const workoutStatusText = isWorkoutComplete
      ? "운동 완료"
      : `${completedSets} / ${targetSets} SET`;
    const workoutSetLabels = Array.from(
      { length: Math.max(targetSets, 1) },
      (_, index) => {
        const setNumber = index + 1;
        const isDone = index < completedSets;
        const isCurrent = index === completedSets && !isWorkoutComplete;
        const actualSet = currentWorkout?.sets[index];

        return {
          setNumber,
          label: isDone ? "완료" : isCurrent ? "진행" : "대기",
          weight: actualSet?.weight ?? "-",
          reps: actualSet?.reps ?? "-",
          isDone,
          isCurrent,
        };
      },
    );

    return (
      <div className="panel-grid workout-layout">
        <div className="section-card workout-main">
          <div className="workout-header">
            <div>
              <span className="workout-badge">
                {selectedDay}요일 · {selectedWeek}주차
              </span>
              <h3>{selectedExercise}</h3>
            </div>
            <span className="status-badge">{workoutStatusText}</span>
          </div>

          <div className="week-select-row">
            <label>
              주차
              <select
                value={selectedWeek}
                onChange={(event) =>
                  setSelectedWeek(Number(event.target.value))
                }
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (week) => (
                    <option key={week} value={week}>
                      {week}주차
                    </option>
                  ),
                )}
              </select>
            </label>
            <label>
              요일
              <select
                value={selectedDay}
                onChange={(event) => setSelectedDay(event.target.value)}
              >
                {DEFAULT_PROGRAM.days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="picker-group">
            <label className="picker-label">운동 종목</label>
            <div className="chip-group wrap">
              {DEFAULT_PROGRAM.exercises.map((exercise) => (
                <button
                  key={exercise}
                  type="button"
                  className={
                    selectedExercise === exercise
                      ? "segment selected"
                      : "segment"
                  }
                  onClick={() => setSelectedExercise(exercise)}
                >
                  {exercise}
                </button>
              ))}
            </div>
          </div>

          <div className="field-row two-col">
            <label>
              목표 세트 수
              <input
                type="number"
                min="1"
                max="10"
                value={targetSets}
                onChange={(event) =>
                  setTargetSets(Math.max(1, Number(event.target.value) || 1))
                }
              />
            </label>
          </div>

          <div className="field-row two-col">
            <label>
              중량(kg)
              <input
                type="number"
                min="0"
                step="0.5"
                value={setWeight}
                onChange={(event) => setSetWeight(event.target.value)}
              />
            </label>
            <label>
              반복 횟수
              <input
                type="number"
                min="1"
                step="1"
                value={setReps}
                onChange={(event) => setSetReps(event.target.value)}
              />
            </label>
          </div>

          <div className="button-row">
            <button
              type="button"
              className="primary-button"
              disabled={isWorkoutComplete}
              onClick={handleWorkoutComplete}
            >
              {isWorkoutComplete ? "운동 완료" : "세트 완료"}
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled={!currentWorkout || currentWorkout.sets.length === 0}
              onClick={handleCancelLastSet}
            >
              마지막 세트 취소
            </button>
          </div>

          <div className="summary-box prominent-box">
            <span className="summary-label">현재 진행</span>
            <div className="set-counter">
              {completedSets} / {targetSets} SET
            </div>
          </div>

          <div className="set-list">
            {workoutSetLabels.map((entry) => (
              <div
                key={`set-${entry.setNumber}`}
                className={`set-item ${entry.isDone ? "done" : ""} ${entry.isCurrent ? "current" : ""}`}
              >
                <span className="set-marker">
                  {entry.isDone ? "✅" : entry.isCurrent ? "▶" : "○"}
                </span>
                <span className="set-number">{entry.setNumber}세트</span>
                <span className="set-value">
                  {entry.isDone || entry.isCurrent
                    ? `${entry.weight}kg × ${entry.reps}회`
                    : "입력 대기"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card timer-card">
          <h3>휴식 타이머</h3>
          <div className="timer-display">
            {String(Math.floor(restSeconds / 60)).padStart(2, "0")}:
            {String(restSeconds % 60).padStart(2, "0")}
          </div>

          <div className="progress-track">
            <div
              className="progress-bar"
              style={{
                width: `${((timerChoice - restSeconds) / Math.max(timerChoice, 1)) * 100}%`,
              }}
            />
          </div>

          <div className="timer-options">
            {[60, 90, 120].map((seconds) => (
              <button
                key={seconds}
                type="button"
                className={timerChoice === seconds ? "chip active" : "chip"}
                onClick={() => {
                  setTimerChoice(seconds);
                  setRestSeconds(seconds);
                  setTimerRunning(false);
                }}
              >
                {seconds}초
              </button>
            ))}
          </div>

          <div className="timer-controls">
            <button type="button" onClick={startTimer}>
              시작
            </button>
            <button type="button" onClick={pauseTimer}>
              일시정지
            </button>
            <button type="button" onClick={restartTimer}>
              다시 시작
            </button>
            <button type="button" onClick={resetTimer}>
              초기화
            </button>
          </div>

          <p className="status-message">
            {restSeconds === 0
              ? statusMessage
              : "휴식 시간을 확인하며 다음 세트를 준비하세요."}
          </p>
        </div>

        <div className="section-card comparison-card">
          <h3>이전 주 기록과 자동 비교</h3>
          <div className="compare-list">
            <div>
              <span>지난주 총 반복</span>
              <strong>
                {currentComparison.message
                  ? "-"
                  : `${currentComparison.previousTotal}회`}
              </strong>
            </div>
            <div>
              <span>이번주 총 반복</span>
              <strong>{currentComparison.currentTotal}회</strong>
            </div>
            <div>
              <span>반복 수 차이</span>
              <strong>
                {currentComparison.message
                  ? "-"
                  : `${currentComparison.difference >= 0 ? "+" : ""}${currentComparison.difference}회`}
              </strong>
            </div>
            <div>
              <span>향상률</span>
              <strong>
                {currentComparison.message
                  ? "-"
                  : `${currentComparison.improvementRate.toFixed(1)}%`}
              </strong>
            </div>
            <div>
              <span>지난주 최고 중량</span>
              <strong>
                {currentComparison.message
                  ? "-"
                  : `${currentComparison.previousMaxWeight}kg`}
              </strong>
            </div>
            <div>
              <span>이번주 최고 중량</span>
              <strong>{currentComparison.currentMaxWeight}kg</strong>
            </div>
            <div>
              <span>중량 변화</span>
              <strong>
                {currentComparison.message
                  ? "-"
                  : `${currentComparison.weightChange >= 0 ? "+" : ""}${currentComparison.weightChange}kg`}
              </strong>
            </div>
            <div>
              <span>PR</span>
              <strong>
                {currentComparison.message || currentComparison.prLabel}
              </strong>
            </div>
          </div>
          {currentComparison.message ? (
            <p className="compare-note">{currentComparison.message}</p>
          ) : null}
        </div>
      </div>
    );
  };

  const renderWeight = () => {
    const weightEntry =
      data.weights.find((entry) => entry.week === weightWeek) || null;
    const currentVisibleWeight = weightEntry?.weight ?? latestWeight;
    const previousWeekWeight =
      data.weights
        .filter((entry) => entry.week < weightWeek)
        .sort((a, b) => b.week - a.week)[0]?.weight ?? currentVisibleWeight;
    const deltaFromPrevious = currentVisibleWeight - previousWeekWeight;
    const weightGoalGap = data.user.goalWeight - currentVisibleWeight;
    const weightNeedText =
      weightGoalGap > 0
        ? `${formatNumber(weightGoalGap)}kg 감량 필요`
        : `${formatNumber(Math.abs(weightGoalGap))}kg 증량 필요`;

    return (
      <div className="panel-grid">
        <div className="section-card">
          <h3>체중 기록</h3>
          <div className="field-row weight-row">
            <label>
              주차
              <select
                value={weightWeek}
                onChange={(event) => setWeightWeek(Number(event.target.value))}
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (week) => (
                    <option key={week} value={week}>
                      {week}주차
                    </option>
                  ),
                )}
              </select>
            </label>
            <label>
              체중(kg)
              <input
                type="number"
                step="0.1"
                value={baseWeight}
                onChange={(event) =>
                  setBaseWeight(Number(event.target.value) || 0)
                }
              />
            </label>
          </div>

          <div className="button-row single">
            <button
              type="button"
              className="primary-button"
              onClick={handleWeightSave}
            >
              체중 저장
            </button>
          </div>

          <ul className="info-list">
            <li>시작 체중: {data.user.startWeight}kg</li>
            <li>현재 체중: {currentVisibleWeight}kg</li>
            <li>목표 체중: {data.user.goalWeight}kg</li>
            <li>전주 대비 변화: {formatNumber(deltaFromPrevious)}kg</li>
            <li>
              시작 대비 변화:{" "}
              {formatNumber(currentVisibleWeight - data.user.startWeight)}kg
            </li>
            <li>목표까지: {weightNeedText}</li>
          </ul>
        </div>

        <div className="section-card">
          <h3>주차별 체중 기록</h3>
          <table className="mini-table">
            <thead>
              <tr>
                <th>주차</th>
                <th>체중</th>
              </tr>
            </thead>
            <tbody>
              {data.weights
                .sort((a, b) => a.week - b.week)
                .map((entry) => (
                  <tr key={`${entry.week}-${entry.weight}`}>
                    <td>{entry.week}주</td>
                    <td>{entry.weight}kg</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDiet = () => {
    const selectedDiet = data.dietByDate[dietDate] || buildEmptyDiet();

    return (
      <div className="panel-grid">
        <div className="section-card">
          <h3>식단 체크</h3>
          <label>
            날짜
            <input
              type="date"
              value={dietDate}
              onChange={(event) => setDietDate(event.target.value)}
            />
          </label>

          <div className="check-grid">
            {DIET_FIELDS.map((key) => (
              <label key={key} className="check-item">
                <input
                  type="checkbox"
                  checked={!!selectedDiet[key]}
                  onChange={() => handleDietToggle(key)}
                />
                <span>{key}</span>
              </label>
            ))}
          </div>

          <div className="summary-box small-box">
            <span className="summary-label">오늘 완료</span>
            <strong>
              {totalDietComplete} / {DIET_FIELDS.length} 완료
            </strong>
          </div>
        </div>
      </div>
    );
  };

  const renderReview = () => (
    <div className="panel-grid">
      <div className="section-card">
        <h3>주간 평가</h3>
        <label>
          주차 선택
          <select
            value={reviewWeek}
            onChange={(event) => setReviewWeek(Number(event.target.value))}
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((week) => (
              <option key={week} value={week}>
                {week}주차
              </option>
            ))}
          </select>
        </label>

        <div className="review-form">
          <label>
            잘된 점
            <textarea
              value={reviewForm.good}
              onChange={(event) =>
                setReviewForm((previous) => ({
                  ...previous,
                  good: event.target.value,
                }))
              }
            />
          </label>
          <label>
            힘들었던 점
            <textarea
              value={reviewForm.hard}
              onChange={(event) =>
                setReviewForm((previous) => ({
                  ...previous,
                  hard: event.target.value,
                }))
              }
            />
          </label>
          <label>
            다음 주 목표
            <textarea
              value={reviewForm.goal}
              onChange={(event) =>
                setReviewForm((previous) => ({
                  ...previous,
                  goal: event.target.value,
                }))
              }
            />
          </label>
          <button
            type="button"
            className="primary-button"
            onClick={handleReviewSave}
          >
            저장
          </button>
        </div>
      </div>

      <div className="section-card">
        <h3>저장된 평가</h3>
        <div className="review-list">
          {Object.entries(data.evaluations)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([week, entry]) => (
              <div key={week} className="review-item">
                <strong>{week}주차</strong>
                <p>
                  <span>잘된 점:</span> {entry.good || "없음"}
                </p>
                <p>
                  <span>힘들었던 점:</span> {entry.hard || "없음"}
                </p>
                <p>
                  <span>다음 주 목표:</span> {entry.goal || "없음"}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderGuide = () => (
    <div className="panel-grid">
      <div className="section-card">
        <h3>사용 방법</h3>
        <ol className="guide-list">
          <li>운동 종목을 선택합니다.</li>
          <li>세트별 중량과 반복 횟수를 입력합니다.</li>
          <li>세트 완료 버튼을 눌러 진행 상태를 저장합니다.</li>
          <li>휴식 타이머가 자동으로 시작됩니다.</li>
          <li>이전 주와 비교해 향상 정도와 PR을 확인합니다.</li>
        </ol>
      </div>

      <div className="section-card">
        <h3>현재 운동 프로그램</h3>
        <ul className="info-list">
          <li>운동 기간: {DEFAULT_PROGRAM.durationWeeks}주</li>
          <li>운동 요일: {DEFAULT_PROGRAM.days.join(" / ")}</li>
          <li>기본 휴식시간: {DEFAULT_REST_SECONDS}초</li>
        </ul>

        <label>
          휴식시간 설정
          <select
            value={timerChoice}
            onChange={(event) => setTimerChoice(Number(event.target.value))}
          >
            {[60, 90, 120].map((seconds) => (
              <option key={seconds} value={seconds}>
                {seconds}초
              </option>
            ))}
          </select>
        </label>

        <div className="button-row single">
          <button
            type="button"
            className="secondary-button"
            onClick={resetDemoData}
          >
            데모 데이터 초기화
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "dashboard", label: "대시보드" },
    { id: "workout", label: "운동 기록" },
    { id: "weight", label: "체중 기록" },
    { id: "diet", label: "식단 체크" },
    { id: "review", label: "주간 평가" },
    { id: "guide", label: "사용 방법 / 설정" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="logo">12W</div>
          <div>
            <h1>운동 관리</h1>
            <p>12주 프로그램</p>
          </div>
        </div>

        <nav className="nav-menu">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id ? "nav-button active" : "nav-button"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">개인 운동 기록</span>
            <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
          </div>
          <div className="status-pill">{totalThisWeek.sessions}회 기록</div>
        </header>

        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "workout" && renderWorkout()}
        {activeTab === "weight" && renderWeight()}
        {activeTab === "diet" && renderDiet()}
        {activeTab === "review" && renderReview()}
        {activeTab === "guide" && renderGuide()}
      </main>
    </div>
  );
}

export default App;
