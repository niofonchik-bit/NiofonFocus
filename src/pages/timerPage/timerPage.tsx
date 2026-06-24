import AppLoader from '@components/appLoader/appLoader';
import { playCelebration } from '@effects/celebration/celebration';
import '@effects/celebration/celebration.css';
import { playChime } from '@effects/sound/chime';
import { useSettings } from '@providers/settingsProvider/settingsProvider';
import { getSessionWord } from '@utils/plural'; // см. п.7 (добавить слово «сессия»)
import React from 'react';
import TimerHeader from './components/timerHeader/timerHeader';
import ModeTabs from './components/modeTabs/modeTabs';
import ProgressRing from './components/progressRing/progressRing';
import TimerClock from './components/timerClock/timerClock';
import TimerControls from './components/timerControls/timerControls';
import SessionDots from './components/sessionDots/sessionDots';
import { TIMER_MODES, type TimerMode } from './constants/timerModes';
import { useFocusTimer } from './hooks/useFocusTimer';
import { useTodaySessions } from './hooks/useTodaySessions';
import './timerPage.css';

export default function TimerPage() {
    const { settings, ready } = useSettings();
    const { count, addCompleted } = useTodaySessions();
    const [cycle, setCycle] = React.useState(0); // 0..3 — индикатор помодоро-цикла
    const effectsLayerRef = React.useRef<HTMLDivElement | null>(null);

    const handleComplete = React.useCallback(
        (mode: TimerMode) => {
            if (settings?.sound_enabled) playChime();
            if (mode === 'work') {
                void addCompleted(settings!.focus_minutes);
                setCycle((c) => (c + 1) % 4);
                playCelebration(effectsLayerRef.current); // частицы поверх кольца
                if (settings?.notifications_enabled && 'Notification' in window && Notification.permission === 'granted') {
                    new Notification('Focus', { body: 'Рабочая сессия завершена. Сделайте перерыв.' });
                }
            }
        },
        [settings, addCompleted],
    );

    const timer = useFocusTimer({ settings: settings!, onComplete: handleComplete });

    // живой заголовок вкладки
    React.useEffect(() => {
        document.title = timer.status === 'running' ? `${fmt(timer.remaining)} · ${TIMER_MODES[timer.mode].short} — Focus` : 'Focus';
        return () => {
            document.title = 'Focus';
        };
    }, [timer.remaining, timer.status, timer.mode]);

    if (!ready || !settings) {
        return (
            <section className='timer_page'>
                <AppLoader
                    variant='section'
                    label='Загрузка таймера...'
                />
            </section>
        );
    }

    const stateLabel = timer.status === 'running' ? TIMER_MODES[timer.mode].label : timer.remaining === timer.total ? 'Готов к старту' : 'Пауза';

    return (
        <section className='timer_page'>
            <div className='timer_page_content'>
                <TimerHeader />

                <div className='timer_page_stage'>
                    <ModeTabs
                        mode={timer.mode}
                        onChange={timer.switchMode}
                    />

                    <div className='timer_page_ring_wrap'>
                        <div
                            ref={effectsLayerRef}
                            className='timer_page_effects'
                            aria-hidden='true'
                        />
                        <ProgressRing
                            progress={timer.progress}
                            size={340}
                            stroke={14}
                        >
                            <TimerClock
                                seconds={timer.remaining}
                                running={timer.status === 'running'}
                            />
                            <div className='timer_page_state'>{stateLabel}</div>
                        </ProgressRing>
                    </div>

                    <TimerControls
                        status={timer.status}
                        mode={timer.mode}
                        onStart={timer.start}
                        onPause={timer.pause}
                        onReset={timer.reset}
                        onSwitchMode={timer.switchMode}
                    />

                    <SessionDots
                        active={cycle}
                        total={4}
                    />

                    <p className='timer_page_foot'>
                        Сегодня завершено <b>{count}</b> {getSessionWord(count)} · фокус <b>{settings.focus_minutes}</b> мин
                    </p>
                </div>
            </div>
        </section>
    );
}

/** MM:SS */
function fmt(total: number): string {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
