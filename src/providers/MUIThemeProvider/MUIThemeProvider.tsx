import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { useAnimatedTheme } from '../animatedThemeProvider/animatedThemeProvider';
import MUITheme from './muiTheme.js';

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
                ...MUITheme,
                palette: {
                    mode: theme,
                    ...MUITheme.palette,
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
