import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileChanges = Pick<Database['public']['Tables']['profiles']['Update'], 'display_name' | 'bio'>;

export async function getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').select('id, display_name, bio, updated_at').eq('id', userId).single();

    if (error) throw error;
    return data;
}

export async function updateProfile(userId: string, changes: ProfileChanges): Promise<Profile> {
    const { data, error } = await supabase
        .from('profiles')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, display_name, bio, updated_at')
        .single();

    if (error) throw error;
    return data;
}
