import { getSession, onAuthChange } from '@api/auth';
import type { Session } from '@supabase/supabase-js';
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

/** значение контекста авторизации */
type AuthContextValue = {
    session: Session | null;
    ready: boolean;
};

/** контекст авторизации */
const AuthContext = createContext<AuthContextValue | null>(null);

/** провайдер авторизации */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let mounted = true;

        getSession().then((currentSession) => {
            if (!mounted) return;

            setSession(currentSession);
            setReady(true);
        });

        const unsubscribe = onAuthChange((nextSession) => {
            if (!mounted) return;

            setSession(nextSession);
            setReady(true);
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    const value = useMemo(
        () => ({
            session,
            ready,
        }),
        [session, ready],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/** доступ к авторизации */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}
