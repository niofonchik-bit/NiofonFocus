import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { useSettings } from '@providers/settingsProvider/settingsProvider';
import MUITheme from './muiTheme.js';

/** провайдер темы mui */
export default function MUIThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme, accentColor } = useSettings();

    const muiTheme = React.useMemo(
        () =>
            createTheme({
                ...MUITheme,
                palette: {
                    ...MUITheme.palette,
                    mode: theme,
                    primary: {
                        ...MUITheme.palette?.primary,
                        main: accentColor,
                    },
                },
            }),
        [theme, accentColor],
    );

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />

            {children}
        </ThemeProvider>
    );
}
