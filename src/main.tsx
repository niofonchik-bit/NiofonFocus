import '@project/index.css';
import MUIThemeProvider from '@providers/MUIThemeProvider/MUIThemeProvider';
import AnimatedThemeProvider from '@providers/animatedThemeProvider/animatedThemeProvider';
import { AuthProvider } from '@providers/authProvider/authProvider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './route';
import SettingsProvider from '@providers/settingsProvider/settingsProvider';

// подключение дерева react
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AnimatedThemeProvider storageKey='niofon_focus_theme'>
            <AuthProvider>
                <SettingsProvider accentStorageKey='niofon_focus_accent'>
                    <MUIThemeProvider>
                        <RouterProvider router={router} />
                    </MUIThemeProvider>
                </SettingsProvider>
            </AuthProvider>
        </AnimatedThemeProvider>
    </StrictMode>,
);
