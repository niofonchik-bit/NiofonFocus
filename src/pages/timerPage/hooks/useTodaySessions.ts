import { addSession, getSessions } from '@api/sessions';
import { useAuth } from '@providers/authProvider/authProvider';
import React from 'react';

function localDateKey(): string {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function useTodaySessions() {
    const { session } = useAuth();

    const userId = session?.user.id;
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        if (!userId) return;
        let active = true;
        const today = localDateKey();
        void getSessions(userId, today)
            .then((rows) => {
                if (active) setCount(rows.length);
            })
            .catch(() => {
                /** счетчик не критичен */
            });

        return () => {
            active = false;
        };
    }, [userId]);

    const addCompleted = React.useCallback(
        async (durationMinutes: number) => {
            if (!userId) return;
            
            setCount((c) => c + 1); // оптимистично

            try {
                await addSession(userId, { durationMinutes });
            } catch {
                setCount((c) => Math.max(0, c - 1)); // откат при ошибке
            }
        },
        [userId],
    );

    return { count, addCompleted };
}
