import { getProfile } from '@api/profile';
import { signOut } from '@api/auth';
import ThemeToggleButton from '@components/themeToggleButton/themeToggleButton';
import { useAuth } from '@providers/authProvider/authProvider';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

/** главная страница */
export default function HomePage() {
    const { session } = useAuth();
    const [displayName, setDisplayName] = useState<string | null>(null);

    // загрузка имени профиля
    useEffect(() => {
        if (!session) {
            setDisplayName(null);
            return;
        }

        getProfile(session.user.id)
            .then((profile) => setDisplayName(profile.display_name))
            .catch(() => setDisplayName(null));
    }, [session]);

    if (!session) return null;

    return (
        <Box sx={{ p: 3 }}>
            <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
                <ThemeToggleButton />
                <Typography variant='h5'>Главная</Typography>
                <Typography>Вы вошли как {session.user.email}</Typography>
                <Typography>
                    Имя в профиле: {displayName ?? 'не указано'}
                </Typography>
                <Button variant='contained' onClick={() => void signOut()}>
                    Выйти
                </Button>
            </Stack>
        </Box>
    );
}
