import PagePlaceholder from '@components/pagePlaceholder/pagePlaceholder';
import { mdiTimerOutline } from '@mdi/js';

/** страница таймера */
export default function TimerPage() {
    return (
        <PagePlaceholder
            iconPath={mdiTimerOutline}
            title='Таймер фокуса скоро появится'
            description='Здесь будет Pomodoro-таймер с рабочими интервалами, короткими и длинными перерывами и историей завершённых сессий.'
        />
    );
}
