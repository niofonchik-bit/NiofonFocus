import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSession, onAuthChange, signOut } from './api/auth';
import { getProfile } from './api/profile';
import AuthPage from './components/pages/authPage';

export default function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [ready, setReady] = useState(false);
    const [displayName, setDisplayName] = useState<string | null>(null);

    useEffect(() => {
        getSession().then((s) => {
            setSession(s);
            setReady(true);
        });
        return onAuthChange(setSession);
    }, []);

    useEffect(() => {
        if (!session) {
            setDisplayName(null);
            return;
        }
        getProfile(session.user.id)
            .then((profile) => setDisplayName(profile.display_name))
            .catch(() => setDisplayName(null));
    }, [session]);

    if (!ready) return null;
    if (!session) return <AuthPage />;

    return (
        <main className='page'>
            <p>Вы вошли как {session.user.email}</p>
            <p>Имя в профиле: {displayName ?? '—'}</p>
            <button onClick={signOut}>Выйти</button>
        </main>
    );
}
