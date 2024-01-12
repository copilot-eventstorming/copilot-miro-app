import path from 'path';
import fs from 'fs';
import dns from 'dns';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';


// https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');
const rootHtmlEntries = fs
    .readdirSync('.')
    .filter((file) => path.extname(file) === '.html')
    .reduce((acc, file) => {
        acc[path.basename(file, '.html')] = path.resolve(__dirname, file);
        return acc;
    }, {});

const modalHtmlEntries = fs
    .readdirSync('./modals')
    .filter((file) => path.extname(file) === '.html')
    .reduce((acc, file) => {
        acc[`modals/${path.basename(file, '.html')}`] = path.resolve(__dirname, 'modals', file);
        return acc;
    }, {});

// make sure vite picks up all html files in root, needed for vite build
const allHtmlEntries = {...rootHtmlEntries, ...modalHtmlEntries};

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            input: allHtmlEntries,
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, 'src'), // 路径别名
        },
        extensions: ['.js', '.json', '.ts'] // 使用路径别名时想要省略的后缀名，可以自己 增减
    },
    plugins: [react()],
    server: {
        port: 3000,
    },
});
