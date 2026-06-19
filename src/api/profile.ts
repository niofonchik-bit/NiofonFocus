import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export async function getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').select('id, display_name').eq('id', userId).single();

    if (error) throw error;
    return data;
}