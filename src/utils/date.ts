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
