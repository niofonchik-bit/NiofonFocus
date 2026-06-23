import { signOut } from '@api/auth';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useAuth } from '@providers/authProvider/authProvider';
import { useProfile } from '@providers/profileProvider/profileProvider';

/** главная страница */
export default function DashboardPage() {
    const { session } = useAuth();
    const profile = useProfile();

    if (!session) return null;

    return (
        <Box>
            <Stack>
                <Typography variant='h5'>Дашборд</Typography>
                <Typography>Вы вошли как {session.user.email}</Typography>
                <Typography>Имя в профиле: {profile?.display_name ?? 'не указано'}</Typography>
                <Button
                    variant='contained'
                    onClick={() => void signOut()}
                >
                    Выйти
                </Button>
            </Stack>
        </Box>
    );
}
