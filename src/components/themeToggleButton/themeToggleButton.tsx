import { IconButton, SvgIcon, type IconButtonProps } from '@mui/material';
import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
import { useSettings } from '@providers/settingsProvider/settingsProvider';

/** кнопка переключения темы */
export default function ThemeToggleButton({ onClick, disabled, ...props }: IconButtonProps) {
    const { theme, ready, toggleTheme } = useSettings();

    /** обработка нажатия на кнопку темы */
    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        onClick?.(event);

        if (event.defaultPrevented) {
            return;
        }

        void toggleTheme(event.currentTarget).catch(() => {
            // ошибка сохранения хранится в SettingsProvider
        });
    }

    return (
        <IconButton
            {...props}
            disabled={disabled || !ready}
            aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
            onClick={handleClick}
        >
            <SvgIcon>
                <path d={theme === 'light' ? mdiWeatherNight : mdiWhiteBalanceSunny} />
            </SvgIcon>
        </IconButton>
    );
}
