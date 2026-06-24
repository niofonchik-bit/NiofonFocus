import type { Habit } from '@api/habits';
import PathIcon from '@components/pathIcon/pathIcon';
import { mdiCalendarCheckOutline, mdiCheckboxMarkedCircleOutline, mdiChartTimelineVariant, mdiFire } from '@mdi/js';
import useCountUp from '@root/hooks/useCountUp';
import { getDashboardSummary } from '@utils/dashboard';
import { getDayWord } from '@utils/plural';
import React from 'react';
import './statCards.css';

interface StatCardsProps {
    habits: Habit[];
}

interface StatItem {
    key: string;
    label: string;
    icon: string;
    value: number;
    total?: number;
    accent: string;
    hint?: string;
}

/** одна карточка показателя с анимацией числа */
function StatCard({ item, index }: { item: StatItem; index: number }) {
    const animated = useCountUp(item.value);
    const rounded = Math.round(animated);

    return (
        <article
            className='stat_card'
            style={{ '--enter-index': index, '--stat-accent': item.accent } as React.CSSProperties}
        >
            <span className='stat_card_icon'>
                <PathIcon path={item.icon} />
            </span>

            <div className='stat_card_body'>
                <span className='stat_card_value'>
                    {rounded}
                    {item.total !== undefined && <small className='stat_card_total'>/{item.total}</small>}
                </span>

                <span className='stat_card_label'>{item.label}</span>
            </div>

            {item.hint && <span className='stat_card_hint'>{item.hint}</span>}
        </article>
    );
}

/** ряд карточек показателей */
export default function StatCards({ habits }: StatCardsProps) {
    const summary = React.useMemo(() => getDashboardSummary(habits), [habits]);

    const items: StatItem[] = [
        {
            key: 'active',
            label: 'Активные привычки',
            icon: mdiChartTimelineVariant,
            value: summary.totalHabits,
            accent: '#7c5cfc',
        },
        {
            key: 'today',
            label: 'Выполнено сегодня',
            icon: mdiCheckboxMarkedCircleOutline,
            value: summary.completedToday,
            total: summary.totalHabits,
            accent: '#18a058',
        },
        {
            key: 'streak',
            label: 'Лучшая серия',
            icon: mdiFire,
            value: summary.bestStreak,
            accent: '#ff7a18',
            hint: `${getDayWord(summary.bestStreak)} подряд`,
        },
        {
            key: 'week',
            label: 'Отметок за неделю',
            icon: mdiCalendarCheckOutline,
            value: summary.weekCompletions,
            accent: '#2f6bff',
        },
    ];

    return (
        <div className='stat_cards'>
            {items.map((item, index) => (
                <StatCard
                    key={item.key}
                    item={item}
                    index={index}
                />
            ))}
        </div>
    );
}
