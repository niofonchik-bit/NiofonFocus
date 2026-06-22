/** стили автозаполнения */
const autofillStyles = {
    '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active, &:autofill': {
        WebkitBoxShadow:
            '0 0 0 1000px var(--input-background, var(--surface-secondary)) inset',
        WebkitTextFillColor: 'var(--text-primary)',
        caretColor: 'var(--text-primary)',
        borderRadius: 'inherit',
    },
};

/** тема компонентов mui */
export default {
    components: {
        MuiInputBase: {
            styleOverrides: {
                input: autofillStyles,
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '--input-background': 'var(--surface-secondary)',

                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--input-background)',

                    transition:
                        'background-color 0.18s ease, box-shadow 0.18s ease',

                    '&.Mui-focused': {
                        '--input-background': 'var(--surface-primary)',
                    },
                },

                input: autofillStyles,
            },
        },

        MuiFilledInput: {
            styleOverrides: {
                root: {
                    '--input-background': 'var(--surface-secondary)',
                    backgroundColor: 'var(--input-background)',

                    '&.Mui-focused': {
                        '--input-background': 'var(--surface-primary)',
                    },
                },

                input: autofillStyles,
            },
        },

        MuiInput: {
            styleOverrides: {
                input: autofillStyles,
            },
        },
    },
};