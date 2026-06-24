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

const BASE_CELL = 15;
const MAX_CELL = 28; // верхний предел — лечит «слишком большие» в 3 мес
const CELL_GAP = 4;
const MONTHS_BLOCK = 22; // высота строки месяцев (16px) + margin-bottom (6px)
const DESKTOP_QUERY = '(min-width: 981px)';

const TOOLTIP_DELAY = 140;

/** карта активности */
export default function ActivityMap({ habits }: ActivityMapProps) {
    const [period, setPeriod] = React.useState(DEFAULT_ACTIVITY_PERIOD);
    const [hover, setHover] = React.useState<HoverState | null>(null);

    const [cellSize, setCellSize] = React.useState(BASE_CELL);

    const scrollRef = React.useRef<HTMLDivElement | null>(null);
    const tooltipTimerRef = React.useRef<number | null>(null);

    const weeks = React.useMemo(() => ACTIVITY_PERIODS.find((option) => option.value === period)?.weeks ?? 26, [period]);
    const data = React.useMemo(() => getActivityData(habits, weeks), [habits, weeks]);

    // прокрутка к актуальной неделе при смене периода
    React.useEffect(() => {
        const node = scrollRef.current;

        if (node) {
            node.scrollLeft = node.scrollWidth;
        }
    }, [weeks]);

    React.useEffect(
        () => () => {
            if (tooltipTimerRef.current) {
                window.clearTimeout(tooltipTimerRef.current);
            }
        },
        [],
    );

    React.useLayoutEffect(() => {
        const node = scrollRef.current;
        if (!node) return;

        const mq = window.matchMedia(DESKTOP_QUERY);

        const recompute = () => {
            const cols = data.weeks.length;
            const widthFit = Math.floor((node.clientWidth - (cols - 1) * CELL_GAP) / cols);

            // на десктопе высота карточки фиксирована — тянем ячейку под высоту (7 рядов),
            // по ширине при нехватке места включается горизонтальный скролл
            let target = widthFit;
            if (mq.matches) {
                const gridHeight = node.clientHeight - MONTHS_BLOCK;
                target = Math.floor((gridHeight - 6 * CELL_GAP) / 7);
            }

            setCellSize(Math.max(BASE_CELL, Math.min(MAX_CELL, target)));
        };

        recompute();

        const ro = new ResizeObserver(recompute);
        ro.observe(node);
        mq.addEventListener('change', recompute);

        return () => {
            ro.disconnect();
            mq.removeEventListener('change', recompute);
        };
    }, [data.weeks.length]);

    function showTooltip(target: HTMLElement, day: ActivityDay, immediate = false) {
        if (day.future) {
            return;
        }

        const rect = target.getBoundingClientRect();

        if (immediate) {
            setHover({ day, rect });
            return;
        }

        if (tooltipTimerRef.current) {
            window.clearTimeout(tooltipTimerRef.current);
        }

        tooltipTimerRef.current = window.setTimeout(() => setHover({ day, rect }), TOOLTIP_DELAY);
    }

    function hideTooltip() {
        if (tooltipTimerRef.current) {
            window.clearTimeout(tooltipTimerRef.current);
            tooltipTimerRef.current = null;
        }

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
            style={{ '--enter-index': 1, '--cell-size': `${cellSize}px` } as React.CSSProperties}
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
                <div
                    className='activity_map_canvas'
                    key={period}
                >
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
                                        onFocus={(event) => showTooltip(event.currentTarget, day, true)}
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
