import type { Habit } from '@api/habits';
import PathIcon from '@components/pathIcon/pathIcon';
import { getHabitIconPath } from '@constants/habitIcons';
import { mdiFire, mdiTrophyOutline } from '@mdi/js';
import { getTopStreaks } from '@utils/dashboard';
import { getDayWord } from '@utils/plural';
import React from 'react';
import './topStreaks.css';

interface TopStreaksProps {
    habits: Habit[];
}

/** топ цепочек привычек */
export default function TopStreaks({ habits }: TopStreaksProps) {
    const items = React.useMemo(() => getTopStreaks(habits, 5), [habits]);

    return (
        <section
            className='top_streaks dashboard_card'
            style={{ '--enter-index': 2 } as React.CSSProperties}
            aria-label='Топ цепочек'
        >
            <header className='top_streaks_header'>
                <h2 className='dashboard_card_title'>Топ цепочек</h2>

                <span className='top_streaks_trophy'>
                    <PathIcon path={mdiTrophyOutline} />
                </span>
            </header>

            <ul className='top_streaks_list'>
                {items.map((item, index) => (
                    <li
                        key={item.habit.id}
                        className='top_streaks_item'
                        style={{ '--enter-index': index, '--streak-color': item.habit.color } as React.CSSProperties}
                    >
                        <span className='top_streaks_icon'>
                            <PathIcon path={getHabitIconPath(item.habit.icon)} />
                        </span>

                        <span className='top_streaks_info'>
                            <strong className='top_streaks_title'>{item.habit.title}</strong>

                            <small className='top_streaks_record'>
                                рекорд {item.recordStreak} {getDayWord(item.recordStreak)}
                            </small>
                        </span>

                        <span className='top_streaks_value'>
                            <PathIcon path={mdiFire} />
                            {item.currentStreak}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
