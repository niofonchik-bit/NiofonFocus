import type { PageTransitionHandle } from '@components/animatedOutlet/animatedOutlet';
import { Box, CircularProgress } from '@mui/material';
import AuthPage from '@pages/authPage/authPage';
import HomePage from '@pages/homePage/homePage';
import MainPage from '@pages/mainPage/mainPage';
import { useAuth } from '@providers/authProvider/authProvider';
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
                element: <MainPage />,
                children: [
                    {
                        index: true,
                        element: <HomePage />,
                        handle: {
                            pageTransition: {
                                level: 0,
                            },
                        } satisfies PageTransitionHandle,
                    },
                    {
                        path: 'settings',
                        element: <div>Settings</div>,
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
