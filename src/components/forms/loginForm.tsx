import { useState, type FormEvent } from 'react';
import { Box, Stack, TextField, Button, Alert, Typography } from '@mui/material';
import { signIn, translateAuthError } from '../../api/auth';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            await signIn({ email, password });
        } catch (err) {
            setError(translateAuthError(err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box
            component='form'
            onSubmit={handleSubmit}
            sx={{ maxWidth: 360, mx: 'auto', mt: 8 }}
        >
            <Stack spacing={2}>
                <Typography variant='h5'>Вход</Typography>
                {error && <Alert severity='error'>{error}</Alert>}
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
                <Button
                    type='submit'
                    variant='contained'
                    disabled={loading}
                    fullWidth
                >
                    {loading ? 'Вход…' : 'Войти'}
                </Button>
            </Stack>
        </Box>
    );
}
