import { useState, type FormEvent } from 'react';
import {
    Box,
    Stack,
    TextField,
    Button,
    Alert,
    Typography,
} from '@mui/material';
import { signUp, translateAuthError } from '@api/auth';

/** форма регистрации */
export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /** отправка формы регистрации */
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setInfo(null);

        if (password !== passwordConfirm) {
            setError('Пароли не совпадают');
            return;
        }
        if (password.length < 6) {
            setError('Пароль должен быть не короче 6 символов');
            return;
        }

        setLoading(true);
        try {
            const data = await signUp({ email, password });
            // проверка необходимости подтверждения email
            if (!data.session) {
                setInfo(
                    'Аккаунт создан. Подтвердите email по ссылке из письма.',
                );
            }
        } catch (err) {
            setError(
                translateAuthError(
                    err instanceof Error ? err.message : String(err),
                ),
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box component='form' onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Stack spacing={2}>
                <Typography variant='h5'>Регистрация</Typography>
                {error && <Alert severity='error'>{error}</Alert>}
                {info && <Alert severity='success'>{info}</Alert>}
                <TextField
                    label='Email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label='Пароль'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label='Повторите пароль'
                    type='password'
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    fullWidth
                />
                <Button
                    type='submit'
                    variant='contained'
                    disabled={loading}
                    fullWidth
                >
                    {loading ? 'Создание…' : 'Зарегистрироваться'}
                </Button>
            </Stack>
        </Box>
    );
}
