import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type NewUser = Pick<Database['public']['Tables']['users']['Insert'], 'name' | 'email'>;

export async function getUsersList(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('id, name, email, created_at').order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createUser(input: NewUser): Promise<User> {
    const { data, error } = await supabase.from('users').insert(input).select('id, name, email, created_at').single();

    if (error) throw error;
    return data;
}
