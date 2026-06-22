import PathIcon from '@components/pathIcon/pathIcon';
import ThemeToggleButton from '@components/themeToggleButton/themeToggleButton';
import { mdiAccountOutline, mdiCheck, mdiEmailOutline, mdiEyeOffOutline, mdiEyeOutline, mdiLockOutline } from '@mdi/js';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { signIn, signUp, translateAuthError } from '@root/api/auth';
import { getPasswordStrength } from '@root/scripts/utilities';
import { useState, type SyntheticEvent } from 'react';
import './authPage.css';

type AuthMode = 'login' | 'register';

type AuthStatus = {
    type: 'error' | 'success';
    message: string;
} | null;

type AuthFormProps = {
    active: boolean;
    isLoading: boolean;
    onLoadingChange: (value: boolean) => void;
    onChangeMode: (mode: AuthMode) => void;
};

/** Форма входа */
function LoginForm({ active, isLoading, onLoadingChange, onChangeMode }: AuthFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<AuthStatus>(null);

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus(null);

        if (!email.trim() || !password) {
            setStatus({
                type: 'error',
                message: 'Заполните e-mail и пароль',
            });

            return;
        }

        onLoadingChange(true);

        try {
            await signIn({
                email: email.trim(),
                password,
            });

            setStatus({
                type: 'success',
                message: 'Вход выполнен',
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: translateAuthError(error instanceof Error ? error.message : 'Не удалось выполнить вход'),
            });
        } finally {
            onLoadingChange(false);
        }
    }

    return (
        <Box
            component='form'
            className={active ? 'auth_page_form auth_page_form_login auth_page_form_active' : 'auth_page_form auth_page_form_login'}
            onSubmit={handleSubmit}
            noValidate
        >
            <Stack className='auth_page_form_content'>
                <Box className='auth_page_brand'>
                    <Box className='auth_page_brand_mark'>
                        <PathIcon path={mdiCheck} />
                    </Box>

                    <Typography className='auth_page_brand_name'>Niofocus</Typography>
                </Box>

                <Box className='auth_page_heading'>
                    <Typography component='h1'>С возвращением</Typography>

                    <Typography>Войдите, чтобы продолжить работу над привычками и фокусом.</Typography>
                </Box>

                {status && (
                    <Alert
                        severity={status.type}
                        className='auth_page_alert'
                    >
                        {status.message}
                    </Alert>
                )}

                <Stack className='auth_page_fields'>
                    <Box>
                        <Typography
                            component='label'
                            htmlFor='login-email'
                            className='auth_page_field_label'
                        >
                            E-mail
                        </Typography>

                        <TextField
                            id='login-email'
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                            }}
                            type='email'
                            autoComplete='email'
                            placeholder='you@example.com'
                            fullWidth
                            disabled={isLoading}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <PathIcon path={mdiEmailOutline} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography
                            component='label'
                            htmlFor='login-password'
                            className='auth_page_field_label'
                        >
                            Пароль
                        </Typography>

                        <TextField
                            id='login-password'
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                            }}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete='current-password'
                            placeholder='••••••••'
                            fullWidth
                            disabled={isLoading}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <PathIcon path={mdiLockOutline} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton
                                                edge='end'
                                                onClick={() => {
                                                    setShowPassword((currentValue) => !currentValue);
                                                }}
                                                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                                                disabled={isLoading}
                                            >
                                                <PathIcon path={showPassword ? mdiEyeOffOutline : mdiEyeOutline} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>
                </Stack>

                <Button
                    type='submit'
                    variant='contained'
                    className='auth_page_submit_button'
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={20} /> : 'Войти'}
                </Button>

                <Typography className='auth_page_switch'>
                    Нет аккаунта?
                    <Button
                        variant='text'
                        onClick={() => {
                            onChangeMode('register');
                        }}
                        disabled={isLoading}
                    >
                        Зарегистрироваться
                    </Button>
                </Typography>
            </Stack>
        </Box>
    );
}

