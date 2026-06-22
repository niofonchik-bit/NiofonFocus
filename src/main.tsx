import '@project/index.css';
import AnimatedThemeProvider from '@providers/animatedThemeProvider/animatedThemeProvider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './route';
import MUIThemeProvider from '@providers/MUIThemeProvider/MUIThemeProvider';

// подключение дерева react
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AnimatedThemeProvider storageKey='niofon_focus_theme'>
            <MUIThemeProvider>
                <RouterProvider router={router} />
            </MUIThemeProvider>
        </AnimatedThemeProvider>
    </StrictMode>,
);
