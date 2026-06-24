import './progressRing.css';

interface ProgressRingProps {
    progress: number;
    size?: number;
    stroke?: number;
    children?: React.ReactNode;
}

export default function ProgressRing({ progress, size = 340, stroke = 14, children }: ProgressRingProps) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(1, progress));
    const offset = c * (1 - clamped);

    return (
        <div
            className='progress_ring'
            style={{ width: size, height: size }}
        >
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className='progress_ring_svg'
            >
                <circle
                    className='progress_ring_track'
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill='none'
                    strokeWidth={stroke}
                />

                <circle
                    className='progress_ring_value'
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill='none'
                    strokeWidth={stroke}
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                />
            </svg>

            <div className='progress_ring_center'>{children}</div>
        </div>
    );
}
