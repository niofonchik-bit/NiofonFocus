import { supabase } from '@root/lib/supabase';
import type { Tables, TablesUpdate } from '@app_types/database.types';

/** настройки пользователя */
export type UserSettings = Tables<'user_settings'>;
/** изменения настроек */
export type SettingsChanges = Omit<TablesUpdate<'user_settings'>, 'user_id'>;

/** поля настроек */
const COLUMNS = 'user_id, theme, accent, focus_minutes, short_break_minutes, long_break_minutes, sound_enabled, notifications_enabled';

/** получение настроек пользователя */
export async function getSettings(userId: string): Promise<UserSettings> {
    const { data, error } = await supabase.from('user_settings').select(COLUMNS).eq('user_id', userId).single();

    if (error) throw error;
    return data;
}

/** обновление настроек пользователя */
export async function updateSettings(userId: string, changes: SettingsChanges): Promise<UserSettings> {
    const { data, error } = await supabase.from('user_settings').update(changes).eq('user_id', userId).select(COLUMNS).single();

    if (error) throw error;
    return data;
}
