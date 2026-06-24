import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    envDir: '../niofocus-env',
    base: '/',
    server: {
        host: '127.0.0.1',
        port: 5174,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rolldownOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react-vendor';
                        if (/[\\/](@mui|@emotion)[\\/]/.test(id)) return 'mui-vendor';
                        if (/[\\/]@supabase[\\/]/.test(id)) return 'supabase-vendor';
                        return 'vendor';
                    }
                },
            },
        },
    },
    resolve: {
        alias: {
            '@api': path.resolve(__dirname, './src/api'),
            '@providers': path.resolve(__dirname, './src/providers'),
            '@components': path.resolve(__dirname, './src/components'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@app_types': path.resolve(__dirname, './src/types'),
            '@constants': path.resolve(__dirname, './src/constants'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@features': path.resolve(__dirname, './src/features'),
            '@effects': path.resolve(__dirname, './src/effects'),
            '@root': path.resolve(__dirname, './src'),
            '@project': path.resolve(__dirname, './'),
        },
    },
});
