import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['test/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      all: true,
      include: [
        'lib/errors/field-errors.ts',
        'lib/validation/password-strength.ts',
        'lib/validation/registro.ts',
        'lib/api/auth.ts',
      ],
    },
  },
})
