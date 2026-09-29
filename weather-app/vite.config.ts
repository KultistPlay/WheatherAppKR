import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Путь, по которому будет доступен сайт: /<ИМЯ_РЕПОЗИТОРИЯ>/<ПОДПАПКА>/
  base: '/WheatherAppKR/weather-app/',
});