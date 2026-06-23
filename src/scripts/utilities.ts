import type { Habit, HabitSchedule } from '@api/habits';

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

export const WEEK_DAY_LABELS = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'];

export const WEEK_DAY_FULL_LABELS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export const WEEK_DAY_SHORT_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** получение локального ключа даты */
export function getDateKey(date = new Date()): string {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

/** получение даты из локального ключа */
export function parseDateKey(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
}

/** добавление дней к дате */
export function addDays(date: Date, count: number): Date {
    const nextDate = new Date(date);

    nextDate.setDate(nextDate.getDate() + count);

    return nextDate;
}

/** получение индекса дня недели от понедельника */
export function getWeekDayIndex(date: Date): number {
    return (date.getDay() + 6) % 7;
}

/** получение понедельника текущей недели */
export function getWeekStart(date: Date): Date {
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return addDays(startDate, -getWeekDayIndex(startDate));
}

/** проверка расписания привычки */
export function isHabitScheduled(
    habit: Habit,
    date: Date,
): boolean {
    if (
        habit.schedule.type === 'daily' ||
        habit.schedule.days.length === 0
    ) {
        return true;
    }

    return habit.schedule.days.includes(getWeekDayIndex(date));
}

/** получение названия расписания */
export function getScheduleLabel(
    schedule: HabitSchedule,
): string {
    if (
        schedule.type === 'daily' ||
        schedule.days.length === 0 ||
        schedule.days.length === 7
    ) {
        return 'Каждый день';
    }

    const days = [...schedule.days].sort(
        (firstDay, secondDay) => firstDay - secondDay,
    );

    if (
        days.length === 5 &&
        [0, 1, 2, 3, 4].every((day) => days.includes(day))
    ) {
        return 'По будням';
    }

    if (
        days.length === 2 &&
        days.includes(5) &&
        days.includes(6)
    ) {
        return 'По выходным';
    }

    return days
        .map((day) => WEEK_DAY_SHORT_LABELS[day])
        .join(' · ');
}

/** получение текущей цепочки привычки */
export function getCurrentStreak(habit: Habit): number {
    const completions = new Set(habit.completions);
    const createdAt = parseDateKey(habit.createdAt);
    let currentDate = new Date();

    if (
        isHabitScheduled(habit, currentDate) &&
        !completions.has(getDateKey(currentDate))
    ) {
        currentDate = addDays(currentDate, -1);
    }

    let streak = 0;

    for (let iteration = 0; iteration < 4000; iteration += 1) {
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

/** получение подписи цепочки */
export function getStreakLabel(streak: number): string {
    if (streak === 0) {
        return 'Начни сегодня';
    }

    return `${streak} ${getDayWord(streak)} подряд`;
}

/** получение дней текущей недели */
export function getHabitWeek(
    habit: Habit,
    currentDate = new Date(),
): HabitWeekDay[] {
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

/** получение формы слова день */
export function getDayWord(value: number): string {
    const lastTwoDigits = value % 100;
    const lastDigit = value % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'дней';
    }

    if (lastDigit === 1) {
        return 'день';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'дня';
    }

    return 'дней';
}

/** получение общей статистики привычек */
export function getHabitStatistics(habits: Habit[]): HabitStatistics {
    const todayKey = getDateKey();

    return {
        totalCount: habits.length,
        completedTodayCount: habits.reduce(
            (count, habit) => count + Number(habit.completions.includes(todayKey)),
            0,
        ),
        longestStreak: habits.reduce(
            (longestStreak, habit) => Math.max(longestStreak, getCurrentStreak(habit)),
            0,
        ),
    };
}

/** расчет сложности пароля */
export function getPasswordStrength(password: string) {
    let score = 0;

    // проверка длины пароля
    if (password.length >= 8) {
        score += 1;
    }

    // проверка регистра букв
    if (/[a-zа-я]/.test(password) && /[A-ZА-Я]/.test(password)) {
        score += 1;
    }

    // проверка цифры или специального символа
    if (/\d/.test(password) || /[^A-Za-zА-Яа-я\d]/.test(password)) {
        score += 1;
    }

    return password.length === 0 ? 0 : Math.max(1, score);
}
