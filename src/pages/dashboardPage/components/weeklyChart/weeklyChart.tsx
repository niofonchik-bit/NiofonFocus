import type { Habit } from '@api/habits';
import { getWeekActivity } from '@utils/dashboard';
import { getMarkWord } from '@utils/plural';
import React from 'react';
import './weeklyChart.css';

interface WeeklyChartProps {
    habits: Habit[];
}

/** график активности за текущую неделю */
export default function WeeklyChart({ habits }: WeeklyChartProps) {
    const days = React.useMemo(() => getWeekActivity(habits), [habits]);

    const max = Math.max(1, ...days.map((day) => day.count));
    const total = days.reduce((sum, day) => sum + day.count, 0);

    return (
        <section
            className='weekly_chart dashboard_card'
            style={{ '--enter-index': 3 } as React.CSSProperties}
            aria-label='Активность за эту неделю'
        >
            <header className='weekly_chart_header'>
                <div className='weekly_chart_heading'>
                    <h2 className='dashboard_card_title'>Эта неделя</h2>

                    <p className='weekly_chart_subtitle'>
                        {total} {getMarkWord(total)} за 7 дней
                    </p>
                </div>

                <span className='weekly_chart_meta'>отметок по дням</span>
            </header>

            <div className='weekly_chart_bars'>
                {days.map((day, index) => (
                    <div
                        key={day.key}
                        className={['weekly_chart_col', day.today ? 'weekly_chart_col_today' : '', day.future ? 'weekly_chart_col_future' : '']
                            .filter(Boolean)
                            .join(' ')}
                        style={{ '--enter-index': index, '--bar-ratio': day.count / max } as React.CSSProperties}
                        title={`${day.label}: ${day.count} из ${day.scheduledCount}`}
                    >
                        <span className='weekly_chart_count'>{day.count}</span>

                        <div className='weekly_chart_track'>
                            <div className='weekly_chart_bar' />
                        </div>

                        <span className='weekly_chart_label'>{day.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