/** Форма регистрации */
function RegisterForm({ active, isLoading, onLoadingChange, onChangeMode }: AuthFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<AuthStatus>(null);

    const passwordStrength = getPasswordStrength(password);

    const passwordStrengthLabel = ['', 'Слабый пароль', 'Средний пароль', 'Надёжный пароль'][passwordStrength];

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus(null);

        if (!name.trim() || !email.trim() || !password) {
            setStatus({
                type: 'error',
                message: 'Заполните все поля',
            });

            return;
        }

        if (password.length < 8) {
            setStatus({
                type: 'error',
                message: 'Пароль должен содержать минимум 8 символов',
            });

            return;
        }

        if (!acceptTerms) {
            setStatus({
                type: 'error',
                message: 'Примите условия использования и политику конфиденциальности',
            });

            return;
        }

        onLoadingChange(true);

        try {
            const { session } = await signUp({
                displayName: name.trim(),
                email: email.trim(),
                password,
            });

            setStatus({
                type: 'success',
                message: session
                    ? 'Аккаунт создан. Добро пожаловать в Niofocus!'
                    : 'Аккаунт создан. Подтвердите e-mail по ссылке из письма, затем выполните вход.',
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: translateAuthError(error instanceof Error ? error.message : 'Не удалось создать аккаунт'),
            });
        } finally {
            onLoadingChange(false);
        }
    }

    return (
        <Box
            component='form'
            className={active ? 'auth_page_form auth_page_form_register auth_page_form_active' : 'auth_page_form auth_page_form_register'}
            onSubmit={handleSubmit}
            noValidate
        >
            <Stack className='auth_page_form_content'>
                <Box className='auth_page_brand'>
                    <Box className='auth_page_brand_mark'>
                        <PathIcon path={mdiCheck} />
                    </Box>

                    <Typography className='auth_page_brand_name'>Niofocus</Typography>
                </Box>

                <Box className='auth_page_heading'>
                    <Typography component='h1'>Создать аккаунт</Typography>

                    <Typography>Несколько секунд — и можно начинать формировать полезные привычки.</Typography>
                </Box>

                {status && (
                    <Alert
                        severity={status.type}
                        className='auth_page_alert'
                    >
                        {status.message}
                    </Alert>
                )}

                <Stack className='auth_page_fields'>
                    <Box>
                        <Typography
                            component='label'
                            htmlFor='register-name'
                            className='auth_page_field_label'
                        >
                            Имя
                        </Typography>

                        <TextField
                            id='register-name'
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                            }}
                            autoComplete='name'
                            placeholder='Как к вам обращаться?'
                            fullWidth
                            disabled={isLoading}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <PathIcon path={mdiAccountOutline} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography
                            component='label'
                            htmlFor='register-email'
                            className='auth_page_field_label'
                        >
                            E-mail
                        </Typography>

                        <TextField
                            id='register-email'
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                            }}
                            type='email'
                            autoComplete='email'
                            placeholder='you@example.com'
                            fullWidth
                            disabled={isLoading}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <PathIcon path={mdiEmailOutline} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography
                            component='label'
                            htmlFor='register-password'
                            className='auth_page_field_label'
                        >
                            Пароль
                        </Typography>

                        <TextField
                            id='register-password'
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                            }}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete='new-password'
                            placeholder='Минимум 8 символов'
                            fullWidth
                            disabled={isLoading}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <PathIcon path={mdiLockOutline} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton
                                                edge='end'
                                                onClick={() => {
                                                    setShowPassword((currentValue) => !currentValue);
                                                }}
                                                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                                                disabled={isLoading}
                                            >
                                                <PathIcon path={showPassword ? mdiEyeOffOutline : mdiEyeOutline} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Box
                            className='auth_page_password_meter'
                            aria-hidden='true'
                        >
                            {[1, 2, 3].map((item) => (
                                <Box
                                    key={item}
                                    component='span'
                                    className={
                                        passwordStrength >= item
                                            ? `auth_page_password_meter_part auth_page_password_meter_part_${passwordStrength}`
                                            : 'auth_page_password_meter_part'
                                    }
                                />
                            ))}
                        </Box>

                        {password && <Typography className='auth_page_password_hint'>{passwordStrengthLabel}</Typography>}
                    </Box>
                </Stack>

                <FormControlLabel
                    className='auth_page_terms'
                    control={
                        <Checkbox
                            checked={acceptTerms}
                            onChange={(event) => {
                                setAcceptTerms(event.target.checked);
                            }}
                            disabled={isLoading}
                        />
                    }
                    label='Принимаю условия использования и политику конфиденциальности'
                />

                <Button
                    type='submit'
                    variant='contained'
                    className='auth_page_submit_button'
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={20} /> : 'Создать аккаунт'}
                </Button>

                <Typography className='auth_page_switch'>
                    Уже есть аккаунт?
                    <Button
                        variant='text'
                        onClick={() => {
                            onChangeMode('login');
                        }}
                        disabled={isLoading}
                    >
                        Войти
                    </Button>
                </Typography>
            </Stack>
        </Box>
    );
}

