"use client";

import {
  Activity,
  Award,
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  Home,
  Keyboard,
  LayoutDashboard,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Target,
  TimerReset,
  Trash2,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type QuestTemplate = {
  id: number;
  title: string;
  xp: number;
};

type DailyQuest = {
  id: number;
  templateId: number;
  title: string;
  xp: number;
  completed: boolean;
};

type DailyStat = {
  xp: number;
  quests: number;
  sessions: number;
};

type TimerMode =
  | "focus"
  | "short"
  | "long";

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: ReactNode;
};

const QUEST_TEMPLATES_KEY =
  "focusflow-quest-templates";

const DAILY_QUESTS_KEY =
  "focusflow-daily-quests";

const CURRENT_DATE_KEY =
  "focusflow-current-date";

const COMPLETED_DATES_KEY =
  "focusflow-completed-dates";

const SESSIONS_KEY =
  "focusflow-sessions";

const DAILY_STATS_KEY =
  "focusflow-daily-stats";

const DENSITY_KEY =
  "focusflow-density";

const REMINDER_ENABLED_KEY =
  "focusflow-reminder-enabled";

const REMINDER_TIME_KEY =
  "focusflow-reminder-time";

const PLAYER_NAME_KEY =
  "focusflow-player-name";

const LAST_LEVEL_KEY =
  "focusflow-last-level";

const FOCUS_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

const DEFAULT_QUESTS: QuestTemplate[] = [
  {
    id: 1,
    title:
      "Complete 30 minutes of focused work",
    xp: 50,
  },
  {
    id: 2,
    title: "Solve 2 coding problems",
    xp: 75,
  },
  {
    id: 3,
    title:
      "Read or learn something new",
    xp: 40,
  },
];

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getTodayKey() {
  return getDateKey(new Date());
}

function getPreviousDateKey(
  dateKey: string
) {
  const date = new Date(
    `${dateKey}T12:00:00`
  );

  date.setDate(
    date.getDate() - 1
  );

  return getDateKey(date);
}

function formatDay(dateKey: string) {
  return new Date(
    `${dateKey}T12:00:00`
  ).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
    }
  );
}

