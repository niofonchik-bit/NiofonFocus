import { useSettings } from '@providers/settingsProvider/settingsProvider';
import { ACCENTS, type AccentName } from '@constants/accentColor';

export default function SettingsPage() {
    const { accent, changeAccent } = useSettings();
    return (
        <section className='settings_page'>
            <h1>Настройки</h1>
            <div className='settings_accents'>
                {(Object.keys(ACCENTS) as AccentName[]).map((name) => (
                    <button
                        key={name}
                        aria-pressed={accent === name}
                        style={{ background: ACCENTS[name].color }}
                        onClick={() => void changeAccent(name).catch(() => {})}
                    >
                        {name}
                    </button>
                ))}
            </div>
        </section>
    );
}
