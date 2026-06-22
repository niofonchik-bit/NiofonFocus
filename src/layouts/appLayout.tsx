import type { PageTransitionRoute } from "@components/animatedOutlet/animatedOutlet";
import AnimatedOutlet from "@components/animatedOutlet/animatedOutlet";

/** маршруты перехода макета */
const transitionRoutes: PageTransitionRoute[] = [
    { path: '/', level: 0 },
    { path: '/settings', level: 1 },
    { path: '/profile', level: 2 },
];

/** макет приложения */
export default function AppLayout() {
    return (
        <div className="app_layout">
            <main className="app_main">
                <div className="app_scroll_container">
                    <AnimatedOutlet routes={transitionRoutes} />
                </div>
            </main>
        </div>
    );
}