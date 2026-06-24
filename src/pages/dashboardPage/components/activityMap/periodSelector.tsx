import type { ActivityPeriod } from '@utils/dashboard';

interface PeriodSelectorProps {
    periods: ActivityPeriod[];
    value: string;
    onChange: (value: string) => void;
}

/** переключатель периода карты активности */
export default function PeriodSelector({ periods, value, onChange }: PeriodSelectorProps) {
    return (
        <div
            className='activity_period'
            role='tablist'
            aria-label='Период карты активности'
        >
            {periods.map((period) => (
                <button
                    key={period.value}
                    type='button'
                    role='tab'
                    aria-selected={period.value === value}
                    className={['activity_period_option', period.value === value ? 'activity_period_option_active' : ''].filter(Boolean).join(' ')}
                    onClick={() => onChange(period.value)}
                >
                    {period.label}
                </button>
            ))}
        </div>
    );
}
