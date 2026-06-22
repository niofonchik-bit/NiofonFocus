import { IconButton, SvgIcon, type IconButtonProps } from '@mui/material';
import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
import { useAnimatedTheme } from '../../providers/animatedThemeProvider/animatedThemeProvider';

export default function ThemeToggleButton({ onClick, ...props }: IconButtonProps) {
    const { theme, toggleTheme } = useAnimatedTheme();

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        onClick?.(event);

        if (event.defaultPrevented) {
            return;
        }

        toggleTheme(event);
    }

    return (
        <IconButton
            {...props}
            onClick={handleClick}
        >
            <SvgIcon>
                <path d={theme === 'light' ? mdiWeatherNight : mdiWhiteBalanceSunny} />
            </SvgIcon>
        </IconButton>
    );
}
