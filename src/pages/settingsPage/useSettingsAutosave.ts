import type { SettingsChanges } from '@api/settings';
import React from 'react';

export type SettingsSaveStatus = 'idle' | 'waiting' | 'saving' | 'saved' | 'error';

/** фоновое сохранение настроек с debounce */
export default function useSettingsAutosave(changeSettings: (changes: SettingsChanges) => Promise<void>) {
    const [status, setStatus] = React.useState<SettingsSaveStatus>('idle');

    const [saveError, setSaveError] = React.useState<string | null>(null);

    /** изменения, еще не переданные в запрос */
    const pendingChangesRef = React.useRef<SettingsChanges>({});

    /** активный запрос сохранения */
    const activeSaveRef = React.useRef<Promise<boolean> | null>(null);

    /** актуальная функция провайдера */
    const changeSettingsRef = React.useRef(changeSettings);

    const saveTimeoutRef = React.useRef<number | null>(null);
    const statusTimeoutRef = React.useRef<number | null>(null);
    const mountedRef = React.useRef(true);

    const flushRef = React.useRef<(force?: boolean) => Promise<boolean>>(async () => true);

    const scheduleRef = React.useRef<() => void>(() => undefined);

    React.useEffect(() => {
        changeSettingsRef.current = changeSettings;
    }, [changeSettings]);

    /** запуск debounce перед сохранением */
    const scheduleSave = React.useCallback(() => {
        if (saveTimeoutRef.current !== null) {
            window.clearTimeout(saveTimeoutRef.current);
        }

        if (statusTimeoutRef.current !== null) {
            window.clearTimeout(statusTimeoutRef.current);
            statusTimeoutRef.current = null;
        }

        if (mountedRef.current) {
            setSaveError(null);
            setStatus('waiting');
        }

        // новые изменения будут сохранены после активного запроса
        if (activeSaveRef.current) {
            return;
        }

        saveTimeoutRef.current = window.setTimeout(() => {
            saveTimeoutRef.current = null;
            void flushRef.current();
        }, 500);
    }, []);

    scheduleRef.current = scheduleSave;

    /** отправка накопленных изменений */
    const flushPendingChanges = React.useCallback(async (force = false): Promise<boolean> => {
        if (saveTimeoutRef.current !== null) {
            window.clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        if (activeSaveRef.current) {
            if (!force) {
                return true;
            }

            const activeSaveSucceeded = await activeSaveRef.current;

            if (!activeSaveSucceeded) {
                return false;
            }

            if (Object.keys(pendingChangesRef.current).length === 0) {
                return true;
            }

            return flushRef.current(true);
        }

        if (Object.keys(pendingChangesRef.current).length === 0) {
            return true;
        }

        const changes = pendingChangesRef.current;

        pendingChangesRef.current = {};

        if (mountedRef.current) {
            setSaveError(null);
            setStatus('saving');
        }

        const request = (async () => {
            try {
                await changeSettingsRef.current(changes);

                if (mountedRef.current) {
                    setStatus('saved');

                    statusTimeoutRef.current = window.setTimeout(() => {
                        statusTimeoutRef.current = null;

                        if (mountedRef.current) {
                            setStatus('idle');
                        }
                    }, 1800);
                }

                return true;
            } catch (requestError: unknown) {
                // неудавшиеся изменения возвращаются в очередь
                pendingChangesRef.current = {
                    ...changes,
                    ...pendingChangesRef.current,
                };

                if (mountedRef.current) {
                    setSaveError(requestError instanceof Error ? requestError.message : 'Не удалось сохранить настройки');

                    setStatus('error');
                }

                return false;
            }
        })();

        activeSaveRef.current = request;

        const succeeded = await request;

        activeSaveRef.current = null;

        if (succeeded && Object.keys(pendingChangesRef.current).length > 0) {
            if (force || !mountedRef.current) {
                return flushRef.current(true);
            }

            scheduleRef.current();
        }

        return succeeded;
    }, []);

    flushRef.current = flushPendingChanges;

    /** добавление изменений в очередь */
    const queueChanges = React.useCallback((changes: SettingsChanges) => {
        pendingChangesRef.current = {
            ...pendingChangesRef.current,
            ...changes,
        };

        scheduleRef.current();
    }, []);

    /** повтор сохранения после ошибки */
    const retrySave = React.useCallback(() => {
        setSaveError(null);

        return flushRef.current(true);
    }, []);

    /** немедленное сохранение перед важным действием */
    const flushNow = React.useCallback(() => flushRef.current(true), []);

    React.useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;

            if (saveTimeoutRef.current !== null) {
                window.clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }

            if (statusTimeoutRef.current !== null) {
                window.clearTimeout(statusTimeoutRef.current);
                statusTimeoutRef.current = null;
            }

            // изменения не должны потеряться при переходе на другую страницу
            void flushRef.current(true);
        };
    }, []);

    return {
        status,
        saveError,
        queueChanges,
        retrySave,
        flushNow,
    };
}
