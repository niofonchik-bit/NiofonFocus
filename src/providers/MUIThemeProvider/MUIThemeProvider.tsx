import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { useAnimatedTheme } from '../animatedThemeProvider/animatedThemeProvider';

/** провайдер темы MUI */
export default function MUIThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme } = useAnimatedTheme();

    const muiTheme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: theme,
                },
            }),
        [theme],
    );

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />

            {children}
        </ThemeProvider>
    );
}
