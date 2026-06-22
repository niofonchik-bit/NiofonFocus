import '@project/index.css';
import MUIThemeProvider from '@providers/MUIThemeProvider/MUIThemeProvider';
import AnimatedThemeProvider from '@providers/animatedThemeProvider/animatedThemeProvider';
import { AuthProvider } from '@providers/authProvider/authProvider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './route';

// подключение дерева react
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AnimatedThemeProvider storageKey='niofon_focus_theme'>
            <MUIThemeProvider>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </MUIThemeProvider>
        </AnimatedThemeProvider>
    </StrictMode>,
);
