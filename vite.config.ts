import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    base: '/',
    server: {
        host: '127.0.0.1',
        port: 5174,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@api': path.resolve(__dirname, './src/api'),
            '@providers': path.resolve(__dirname, './src/providers'),
            '@components': path.resolve(__dirname, './src/components'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@layouts': path.resolve(__dirname, './src/layouts'),
            '@app_types': path.resolve(__dirname, './src/types'),
            '@root': path.resolve(__dirname, './src'),
            '@project': path.resolve(__dirname, './'),
        },
    },
});
