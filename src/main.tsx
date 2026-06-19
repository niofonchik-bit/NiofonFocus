import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@project/index.css';
import MUIThemeProvider from '@providers/MUIThemeProvider/MUIThemeProvider';
import AnimatedThemeProvider from '@providers/animatedThemeProvider/animatedThemeProvider';
import App from '@root/App';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AnimatedThemeProvider storageKey='niofon_focus_theme'>
            <MUIThemeProvider>
                <App />
            </MUIThemeProvider>
        </AnimatedThemeProvider>
    </StrictMode>,
);
