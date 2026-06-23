import './appLoader.css';

type AppLoaderVariant = 'page' | 'section';

interface AppLoaderProps {
    variant?: AppLoaderVariant;
    label?: string;
    className?: string;
}

interface InlineLoaderProps {
    className?: string;
}

/** крупный индикатор загрузки приложения */
export default function AppLoader({ variant = 'section', label = 'Загрузка...', className }: AppLoaderProps) {
    return (
        <div
            className={['app_loader', `app_loader_${variant}`, className].filter(Boolean).join(' ')}
            role='status'
            aria-live='polite'
        >
            <span
                className='app_loader_visual'
                aria-hidden='true'
            >
                <span className='app_loader_orbit app_loader_orbit_outer' />

                <span className='app_loader_orbit app_loader_orbit_inner' />

                <span className='app_loader_core' />
            </span>

            <span className='app_loader_label'>{label}</span>
        </div>
    );
}

/** компактный индикатор загрузки действия */
export function InlineLoader({ className }: InlineLoaderProps) {
    return (
        <span
            className={['inline_loader', className].filter(Boolean).join(' ')}
            aria-hidden='true'
        />
    );
}