import type { Habit } from '@api/habits';
import { ACTIVITY_PERIODS, DEFAULT_ACTIVITY_PERIOD, formatDayLong, getActivityData, type ActivityDay } from '@utils/dashboard';
import { getWeekWord } from '@utils/plural';
import React from 'react';
import ActivityTooltip from './activityTooltip';
import PeriodSelector from './periodSelector';
import './activityMap.css';

interface ActivityMapProps {
    habits: Habit[];
}

interface HoverState {
    day: ActivityDay;
    rect: DOMRect;
}

/** карта активности */
export default function ActivityMap({ habits }: ActivityMapProps) {
    const [period, setPeriod] = React.useState(DEFAULT_ACTIVITY_PERIOD);
    const [hover, setHover] = React.useState<HoverState | null>(null);

    const scrollRef = React.useRef<HTMLDivElement | null>(null);

    const weeks = React.useMemo(() => ACTIVITY_PERIODS.find((option) => option.value === period)?.weeks ?? 26, [period]);
    const data = React.useMemo(() => getActivityData(habits, weeks), [habits, weeks]);

    // прокрутка к актуальной неделе при смене периода
    React.useEffect(() => {
        const node = scrollRef.current;

        if (node) {
            node.scrollLeft = node.scrollWidth;
        }
    }, [weeks]);

    function showTooltip(target: HTMLElement, day: ActivityDay) {
        if (day.future) {
            return;
        }

        setHover({ day, rect: target.getBoundingClientRect() });
    }

    function hideTooltip() {
        setHover(null);
    }

    function handlePeriodChange(next: string) {
        setHover(null);
        setPeriod(next);
    }

    function describeCell(day: ActivityDay): string {
        if (day.future) {
            return formatDayLong(day.date);
        }

        return `${formatDayLong(day.date)}: выполнено ${day.completedCount} из ${day.scheduledCount}`;
    }

    return (
        <section
            className='activity_map dashboard_card'
            style={{ '--enter-index': 1 } as React.CSSProperties}
            aria-label='Карта активности'
        >
            <header className='activity_map_header'>
                <div className='activity_map_heading'>
                    <h2 className='dashboard_card_title'>Карта активности</h2>

                    <p className='activity_map_subtitle'>
                        последние {weeks} {getWeekWord(weeks)}
                    </p>
                </div>

                <PeriodSelector
                    periods={ACTIVITY_PERIODS}
                    value={period}
                    onChange={handlePeriodChange}
                />
            </header>

            <div
                className='activity_map_scroll'
                ref={scrollRef}
            >
                <div className='activity_map_canvas'>
                    <div className='activity_map_months'>
                        {data.monthLabels.map((month) => (
                            <span
                                key={`${month.weekIndex}-${month.label}`}
                                className='activity_map_month'
                                style={{ '--col': month.weekIndex } as React.CSSProperties}
                            >
                                {month.label}
                            </span>
                        ))}
                    </div>

                    <div className='activity_map_grid'>
                        {data.weeks.map((week, weekIndex) => (
                            <div
                                className='activity_map_week'
                                key={week.key}
                            >
                                {week.days.map((day) => (
                                    <button
                                        type='button'
                                        key={day.key}
                                        className={[
                                            'activity_map_cell',
                                            `activity_map_cell_level_${day.level}`,
                                            day.future ? 'activity_map_cell_future' : '',
                                            hover?.day.key === day.key ? 'activity_map_cell_active' : '',
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        style={{ '--cell-index': weekIndex } as React.CSSProperties}
                                        disabled={day.future}
                                        aria-label={describeCell(day)}
                                        onMouseEnter={(event) => showTooltip(event.currentTarget, day)}
                                        onMouseLeave={hideTooltip}
                                        onFocus={(event) => showTooltip(event.currentTarget, day)}
                                        onBlur={hideTooltip}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className='activity_map_legend'>
                <span>меньше</span>

                <span className='activity_map_legend_cells'>
                    {[0, 1, 2, 3, 4].map((level) => (
                        <i
                            key={level}
                            className={`activity_map_cell_level_${level}`}
                        />
                    ))}
                </span>

                <span>больше</span>
            </footer>

            {hover && (
                <ActivityTooltip
                    day={hover.day}
                    rect={hover.rect}
                />
            )}
        </section>
    );
}
