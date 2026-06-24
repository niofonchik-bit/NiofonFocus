import './sessionDots.css';

interface SessionDotsProps {
    /** сколько точек заполнено (0..total) */
    active: number;
    /** всего точек в цикле */
    total?: number;
}

/** индикатор помодоро-цикла */
export default function SessionDots({ active, total = 4 }: SessionDotsProps) {
    return (
        <div
            className='session_dots'
            role='img'
            aria-label={`Сессий в цикле выполнено: ${active} из ${total}`}
        >
            {Array.from({ length: total }, (_, index) => (
                <span
                    key={index}
                    className={['session_dots_dot', index < active ? 'session_dots_dot_on' : ''].filter(Boolean).join(' ')}
                    aria-hidden='true'
                />
            ))}
        </div>
    );
}
