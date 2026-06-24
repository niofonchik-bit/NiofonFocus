import type { Habit } from '@api/habits';
import { addDays, getDateKey, getWeekStart, parseDateKey } from './date';
import { getCurrentStreak, getRecordStreak, isHabitScheduled } from './habits';

const DAY_LONG_FORMATTER = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const MONTH_SHORT_FORMATTER = new Intl.DateTimeFormat('ru-RU', { month: 'short' });

const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** форматирование даты в день */
export function formatDayLong(date: Date): string {
    return DAY_LONG_FORMATTER.format(date);
}

export interface ActivityPeriod {
    value: string;
    label: string;
    weeks: number;
}

export const ACTIVITY_PERIODS: ActivityPeriod[] = [
    { value: '3m', label: '3 мес', weeks: 13 },
    { value: '6m', label: '6 мес', weeks: 26 },
    { value: '1y', label: 'Год', weeks: 53 },
];

export const DEFAULT_ACTIVITY_PERIOD = '6m';

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export interface ActivityDay {
    key: string;
    date: Date;
    weekdayIndex: number;
    completedCount: number;
    scheduledCount: number;
    future: boolean;
    level: ActivityLevel;
}

export interface ActivityWeek {
    key: string;
    days: ActivityDay[];
}

export interface ActivityMonthLabel {
    weekIndex: number;
    label: string;
}

export interface ActivityData {
    weeks: ActivityWeek[];
    monthLabels: ActivityMonthLabel[];
    totalCompleted: number;
}

/** счётчик отметок по датам для всех привычек */
function buildCompletionCounts(habits: Habit[]): Map<string, number> {
    const counts = new Map<string, number>();

    for (const habit of habits) {
        for (const key of habit.completions) {
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
    }

    return counts;
}

/** уровень закраски ячейки по доле выполнения */
function computeLevel(completed: number, scheduled: number): ActivityLevel {
    if (completed <= 0) {
        return 0;
    }

    const ratio = scheduled > 0 ? completed / scheduled : 1;

    if (ratio >= 1) return 4;
    if (ratio >= 0.66) return 3;
    if (ratio >= 0.34) return 2;

    return 1;
}

/** построение карты активности за указанное число недель */
export function getActivityData(habits: Habit[], weeks: number, today = new Date()): ActivityData {
    const completionCounts = buildCompletionCounts(habits);
    const created = habits.map((habit) => ({ habit, createdAt: parseDateKey(habit.createdAt) }));

    const todayKey = getDateKey(today);
    const currentWeekStart = getWeekStart(today);
    const firstWeekStart = addDays(currentWeekStart, -(weeks - 1) * 7);

    const resultWeeks: ActivityWeek[] = [];
    const monthLabels: ActivityMonthLabel[] = [];
    let lastMonth = -1;
    let totalCompleted = 0;

    for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
        const weekStart = addDays(firstWeekStart, weekIndex * 7);
        const days: ActivityDay[] = [];

        for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
            const date = addDays(weekStart, dayIndex);
            const key = getDateKey(date);
            const future = key > todayKey;

            const completedCount = future ? 0 : (completionCounts.get(key) ?? 0);

            let scheduledCount = 0;
            if (!future) {
                for (const { habit, createdAt } of created) {
                    if (date >= createdAt && isHabitScheduled(habit, date)) {
                        scheduledCount += 1;
                    }
                }
            }

            totalCompleted += completedCount;

            days.push({
                key,
                date,
                weekdayIndex: dayIndex,
                completedCount,
                scheduledCount,
                future,
                level: future ? 0 : computeLevel(completedCount, scheduledCount),
            });
        }

        // подпись месяца над первой колонкой нового месяца
        const month = weekStart.getMonth();
        if (month !== lastMonth) {
            monthLabels.push({
                weekIndex,
                label: MONTH_SHORT_FORMATTER.format(weekStart).replace('.', ''),
            });
            lastMonth = month;
        }

        resultWeeks.push({ key: getDateKey(weekStart), days });
    }

    return { weeks: resultWeeks, monthLabels, totalCompleted };
}

export interface TopStreakItem {
    habit: Habit;
    currentStreak: number;
    recordStreak: number;
}

/** топ цепочек */
export function getTopStreaks(habits: Habit[], limit = 5): TopStreakItem[] {
    return habits
        .map((habit) => ({
            habit,
            currentStreak: getCurrentStreak(habit),
            recordStreak: getRecordStreak(habit),
        }))
        .sort((first, second) => second.currentStreak - first.currentStreak || second.recordStreak - first.recordStreak)
        .slice(0, limit);
}

export interface WeekActivityDay {
    key: string;
    label: string;
    count: number;
    scheduledCount: number;
    today: boolean;
    future: boolean;
}

/** активность за неделю */
export function getWeekActivity(habits: Habit[], today = new Date()): WeekActivityDay[] {
    const start = getWeekStart(today);
    const todayKey = getDateKey(today);
    const counts = buildCompletionCounts(habits);
    const created = habits.map((habit) => ({ habit, createdAt: parseDateKey(habit.createdAt) }));

    return WEEKDAY_SHORT.map((label, index) => {
        const date = addDays(start, index);
        const key = getDateKey(date);
        const future = key > todayKey;

        let scheduledCount = 0;
        for (const { habit, createdAt } of created) {
            if (date >= createdAt && isHabitScheduled(habit, date)) {
                scheduledCount += 1;
            }
        }

        return {
            key,
            label,
            count: future ? 0 : (counts.get(key) ?? 0),
            scheduledCount,
            today: key === todayKey,
            future,
        };
    });
}

export interface DashboardSummary {
    totalHabits: number;
    completedToday: number;
    bestStreak: number;
    weekCompletions: number;
    totalCompletions: number;
}

/** сводка для карточек */
export function getDashboardSummary(habits: Habit[], today = new Date()): DashboardSummary {
    const todayKey = getDateKey(today);
    const weekStart = getWeekStart(today);
    const weekKeys = new Set(Array.from({ length: 7 }, (_, index) => getDateKey(addDays(weekStart, index))));

    let completedToday = 0;
    let weekCompletions = 0;
    let totalCompletions = 0;
    let bestStreak = 0;

    for (const habit of habits) {
        totalCompletions += habit.completions.length;

        if (habit.completions.includes(todayKey)) {
            completedToday += 1;
        }

        for (const key of habit.completions) {
            if (weekKeys.has(key)) {
                weekCompletions += 1;
            }
        }

        bestStreak = Math.max(bestStreak, getCurrentStreak(habit));
    }

    return {
        totalHabits: habits.length,
        completedToday,
        bestStreak,
        weekCompletions,
        totalCompletions,
    };
}
