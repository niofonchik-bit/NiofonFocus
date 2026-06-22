import { supabase } from '@root/lib/supabase';
import type { Tables, TablesUpdate } from '@app_types/database.types';

export type Profile = Tables<'profiles'>;

const COLUMNS = 'id, display_name, avatar_color, updated_at';

export async function getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').select(COLUMNS).eq('id', userId).single();

    if (error) throw error;

    return data;
}

export async function updateProfile(userId: string, changes: Pick<TablesUpdate<'profiles'>, 'display_name' | 'avatar_color'>): Promise<Profile> {
    const { data, error } = await supabase
        .from('profiles')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select(COLUMNS)
        .single();

    if (error) throw error;
    return data;
}
