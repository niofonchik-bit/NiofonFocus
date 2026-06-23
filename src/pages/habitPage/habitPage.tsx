import PathIcon from '@components/pathIcon/pathIcon';
import { mdiCheckAll, mdiRefresh } from '@mdi/js';
import { Alert, Button, CircularProgress } from '@mui/material';
import { useHabitsCollection } from '@providers/habitsProvider/habitsProvider';
import HabitList from './components/habitList';
import './habitPage.css';
import HabitPageHeader from './components/habitPageHeader';
import React from 'react';
import { useLocation } from 'react-router-dom';

/** пустое состояние привычек */
function HabitEmptyState() {
    return (
        <div className='habit_page_empty'>
            <span className='habit_page_empty_icon'>
                <PathIcon path={mdiCheckAll} />
            </span>

            <h2>Пока ни одной привычки</h2>

            <p>Начните с малого — добавьте первую привычку и отмечайте её каждый день, не разрывая цепочку.</p>
        </div>
    );
}

/** страница привычек */
export default function HabitPage() {
    const { habits, loading, error, reload } = useHabitsCollection();

    const location = useLocation();

    // обновление данных при каждом открытии страницы
    React.useEffect(() => {
        if (location.pathname !== '/habits') return;

        reload();
    }, [location.key, location.pathname, reload]);

    return (
        <section className='habit_page'>
            <div className='habit_page_content'>
                <HabitPageHeader />

                <div className='habit_page_body'>
                    {loading && (
                        <div
                            className='habit_page_loading'
                            role='status'
                        >
                            <CircularProgress size={30} />

                            <span>Загрузка привычек...</span>
                        </div>
                    )}

                    {!loading && error && (
                        <Alert
                            className='habit_page_alert'
                            severity='error'
                            action={
                                <Button
                                    color='inherit'
                                    size='small'
                                    startIcon={<PathIcon path={mdiRefresh} />}
                                    onClick={reload}
                                >
                                    Повторить
                                </Button>
                            }
                        >
                            Не удалось загрузить привычки
                        </Alert>
                    )}

                    {!loading && !error && habits.length === 0 && <HabitEmptyState />}

                    {!loading && !error && habits.length > 0 && <HabitList habits={habits} />}
                </div>
            </div>
        </section>
    );
}
