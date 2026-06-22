import { supabase } from '@root/lib/supabase';
import type { Tables } from '@app_types/database.types';

/** сессия фокуса */
export type FocusSession = Tables<'focus_sessions'>;

/** поля сессии фокуса */
const COLUMNS = 'id, user_id, duration_minutes, completed_on, completed_at';

/** получение локальной даты */
function localDateKey(): string {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** получение сессий фокуса */
export async function getSessions(userId: string, fromDate?: string): Promise<FocusSession[]> {
    let query = supabase.from('focus_sessions').select(COLUMNS).eq('user_id', userId).order('completed_at', { ascending: false });

    if (fromDate) query = query.gte('completed_on', fromDate);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

/** создание сессии фокуса */
export async function addSession(userId: string, input: { durationMinutes: number; completedOn?: string }): Promise<FocusSession> {
    const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
            user_id: userId,
            duration_minutes: input.durationMinutes,
            completed_on: input.completedOn ?? localDateKey(),
        })
        .select(COLUMNS)
        .single();

    if (error) throw error;
    return data;
}
