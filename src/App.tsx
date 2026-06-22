import AnimatedOutlet from '@components/animatedOutlet/animatedOutlet';
import { AuthProvider } from '@providers/authProvider/authProvider';
import type { PageTransitionRoute } from '@components/animatedOutlet/animatedOutlet';

/** маршруты перехода приложения */
const transitionRoutes: PageTransitionRoute[] = [
    { path: '/auth', level: 0, preset: 'fade' },
    { path: '/', level: 1 },
    { path: '/settings', level: 2 },
    { path: '/profile', level: 3 },
];

/** корневой компонент приложения */
export default function App() {
    return (
        <AuthProvider>
            <AnimatedOutlet routes={transitionRoutes} />
        </AuthProvider>
    );
}
