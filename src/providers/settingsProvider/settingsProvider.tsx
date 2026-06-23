import { getSettings, updateSettings as updateSettingsRequest, type SettingsChanges, type UserSettings } from '@api/settings';
import { useAnimatedTheme, type ThemeMode, type ThemeOrigin } from '@providers/animatedThemeProvider/animatedThemeProvider';
import { useAuth } from '@providers/authProvider/authProvider';
import React from 'react';
import { ACCENT_COLORS, ACCENTS, DEFAULT_ACCENT, getAccentName, type AccentName } from '@root/constants/accentColor';

type SettingsContextValue = {
    settings: UserSettings | null;
    ready: boolean;
    error: Error | null;
    theme: ThemeMode;
    accent: AccentName;
    accentColor: string;
    accentContrast: string;
    changeSettings: (changes: SettingsChanges, origin?: ThemeOrigin) => Promise<void>;
    changeTheme: (theme: ThemeMode, origin?: ThemeOrigin) => Promise<void>;
    toggleTheme: (origin?: ThemeOrigin) => Promise<void>;
    previewAccent: (accent: AccentName) => void;
    changeAccent: (accent: AccentName) => Promise<void>;
};

type SettingsProviderProps = {
    children: React.ReactNode;
    accentStorageKey?: string;
};

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

/** нормализация темы */
function normalizeTheme(value: unknown): ThemeMode {
    return value === 'dark' ? 'dark' : 'light';
}

/** получение сохраненного акцентного цвета */
function getInitialAccent(): AccentName {
    if (typeof document === 'undefined') {
        return DEFAULT_ACCENT;
    }

    try {
        const documentAccent = document.documentElement.dataset.accent;

        if (documentAccent) {
            return getAccentName(documentAccent);
        }
    } catch {
        // dataset может быть недоступен
    }
    return DEFAULT_ACCENT;
}

