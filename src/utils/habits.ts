import type { Habit, HabitSchedule } from '@api/habits';
import { addDays, getDateKey, getWeekDayIndex, getWeekStart, parseDateKey } from './date';
import { getDayWord } from './plural';

/** день недели привычки */
export interface HabitWeekDay {
    key: string;
    label: string;
    fullLabel: string;
    completed: boolean;
    today: boolean;
    future: boolean;
    scheduled: boolean;
}

export const WEEK_DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const WEEK_DAY_FULL_LABELS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const MAX_STREAK_LOOKBACK_DAYS = 4000;

/** проверка расписания привычки */
export function isHabitScheduled(habit: Habit, date: Date): boolean {
    if (habit.schedule.type === 'daily' || habit.schedule.days.length === 0) {
        return true;
    }

    return habit.schedule.days.includes(getWeekDayIndex(date));
}

/** получение названия расписания */
export function getScheduleLabel(schedule: HabitSchedule): string {
    if (schedule.type === 'daily' || schedule.days.length === 0 || schedule.days.length === 7) {
        return 'Каждый день';
    }

    const days = [...schedule.days].sort((firstDay, secondDay) => firstDay - secondDay);

    if (days.length === 5 && [0, 1, 2, 3, 4].every((day) => days.includes(day))) {
        return 'По будням';
    }

    if (days.length === 2 && days.includes(5) && days.includes(6)) {
        return 'По выходным';
    }

    return days.map((day) => WEEK_DAY_LABELS[day]).join(' · ');
}

/** получение текущей цепочки привычки */
export function getCurrentStreak(habit: Habit): number {
    const completions = new Set(habit.completions);
    const createdAt = parseDateKey(habit.createdAt);
    let currentDate = new Date();

    if (isHabitScheduled(habit, currentDate) && !completions.has(getDateKey(currentDate))) {
        currentDate = addDays(currentDate, -1);
    }

    let streak = 0;

    for (let iteration = 0; iteration < MAX_STREAK_LOOKBACK_DAYS; iteration += 1) {
        if (currentDate < createdAt) {
            break;
        }

        if (isHabitScheduled(habit, currentDate)) {
            if (!completions.has(getDateKey(currentDate))) {
                break;
            }

            streak += 1;
        }

        currentDate = addDays(currentDate, -1);
    }

    return streak;
}

/** получение рекордной цепочки привычки за всё время */
export function getRecordStreak(habit: Habit): number {
    const completions = new Set(habit.completions);
    const createdAt = parseDateKey(habit.createdAt);
    const today = new Date();

    let currentDate = new Date(createdAt);
    let streak = 0;
    let record = 0;

    for (let iteration = 0; iteration < MAX_STREAK_LOOKBACK_DAYS && currentDate <= today; iteration += 1) {
        if (isHabitScheduled(habit, currentDate)) {
            if (completions.has(getDateKey(currentDate))) {
                streak += 1;
                record = Math.max(record, streak);
            } else {
                streak = 0;
            }
        }

        currentDate = addDays(currentDate, 1);
    }

    return record;
}

/** получение бонус-цепочки — выполнений вне расписания подряд */
export function getBonusStreak(habit: Habit): number {
    // у ежедневных привычек внеплановых дней нет
    if (habit.schedule.type === 'daily' || habit.schedule.days.length === 0 || habit.schedule.days.length === 7) {
        return 0;
    }

    const completions = new Set(habit.completions);
    const createdAt = parseDateKey(habit.createdAt);
    let currentDate = new Date();

    // сегодняшний внеплановый день ещё можно выполнить — не прерываем из-за него
    if (!isHabitScheduled(habit, currentDate) && !completions.has(getDateKey(currentDate))) {
        currentDate = addDays(currentDate, -1);
    }

    let streak = 0;

    for (let iteration = 0; iteration < MAX_STREAK_LOOKBACK_DAYS; iteration += 1) {
        if (currentDate < createdAt) {
            break;
        }

        // запланированные дни относятся к основной цепочке — пропускаем
        if (!isHabitScheduled(habit, currentDate)) {
            if (!completions.has(getDateKey(currentDate))) {
                break;
            }

            streak += 1;
        }

        currentDate = addDays(currentDate, -1);
    }

    return streak;
}

/** подпись бонус-цепочки */
export function getBonusStreakLabel(streak: number): string {
    return `+${streak} ${getDayWord(streak)} сверх плана`;
}

/** получение подписи цепочки */
export function getStreakLabel(streak: number): string {
    if (streak === 0) {
        return 'Начни сегодня';
    }

    return `${streak} ${getDayWord(streak)} подряд`;
}

/** получение дней текущей недели */
export function getHabitWeek(habit: Habit, currentDate = new Date()): HabitWeekDay[] {
    const startDate = getWeekStart(currentDate);
    const todayKey = getDateKey(currentDate);

    return WEEK_DAY_LABELS.map((label, index) => {
        const date = addDays(startDate, index);
        const key = getDateKey(date);

        return {
            key,
            label,
            fullLabel: WEEK_DAY_FULL_LABELS[index],
            completed: habit.completions.includes(key),
            today: key === todayKey,
            future: key > todayKey,
            scheduled: isHabitScheduled(habit, date),
        };
    });
}

/** статистика привычек */
export interface HabitStatistics {
    totalCount: number;
    completedTodayCount: number;
    longestStreak: number;
}

/** получение общей статистики привычек */
export function getHabitStatistics(habits: Habit[]): HabitStatistics {
    const todayKey = getDateKey();

    return {
        totalCount: habits.length,
        completedTodayCount: habits.reduce((count, habit) => count + Number(habit.completions.includes(todayKey)), 0),
        longestStreak: habits.reduce((longestStreak, habit) => Math.max(longestStreak, getCurrentStreak(habit)), 0),
    };
}
