import './timerHeader.css';

/** шапка страницы таймера */
export default function TimerHeader() {
    return (
        <header className='timer_header'>
            <p className='timer_header_eyebrow'>Pomodoro</p>

            <h1 className='timer_header_title'>Таймер фокуса</h1>
        </header>
    );
}
