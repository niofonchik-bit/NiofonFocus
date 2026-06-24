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
