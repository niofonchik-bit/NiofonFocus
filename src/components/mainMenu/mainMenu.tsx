import PathIcon from '@components/pathIcon/pathIcon';
import ThemeToggleButton from '@components/themeToggleButton/themeToggleButton';
import { mdiCheckAll, mdiCogOutline, mdiFire, mdiHomeOutline, mdiTimerOutline } from '@mdi/js';
import { useAuth } from '@providers/authProvider/authProvider';
import { useHabitStatistics } from '@providers/habitsProvider/habitsProvider';
import { useProfile } from '@providers/profileProvider/profileProvider';
import Logo from '@root/assets/logo.png';
import { NavLink } from 'react-router-dom';
import './mainMenu.css';
import { getDayWord } from '@utils/plural';

/** элементы главного меню */
const MAIN_MENU_ITEMS = [
    {
        path: '/',
        label: 'Дашборд',
        iconPath: mdiHomeOutline,
    },
    {
        path: '/habits',
        label: 'Привычки',
        iconPath: mdiCheckAll,
    },
    {
        path: '/timer',
        label: 'Таймер',
        iconPath: mdiTimerOutline,
    },
    {
        path: '/settings',
        label: 'Настройки',
        iconPath: mdiCogOutline,
    },
] as const;

/** главное меню приложения */
export default function MainMenu() {
    const { session } = useAuth();
    const profile = useProfile();

    const { totalCount, completedTodayCount, longestStreak } = useHabitStatistics();
    
    const userName = profile?.display_name?.trim() || session?.user.email?.split('@')[0] || 'Пользователь';

    const userInitials = userName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return (
        <aside className='main_menu'>
            <NavLink
                className='main_menu_brand'
                to='/'
                aria-label='Niofocus'
            >
                <span className='main_menu_logo'>
                    <img
                        src={Logo}
                        alt=''
                    />
                </span>

                <span className='main_menu_brand_name'>Niofocus</span>
            </NavLink>

            <nav className='main_menu_navigation'>
                {MAIN_MENU_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                            ['main_menu_navigation_item', isActive ? 'main_menu_navigation_item_active' : ''].filter(Boolean).join(' ')
                        }
                    >
                        <PathIcon
                            className='main_menu_navigation_icon'
                            path={item.iconPath}
                        />

                        <span className='main_menu_navigation_label'>{item.label}</span>

                        {item.path === '/habits' && totalCount > 0 && (
                            <span className='main_menu_navigation_badge'>
                                {completedTodayCount}/{totalCount}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className='main_menu_footer'>
                <div className='main_menu_streak'>
                    <span className='main_menu_streak_icon'>
                        <PathIcon path={mdiFire} />
                    </span>

                    <span className='main_menu_streak_content'>
                        <strong className='main_menu_streak_value'>
                            {longestStreak} {getDayWord(longestStreak)}
                        </strong>

                        <small className='main_menu_streak_label'>самая длинная цепочка</small>
                    </span>
                </div>

                <div className='main_menu_user_bar'>
                    <div className='main_menu_user'>
                        <span className='main_menu_user_avatar'>{userInitials}</span>

                        <span className='main_menu_user_info'>
                            <strong>{userName}</strong>

                            <small>{session?.user.email ?? ''}</small>
                        </span>
                    </div>

                    <ThemeToggleButton className='main_menu_theme_toggle' />
                </div>
            </div>
        </aside>
    );
}