import type { Session } from '@supabase/supabase-js';
import { supabase } from '@root/lib/supabase';

interface Credentials {
    email: string;
    password: string;
}

interface SignUpCredentials extends Credentials {
    displayName: string;
}

export async function signIn({ email, password }: Credentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    return data;
}

export async function signUp({ email, password, displayName }: SignUpCredentials) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: displayName,
            },
        },
    });

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
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });

    return () => data.subscription.unsubscribe();
}

export function translateAuthError(message: string): string {
    if (message.includes('Invalid login credentials')) {
        return 'Неверный e-mail или пароль';
    }

    if (message.includes('Email not confirmed')) {
        return 'E-mail не подтверждён';
    }

    if (message.includes('User already registered')) {
        return 'Данный e-mail занят';
    }

    if (message.includes('Password should be at least')) {
        return 'Пароль слишком короткий';
    }

    if (message.includes('valid email') || message.includes('Unable to validate email address')) {
        return 'Некорректный e-mail';
    }

    if (message.includes('Email rate limit exceeded')) {
        return 'Слишком много попыток. Повторите позже';
    }

    if (message.includes('Signup is disabled')) {
        return 'Регистрация временно отключена';
    }

    return message;
}
