import { useEffect, useState } from 'react';

/** проверка уменьшения движения */
export default function useReducedMotion() {
    const [reducedMotion, setReducedMotion] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

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
