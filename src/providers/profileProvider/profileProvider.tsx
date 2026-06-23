import { getProfile, type Profile } from '@api/profile';
import { useAuth } from '@providers/authProvider/authProvider';
import React from 'react';

const ProfileContext = React.createContext<Profile | null>(null);

export default function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { session } = useAuth();
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const userId = session?.user.id;

    React.useEffect(() => {
        let active = true;
        if (!userId) {
            setProfile(null);
            return;
        }
        void getProfile(userId)
            .then((p) => {
                if (active) setProfile(p);
            })
            .catch(() => {
                if (active) setProfile(null);
            });
        return () => {
            active = false;
        };
    }, [userId]);

    return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
    return React.useContext(ProfileContext);
}
