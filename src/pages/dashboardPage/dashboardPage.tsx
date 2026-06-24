import AppLoader from '@components/appLoader/appLoader';
import PathIcon from '@components/pathIcon/pathIcon';
import { mdiArrowRight, mdiRefresh, mdiSproutOutline } from '@mdi/js';
import { Alert, Button } from '@mui/material';
import { useHabitsCollection } from '@providers/habitsProvider/habitsProvider';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ActivityMap from './components/activityMap/activityMap';
import DashboardHeader from './components/dashboardHeader/dashboardHeader';
import StatCards from './components/statCards/statCards';
import TopStreaks from './components/topStreaks/topStreaks';
import WeeklyChart from './components/weeklyChart/weeklyChart';
import './dashboardPage.css';

/** главная страница — дашборд */
export default function DashboardPage() {
    const { habits, loading, error, reload } = useHabitsCollection();
    const location = useLocation();

    // обновление данных при каждом открытии дашборда
    React.useEffect(() => {
        if (location.pathname !== '/') {
            return;
        }

        reload();
    }, [location.key, location.pathname, reload]);

    let body: React.ReactNode;

    if (loading && habits.length === 0) {
        body = (
            <AppLoader
                variant='section'
                label='Собираем статистику...'
            />
        );
    } else if (error && habits.length === 0) {
        body = (
            <Alert
                className='dashboard_page_alert'
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
                Не удалось загрузить данные дашборда
            </Alert>
        );
    } else if (habits.length === 0) {
        body = (
            <div className='dashboard_page_empty'>
                <span className='dashboard_page_empty_icon'>
                    <PathIcon path={mdiSproutOutline} />
                </span>

                <h2>Пока нет данных</h2>

                <p>Создайте первую привычку — и дашборд оживёт: появятся карта активности, серии и график недели.</p>

                <Button
                    className='dashboard_page_empty_button'
                    component={Link}
                    to='/habits'
                    endIcon={<PathIcon path={mdiArrowRight} />}
                >
                    Перейти к привычкам
                </Button>
            </div>
        );
    } else {
        body = (
            <div className='dashboard_page_content'>
                <StatCards habits={habits} />

                <div className='dashboard_page_grid'>
                    <ActivityMap habits={habits} />

                    <TopStreaks habits={habits} />
                </div>

                <WeeklyChart habits={habits} />
            </div>
        );
    }

    return (
        <section className='dashboard_page'>
            <div className='dashboard_page_inner'>
                <DashboardHeader />

                {body}
            </div>
        </section>
    );
}
