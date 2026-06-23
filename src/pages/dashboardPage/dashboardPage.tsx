import PagePlaceholder from '@components/pagePlaceholder/pagePlaceholder';
import { mdiViewDashboardOutline } from '@mdi/js';

/** главная страница */
export default function DashboardPage() {
    return (
        <PagePlaceholder
            iconPath={mdiViewDashboardOutline}
            title='Дашборд скоро появится'
            description='Здесь соберутся прогресс по привычкам, серии выполнений, статистика фокус-сессий и ключевые результаты за день.'
        />
    );
}
