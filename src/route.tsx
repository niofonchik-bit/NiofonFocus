import type { PageTransitionHandle } from '@components/animatedOutlet/animatedOutlet';
import AppLoader from '@components/appLoader/appLoader';
import { useAuth } from '@providers/authProvider/authProvider';
import HabitsProvider from '@providers/habitsProvider/habitsProvider';
import ProfileProvider from '@providers/profileProvider/profileProvider';
import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
const AuthPage = lazy(() => import('@pages/authPage/authPage'));
const DashboardPage = lazy(() => import('@pages/dashboardPage/dashboardPage'));
const HabitPage = lazy(() => import('@pages/habitPage/habitPage'));
const MainPage = lazy(() => import('@pages/mainPage/mainPage'));
const SettingsPage = lazy(() => import('@pages/settingsPage/settingsPage'));
const TimerPage = lazy(() => import('@pages/timerPage/timerPage'));

/** загрузчик страницы */
function PageLoader() {
    return (
        <AppLoader
            variant='page'
            label='Загрузка приложения...'
        />
    );
}

/** защищённый маршрут */
function ProtectedRoute() {
    const { ready, session } = useAuth();
    const location = useLocation();

    if (!ready) {
        return <PageLoader />;
    }

    if (!session) {
        return (
            <Navigate
                to='/auth'
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}

/** публичный маршрут */
function PublicOnlyRoute() {
    const { ready, session } = useAuth();

    if (!ready) {
        return <PageLoader />;
    }

    if (session) {
        return (
            <Navigate
                to='/'
                replace
            />
        );
    }

    return <Outlet />;
}

/** маршруты приложения */
export const router = createBrowserRouter([
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                path: '/auth',
                element: <AuthPage />,
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: (
                    <ProfileProvider>
                        <HabitsProvider>
                            <MainPage />
                        </HabitsProvider>
                    </ProfileProvider>
                ),
                children: [
                    {
                        index: true,
                        element: <DashboardPage />,
                        handle: {
                            pageTransition: {
                                level: 0,
                            },
                        } satisfies PageTransitionHandle,
                    },
                    {
                        path: 'habits',
                        element: <HabitPage />,
                        handle: {
                            pageTransition: {
                                level: 1,
                            },
                        },
                    },
                    {
                        path: 'timer',
                        element: <TimerPage />,
                        handle: {
                            pageTransition: {
                                level: 1,
                            },
                        } satisfies PageTransitionHandle,
                    },
                    {
                        path: 'settings',
                        element: <SettingsPage />,
                        handle: {
                            pageTransition: {
                                level: 1,
                            },
                        } satisfies PageTransitionHandle,
                    },
                ],
            },
        ],
    },
    {
        path: '*',
        element: (
            <Navigate
                to='/'
                replace
            />
        ),
    },
]);
