import { getSettings, updateSettings as updateSettingsRequest, type SettingsChanges, type UserSettings } from '@api/settings';
import { useAnimatedTheme, type ThemeMode, type ThemeOrigin } from '@providers/animatedThemeProvider/animatedThemeProvider';
import { useAuth } from '@providers/authProvider/authProvider';
import React from 'react';
import { ACCENT_COLORS, DEFAULT_ACCENT, getAccentName, type AccentName } from '@root/constants/accentColor';

type SettingsContextValue = {
    settings: UserSettings | null;
    ready: boolean;
    error: Error | null;
    theme: ThemeMode;
    accent: AccentName;
    accentColor: string;
    changeSettings: (changes: SettingsChanges, origin?: ThemeOrigin) => Promise<void>;
    changeTheme: (theme: ThemeMode, origin?: ThemeOrigin) => Promise<void>;
    toggleTheme: (origin?: ThemeOrigin) => Promise<void>;
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
function getInitialAccent(storageKey: string): AccentName {
    if (typeof document === 'undefined') {
        return DEFAULT_ACCENT;
    }

    const documentAccent = document.documentElement.dataset.accent;

    if (documentAccent) {
        return getAccentName(documentAccent);
    }

    try {
        return getAccentName(localStorage.getItem(storageKey));
    } catch {
        return DEFAULT_ACCENT;
    }
}

/** провайдер настроек пользователя */
export default function SettingsProvider({ children, accentStorageKey = 'niofon_focus_accent' }: SettingsProviderProps) {
    const { session, ready: authReady } = useAuth();
    const { theme, setTheme: setAnimatedTheme } = useAnimatedTheme();

    const [settings, setSettings] = React.useState<UserSettings | null>(null);

    const [accent, setAccent] = React.useState<AccentName>(() => getInitialAccent(accentStorageKey));

    /** фактический цвет выбранного акцента */
    const accentColor = ACCENT_COLORS[accent];

    const [ready, setReady] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const userId = session?.user.id;

    React.useLayoutEffect(() => {
        document.documentElement.dataset.accent = accent;

        document.documentElement.style.setProperty('--accent-primary', accentColor);

        try {
            localStorage.setItem(accentStorageKey, accent);

            // цвет используется только для применения до запуска react
            localStorage.setItem(`${accentStorageKey}_color`, accentColor);
        } catch {
            // localStorage может быть недоступен
        }
    }, [accent, accentColor, accentStorageKey]);

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
            .then((loadedSettings) => {
                if (!active) return;

                const loadedTheme = normalizeTheme(loadedSettings.theme);

                const loadedAccent = getAccentName(loadedSettings.accent);

                // синхронизация с бд не должна запускать ripple-анимацию
                setAnimatedTheme(loadedTheme, undefined, false);

                setAccent(loadedAccent);

                setSettings({
                    ...loadedSettings,
                    theme: loadedTheme,
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

    /** изменение настроек пользователя */
    const changeSettings = React.useCallback(
        async (changes: SettingsChanges, origin?: ThemeOrigin) => {
            if (!userId || !settings) {
                throw new Error('Настройки пользователя еще не загружены');
            }

            const previousSettings = settings;
            const previousTheme = theme;
            const previousAccent = accent;

            const normalizedChanges: SettingsChanges = {
                ...changes,
            };

            if (changes.theme !== undefined) {
                const nextTheme = normalizeTheme(changes.theme);

                normalizedChanges.theme = nextTheme;
                setAnimatedTheme(nextTheme, origin);
            }

            if (changes.accent !== undefined) {
                const nextAccent = getAccentName(changes.accent);

                normalizedChanges.accent = nextAccent;
                setAccent(nextAccent);
            }

            setSettings({
                ...settings,
                ...normalizedChanges,
            });

            setError(null);

            try {
                const updatedSettings = await updateSettingsRequest(userId, normalizedChanges);

                const updatedAccent = getAccentName(updatedSettings.accent);

                setAccent(updatedAccent);

                setSettings({
                    ...updatedSettings,
                    theme: normalizeTheme(updatedSettings.theme),
                    accent: updatedAccent,
                });
            } catch (requestError: unknown) {
                setSettings(previousSettings);

                if (changes.theme !== undefined) {
                    setAnimatedTheme(previousTheme, undefined, false);
                }

                if (changes.accent !== undefined) {
                    setAccent(previousAccent);
                }

                const nextError = requestError instanceof Error ? requestError : new Error('Не удалось сохранить настройки');

                setError(nextError);
                throw nextError;
            }
        },
        [userId, settings, theme, accent, setAnimatedTheme],
    );

    /** изменение темы */
    const changeTheme = React.useCallback(
        (nextTheme: ThemeMode, origin?: ThemeOrigin) =>
            changeSettings(
                {
                    theme: nextTheme,
                },
                origin,
            ),
        [changeSettings],
    );

    /** переключение темы */
    const toggleTheme = React.useCallback((origin?: ThemeOrigin) => changeTheme(theme === 'light' ? 'dark' : 'light', origin), [theme, changeTheme]);

    /** изменение акцентного цвета */
    const changeAccent = React.useCallback(
        (nextAccent: AccentName) =>
            changeSettings({
                accent: nextAccent,
            }),
        [changeSettings],
    );

    const value = React.useMemo(
        () => ({
            settings,
            ready,
            error,
            theme,
            accent,
            accentColor,
            changeSettings,
            changeTheme,
            toggleTheme,
            changeAccent,
        }),
        [settings, ready, error, theme, accent, accentColor, changeSettings, changeTheme, toggleTheme, changeAccent],
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
