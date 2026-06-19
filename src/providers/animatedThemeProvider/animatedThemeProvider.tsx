import React from 'react';
import { flushSync } from 'react-dom';
import './animatedThemeProvider.css';

export type ThemeMode = 'light' | 'dark';

type ThemeOrigin =
    | React.MouseEvent<HTMLElement>
    | MouseEvent
    | HTMLElement
    | {
          x: number;
          y: number;
      };

type NativeViewTransition = {
    ready: Promise<void>;
    finished: Promise<void>;
    skipTransition: () => void;
};

type DocumentWithViewTransition = Document & {
    startViewTransition?: (updateCallback: () => void | Promise<void>) => NativeViewTransition;
};

type AnimatedThemeContextValue = {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode, origin?: ThemeOrigin) => void;
    toggleTheme: (origin?: ThemeOrigin) => void;
};

type AnimatedThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: ThemeMode;
    storageKey?: string;
    duration?: number;
    easing?: string;
};

const AnimatedThemeContext = React.createContext<AnimatedThemeContextValue | null>(null);

/** проверка значения темы */
function isThemeMode(value: unknown): value is ThemeMode {
    return value === 'light' || value === 'dark';
}

/** получение сохраненной темы */
function getInitialTheme(storageKey: string, defaultTheme: ThemeMode): ThemeMode {
    if (typeof document === 'undefined') {
        return defaultTheme;
    }

    const documentTheme = document.documentElement.dataset.theme;

    if (isThemeMode(documentTheme)) {
        return documentTheme;
    }

    try {
        const savedTheme = localStorage.getItem(storageKey);

        if (isThemeMode(savedTheme)) {
            return savedTheme;
        }
    } catch {
        // localStorage может быть недоступен
    }

    return defaultTheme;
}

/** получение точки начала ripple-анимации */
function getTransitionOrigin(origin?: ThemeOrigin) {
    if (origin && 'clientX' in origin) {
        return {
            x: origin.clientX,
            y: origin.clientY,
        };
    }

    if (origin instanceof HTMLElement) {
        const rect = origin.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    }

    if (origin && 'x' in origin && 'y' in origin) {
        return origin;
    }

    return {
        x: document.documentElement.clientWidth / 2,
        y: document.documentElement.clientHeight / 2,
    };
}

/** провайдер темы с ripple-анимацией */
export default function AnimatedThemeProvider({
    children,
    defaultTheme = 'light',
    storageKey = 'app_theme',
    duration = 500,
    easing = 'cubic-bezier(1, 1.2, 1, 1.2)',
}: AnimatedThemeProviderProps) {
    const [theme, setThemeState] = React.useState<ThemeMode>(() => getInitialTheme(storageKey, defaultTheme));

    /** текущая тема без зависимости от состояния React */
    const themeRef = React.useRef(theme);

    /** активный переход темы */
    const activeTransitionRef = React.useRef<NativeViewTransition | null>(null);

    React.useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme;
        themeRef.current = theme;
    }, [theme]);

    /** изменение темы */
    const setTheme = React.useCallback(
        (nextTheme: ThemeMode, origin?: ThemeOrigin) => {
            if (themeRef.current === nextTheme) return;

            const root = document.documentElement;
            const documentWithTransition = document as DocumentWithViewTransition;

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            const startViewTransition = documentWithTransition.startViewTransition?.bind(document);

            /** применение новой темы */
            function applyTheme(synchronous: boolean) {
                root.dataset.theme = nextTheme;
                themeRef.current = nextTheme;

                try {
                    localStorage.setItem(storageKey, nextTheme);
                } catch {
                    // localStorage может быть недоступен
                }

                if (synchronous) {
                    flushSync(() => {
                        setThemeState(nextTheme);
                    });

                    return;
                }
            }

            activeTransitionRef.current?.skipTransition();

            if (!startViewTransition || prefersReducedMotion) {
                delete root.dataset.themeTransition;
                applyTheme(false);
                return;
            }

            const { x, y } = getTransitionOrigin(origin);
            const viewportWidth = root.clientWidth;
            const viewportHeight = root.clientHeight;

            const radius = Math.hypot(Math.max(x, viewportWidth - x), Math.max(y, viewportHeight - y));

            root.dataset.themeTransition = 'active';

            const transition = startViewTransition(() => {
                /** важно применить тему синхронно.
                 * чтобы браузер снял обновленное состояние.
                 */
                applyTheme(true);
            });

            activeTransitionRef.current = transition;

            void transition.ready
                .then(() => {
                    root.animate(
                        {
                            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
                        },
                        {
                            duration,
                            easing,
                            pseudoElement: '::view-transition-new(root)',
                        },
                    );
                })
                .catch(() => {
                    // переход может быть прерван следующим переключением
                });

            void transition.finished
                .catch(() => {
                    // переход может быть принудительно завершен
                })
                .finally(() => {
                    if (activeTransitionRef.current != transition) {
                        return;
                    }

                    activeTransitionRef.current = null;
                    delete root.dataset.themeTransition;
                });
        },
        [duration, easing, storageKey],
    );

    /** переключение между светлой и темной темой */
    const toggleTheme = React.useCallback(
        (origin?: ThemeOrigin) => {
            setTheme(themeRef.current === 'light' ? 'dark' : 'light', origin);
        },
        [setTheme],
    );

    const value = React.useMemo(
        () => ({
            theme,
            setTheme,
            toggleTheme,
        }),
        [theme, setTheme, toggleTheme],
    );

    return <AnimatedThemeContext.Provider value={value}>{children}</AnimatedThemeContext.Provider>;
}

/** доступ к теме приложения */
export function useAnimatedTheme() {
    const context = React.useContext(AnimatedThemeContext);

    if (!context) {
        throw new Error('useAnimatedTheme должен использоваться внутри AnimatedThemeProvider');
    }

    return context;
}
