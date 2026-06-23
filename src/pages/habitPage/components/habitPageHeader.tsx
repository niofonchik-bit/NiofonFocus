import PathIcon from '@components/pathIcon/pathIcon';
import { mdiPlus } from '@mdi/js';
import { Button } from '@mui/material';
import { useHabitStatistics } from '@providers/habitsProvider/habitsProvider';

interface HabitPageHeaderProps {
    onCreate?: () => void;
}

/** формат даты заголовка */
const CURRENT_DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
});

/** заголовок страницы привычек */
export default function HabitPageHeader({ onCreate }: HabitPageHeaderProps) {
    const { totalCount, completedTodayCount } = useHabitStatistics();

    return (
        <header className='habit_page_header'>
            <div>
                <p className='habit_page_date'>Сегодня · {CURRENT_DATE_FORMATTER.format(new Date())}</p>

                <h1 className='habit_page_title'>Привычки</h1>

                {totalCount > 0 && (
                    <p className='habit_page_subtitle'>
                        Выполнено {completedTodayCount} из {totalCount} на сегодня
                    </p>
                )}
            </div>

            <Button
                className='habit_page_create_button'
                variant='contained'
                disableElevation
                startIcon={<PathIcon path={mdiPlus} />}
                onClick={onCreate}
            >
                Новая привычка
            </Button>
        </header>
    );
}
