import type { CSSProperties } from '@mui/material';
import { Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useMatches, useNavigationType, useOutlet } from 'react-router-dom';
import './animatedOutlet.css';

type RouterLocation = ReturnType<typeof useLocation>;
type RouterNavigationType = ReturnType<typeof useNavigationType>;

export type TransitionDirection = 'forward' | 'back' | 'refresh';
export type TransitionPreset = 'slide' | 'scale' | 'fade';

export type PageTransitionMeta = {
    level: number;
    preset?: TransitionPreset;
};

export type PageTransitionHandle = {
    pageTransition?: PageTransitionMeta;
};

type TransitionOptions = {
    direction?: TransitionDirection;
    preset?: TransitionPreset;
    originY?: number;
};

type TransitionLocationState = {
    pageTransition?: TransitionOptions;
};

type TransitionSnapshot = {
    key: string;
    outlet: ReactNode;
    location: RouterLocation;
    route?: PageTransitionMeta;
};

type DirectionContext = {
    previousLocation: RouterLocation;
    nextLocation: RouterLocation;
    navigationType: RouterNavigationType;
    previousRoute?: PageTransitionMeta;
    nextRoute?: PageTransitionMeta;
};

type AnimatedOutletProps = {
    fallback?: ReactNode;
    className?: string;
    exitDuration?: number;
    enterDuration?: number;
    disabled?: boolean;
    respectReducedMotion?: boolean;
    getKey?: (location: RouterLocation) => string;
    getDirection?: (context: DirectionContext) => TransitionDirection;
};

/** получение параметров перехода */
function getTransitionOptions(location: RouterLocation) {
    return (
        (location.state as TransitionLocationState | null)?.pageTransition ?? {}
    );
}

/** проверка уменьшения движения */
function useReducedMotion() {
    const [reducedMotion, setReducedMotion] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );

        function updateReducedMotion() {
            setReducedMotion(mediaQuery.matches);
        }

        updateReducedMotion();

        mediaQuery.addEventListener('change', updateReducedMotion);

        return () => {
            mediaQuery.removeEventListener('change', updateReducedMotion);
        };
    }, []);

    return reducedMotion;
}

/** анимированный выход маршрута */
export default function AnimatedOutlet({
    fallback = null,
    className,
    exitDuration = 200,
    enterDuration = 400,
    disabled = false,
    respectReducedMotion = true,
    getKey = (location) => location.key,
    getDirection,
}: AnimatedOutletProps) {
    const location = useLocation();
    const navigationType = useNavigationType();
    const outlet = useOutlet();
    const reducedMotion = useReducedMotion();

    const locationKey = getKey(location);
    
    const matches = useMatches();

    const currentRoute = [...matches]
        .reverse()
        .map((match) => {
            return match.handle as PageTransitionHandle | undefined;
        })
        .find((handle) => handle?.pageTransition)?.pageTransition;

    const [displayedPage, setDisplayedPage] = useState<TransitionSnapshot>(
        () => ({
            key: locationKey,
            outlet,
            location,
            route: currentRoute,
        }),
    );

    const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');

    const [animation, setAnimation] = useState<{
        direction: TransitionDirection;
        preset: TransitionPreset;
        originY: number | null;
    }>({
        direction: 'forward',
        preset: 'slide',
        originY: null,
    });

    const displayedPageRef = useRef(displayedPage);
    const timersRef = useRef<number[]>([]);

    const latestValuesRef = useRef({
        location,
        outlet,
        navigationType,
        currentRoute,
        disabled,
        reducedMotion,
        respectReducedMotion,
        exitDuration,
        enterDuration,
        getDirection,
    });

    latestValuesRef.current = {
        location,
        outlet,
        navigationType,
        currentRoute,
        disabled,
        reducedMotion,
        respectReducedMotion,
        exitDuration,
        enterDuration,
        getDirection,
    };

   useLayoutEffect(() => {
        const latestValues = latestValuesRef.current;
        const previousPage = displayedPageRef.current;

        if (previousPage.key === locationKey) {
            return;
        }

        timersRef.current.forEach(window.clearTimeout);
        timersRef.current = [];

        const nextPage: TransitionSnapshot = {
            key: locationKey,
            outlet: latestValues.outlet,
            location: latestValues.location,
            route: latestValues.currentRoute,
        };

        // проверка отключения анимации
        const shouldReduceMotion =
            latestValues.disabled ||
            (latestValues.respectReducedMotion &&
                latestValues.reducedMotion);

        if (shouldReduceMotion) {
            displayedPageRef.current = nextPage;
            setDisplayedPage(nextPage);
            setPhase('idle');

            return;
        }

        const previousOptions = getTransitionOptions(
            previousPage.location,
        );

        const nextOptions = getTransitionOptions(
            nextPage.location,
        );

        let direction = nextOptions.direction;

        if (!direction && latestValues.getDirection) {
            direction = latestValues.getDirection({
                previousLocation: previousPage.location,
                nextLocation: nextPage.location,
                navigationType: latestValues.navigationType,
                previousRoute: previousPage.route,
                nextRoute: nextPage.route,
            });
        }

        // определение направления перехода
        if (!direction) {
            if (
                previousPage.location.pathname ===
                nextPage.location.pathname
            ) {
                direction = 'refresh';
            } else if (
                previousPage.route &&
                nextPage.route
            ) {
                direction =
                    nextPage.route.level >=
                    previousPage.route.level
                        ? 'forward'
                        : 'back';
            } else {
                direction =
                    latestValues.navigationType === 'POP'
                        ? 'back'
                        : 'forward';
            }
        }

        // определение пресета перехода
        let preset: TransitionPreset;

        if (direction === 'back') {
            preset =
                nextOptions.preset ??
                previousOptions.preset ??
                previousPage.route?.preset ??
                nextPage.route?.preset ??
                'slide';
        } else {
            preset =
                nextOptions.preset ??
                nextPage.route?.preset ??
                'slide';
        }

        // определение точки начала перехода
        const originY =
            direction === 'back'
                ? previousOptions.originY ??
                  nextOptions.originY ??
                  null
                : nextOptions.originY ?? null;

        setAnimation({
            direction,
            preset,
            originY,
        });

        setPhase('exit');

        const exitTimer = window.setTimeout(() => {
            displayedPageRef.current = nextPage;
            setDisplayedPage(nextPage);
            setPhase('enter');

            const enterTimer = window.setTimeout(() => {
                setPhase('idle');
            }, latestValues.enterDuration);

            timersRef.current.push(enterTimer);
        }, latestValues.exitDuration);

        timersRef.current.push(exitTimer);
    }, [locationKey]);

    useEffect(() => {
        return () => {
            timersRef.current.forEach(window.clearTimeout);
        };
    }, []);

    const effectiveExitDuration =
        respectReducedMotion && reducedMotion
            ? 0
            : exitDuration;

    const effectiveEnterDuration =
        respectReducedMotion && reducedMotion
            ? 0
            : enterDuration;

    const transitionStyle = {
        '--route-transition-exit-duration': `${effectiveExitDuration}ms`,
        '--route-transition-enter-duration': `${effectiveEnterDuration}ms`,
        '--route-transition-origin-y':
            animation.originY === null
                ? 'top'
                : `${animation.originY}px`,
    } as CSSProperties;

    return (
        <div
            className={[
                'route_transition',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={transitionStyle}
            data-phase={phase}
            data-direction={animation.direction}
            data-preset={animation.preset}
            data-route-transition-root
        >
            <Suspense fallback={fallback}>
                {displayedPage.outlet}
            </Suspense>
        </div>
    );
}
