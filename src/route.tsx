import type { PageTransitionHandle } from '@components/animatedOutlet/animatedOutlet';
import { Box, CircularProgress } from '@mui/material';
import AuthPage from '@pages/authPage/authPage';
import DashboardPage from '@pages/dashboardPage/dashboardPage';
import HabitPage from '@pages/habitPage/habitPage';
import MainPage from '@pages/mainPage/mainPage';
import SettingsPage from '@pages/settingsPage/settingsPage';
import { useAuth } from '@providers/authProvider/authProvider';
import HabitsProvider from '@providers/habitsProvider/habitsProvider';
import ProfileProvider from '@providers/profileProvider/profileProvider';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';

/** загрузчик страницы */
function PageLoader() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
            }}
        >
            <CircularProgress />
        </Box>
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
