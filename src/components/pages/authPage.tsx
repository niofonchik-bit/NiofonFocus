import { useState } from 'react';
import { Box, Stack, Button } from '@mui/material';
import LoginForm from '../forms/loginForm';
import RegisterForm from '../forms/registerForm';

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');

    return (
        <Box sx={{ maxWidth: 360, mx: 'auto', mt: 8 }}>
            {mode === 'login' ? <LoginForm /> : <RegisterForm />}
            <Stack
                sx={{ mt: 2, alignItems: 'center' }}
            >
                <Button
                    variant='text'
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                >
                    {mode === 'login' ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}
                </Button>
            </Stack>
        </Box>
    );
}
