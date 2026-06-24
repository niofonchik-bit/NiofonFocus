import type { UserSettings } from '@api/settings';
import React from 'react';
import { getModeSeconds, type TimerMode } from '../constants/timerModes';

export type TimerStatus = 'idle' | 'running' | 'paused';

interface UseFocusTimerParams {
    settings: UserSettings;
    onComplete: (mode: TimerMode) => void;
}

export function useFocusTimer({ settings, onComplete }: UseFocusTimerParams) {
    const [mode, setMode] = React.useState<TimerMode>('work');
    const [status, setStatus] = React.useState<TimerStatus>('idle');
    const total = getModeSeconds(mode, settings);
    const [remaining, setRemaining] = React.useState(total);

    const deadlineRef = React.useRef<number>(0);
    const intervalRef = React.useRef<number | null>(null);
    // держим актуальный onComplete без перезапуска эффекта
    const onCompleteRef = React.useRef(onComplete);
    onCompleteRef.current = onComplete;

    // пока не идёт — синхронизируем остаток с длительностью режима
    React.useEffect(() => {
        if (status !== 'running') {
            setRemaining(getModeSeconds(mode, settings));
        }
    }, [mode, settings, status]);

    // тик по дедлайну
    React.useEffect(() => {
        if (status !== 'running') return;

        deadlineRef.current = Date.now() + remaining * 1000;
        intervalRef.current = window.setInterval(() => {
            const left = Math.round((deadlineRef.current - Date.now()) / 1000);
            if (left <= 0) {
                window.clearInterval(intervalRef.current!);
                setRemaining(0);
                setStatus('idle');
                onCompleteRef.current?.(mode);
            } else {
                setRemaining(left);
            }
        }, 250);

        return () => window.clearInterval(intervalRef.current!);
        // eslint-disable-next-line react-hooks/exhausetive-deps
    }, [status]);

    const start = React.useCallback(() => {
        if (remaining > 0) setStatus('running');
    }, [remaining]);

    const pause = React.useCallback(() => {
        setStatus('paused');
    }, []);

    const reset = React.useCallback(() => {
        setStatus('idle');
        setRemaining(getModeSeconds(mode, settings));
    }, [mode, settings]);

    const switchMode = React.useCallback(
        (next: TimerMode) => {
            setStatus('idle');
            setMode(next);
            setRemaining(getModeSeconds(next, settings));
        },
        [settings],
    );

    const progress = total === 0 ? 0 : 1 - remaining / total;

    return {
        mode,
        status,
        remaining,
        total,
        progress,
        start,
        pause,
        reset,
        switchMode,
    };
}
