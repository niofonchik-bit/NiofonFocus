import PathIcon from '@components/pathIcon/pathIcon';
import { mdiBullseyeArrow, mdiCoffeeOutline, mdiPause, mdiPlay, mdiRestart } from '@mdi/js';
import { IconButton } from '@mui/material';
import type { TimerMode } from '../../constants/timerModes';
import type { TimerStatus } from '../../hooks/useFocusTimer';
import './timerControls.css';

interface TimerControlsProps {
    status: TimerStatus;
    mode: TimerMode;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onSwitchMode: (mode: TimerMode) => void;
}

export default function TimerControls({ status, mode, onStart, onPause, onReset, onSwitchMode }: TimerControlsProps) {
    const running = status === 'running';
    return (
        <div className='timer_controls'>
            <IconButton
                className='timer_controls_btn timer_controls_btn_secondary'
                aria-label='Сброс'
                onClick={onReset}
            >
                <PathIcon path={mdiRestart} />
            </IconButton>

            <IconButton
                className={['timer_controls_btn', 'timer_controls_btn_primary', running ? 'timer_controls_btn_running' : '']
                    .filter(Boolean)
                    .join(' ')}
                aria-label={running ? 'Пауза' : 'Старт'}
                onClick={running ? onPause : onStart}
            >
                <span
                    key={running ? 'pause' : 'play'}
                    className='timer_controls_main_icon'
                >
                    <PathIcon path={running ? mdiPause : mdiPlay} />
                </span>
            </IconButton>

            <IconButton
                className='timer_controls_btn timer_controls_btn_secondary'
                aria-label='Сменить режим'
                onClick={() => onSwitchMode(mode === 'work' ? 'short' : 'work')}
            >
                <PathIcon path={mode === 'work' ? mdiCoffeeOutline : mdiBullseyeArrow} />
            </IconButton>
        </div>
    );
}
