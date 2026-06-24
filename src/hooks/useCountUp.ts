import { useEffect, useRef, useState } from 'react';
import useReducedMotion from '@root/hooks/useReducedMotion';

interface CountUpOptions {
    /** длительность анимации в мс */
    duration?: number;
}

/** анимированное число: плавно «доезжает» до целевого значения */
export default function useCountUp(target: number, { duration = 900 }: CountUpOptions = {}): number {
    const reducedMotion = useReducedMotion();
    const [display, setDisplay] = useState(0);

    // последнее показанное значение — стартовая точка следующей анимации
    const displayRef = useRef(0);

    useEffect(() => {
        displayRef.current = display;
    }, [display]);

    useEffect(() => {
        // без анимации — мгновенно показываем итог
        if (reducedMotion) {
            setDisplay(target);
            return;
        }

        const from = displayRef.current;
        const diff = target - from;

        if (Math.abs(diff) < 0.001) {
            setDisplay(target);
            return;
        }

        let frame = 0;
        const start = performance.now();

        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);

            setDisplay(from + diff * eased);

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            } else {
                setDisplay(target);
            }
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [target, duration, reducedMotion]);

    return display;
}
