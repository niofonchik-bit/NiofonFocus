import AppLayout from '@layouts/appLayout';
import { Box, CircularProgress } from '@mui/material';
import AuthPage from '@pages/authPage/authPage';
import HomePage from '@pages/homePage/homePage';
import { useAuth } from '@providers/authProvider/authProvider';
import {
    createBrowserRouter,
    Navigate,
    Outlet,
    useLocation,
} from 'react-router-dom';
import App from './App';

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

function ProtectedRoute() {
    const { ready, session } = useAuth();
    const location = useLocation();

    if (!ready) return <PageLoader />;

    if (!session) {
        return <Navigate to='/auth' replace state={{ from: location }} />;
    }

    return <Outlet />;
}

function PublicOnlyRoute() {
    const { ready, session } = useAuth();

    if (!ready) return <PageLoader />;

    if (session) {
        return <Navigate to='/' replace />;
    }

    return <Outlet />;
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                element: <PublicOnlyRoute />,
                children: [
                    {
                        path: 'auth',
                        element: <AuthPage />,
                    },
                ],
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: '/',
                        element: <AppLayout />,
                        children: [
                            {
                                index: true,
                                element: <HomePage />,
                            },
                            {
                                path: 'settings',
                                element: <div>Settings</div>,
                            },
                        ],
                    },
                ],
            },
            {
                path: '*',
                element: <Navigate to='/' replace />,
            },
        ],
    },
]);
