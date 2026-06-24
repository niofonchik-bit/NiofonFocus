import type { UserSettings } from '@api/settings';

/** режим таймера */
export type TimerMode = 'work' | 'short' | 'long';

/** метаданные режима */
interface TimerModeMeta {
    /** подпись на вкладке */
    label: string;
    /** короткая подпись для document.title */
    short: string;
    /** поле длительности в настройках пользователя */
    durationKey: keyof Pick<UserSettings, 'focus_minutes' | 'short_break_minutes' | 'long_break_minutes'>;
}

/** порядок вкладок (важен для "едущей подложки") */
export const TIMER_MODE_ORDER: TimerMode[] = ['work', 'short', 'long'];

export const TIMER_MODES: Record<TimerMode, TimerModeMeta> = {
    work: { label: 'Фокус', short: 'Работа', durationKey: 'focus_minutes' },
    short: { label: 'Короткий перерыв', short: 'Перерыв', durationKey: 'short_break_minutes' },
    long: { label: 'Длинный перерыв', short: 'Отдых', durationKey: 'long_break_minutes' },
};

/** длительность режима в секундах из настроек */
export function getModeSeconds(mode: TimerMode, settings: UserSettings): number {
    return settings[TIMER_MODES[mode].durationKey] * 60;
}