/** Страница входа и регистрации */
export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [isLoading, setIsLoading] = useState(false);

    function changeMode(nextMode: AuthMode) {
        if (isLoading) {
            return;
        }

        setMode(nextMode);
    }

    return (
        <Box className='auth_page'>
            <Box className='auth_page_theme_toggle'>
                <ThemeToggleButton />
            </Box>

            <Box className={mode === 'register' ? 'auth_page_card auth_page_card_register' : 'auth_page_card'}>
                <Box className='auth_page_tabs'>
                    <Button
                        className={mode === 'login' ? 'auth_page_tab auth_page_tab_active' : 'auth_page_tab'}
                        onClick={() => changeMode('login')}
                        disabled={isLoading}
                    >
                        Вход
                    </Button>

                    <Button
                        className={mode === 'register' ? 'auth_page_tab auth_page_tab_active' : 'auth_page_tab'}
                        onClick={() => changeMode('register')}
                        disabled={isLoading}
                    >
                        Регистрация
                    </Button>
                </Box>

                <LoginForm
                    active={mode === 'login'}
                    isLoading={isLoading}
                    onLoadingChange={setIsLoading}
                    onChangeMode={changeMode}
                />

                <RegisterForm
                    active={mode === 'register'}
                    isLoading={isLoading}
                    onLoadingChange={setIsLoading}
                    onChangeMode={changeMode}
                />

                <Box className='auth_page_overlay_wrapper'>
                    <Box className='auth_page_overlay'>
                        <Box className='auth_page_overlay_panel auth_page_overlay_panel_left'>
                            <Box className='auth_page_overlay_mark'>
                                <PathIcon path={mdiCheck} />
                            </Box>

                            <Typography component='h2'>Уже с нами?</Typography>

                            <Typography>Войдите, чтобы продолжить свои цепочки и сохранить ежедневный прогресс.</Typography>

                            <Button
                                variant='outlined'
                                onClick={() => {
                                    changeMode('login');
                                }}
                                disabled={isLoading}
                            >
                                Войти
                            </Button>

                            <Box
                                className='auth_page_streak'
                                aria-hidden='true'
                            >
                                {[0, 1, 2, 3, 4].map((item) => (
                                    <Box
                                        key={item}
                                        className={item < 4 ? 'auth_page_streak_item auth_page_streak_item_active' : 'auth_page_streak_item'}
                                    >
                                        {item < 4 && <PathIcon path={mdiCheck} />}
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box className='auth_page_overlay_panel auth_page_overlay_panel_right'>
                            <Box className='auth_page_overlay_mark'>
                                <PathIcon path={mdiCheck} />
                            </Box>

                            <Typography component='h2'>Впервые здесь?</Typography>

                            <Typography>Создайте аккаунт и начните строить привычки, которые действительно остаются с вами.</Typography>

                            <Button
                                variant='outlined'
                                onClick={() => {
                                    changeMode('register');
                                }}
                                disabled={isLoading}
                            >
                                Регистрация
                            </Button>

                            <Box
                                className='auth_page_streak'
                                aria-hidden='true'
                            >
                                {[0, 1, 2, 3, 4].map((item) => (
                                    <Box
                                        key={item}
                                        className={item < 3 ? 'auth_page_streak_item auth_page_streak_item_active' : 'auth_page_streak_item'}
                                    >
                                        {item < 3 && <PathIcon path={mdiCheck} />}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
