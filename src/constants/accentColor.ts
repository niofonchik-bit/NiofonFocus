/** доступный акцентный цвет */
export type AccentName = 'violet' | 'green' | 'blue' | 'teal' | 'amber' | 'rose';

/** палитра акцентных цветов */
export const ACCENT_COLORS: Record<AccentName, string> = {
    violet: '#7c5cfc',
    green: '#22a06b',
    blue: '#3488f4',
    teal: '#149b98',
    amber: '#e58a13',
    rose: '#e54873',
};

/** акцентный цвет по умолчанию */
export const DEFAULT_ACCENT: AccentName = 'violet';

/** проверка названия акцентного цвета */
export function isAccentName(
    value: unknown,
): value is AccentName {
    return (
        typeof value === 'string' &&
        value in ACCENT_COLORS
    );
}

/** получение поддерживаемого акцентного цвета */
export function getAccentName(
    value: unknown,
): AccentName {
    return isAccentName(value)
        ? value
        : DEFAULT_ACCENT;
}