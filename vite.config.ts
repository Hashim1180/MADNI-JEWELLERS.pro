import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env['API_KEY']),
  },
  resolve: {
    mainFields: ['module'],
  },
});