function formatDate(dateKey: string) {
  return new Date(
    `${dateKey}T12:00:00`
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

function formatTime(
  seconds: number
) {
  const minutes =
    Math.floor(seconds / 60);

  const remaining =
    seconds % 60;

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    remaining
  ).padStart(
    2,
    "0"
  )}`;
}

function createFreshQuests(
  templates: QuestTemplate[]
) {
  return templates.map(
    (template, index) => ({
      id:
        Date.now() +
        index +
        Math.floor(
          Math.random() * 1000
        ),
      templateId:
        template.id,
      title:
        template.title,
      xp: template.xp,
      completed: false,
    })
  );
}

export default function FocusFlowApp() {
  const [loaded, setLoaded] =
    useState(false);

  const [questTemplates, setQuestTemplates] =
    useState<QuestTemplate[]>(
      DEFAULT_QUESTS
    );

  const [dailyQuests, setDailyQuests] =
    useState<DailyQuest[]>([]);

  const [currentDate, setCurrentDate] =
    useState("");

  const [completedDates, setCompletedDates] =
    useState<string[]>([]);

  const [sessions, setSessions] =
    useState(0);

  const [dailyStats, setDailyStats] =
    useState<Record<string, DailyStat>>(
      {}
    );

  const [playerName, setPlayerName] =
    useState("PLAYER");

  const [showAddQuest, setShowAddQuest] =
    useState(false);

  const [showSettings, setShowSettings] =
    useState(false);

  const [newQuest, setNewQuest] =
    useState("");

  const [newQuestXP, setNewQuestXP] =
    useState(50);

  const [timeLeft, setTimeLeft] =
    useState(FOCUS_TIME);

  const [timerRunning, setTimerRunning] =
    useState(false);

  const [timerMode, setTimerMode] =
    useState<TimerMode>("focus");

  const [xpPopup, setXpPopup] =
    useState<number | null>(null);

  const [
    showStreakCelebration,
    setShowStreakCelebration,
  ] = useState(false);

  const [showLevelUp, setShowLevelUp] =
    useState(false);

  const [newLevel, setNewLevel] =
    useState(1);

  const [newDayMessage, setNewDayMessage] =
    useState("");

  const [density, setDensity] =
    useState<
      "comfortable" | "compact"
    >("comfortable");

  const [
    reminderEnabled,
    setReminderEnabled,
  ] = useState(false);

  const [reminderTime, setReminderTime] =
    useState("18:00");

  const [
    reminderMessage,
    setReminderMessage,
  ] = useState("");

  const [
    activeMobileNav,
    setActiveMobileNav,
  ] = useState("dashboard");

  const [
    showShortcuts,
    setShowShortcuts,
  ] = useState(false);

  const [profileEditing, setProfileEditing] =
    useState(false);

  const [nameDraft, setNameDraft] =
    useState("PLAYER");

  const today = getTodayKey();

  /*
   * LOAD
   */

  useEffect(() => {
    try {
      const savedTemplates =
        localStorage.getItem(
          QUEST_TEMPLATES_KEY
        );

      const savedDailyQuests =
        localStorage.getItem(
          DAILY_QUESTS_KEY
        );

      const savedCurrentDate =
        localStorage.getItem(
          CURRENT_DATE_KEY
        );

      const savedCompletedDates =
        localStorage.getItem(
          COMPLETED_DATES_KEY
        );

      const savedSessions =
        localStorage.getItem(
          SESSIONS_KEY
        );

      const savedDailyStats =
        localStorage.getItem(
          DAILY_STATS_KEY
        );

      const savedDensity =
        localStorage.getItem(
          DENSITY_KEY
        );

      const savedReminderEnabled =
        localStorage.getItem(
          REMINDER_ENABLED_KEY
        );

      const savedReminderTime =
        localStorage.getItem(
          REMINDER_TIME_KEY
        );

      const savedPlayerName =
        localStorage.getItem(
          PLAYER_NAME_KEY
        );

      let templates =
        DEFAULT_QUESTS;

      if (savedTemplates) {
        try {
          templates =
            JSON.parse(
              savedTemplates
            );
        } catch {
          templates =
            DEFAULT_QUESTS;
        }
      } else if (
        savedDailyQuests
      ) {
        try {
          const oldQuests =
            JSON.parse(
              savedDailyQuests
            ) as DailyQuest[];

          templates =
            oldQuests.map(
              (quest) => ({
                id:
                  quest.templateId ||
                  quest.id,
                title:
                  quest.title,
                xp: quest.xp,
              })
            );
        } catch {
          templates =
            DEFAULT_QUESTS;
        }
      }

      setQuestTemplates(
        templates
      );

      if (
        savedCompletedDates
      ) {
        try {
          setCompletedDates(
            JSON.parse(
              savedCompletedDates
            )
          );
        } catch {
          setCompletedDates([]);
        }
      }

      if (savedSessions) {
        setSessions(
          Number(
            savedSessions
          ) || 0
        );
      }

      if (savedDailyStats) {
        try {
          setDailyStats(
            JSON.parse(
              savedDailyStats
            )
          );
        } catch {
          setDailyStats({});
        }
      }

      if (
        savedDensity ===
          "compact" ||
        savedDensity ===
          "comfortable"
      ) {
        setDensity(
          savedDensity
        );
      }

      if (
        savedReminderEnabled ===
        "true"
      ) {
        setReminderEnabled(
          true
        );
      }

      if (savedReminderTime) {
        setReminderTime(
          savedReminderTime
        );
      }

      if (savedPlayerName) {
        setPlayerName(
          savedPlayerName
        );

        setNameDraft(
          savedPlayerName
        );
      }

      if (
        savedCurrentDate ===
          today &&
        savedDailyQuests
      ) {
        try {
          setDailyQuests(
            JSON.parse(
              savedDailyQuests
            )
          );

          setCurrentDate(
            today
          );
        } catch {
          const fresh =
            createFreshQuests(
              templates
            );

          setDailyQuests(
            fresh
          );

          setCurrentDate(
            today
          );
        }
      } else {
        const fresh =
          createFreshQuests(
            templates
          );

        setDailyQuests(
          fresh
        );

        setCurrentDate(
          today
        );

        localStorage.setItem(
          DAILY_QUESTS_KEY,
          JSON.stringify(
            fresh
          )
        );

        localStorage.setItem(
          CURRENT_DATE_KEY,
          today
        );
      }
    } catch (error) {
      console.error(
        "FocusFlow load error:",
        error
      );

      const fresh =
        createFreshQuests(
          DEFAULT_QUESTS
        );

      setQuestTemplates(
        DEFAULT_QUESTS
      );

      setDailyQuests(
        fresh
      );

      setCurrentDate(
        today
      );
    }

    setLoaded(true);
  }, []);

  /*
   * SAVE
   */

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      QUEST_TEMPLATES_KEY,
      JSON.stringify(
        questTemplates
      )
    );
  }, [
    questTemplates,
    loaded,
  ]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      DAILY_QUESTS_KEY,
      JSON.stringify(
        dailyQuests
      )
    );

    localStorage.setItem(
      CURRENT_DATE_KEY,
      currentDate
    );
  }, [
    dailyQuests,
    currentDate,
    loaded,
  ]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      COMPLETED_DATES_KEY,
      JSON.stringify(
        completedDates
      )
    );

    localStorage.setItem(
      SESSIONS_KEY,
      String(sessions)
    );

    localStorage.setItem(
      DAILY_STATS_KEY,
      JSON.stringify(
        dailyStats
      )
    );

    localStorage.setItem(
      DENSITY_KEY,
      density
    );

    localStorage.setItem(
      REMINDER_ENABLED_KEY,
      String(
        reminderEnabled
      )
    );

    localStorage.setItem(
      REMINDER_TIME_KEY,
      reminderTime
    );

    localStorage.setItem(
      PLAYER_NAME_KEY,
      playerName
    );
  }, [
    completedDates,
    sessions,
    dailyStats,
    density,
    reminderEnabled,
    reminderTime,
    playerName,
    loaded,
  ]);

  /*
   * XP / LEVEL
   */

  const totalXP = useMemo(
    () =>
      Object.values(
        dailyStats
      ).reduce(
        (total, stat) =>
          total + stat.xp,
        0
      ),
    [dailyStats]
  );

  const level =
    Math.floor(
      totalXP / 500
    ) + 1;

  const currentLevelXP =
    totalXP % 500;

  const levelProgress =
    (currentLevelXP / 500) *
    100;

  /*
   * LEVEL UP
   */

  useEffect(() => {
    if (!loaded) return;

    const saved =
      localStorage.getItem(
        LAST_LEVEL_KEY
      );

    const previous =
      saved
        ? Number(saved)
        : level;

    if (level > previous) {
      setNewLevel(level);

      setShowLevelUp(
        true
      );

      setTimeout(() => {
        setShowLevelUp(
          false
        );
      }, 3500);
    }

    localStorage.setItem(
      LAST_LEVEL_KEY,
      String(level)
    );
  }, [
    level,
    loaded,
  ]);

  /*
   * STREAK
   */

  const streak = useMemo(() => {
    const dates =
      new Set(
        completedDates
      );

    let count = 0;

    let dateKey = today;

    if (
      !dates.has(
        dateKey
      )
    ) {
      dateKey =
        getPreviousDateKey(
          dateKey
        );
    }

    while (
      dates.has(
        dateKey
      )
    ) {
      count++;

      dateKey =
        getPreviousDateKey(
          dateKey
        );
    }

    return count;
  }, [
    completedDates,
    today,
  ]);

  /*
   * WEEKLY DATA
   */

  const last7Days =
    useMemo(() => {
      const result: {
        key: string;
        label: string;
        date: string;
        active: boolean;
        xp: number;
        quests: number;
        sessions: number;
      }[] = [];

      for (
        let i = 6;
        i >= 0;
        i--
      ) {
        const date =
          new Date();

        date.setDate(
          date.getDate() -
            i
        );

        const key =
          getDateKey(
            date
          );

        result.push({
          key,
          label:
            formatDay(
              key
            ),
          date:
            formatDate(
              key
            ),
          active:
            completedDates.includes(
              key
            ),
          xp:
            dailyStats[
              key
            ]?.xp || 0,
          quests:
            dailyStats[
              key
            ]?.quests || 0,
          sessions:
            dailyStats[
              key
            ]?.sessions || 0,
        });
      }

      return result;
    }, [
      completedDates,
      dailyStats,
    ]);

  const todayStats =
    dailyStats[today] || {
      xp: 0,
      quests: 0,
      sessions: 0,
    };

  const weeklyXP =
    last7Days.reduce(
      (sum, day) =>
        sum + day.xp,
      0
    );

  const weeklySessions =
    last7Days.reduce(
      (sum, day) =>
        sum + day.sessions,
      0
    );

  const weeklyQuests =
    last7Days.reduce(
      (sum, day) =>
        sum + day.quests,
      0
    );

  const maxWeeklyXP =
    Math.max(
      ...last7Days.map(
        (day) => day.xp
      ),
      100
    );

  const bestDay =
    last7Days.reduce(
      (best, day) =>
        day.xp > best.xp
          ? day
          : best,
      last7Days[0]
    );

  const completedToday =
    dailyQuests.filter(
      (quest) =>
        quest.completed
    ).length;

  /*
   * TOTAL QUESTS
   */

  const totalQuestsCompleted =
    Object.values(
      dailyStats
    ).reduce(
      (sum, stat) =>
        sum + stat.quests,
      0
    );

  /*
   * ACHIEVEMENTS
   */

  const achievements =
    useMemo<Achievement[]>(
      () => [
        {
          id: "first-quest",
          title: "First Step",
          description:
            "Complete your first quest.",
          unlocked:
            totalQuestsCompleted >=
            1,
          icon: (
            <Target size={18} />
          ),
        },
        {
          id: "five-quests",
          title: "Getting Serious",
          description:
            "Complete 5 quests.",
          unlocked:
            totalQuestsCompleted >=
            5,
          icon: (
            <Check size={18} />
          ),
        },
        {
          id: "ten-quests",
          title: "Quest Hunter",
          description:
            "Complete 10 quests.",
          unlocked:
            totalQuestsCompleted >=
            10,
          icon: (
            <Trophy size={18} />
          ),
        },
        {
          id: "500-xp",
          title: "XP Collector",
          description:
            "Earn 500 total XP.",
          unlocked:
            totalXP >= 500,
          icon: (
            <Zap size={18} />
          ),
        },
        {
          id: "three-day",
          title: "On Fire",
          description:
            "Reach a 3 day streak.",
          unlocked:
            streak >= 3,
          icon: (
            <Flame
              size={18}
              fill="currentColor"
            />
          ),
        },
        {
          id: "seven-day",
          title: "Consistent",
          description:
            "Reach a 7 day streak.",
          unlocked:
            streak >= 7,
          icon: (
            <Sparkles size={18} />
          ),
        },
        {
          id: "five-sessions",
          title: "Deep Worker",
          description:
            "Complete 5 focus sessions.",
          unlocked:
            sessions >= 5,
          icon: (
            <Clock3 size={18} />
          ),
        },
        {
          id: "level-five",
          title: "Level Five",
          description:
            "Reach level 5.",
          unlocked:
            level >= 5,
          icon: (
            <Award size={18} />
          ),
        },
      ],
      [
        totalQuestsCompleted,
        totalXP,
        streak,
        sessions,
        level,
      ]
    );

  const unlockedAchievements =
    achievements.filter(
      (item) =>
        item.unlocked
    ).length;

  /*
   * DAILY RESET
   */

  useEffect(() => {
    if (!loaded) return;

    const checkDate =
      () => {
        const actualToday =
          getTodayKey();

        if (
          currentDate &&
          actualToday !==
            currentDate
        ) {
          const fresh =
            createFreshQuests(
              questTemplates
            );

          setDailyQuests(
            fresh
          );

          setCurrentDate(
            actualToday
          );

          setNewDayMessage(
            "✨ New day. New quests."
          );

          setTimeout(() => {
            setNewDayMessage(
              ""
            );
          }, 3500);
        }
      };

    const interval =
      setInterval(
        checkDate,
        30000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [
    loaded,
    currentDate,
    questTemplates,
  ]);

  /*
   * TIMER MODE
   */

  const getModeDuration =
    (
      mode: TimerMode
    ) => {
      if (mode === "short")
        return SHORT_BREAK_TIME;

      if (mode === "long")
        return LONG_BREAK_TIME;

      return FOCUS_TIME;
    };

  const setMode = (
    mode: TimerMode
  ) => {
    setTimerRunning(
      false
    );

    setTimerMode(mode);

    setTimeLeft(
      getModeDuration(
        mode
      )
    );
  };

  /*
   * TIMER
   */

  useEffect(() => {
    if (!timerRunning)
      return;

    const interval =
      setInterval(() => {
        setTimeLeft(
          (previous) => {
            if (
              previous <= 1
            ) {
              clearInterval(
                interval
              );

              setTimerRunning(
                false
              );

              if (
                timerMode ===
                "focus"
              ) {
                setSessions(
                  (value) =>
                    value + 1
                );

                const key =
                  getTodayKey();

                setDailyStats(
                  (previousStats) => ({
                    ...previousStats,
                    [key]: {
                      xp:
                        previousStats[
                          key
                        ]?.xp ||
                        0,

                      quests:
                        previousStats[
                          key
                        ]?.quests ||
                        0,

                      sessions:
                        (previousStats[
                          key
                        ]?.sessions ||
                          0) +
                        1,
                    },
                  })
                );

                setXpPopup(
                  25
                );

                setTimeout(
                  () =>
                    setXpPopup(
                      null
                    ),
                  1400
                );
              }

              setTimeLeft(
                getModeDuration(
                  timerMode
                )
              );

              return getModeDuration(
                timerMode
              );
            }

            return (
              previous - 1
            );
          }
        );
      }, 1000);

    return () =>
      clearInterval(
        interval
      );
  }, [
    timerRunning,
    timerMode,
  ]);

  const timerDuration =
    getModeDuration(
      timerMode
    );

  const timerProgress =
    ((timerDuration -
      timeLeft) /
      timerDuration) *
    100;

  /*
   * QUEST TOGGLE
   */

  const toggleQuest = (
    id: number
  ) => {
    const quest =
      dailyQuests.find(
        (item) =>
          item.id === id
      );

    if (!quest) return;

    const completed =
      !quest.completed;

    setDailyQuests(
      (previous) =>
        previous.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  completed,
                }
              : item
        )
    );

    const key =
      getTodayKey();

    if (completed) {
      const firstToday =
        !completedDates.includes(
          key
        );

      setCompletedDates(
        (previous) =>
          previous.includes(
            key
          )
            ? previous
            : [
                ...previous,
                key,
              ]
      );

      setDailyStats(
        (previous) => ({
          ...previous,
          [key]: {
            xp:
              (previous[
                key
              ]?.xp || 0) +
              quest.xp,
            quests:
              (previous[
                key
              ]?.quests || 0) +
              1,
            sessions:
              previous[
                key
              ]?.sessions || 0,
          },
        })
      );

      setXpPopup(
        quest.xp
      );

      setTimeout(
        () => setXpPopup(null),
        1400
      );

      if (firstToday) {
        setShowStreakCelebration(
          true
        );

        setTimeout(
          () =>
            setShowStreakCelebration(
              false
            ),
          2200
        );
      }
    } else {
      setDailyStats(
        (previous) => ({
          ...previous,
          [key]: {
            xp: Math.max(
              0,
              (previous[
                key
              ]?.xp || 0) -
                quest.xp
            ),
            quests:
              Math.max(
                0,
                (previous[
                  key
                ]?.quests || 0) -
                  1
              ),
            sessions:
              previous[
                key
              ]?.sessions || 0,
          },
        })
      );

      const anotherCompleted =
        dailyQuests.some(
          (item) =>
            item.id !== id &&
            item.completed
        );

      if (
        !anotherCompleted
      ) {
        setCompletedDates(
          (previous) =>
            previous.filter(
              (date) =>
                date !== key
            )
        );
      }
    }
  };

  /*
   * ADD QUEST
   */

  const addQuest = () => {
    const title =
      newQuest.trim();

    if (!title) return;

    const templateId =
      Date.now() +
      Math.floor(
        Math.random() *
          10000
      );

    const template: QuestTemplate =
      {
        id: templateId,
        title,
        xp: newQuestXP,
      };

    const quest: DailyQuest =
      {
        id: Date.now(),
        templateId,
        title,
        xp: newQuestXP,
        completed: false,
      };

    setQuestTemplates(
      (previous) => [
        ...previous,
        template,
      ]
    );

    setDailyQuests(
      (previous) => [
        ...previous,
        quest,
      ]
    );

    setNewQuest("");

    setNewQuestXP(50);

    setShowAddQuest(
      false
    );
  };

  /*
   * DELETE QUEST
   */

  const deleteQuest = (
    id: number
  ) => {
    const quest =
      dailyQuests.find(
        (item) =>
          item.id === id
      );

    if (!quest) return;

    const key =
      getTodayKey();

    if (quest.completed) {
      setDailyStats(
        (previous) => ({
          ...previous,
          [key]: {
            xp: Math.max(
              0,
              (previous[
                key
              ]?.xp || 0) -
                quest.xp
            ),
            quests:
              Math.max(
                0,
                (previous[
                  key
                ]?.quests || 0) -
                  1
              ),
            sessions:
              previous[
                key
              ]?.sessions || 0,
          },
        })
      );
    }

    setDailyQuests(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !== id
        )
    );

    setQuestTemplates(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !==
            quest.templateId
        )
    );

    const remaining =
      dailyQuests.some(
        (item) =>
          item.id !== id &&
          item.completed
      );

    if (
      quest.completed &&
      !remaining
    ) {
      setCompletedDates(
        (previous) =>
          previous.filter(
            (date) =>
              date !== key
          )
      );
    }
  };

  /*
   * REMINDER
   */

  const enableReminder =
    async () => {
      setReminderEnabled(
        true
      );

      if (
        "Notification" in
        window
      ) {
        try {
          if (
            Notification.permission ===
            "default"
          ) {
            await Notification.requestPermission();
          }
        } catch {
          // Notification permission can fail silently.
        }
      }
    };

  useEffect(() => {
    if (
      !loaded ||
      !reminderEnabled
    )
      return;

    const check =
      () => {
        const now =
          new Date();

        const current =
          `${String(
            now.getHours()
          ).padStart(
            2,
            "0"
          )}:${String(
            now.getMinutes()
          ).padStart(
            2,
            "0"
          )}`;

        if (
          current !==
          reminderTime
        )
          return;

        const key =
          `focusflow-reminder-${getTodayKey()}`;

        if (
          localStorage.getItem(
            key
          )
        )
          return;

        localStorage.setItem(
          key,
          "true"
        );

        setReminderMessage(
          "🔔 Time for your FocusFlow session."
        );

        setTimeout(
          () =>
            setReminderMessage(
              ""
            ),
          5000
        );

        if (
          "Notification" in
          window &&
          Notification.permission ===
            "granted"
        ) {
          new Notification(
            "FocusFlow",
            {
              body:
                "Time for your focus session.",
            }
          );
        }
      };

    check();

    const interval =
      setInterval(
        check,
        30000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [
    loaded,
    reminderEnabled,
    reminderTime,
  ]);

  /*
   * KEYBOARD SHORTCUTS
   */

  useEffect(() => {
    const handleKey =
      (event: KeyboardEvent) => {
        const target =
          event.target as HTMLElement;

        const isTyping =
          target.tagName ===
            "INPUT" ||
          target.tagName ===
            "TEXTAREA" ||
          target.isContentEditable;

        if (isTyping)
          return;

        if (
          event.code ===
          "Space"
        ) {
          event.preventDefault();

          setTimerRunning(
            (value) =>
              !value
          );
        }

        if (
          event.key.toLowerCase() ===
          "r"
        ) {
          setTimerRunning(
            false
          );

          setTimeLeft(
            getModeDuration(
              timerMode
            )
          );
        }

        if (
          event.key.toLowerCase() ===
          "n"
        ) {
          setShowAddQuest(
            true
          );
        }

        if (
          event.key ===
          "Escape"
        ) {
          setShowAddQuest(
            false
          );

          setShowSettings(
            false
          );

          setShowShortcuts(
            false
          );

          setProfileEditing(
            false
          );
        }
      };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );
  }, [
    timerMode,
  ]);

  /*
   * CLEAR DATA
   */

  const clearAllData =
    () => {
      const confirmed =
        window.confirm(
          "Clear all FocusFlow data? This cannot be undone."
        );

      if (!confirmed)
        return;

      const keys = [
        QUEST_TEMPLATES_KEY,
        DAILY_QUESTS_KEY,
        CURRENT_DATE_KEY,
        COMPLETED_DATES_KEY,
        SESSIONS_KEY,
        DAILY_STATS_KEY,
        DENSITY_KEY,
        REMINDER_ENABLED_KEY,
        REMINDER_TIME_KEY,
        PLAYER_NAME_KEY,
        LAST_LEVEL_KEY,
      ];

      keys.forEach(
        (key) =>
          localStorage.removeItem(
            key
          )
      );

      const fresh =
        createFreshQuests(
          DEFAULT_QUESTS
        );

      setQuestTemplates(
        DEFAULT_QUESTS
      );

      setDailyQuests(
        fresh
      );

      setCurrentDate(
        getTodayKey()
      );

      setCompletedDates(
        []
      );

      setSessions(0);

      setDailyStats({});

      setDensity(
        "comfortable"
      );

      setReminderEnabled(
        false
      );

      setReminderTime(
        "18:00"
      );

      setPlayerName(
        "PLAYER"
      );

      setNameDraft(
        "PLAYER"
      );

      setShowSettings(
        false
      );

      setNewDayMessage(
        "FocusFlow has been reset."
      );

      setTimeout(
        () =>
          setNewDayMessage(
            ""
          ),
        3000
      );
    };

  /*
   * PROFILE
   */

  const saveProfile =
    () => {
      const clean =
        nameDraft
          .trim()
          .slice(0, 18);

      if (!clean) {
        setNameDraft(
          playerName
        );

        setProfileEditing(
          false
        );

        return;
      }

      setPlayerName(
        clean.toUpperCase()
      );

      setNameDraft(
        clean.toUpperCase()
      );

      setProfileEditing(
        false
      );
    };

  /*
   * STYLING
   */

  const densityClass =
    density === "compact"
      ? "p-4 md:p-5"
      : "p-5 md:p-6";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070707] text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="absolute bottom-[-300px] right-[-100px] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[130px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_35%)]" />
      </div>

      {/* NAVBAR */}

      <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#070707]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <a
            href="#dashboard"
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{
                rotate: 8,
                scale: 1.05,
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black"
            >
              <Zap
                size={18}
                fill="currentColor"
              />
            </motion.div>

            <div>
              <p className="text-sm font-bold tracking-[0.2em]">
                FOCUSFLOW
              </p>

              <p className="hidden text-[10px] text-white/35 sm:block">
                BUILD YOUR MOMENTUM
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-2 md:flex">
            <NavLink
              href="#dashboard"
              icon={
                <Home size={13} />
              }
              label="Dashboard"
            />

            <NavLink
              href="#analytics"
              icon={
                <BarChart3
                  size={13}
                />
              }
              label="Analytics"
            />

            <NavLink
              href="#achievements"
              icon={
                <Award size={13} />
              }
              label="Achievements"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/5 px-3 py-1.5 sm:flex">
              <Flame
                size={14}
                className="text-orange-400"
                fill="currentColor"
              />

              <span className="text-xs font-semibold text-orange-300">
                {streak} day
                {streak ===
                1
                  ? ""
                  : "s"}
              </span>
            </div>

            <button
              onClick={() =>
                setShowSettings(
                  true
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              aria-label="Settings"
            >
              <Settings
                size={17}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* DASHBOARD */}

      <div
        id="dashboard"
        className="mx-auto max-w-7xl px-4 pb-28 pt-8 md:px-6 md:pb-20 md:pt-12"
      >
        {/* HERO */}

        <section className="mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/5 px-3 py-1.5 text-xs text-violet-300">
            <Sparkles size={13} />
            Personal productivity
            system
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
                Ready to{" "}
                <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                  level up?
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40 md:text-base">
                Turn focused work
                into progress.
                Complete quests,
                build your streak,
                and keep moving
                forward.
              </p>
            </div>
          </div>
        </section>

        {/* PLAYER */}

        <section className="mb-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-r from-violet-500/[0.08] via-white/[0.025] to-transparent">
          <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotate: 3,
                }}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300"
              >
                <User
                  size={25}
                />
              </motion.div>

              <div>
                {profileEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={
                        nameDraft
                      }
                      onChange={(
                        event
                      ) =>
                        setNameDraft(
                          event.target
                            .value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          saveProfile();
                        }
                      }}
                      maxLength={
                        18
                      }
                      autoFocus
                      className="w-44 rounded-lg border border-violet-400/30 bg-black/30 px-3 py-1.5 text-sm font-bold uppercase outline-none"
                    />

                    <button
                      onClick={
                        saveProfile
                      }
                      className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-semibold text-black"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setProfileEditing(
                        true
                      )
                    }
                    className="group text-left"
                  >
                    <p className="text-lg font-bold tracking-wide group-hover:text-violet-300">
                      {playerName}
                    </p>

                    <p className="mt-1 text-xs text-white/30">
                      Level {level}{" "}
                      ·{" "}
                      {totalXP} XP{" "}
                      ·{" "}
                      {streak} day
                      streak
                    </p>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:min-w-[330px]">
              <MiniMetric
                label="XP"
                value={String(
                  totalXP
                )}
              />

              <MiniMetric
                label="Level"
                value={String(
                  level
                )}
              />

              <MiniMetric
                label="Badges"
                value={`${unlockedAchievements}/${achievements.length}`}
              />
            </div>
          </div>
        </section>

        {/* STATS */}

        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={
              <Trophy size={18} />
            }
            label="Level"
            value={String(
              level
            )}
            detail={`${currentLevelXP} / 500 XP`}
          />

          <StatCard
            icon={
              <Zap size={18} />
            }
            label="Total XP"
            value={String(
              totalXP
            )}
            detail="Lifetime progress"
          />

          <StatCard
            icon={
              <Flame
                size={18}
                fill="currentColor"
              />
            }
            label="Current Streak"
            value={`${streak}d`}
            detail="Keep the momentum"
          />
        </section>

        {/* LEVEL */}

        <section
          className={`mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] ${densityClass}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/35">
                LEVEL {level}
              </p>

              <p className="mt-1 text-sm font-semibold">
                Progress to next
                level
              </p>
            </div>

            <span className="text-xs text-white/35">
              {Math.round(
                levelProgress
              )}
              %
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400"
              animate={{
                width: `${levelProgress}%`,
              }}
              transition={{
                duration: 0.8,
              }}
            />
          </div>
        </section>

        {/* STREAK */}

        <section
          className={`mb-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] ${densityClass}`}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                Your streak
              </p>

              <p className="mt-1 text-xs text-white/30">
                Stay consistent,
                even on small
                days.
              </p>
            </div>

            <Flame
              size={18}
              className="text-orange-400"
              fill="currentColor"
            />
          </div>

          <div className="grid grid-cols-7 gap-2">
            {last7Days.map(
              (day) => (
                <div
                  key={day.key}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="text-[9px] uppercase tracking-wider text-white/25">
                    {day.label}
                  </span>

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs ${
                      day.active
                        ? "border-orange-400/30 bg-orange-400/10 text-orange-300"
                        : "border-white/[0.06] bg-white/[0.02] text-white/20"
                    }`}
                  >
                    {day.active ? (
                      <Flame
                        size={15}
                        fill="currentColor"
                      />
                    ) : (
                      "—"
                    )}
                  </div>

                  <span className="text-[9px] text-white/20">
                    {day.date}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        {/* MAIN */}

        <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          {/* QUESTS */}

          <section
            className={`rounded-2xl border border-white/[0.07] bg-white/[0.025] ${densityClass}`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Target
                    size={17}
                    className="text-violet-400"
                  />

                  <h2 className="text-sm font-semibold">
                    Daily Quests
                  </h2>
                </div>

                <p className="mt-1 text-xs text-white/30">
                  {completedToday}/
                  {dailyQuests.length}{" "}
                  completed
                </p>
              </div>

              <button
                onClick={() =>
                  setShowAddQuest(
                    true
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
              >
                <Plus size={14} />
                Add quest
              </button>
            </div>

            <div className="space-y-2">
              {dailyQuests.length ===
              0 ? (
                <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
                  <Target
                    size={24}
                    className="mx-auto mb-3 text-white/20"
                  />

                  <p className="text-sm text-white/40">
                    No quests yet
                  </p>
                </div>
              ) : (
                [...dailyQuests]
                  .sort(
                    (a, b) =>
                      Number(
                        a.completed
                      ) -
                      Number(
                        b.completed
                      )
                  )
                  .map(
                    (
                      quest,
                      index
                    ) => (
                      <motion.div
                        layout
                        key={
                          quest.id
                        }
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index *
                            0.03,
                        }}
                        className={`group flex min-w-0 w-full items-center gap-2 rounded-xl border p-3 ${
                          quest.completed
                            ? "border-emerald-400/10 bg-emerald-400/[0.035]"
                            : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                      >
                        <button
                          onClick={() =>
                            toggleQuest(
                              quest.id
                            )
                          }
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            quest.completed
                              ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                              : "border-white/10 text-transparent"
                          }`}
                        >
                          {quest.completed && (
                            <Check
                              size={
                                15
                              }
                            />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-medium ${
                              quest.completed
                                ? "text-white/35 line-through"
                                : "text-white/80"
                            }`}
                          >
                            {
                              quest.title
                            }
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full border border-violet-400/15 bg-violet-400/5 px-2 py-1 text-[10px] font-semibold text-violet-300">
                          +
                          {
                            quest.xp
                          }{" "}
                          XP
                        </span>

                        <button
                          onClick={() =>
                            deleteQuest(
                              quest.id
                            )
                          }
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-400/10 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <Trash2
                            size={
                              13
                            }
                          />
                        </button>
                      </motion.div>
                    )
                  )
              )}
            </div>
          </section>

          {/* TIMER */}

          <section
            className={`rounded-2xl border border-white/[0.07] bg-white/[0.025] ${densityClass}`}
          >
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <Clock3
                  size={17}
                  className="text-blue-400"
                />

                <h2 className="text-sm font-semibold">
                  Focus Timer
                </h2>
              </div>

              <p className="mt-1 text-xs text-white/30">
                Choose your mode and
                start working.
              </p>
            </div>

            {/* TIMER MODES */}

            <div className="mb-6 grid min-w-0 w-full grid-cols-3 gap-1 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
              <TimerModeButton
                active={
                  timerMode ===
                  "focus"
                }
                label="Focus"
                onClick={() =>
                  setMode(
                    "focus"
                  )
                }
              />

              <TimerModeButton
                active={
                  timerMode ===
                  "short"
                }
                label="Short"
                onClick={() =>
                  setMode(
                    "short"
                  )
                }
              />

              <TimerModeButton
                active={
                  timerMode ===
                  "long"
                }
                label="Long"
                onClick={() =>
                  setMode(
                    "long"
                  )
                }
              />
            </div>

            <div className="flex flex-col items-center">
              <div className="relative flex h-44 w-44 items-center justify-center sm:h-52 sm:w-52">
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 200 200"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="5"
                  />

                  <motion.circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke="rgba(129,140,248,0.9)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={
                      2 *
                      Math.PI *
                      88
                    }
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      88 *
                      (1 -
                        timerProgress /
                          100)
                    }
                  />
                </svg>

                <div className="text-center">
                  <p className="font-mono text-4xl font-semibold tracking-tight">
                    {formatTime(
                      timeLeft
                    )}
                  </p>

                  <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/25">
                    {timerRunning
                      ? timerMode ===
                        "focus"
                        ? "Focus"
                        : "Break"
                      : "Ready"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex w-full items-center gap-2 sm:w-auto">
                <button
                  onClick={() =>
                    setTimerRunning(
                      (value) =>
                        !value
                    )
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 sm:flex-none sm:px-6"
                >
                  {timerRunning ? (
                    <>
                      <Pause
                        size={13}
                      />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play
                        size={13}
                        fill="currentColor"
                      />
                      Start
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setTimerRunning(
                      false
                    );

                    setTimeLeft(
                      timerDuration
                    );
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white/50 transition hover:bg-white/[0.07] hover:text-white sm:flex-none"
                >
                  <RotateCcw
                    size={13}
                  />
                  Reset
                </button>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[10px] text-white/25">
                <Activity size={12} />

                {sessions} focus
                session
                {sessions ===
                1
                  ? ""
                  : "s"}{" "}
                completed
              </div>
            </div>
          </section>
        </section>

        {/* ANALYTICS */}

        <section
          id="analytics"
          className={`mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] ${densityClass}`}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3
                  size={17}
                  className="text-emerald-400"
                />

                <h2 className="text-sm font-semibold">
                  Weekly Analytics
                </h2>
              </div>

              <p className="mt-1 text-xs text-white/30">
                See how your
                productivity is
                trending.
              </p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
            <AnalyticsStat
              label="XP earned"
              value={weeklyXP}
            />

            <AnalyticsStat
              label="Quests"
              value={
                weeklyQuests
              }
            />

            <AnalyticsStat
              label="Focus sessions"
              value={
                weeklySessions
              }
            />

            <AnalyticsStat
              label="Best day"
              value={
                bestDay?.label ||
                "-"
              }
            />
          </div>

          <div className="flex h-48 items-end gap-2 md:gap-4">
            {last7Days.map(
              (day) => {
                const height =
                  day.xp === 0
                    ? 5
                    : Math.max(
                        8,
                        (day.xp /
                          maxWeeklyXP) *
                          100
                      );

                return (
                  <div
                    key={day.key}
                    className="flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="flex h-full items-end">
                      <motion.div
                        initial={{
                          height: 0,
                        }}
                        animate={{
                          height: `${height}%`,
                        }}
                        transition={{
                          duration:
                            0.7,
                        }}
                        className={`group relative w-full rounded-t-lg ${
                          day.xp >
                          0
                            ? "bg-gradient-to-t from-violet-600/50 to-violet-400/80"
                            : "bg-white/[0.04]"
                        }`}
                      >
                        {day.xp >
                          0 && (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-white/40 opacity-0 transition group-hover:opacity-100">
                            {
                              day.xp
                            }
                          </span>
                        )}
                      </motion.div>
                    </div>

                    <div className="mt-3 text-center">
                      <p className="text-[9px] uppercase text-white/25">
                        {
                          day.label
                        }
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <MiniInsight
              icon={
                <Flame
                  size={14}
                />
              }
              label="Current streak"
              value={`${streak} days`}
            />

            <MiniInsight
              icon={
                <Target
                  size={14}
                />
              }
              label="Today's quests"
              value={`${completedToday}/${dailyQuests.length}`}
            />

            <MiniInsight
              icon={
                <Clock3
                  size={14}
                />
              }
              label="Today's sessions"
              value={String(
                todayStats.sessions
              )}
            />
          </div>
        </section>

        {/* ACHIEVEMENTS */}

        <section
          id="achievements"
          className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 md:p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Award
                  size={17}
                  className="text-yellow-400"
                />

                <h2 className="text-sm font-semibold">
                  Achievements
                </h2>
              </div>

              <p className="mt-1 text-xs text-white/30">
                {unlockedAchievements} of{" "}
                {
                  achievements.length
                }{" "}
                unlocked
              </p>
            </div>

            <div className="rounded-full border border-yellow-400/15 bg-yellow-400/5 px-3 py-1.5 text-[10px] text-yellow-300">
              {Math.round(
                (unlockedAchievements /
                  achievements.length) *
                  100
              )}
              %
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map(
              (achievement) => (
                <motion.div
                  key={
                    achievement.id
                  }
                  whileHover={{
                    y: -2,
                  }}
                  className={`rounded-xl border p-4 ${
                    achievement.unlocked
                      ? "border-yellow-400/15 bg-yellow-400/[0.04]"
                      : "border-white/[0.05] bg-white/[0.015] opacity-45"
                  }`}
                >
                  <div
                    className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl ${
                      achievement.unlocked
                        ? "bg-yellow-400/10 text-yellow-300"
                        : "bg-white/[0.04] text-white/25"
                    }`}
                  >
                    {achievement.icon}
                  </div>

                  <p className="text-xs font-semibold">
                    {
                      achievement.title
                    }
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-white/30">
                    {
                      achievement.description
                    }
                  </p>

                  <div className="mt-3 text-[9px] uppercase tracking-wider">
                    {achievement.unlocked
                      ? "Unlocked"
                      : "Locked"}
                  </div>
                </motion.div>
              )
            )}
          </div>
        </section>

        {/* ABOUT */}

        <section className="mt-5 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.035] to-transparent p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-violet-300">
                <Sparkles size={15} />

                <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">
                  About FocusFlow
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Productivity,
                designed like a
                game.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/35">
                Complete quests, earn XP,
                build streaks, unlock
                achievements and use
                focused sessions to build
                momentum.
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-400/5 text-violet-300">
              <Zap
                size={30}
                fill="currentColor"
              />
            </div>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/[0.05] pt-6 text-[10px] text-white/20 sm:flex-row">
          <p>
            FOCUSFLOW — SMALL STEPS.
            CONSISTENT PROGRESS.
          </p>

          <button
            onClick={() =>
              setShowShortcuts(
                true
              )
            }
            className="flex items-center gap-2 transition hover:text-white/50"
          >
            <Keyboard size={12} />
            Keyboard shortcuts
          </button>
        </footer>
      </div>

      {/* MOBILE NAV */}

      <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/10 bg-[#101010]/90 p-1.5 shadow-2xl backdrop-blur-xl md:hidden">
        <MobileNavButton
          active={
            activeMobileNav ===
            "dashboard"
          }
          icon={
            <Home size={16} />
          }
          label="Home"
          onClick={() => {
            setActiveMobileNav(
              "dashboard"
            );

            document
              .getElementById(
                "dashboard"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",
              });
          }}
        />

        <MobileNavButton
          active={
            activeMobileNav ===
            "analytics"
          }
          icon={
            <BarChart3
              size={16}
            />
          }
          label="Stats"
          onClick={() => {
            setActiveMobileNav(
              "analytics"
            );

            document
              .getElementById(
                "analytics"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",
              });
          }}
        />

        <MobileNavButton
          active={
            activeMobileNav ===
            "achievements"
          }
          icon={
            <Award size={16} />
          }
          label="Badges"
          onClick={() => {
            setActiveMobileNav(
              "achievements"
            );

            document
              .getElementById(
                "achievements"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",
              });
          }}
        />

        <MobileNavButton
          active={
            activeMobileNav ===
            "settings"
          }
          icon={
            <Settings
              size={16}
            />
          }
          label="Settings"
          onClick={() => {
            setActiveMobileNav(
              "settings"
            );

            setShowSettings(
              true
            );
          }}
        />
      </div>

      {/* ADD QUEST */}

      <AnimatePresence>
        {showAddQuest && (
          <ModalOverlay
            onClose={() =>
              setShowAddQuest(
                false
              )
            }
          >
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Add daily quest
                  </h3>

                  <p className="mt-1 text-xs text-white/30">
                    Create a task that
                    earns XP.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowAddQuest(
                      false
                    )
                  }
                  className="text-white/30 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="mb-2 block text-xs text-white/40">
                Quest
              </label>

              <input
                value={newQuest}
                onChange={(
                  event
                ) =>
                  setNewQuest(
                    event.target
                      .value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    addQuest();
                  }
                }}
                placeholder="e.g. Read for 20 minutes"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-violet-400/40"
                autoFocus
              />

              <label className="mb-2 mt-5 block text-xs text-white/40">
                XP reward
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map(
                  (xp) => (
                    <button
                      key={xp}
                      onClick={() =>
                        setNewQuestXP(
                          xp
                        )
                      }
                      className={`rounded-xl border py-2 text-xs ${
                        newQuestXP ===
                        xp
                          ? "border-violet-400/40 bg-violet-400/10 text-violet-300"
                          : "border-white/10 bg-white/[0.03] text-white/40"
                      }`}
                    >
                      {xp} XP
                    </button>
                  )
                )}
              </div>

              <button
                onClick={addQuest}
                disabled={
                  !newQuest.trim()
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus size={14} />
                Create quest
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* SETTINGS */}

      <AnimatePresence>
        {showSettings && (
          <ModalOverlay
            onClose={() =>
              setShowSettings(
                false
              )
            }
          >
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                <div>
                  <h3 className="text-lg font-semibold">
                    Settings
                  </h3>

                  <p className="mt-1 text-xs text-white/30">
                    Customize FocusFlow.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowSettings(
                      false
                    )
                  }
                  className="text-white/30 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 p-6">
                {/* DENSITY */}

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <LayoutDashboard
                      size={17}
                      className="mt-0.5 text-violet-400"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Dashboard density
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        Control dashboard
                        spacing.
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          onClick={() =>
                            setDensity(
                              "comfortable"
                            )
                          }
                          className={`rounded-lg border px-3 py-2 text-xs ${
                            density ===
                            "comfortable"
                              ? "border-violet-400/30 bg-violet-400/10 text-violet-300"
                              : "border-white/10 text-white/35"
                          }`}
                        >
                          Comfortable
                        </button>

                        <button
                          onClick={() =>
                            setDensity(
                              "compact"
                            )
                          }
                          className={`rounded-lg border px-3 py-2 text-xs ${
                            density ===
                            "compact"
                              ? "border-violet-400/30 bg-violet-400/10 text-violet-300"
                              : "border-white/10 text-white/35"
                          }`}
                        >
                          Compact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* REMINDER */}

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <Bell
                      size={17}
                      className="mt-0.5 text-blue-400"
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Daily reminder
                          </p>

                          <p className="mt-1 text-xs text-white/30">
                            Get reminded to
                            focus.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            if (
                              reminderEnabled
                            ) {
                              setReminderEnabled(
                                false
                              );
                            } else {
                              enableReminder();
                            }
                          }}
                          className={`relative h-6 w-11 rounded-full ${
                            reminderEnabled
                              ? "bg-violet-500"
                              : "bg-white/10"
                          }`}
                        >
                          <motion.span
                            animate={{
                              x: reminderEnabled
                                ? 20
                                : 3,
                            }}
                            className="absolute left-0 top-1 h-4 w-4 rounded-full bg-white"
                          />
                        </button>
                      </div>

                      {reminderEnabled && (
                        <div className="mt-4">
                          <label className="mb-2 block text-[10px] uppercase tracking-wider text-white/25">
                            Reminder time
                          </label>

                          <input
                            type="time"
                            value={
                              reminderTime
                            }
                            onChange={(
                              event
                            ) =>
                              setReminderTime(
                                event.target
                                  .value
                              )
                            }
                            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                          />

                          <p className="mt-2 text-[10px] text-white/20">
                            Works while
                            FocusFlow is open.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SHORTCUTS */}

                <button
                  onClick={() =>
                    setShowShortcuts(
                      true
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:bg-white/[0.04]"
                >
                  <Keyboard
                    size={17}
                    className="text-white/40"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Keyboard shortcuts
                    </p>

                    <p className="mt-1 text-xs text-white/30">
                      Control FocusFlow
                      faster.
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="text-white/20"
                  />
                </button>

                {/* CLEAR */}

                <div className="rounded-xl border border-red-400/10 bg-red-400/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <Trash2
                      size={17}
                      className="mt-0.5 text-red-400"
                    />

                    <div>
                      <p className="text-sm font-medium">
                        Local data
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/30">
                        Delete all FocusFlow
                        progress from this
                        browser.
                      </p>

                      <button
                        onClick={
                          clearAllData
                        }
                        className="mt-4 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-300"
                      >
                        Clear all data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* SHORTCUTS */}

      <AnimatePresence>
        {showShortcuts && (
          <ModalOverlay
            onClose={() =>
              setShowShortcuts(
                false
              )
            }
          >
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Keyboard shortcuts
                  </h3>

                  <p className="mt-1 text-xs text-white/30">
                    Work faster without
                    touching the mouse.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowShortcuts(
                      false
                    )
                  }
                  className="text-white/30 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <Shortcut
                  keyName="Space"
                  description="Start / pause timer"
                />

                <Shortcut
                  keyName="R"
                  description="Reset timer"
                />

                <Shortcut
                  keyName="N"
                  description="Create new quest"
                />

                <Shortcut
                  keyName="Esc"
                  description="Close modal"
                />
              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* LEVEL UP */}

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
          >
            <motion.div
              initial={{
                scale: 0.6,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              className="w-full max-w-md rounded-3xl border border-violet-400/20 bg-[#100d18] p-10 text-center shadow-2xl"
            >
              <motion.div
                animate={{
                  scale: [
                    1,
                    1.15,
                    1,
                  ],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-400/10 text-violet-300"
              >
                <Trophy
                  size={38}
                />
              </motion.div>

              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-300">
                LEVEL UP
              </p>

              <h2 className="mt-3 text-4xl font-black">
                Level {newLevel}
              </h2>

              <p className="mx-auto mt-3 max-w-xs text-sm text-white/40">
                Your consistency is
                paying off.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STREAK */}

      <AnimatePresence>
        {showStreakCelebration && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{
                scale: 0.8,
              }}
              animate={{
                scale: 1,
              }}
              className="rounded-3xl border border-orange-400/20 bg-[#15110d] px-8 py-10 text-center shadow-2xl"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-400/10 text-orange-300">
                <Flame
                  size={32}
                  fill="currentColor"
                />
              </div>

              <h2 className="text-2xl font-bold">
                Streak started!
              </h2>

              <p className="mt-2 text-sm text-white/40">
                You showed up today.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP */}

      <AnimatePresence>
        {xpPopup !== null && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -35,
            }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-violet-400/20 bg-[#15121f]/95 px-5 py-2.5 text-sm font-semibold text-violet-300 shadow-2xl"
          >
            +{xpPopup} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST */}

      <AnimatePresence>
        {newDayMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -15,
            }}
            className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[#151515]/95 px-5 py-2.5 text-xs text-white/70 shadow-xl backdrop-blur-xl"
          >
            {newDayMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* REMINDER */}

      <AnimatePresence>
        {reminderMessage && (
          <motion.div
            initial={{
              opacity: 0,
              x: 30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: 30,
            }}
            className="fixed bottom-24 right-6 z-50 max-w-xs rounded-2xl border border-blue-400/20 bg-[#10151d]/95 px-5 py-4 shadow-2xl backdrop-blur-xl md:bottom-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                <Bell size={16} />
              </div>

              <div>
                <p className="text-xs font-semibold">
                  FocusFlow reminder
                </p>

                <p className="mt-1 text-[10px] text-white/35">
                  Time to start your
                  focus session.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/*
 * COMPONENTS
 */

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/45 transition hover:bg-white/5 hover:text-white"
    >
      {icon}
      {label}
    </a>
  );
}

function MobileNavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-[68px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[9px] transition ${
        active
          ? "bg-white/10 text-white"
          : "text-white/35"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
    >
      <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-white/50">
        {icon}
      </div>

      <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <div className="mt-1 flex items-end gap-2">
        <span className="text-2xl font-bold">
          {value}
        </span>

        <span className="mb-1 text-[10px] text-white/25">
          {detail}
        </span>
      </div>
    </motion.div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3">
      <p className="text-[9px] uppercase tracking-wider text-white/20">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function AnalyticsStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
      <p className="text-[9px] uppercase tracking-wider text-white/20">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}

function MiniInsight({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="text-white/30">
        {icon}
      </div>

      <div>
        <p className="text-[9px] uppercase tracking-wider text-white/20">
          {label}
        </p>

        <p className="mt-1 text-xs font-semibold text-white/70">
          {value}
        </p>
      </div>
    </div>
  );
}

function TimerModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-w-0 w-full rounded-lg px-2 py-2 text-[10px] font-medium transition ${
        active
          ? "bg-white/10 text-white"
          : "text-white/30 hover:text-white/60"
      }`}
    >
      {label}
    </button>
  );
}

function Shortcut({
  keyName,
  description,
}: {
  keyName: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <span className="text-xs text-white/50">
        {description}
      </span>

      <kbd className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold text-white/70">
        {keyName}
      </kbd>
    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 20,
          scale: 0.97,
        }}
        transition={{
          duration: 0.2,
        }}
        className="my-auto flex w-full items-center justify-center"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}