/** провайдер настроек пользователя */
export default function SettingsProvider({ children, accentStorageKey = 'niofon_focus_accent' }: SettingsProviderProps) {
    const { session, ready: authReady } = useAuth();
    const { theme, setTheme: setAnimatedTheme } = useAnimatedTheme();

    const [settings, setSettings] = React.useState<UserSettings | null>(null);

    const [accent, setAccent] = React.useState<AccentName>(() => getInitialAccent());

    /** актуальный акцент без ожидания рендера */
    const accentRef = React.useRef(accent);

    /** тема, явно выбранная пользователем до авторизации (приоритетнее темы из БД) */
    const pendingThemeOverrideRef = React.useRef<ThemeMode | null>(null);

    /** фактический цвет выбранного акцента */
    const accentColor = ACCENT_COLORS[accent];
    const accentContrast = ACCENTS[accent].contrast;

    const [ready, setReady] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const userId = session?.user.id;

    React.useLayoutEffect(() => {
        accentRef.current = accent;

        document.documentElement.dataset.accent = accent;

        document.documentElement.style.setProperty('--accent-primary', ACCENTS[accent].color);
        document.documentElement.style.setProperty('--accent-contrast', ACCENTS[accent].contrast);

        try {
            localStorage.setItem(accentStorageKey, accent);

            // цвет используется только для применения до запуска react
            localStorage.setItem(`${accentStorageKey}_color`, ACCENTS[accent].color);
            localStorage.setItem(`${accentStorageKey}_contrast`, ACCENTS[accent].contrast);
        } catch {
            // localStorage может быть недоступен
        }
    }, [accent, accentStorageKey]);

    // загрузка настроек текущего пользователя
    React.useEffect(() => {
        let active = true;

        if (!authReady) {
            return;
        }

        if (!userId) {
            setSettings(null);
            setError(null);
            setReady(true);
            return;
        }

        setSettings(null);
        setError(null);
        setReady(false);

        void getSettings(userId)
            .then(async (loadedSettings) => {
                if (!active) return;

                const loadedTheme = normalizeTheme(loadedSettings.theme);

                const loadedAccent = getAccentName(loadedSettings.accent);

                // явный выбор темы до входа имеет приоритет над темой из БД
                const pendingTheme = pendingThemeOverrideRef.current;
                pendingThemeOverrideRef.current = null;

                let effectiveTheme = loadedTheme;

                if (pendingTheme && pendingTheme !== loadedTheme) {
                    // тема уже применена локально пользователем — сохраняем его выбор в БД
                    effectiveTheme = pendingTheme;

                    try {
                        const savedSettings = await updateSettingsRequest(userId, { theme: pendingTheme });

                        if (!active) return;

                        effectiveTheme = normalizeTheme(savedSettings.theme);
                    } catch {
                        // если сохранить не удалось — оставляем выбранную локально тему в UI
                    }
                } else {
                    // синхронизация с бд не должна запускать ripple-анимацию
                    setAnimatedTheme(loadedTheme, undefined, true);
                }

                if (!active) return;

                accentRef.current = loadedAccent;
                setAccent(loadedAccent);

                setSettings({
                    ...loadedSettings,
                    theme: effectiveTheme,
                    accent: loadedAccent,
                });
            })
            .catch((requestError: unknown) => {
                if (!active) return;

                setError(requestError instanceof Error ? requestError : new Error('Не удалось загрузить настройки'));
            })
            .finally(() => {
                if (!active) return;

                setReady(true);
            });

        return () => {
            active = false;
        };
    }, [authReady, userId, setAnimatedTheme]);

    /** предварительное применение акцентного цвета */
    const previewAccent = React.useCallback((nextAccent: AccentName) => {
        accentRef.current = nextAccent;
        setAccent(nextAccent);
    }, []);

    /** изменение настроек пользователя */
    const changeSettings = React.useCallback(
        async (changes: SettingsChanges, origin?: ThemeOrigin) => {
            if (!userId || !settings) {
                throw new Error('Настройки пользователя еще не загружены');
            }

            const previousSettings = settings;
            const previousTheme = theme;

            const normalizedChanges: SettingsChanges = {
                ...changes,
            };

            if (changes.theme !== undefined) {
                const nextTheme = normalizeTheme(changes.theme);

                normalizedChanges.theme = nextTheme;
                setAnimatedTheme(nextTheme, origin);
            }

            if (changes.accent !== undefined) {
                normalizedChanges.accent = getAccentName(changes.accent);
            }

            setSettings({
                ...settings,
                ...normalizedChanges,
            });

            setError(null);

            try {
                const updatedSettings = await updateSettingsRequest(userId, normalizedChanges);

                setSettings({
                    ...updatedSettings,
                    theme: normalizeTheme(updatedSettings.theme),
                    accent: getAccentName(updatedSettings.accent),
                });
            } catch (requestError: unknown) {
                setSettings(previousSettings);

                if (changes.theme !== undefined) {
                    setAnimatedTheme(previousTheme, undefined, false);
                }

                const nextError = requestError instanceof Error ? requestError : new Error('Не удалось сохранить настройки');

                setError(nextError);
                throw nextError;
            }
        },
        [userId, settings, theme, setAnimatedTheme],
    );

    /** изменение темы */
    const changeTheme = React.useCallback(
        async (nextTheme: ThemeMode, origin?: ThemeOrigin) => {
            // без авторизации тема меняется только локально, без записи в БД
            if (!userId || !settings) {
                setAnimatedTheme(nextTheme, origin);
                pendingThemeOverrideRef.current = nextTheme; // запомнить явный выбор до входа
                return;
            }

            await changeSettings({ theme: nextTheme }, origin);
        },
        [userId, settings, setAnimatedTheme, changeSettings],
    );

    /** переключение темы */
    const toggleTheme = React.useCallback((origin?: ThemeOrigin) => changeTheme(theme === 'light' ? 'dark' : 'light', origin), [theme, changeTheme]);

    /** изменение акцентного цвета */
    const changeAccent = React.useCallback(
        async (nextAccent: AccentName) => {
            const previousAccent = accentRef.current;

            previewAccent(nextAccent);

            try {
                await changeSettings({
                    accent: nextAccent,
                });
            } catch (requestError: unknown) {
                if (accentRef.current === nextAccent) {
                    previewAccent(previousAccent);
                }

                throw requestError;
            }
        },
        [changeSettings, previewAccent],
    );

    const value = React.useMemo(
        () => ({
            settings,
            ready,
            error,
            theme,
            accent,
            accentColor,
            accentContrast,
            changeSettings,
            changeTheme,
            toggleTheme,
            previewAccent,
            changeAccent,
        }),
        [settings, ready, error, theme, accent, accentColor, accentContrast, changeSettings, changeTheme, toggleTheme, previewAccent, changeAccent],
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** доступ к настройкам пользователя */
export function useSettings() {
    const context = React.useContext(SettingsContext);

    if (!context) {
        throw new Error('useSettings должен использоваться внутри SettingsProvider');
    }

    return context;
}
