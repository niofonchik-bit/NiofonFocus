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
