import PathIcon from '@components/pathIcon/pathIcon';
import { mdiCalendarBlankOutline, mdiCheckCircleOutline } from '@mdi/js';
import { formatDayLong, type ActivityDay } from '@utils/dashboard';
import React from 'react';

interface ActivityTooltipProps {
    day: ActivityDay;
    rect: DOMRect;
}

/** первая буква заглавной */
function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/** всплывающая сводка за день */
export default function ActivityTooltip({ day, rect }: ActivityTooltipProps) {
    const placeBelow = rect.top < 140;

    const style: React.CSSProperties = {
        position: 'fixed',
        left: rect.left + rect.width / 2,
        top: placeBelow ? rect.bottom + 10 : rect.top - 10,
        transform: `translate(-50%, ${placeBelow ? '0' : '-100%'})`,
    };

    const done = day.completedCount;
    const planned = day.scheduledCount;
    const allDone = planned > 0 && done >= planned;

    let badge: string;
    if (planned === 0) {
        badge = done > 0 ? `${done} вне плана` : 'Нет привычек';
    } else if (allDone) {
        badge = 'День закрыт полностью';
    } else {
        badge = `${Math.round((done / planned) * 100)}% выполнено`;
    }

    return (
        <div
            className={['activity_tooltip', placeBelow ? 'activity_tooltip_below' : ''].filter(Boolean).join(' ')}
            style={style}
            role='tooltip'
        >
            <span className='activity_tooltip_date'>{capitalize(formatDayLong(day.date))}</span>

            <div className='activity_tooltip_rows'>
                <span className='activity_tooltip_row'>
                    <PathIcon path={mdiCheckCircleOutline} />
                    Выполнено
                    <b>{done}</b>
                </span>

                <span className='activity_tooltip_row'>
                    <PathIcon path={mdiCalendarBlankOutline} />
                    Запланировано
                    <b>{planned}</b>
                </span>
            </div>

            <span className={['activity_tooltip_badge', allDone ? 'activity_tooltip_badge_full' : ''].filter(Boolean).join(' ')}>{badge}</span>

            <span className='activity_tooltip_arrow' />
        </div>
    );
}
