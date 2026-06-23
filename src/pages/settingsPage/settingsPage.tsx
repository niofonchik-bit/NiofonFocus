import { signOut } from '@api/auth';
import type { SettingsChanges, UserSettings } from '@api/settings';
import AppDialog from '@components/appDialog/appDialog';
import AppLoader, { InlineLoader } from '@components/appLoader/appLoader';
import PathIcon from '@components/pathIcon/pathIcon';
import { ACCENTS, type AccentName } from '@constants/accentColor';
import { mdiCheck, mdiLogoutVariant, mdiMinus, mdiPlus } from '@mdi/js';
import { Alert, Button } from '@mui/material';
import { useAuth } from '@providers/authProvider/authProvider';
import { useSettings } from '@providers/settingsProvider/settingsProvider';
import React from 'react';
import useSettingsAutosave from './useSettingsAutosave';
import './settingsPage.css';

interface SettingsStepperProps {
    label: string;
    description: string;
    value: number;
    min: number;
    max: number;
    disabled?: boolean;
    onChange: (value: number) => void;
}

interface SettingsSwitchProps {
    checked: boolean;
    label: string;
    disabled?: boolean;
    onChange: () => void;
}

/** русские названия акцентных цветов */
const ACCENT_NAMES: Record<AccentName, string> = {
    violet: 'Фиолетовый',
    green: 'Зелёный',
    blue: 'Синий',
    teal: 'Бирюзовый',
    amber: 'Янтарный',
    rose: 'Розовый',
};

/** числовое поле настройки с шагом */
function SettingsStepper({ label, description, value, min, max, disabled = false, onChange }: SettingsStepperProps) {
    return (
        <div className='settings_page_row'>
            <div className='settings_page_label'>
                <span>{label}</span>

                <small>{description}</small>
            </div>

            <div
                className='settings_page_stepper'
                aria-label={label}
            >
                <button
                    type='button'
                    aria-label={`Уменьшить: ${label}`}
                    disabled={disabled || value <= min}
                    onClick={() => onChange(Math.max(min, value - 1))}
                >
                    <PathIcon path={mdiMinus} />
                </button>

                <span className='settings_page_stepper_value'>
                    {value}
                    <small> мин</small>
                </span>

                <button
                    type='button'
                    aria-label={`Увеличить: ${label}`}
                    disabled={disabled || value >= max}
                    onClick={() => onChange(Math.min(max, value + 1))}
                >
                    <PathIcon path={mdiPlus} />
                </button>
            </div>
        </div>
    );
}

/** переключатель настройки */
function SettingsSwitch({ checked, label, disabled = false, onChange }: SettingsSwitchProps) {
    return (
        <button
            type='button'
            role='switch'
            className={['settings_page_switch', checked ? 'settings_page_switch_on' : ''].filter(Boolean).join(' ')}
            aria-label={label}
            aria-checked={checked}
            disabled={disabled}
            onClick={onChange}
        >
            <span />
        </button>
    );
}

