/** доступный акцентный цвет */
export type AccentName = 'violet' | 'green' | 'blue' | 'teal' | 'amber' | 'rose';

interface Accent {
    color: string;
    contrast: string;
}

export const ACCENTS: Record<AccentName, Accent> = {
    violet: { color: '#7c5cfc', contrast: '#ffffff' },
    green: { color: '#22a06b', contrast: '#ffffff' },
    blue: { color: '#3488f4', contrast: '#ffffff' },
    teal: { color: '#149b98', contrast: '#ffffff' },
    amber: { color: '#e58a13', contrast: '#ffffff' },
    rose: { color: '#e54873', contrast: '#ffffff' },
};

/** палитра акцентных цветов */
export const ACCENT_COLORS = Object.fromEntries(Object.entries(ACCENTS).map(([k, v]) => [k, v.color])) as Record<AccentName, string>;

/** акцентный цвет по умолчанию */
export const DEFAULT_ACCENT: AccentName = 'violet';

/** проверка названия акцентного цвета */
export function isAccentName(value: unknown): value is AccentName {
    return typeof value === 'string' && value in ACCENT_COLORS;
}

/** получение поддерживаемого акцентного цвета */
export function getAccentName(value: unknown): AccentName {
    return isAccentName(value) ? value : DEFAULT_ACCENT;
}
