import useReducedMotion from '@root/hooks/useReducedMotion';
import './timerClock.css';

interface TimerClockProps {
    seconds: number;
    running: boolean;
}

export default function TimerClock({ seconds, running }: TimerClockProps) {
    const reduced = useReducedMotion();
    const text = format(seconds);
    const chars = text.split('');

    return (
        <div
            className='timer_clock num'
            aria-label={text}
            role='timer'
        >
            {chars.map((ch, i) => {
                if (ch === ':')
                    return (
                        <span
                            key='sep'
                            className='timer_clock_sep'
                            aria-hidden='true'
                        >
                            :
                        </span>
                    );

                return (
                    <span
                        key={i}
                        className='timer_clock_cell'
                    >
                        {/* key={ch} => при смене цифры узел пересоздается и анимация проигрывается */}
                        <span
                            key={reduced ? 'static' : ch}
                            className={running && !reduced ? 'timer_clock_digit timer_clock_digit_flip' : 'timer_clock_digit'}
                        >
                            {ch}
                        </span>
                    </span>
                );
            })}
        </div>
    );
}

function format(total: number): string {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