/** страница настроек */
export default function SettingsPage() {
    const { session } = useAuth();

    const { settings, ready, error, accent, previewAccent, changeSettings } = useSettings();

    const [draftSettings, setDraftSettings] = React.useState<UserSettings | null>(settings);

    const [requestingNotifications, setRequestingNotifications] = React.useState(false);

    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

    const [signingOut, setSigningOut] = React.useState(false);

    const [actionError, setActionError] = React.useState<string | null>(null);

    const [logoutError, setLogoutError] = React.useState<string | null>(null);

    const logoutTitleId = React.useId();
    const logoutDescriptionId = React.useId();

    const { status: saveStatus, saveError, queueChanges, retrySave, flushNow } = useSettingsAutosave(changeSettings);

    React.useEffect(() => {
        if (settings && (!draftSettings || draftSettings.user_id !== settings.user_id)) {
            setDraftSettings(settings);
        }
    }, [settings, draftSettings]);

    /** изменение локального значения с постановкой в очередь */
    function updateSetting(changes: SettingsChanges) {
        if (!settings) {
            return;
        }

        setActionError(null);

        setDraftSettings((currentSettings) => ({
            ...(currentSettings ?? settings),
            ...changes,
        }));

        queueChanges(changes);
    }

    /** изменение акцентного цвета */
    function handleAccentChange(nextAccent: AccentName) {
        if (nextAccent === accent) {
            return;
        }

        // цвет применяется сразу, запрос отправляется через debounce
        previewAccent(nextAccent);

        updateSetting({
            accent: nextAccent,
        });
    }

    /** изменение разрешения браузерных уведомлений */
    async function handleNotificationsChange() {
        const currentSettings = draftSettings ?? settings;

        if (!currentSettings || requestingNotifications) {
            return;
        }

        const nextValue = !currentSettings.notifications_enabled;

        setActionError(null);

        try {
            if (nextValue) {
                if (!('Notification' in window)) {
                    throw new Error('Этот браузер не поддерживает системные уведомления');
                }

                setRequestingNotifications(true);

                const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;

                if (permission !== 'granted') {
                    throw new Error('Разрешите уведомления в настройках браузера');
                }
            }

            updateSetting({
                notifications_enabled: nextValue,
            });
        } catch (requestError: unknown) {
            setActionError(requestError instanceof Error ? requestError.message : 'Не удалось изменить настройку уведомлений');
        } finally {
            setRequestingNotifications(false);
        }
    }

    /** открытие подтверждения выхода */
    function openLogoutDialog() {
        setLogoutError(null);
        setLogoutDialogOpen(true);
    }

    /** закрытие подтверждения выхода */
    function closeLogoutDialog() {
        if (signingOut) {
            return;
        }

        setLogoutDialogOpen(false);
        setLogoutError(null);
    }

    /** выход из аккаунта */
    async function handleSignOut() {
        if (signingOut) {
            return;
        }

        setSigningOut(true);
        setLogoutError(null);

        try {
            const settingsSaved = await flushNow();

            if (!settingsSaved) {
                throw new Error('Не удалось сохранить последние изменения перед выходом');
            }

            await signOut();
        } catch (requestError: unknown) {
            setLogoutError(requestError instanceof Error ? requestError.message : 'Не удалось выйти из аккаунта');

            setSigningOut(false);
        }
    }

    if (!ready) {
        return (
            <section className='settings_page'>
                <div className='settings_page_state'>
                    <AppLoader
                        variant='section'
                        label='Загрузка настроек...'
                    />
                </div>
            </section>
        );
    }

    if (!settings) {
        return (
            <section className='settings_page'>
                <div className='settings_page_state'>
                    <Alert
                        severity='error'
                        className='settings_page_alert'
                    >
                        {error?.message ?? 'Не удалось загрузить настройки'}
                    </Alert>
                </div>
            </section>
        );
    }

    const currentSettings = draftSettings ?? settings;

    return (
        <section className='settings_page'>
            <div className='settings_page_content'>
                <header className='settings_page_header'>
                    <p className='settings_page_eyebrow'>Конфигурация</p>

                    <h1 className='settings_page_title'>Настройки</h1>
                </header>

                <div className='settings_page_body'>
                    {(error || actionError || saveError) && (
                        <Alert
                            severity='error'
                            className='settings_page_alert'
                            action={
                                saveError ? (
                                    <Button
                                        color='inherit'
                                        size='small'
                                        onClick={() => void retrySave()}
                                    >
                                        Повторить
                                    </Button>
                                ) : undefined
                            }
                        >
                            {saveError ?? actionError ?? error?.message}
                        </Alert>
                    )}

                    <div className='settings_page_cards'>
                        <section className='settings_page_card'>
                            <h2>Внешний вид</h2>

                            <p className='settings_page_description'>Акцентный цвет интерфейса. Тема переключается в боковом меню.</p>

                            <div className='settings_page_row'>
                                <div className='settings_page_label'>
                                    <span>Акцент</span>

                                    <small>{ACCENT_NAMES[accent]}</small>
                                </div>

                                <div
                                    className='settings_page_accents'
                                    aria-label='Акцентный цвет'
                                >
                                    {(Object.keys(ACCENTS) as AccentName[]).map((name) => (
                                        <button
                                            key={name}
                                            type='button'
                                            className={['settings_page_accent', accent === name ? 'settings_page_accent_selected' : '']
                                                .filter(Boolean)
                                                .join(' ')}
                                            style={{
                                                background: ACCENTS[name].color,
                                                color: ACCENTS[name].color,
                                            }}
                                            aria-label={ACCENT_NAMES[name]}
                                            aria-pressed={accent === name}
                                            title={ACCENT_NAMES[name]}
                                            disabled={signingOut}
                                            onClick={() => handleAccentChange(name)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className='settings_page_card'>
                            <h2>Pomodoro</h2>

                            <p className='settings_page_description'>Длительность интервалов таймера фокуса.</p>

                            <SettingsStepper
                                label='Фокус-сессия'
                                description='Основной рабочий интервал'
                                value={currentSettings.focus_minutes}
                                min={5}
                                max={90}
                                disabled={signingOut}
                                onChange={(value) =>
                                    updateSetting({
                                        focus_minutes: value,
                                    })
                                }
                            />

                            <SettingsStepper
                                label='Короткий перерыв'
                                description='Отдых между рабочими интервалами'
                                value={currentSettings.short_break_minutes}
                                min={1}
                                max={30}
                                disabled={signingOut}
                                onChange={(value) =>
                                    updateSetting({
                                        short_break_minutes: value,
                                    })
                                }
                            />

                            <SettingsStepper
                                label='Длинный перерыв'
                                description='Отдых после нескольких сессий'
                                value={currentSettings.long_break_minutes}
                                min={5}
                                max={60}
                                disabled={signingOut}
                                onChange={(value) =>
                                    updateSetting({
                                        long_break_minutes: value,
                                    })
                                }
                            />

                            <div className='settings_page_row'>
                                <div className='settings_page_label'>
                                    <span>Звук по завершении</span>

                                    <small>Мягкий сигнал в конце сессии</small>
                                </div>

                                <SettingsSwitch
                                    checked={currentSettings.sound_enabled}
                                    label='Звук по завершении'
                                    disabled={signingOut}
                                    onChange={() =>
                                        updateSetting({
                                            sound_enabled: !currentSettings.sound_enabled,
                                        })
                                    }
                                />
                            </div>

                            <div className='settings_page_row'>
                                <div className='settings_page_label'>
                                    <span>Уведомления</span>

                                    <small>Системное уведомление браузера</small>
                                </div>

                                <SettingsSwitch
                                    checked={currentSettings.notifications_enabled}
                                    label='Системные уведомления'
                                    disabled={signingOut || requestingNotifications}
                                    onChange={() => void handleNotificationsChange()}
                                />
                            </div>
                        </section>

                        <section className='settings_page_card'>
                            <h2>Аккаунт</h2>

                            <p className='settings_page_description'>Управление текущей сессией пользователя.</p>

                            <div className='settings_page_row'>
                                <div className='settings_page_label'>
                                    <span>Выйти из аккаунта</span>

                                    <small>{session?.user.email ?? 'Текущий пользователь'}</small>
                                </div>

                                <Button
                                    type='button'
                                    variant='outlined'
                                    className='settings_page_logout_button'
                                    startIcon={<PathIcon path={mdiLogoutVariant} />}
                                    onClick={openLogoutDialog}
                                >
                                    Выйти
                                </Button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <div
                className='settings_page_save_status'
                data-visible={saveStatus !== 'idle' && saveStatus !== 'error'}
                data-status={saveStatus}
                role='status'
                aria-live='polite'
                aria-atomic='true'
            >
                <span
                    key={`save_icon_${saveStatus}`}
                    className='settings_page_save_status_icon'
                    aria-hidden='true'
                >
                    {saveStatus === 'waiting' && <span className='settings_page_save_status_pulse' />}

                    {saveStatus === 'saving' && <InlineLoader />}

                    {saveStatus === 'saved' && <PathIcon path={mdiCheck} />}
                </span>

                <span
                    key={`save_text_${saveStatus}`}
                    className='settings_page_save_status_text'
                >
                    {saveStatus === 'waiting' && 'Изменения ожидают сохранения'}

                    {saveStatus === 'saving' && 'Сохранение настроек...'}

                    {saveStatus === 'saved' && 'Настройки сохранены'}
                </span>
            </div>

            <AppDialog
                open={logoutDialogOpen}
                busy={signingOut}
                role='alertdialog'
                className='settings_logout_dialog'
                aria-labelledby={logoutTitleId}
                aria-describedby={logoutDescriptionId}
                onClose={closeLogoutDialog}
            >
                <AppDialog.Header>
                    <div className='settings_logout_dialog_title_row'>
                        <span className='settings_logout_dialog_icon'>
                            <PathIcon path={mdiLogoutVariant} />
                        </span>

                        <h2
                            id={logoutTitleId}
                            className='settings_logout_dialog_title'
                        >
                            Выйти из аккаунта?
                        </h2>
                    </div>
                </AppDialog.Header>

                <AppDialog.Content>
                    <p
                        id={logoutDescriptionId}
                        className='settings_logout_dialog_description'
                    >
                        Текущая сессия будет завершена. Для продолжения работы потребуется снова войти в аккаунт.
                    </p>

                    {logoutError && (
                        <p
                            className='settings_logout_dialog_error'
                            role='alert'
                        >
                            {logoutError}
                        </p>
                    )}
                </AppDialog.Content>

                <AppDialog.Actions>
                    <Button
                        type='button'
                        variant='outlined'
                        className='app_dialog_button app_dialog_button_ghost'
                        disabled={signingOut}
                        onClick={closeLogoutDialog}
                    >
                        Отмена
                    </Button>

                    <Button
                        type='button'
                        variant='contained'
                        className='app_dialog_button app_dialog_button_danger'
                        disabled={signingOut}
                        startIcon={signingOut ? <InlineLoader /> : <PathIcon path={mdiLogoutVariant} />}
                        onClick={() => void handleSignOut()}
                    >
                        Выйти
                    </Button>
                </AppDialog.Actions>
            </AppDialog>
        </section>
    );
}
