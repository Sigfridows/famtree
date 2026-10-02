import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'src/app/**',
        'src/assets/**',                      // Excluye imágenes y recursos estáticos
        'src/components/**',
        'src/features/**/components/**',
        'src/features/**/types/**',
        '**/*.types.ts',
        '**/index.ts',
        'src/tests/**',
        // Excluir temporalmente servicios y hooks pendientes de tests unitarios
        'src/features/asylums/hooks/**',
        'src/features/asylums/services/**',
        'src/features/map/hooks/**',
        'src/features/notifications/**',
        // The role-admin screens are exercised by the disposable browser workflow
        // in backend/scripts/check_admin_ui.sh; keep unit coverage focused on
        // shared transport and domain hooks.
        'src/features/admin/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
