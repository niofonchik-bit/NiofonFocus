import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Credentials {
    email: string;
    password: string;
}

export async function signIn({ email, password }: Credentials) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signUp({ email, password }: Credentials) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
}

export function onAuthChange(callback: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
}

export function translateAuthError(message: string): string {
    if (message.includes('Invalid login credentials')) return 'Неверный email или пароль';
    if (message.includes('Email not confirmed')) return 'Email не подтверждён';
    if (message.includes('User already registered')) return 'Пользователь с таким email уже существует';
    if (message.includes('Password should be at least')) return 'Пароль слишком короткий';
    if (message.includes('valid email')) return 'Некорректный email';
    return message;
}