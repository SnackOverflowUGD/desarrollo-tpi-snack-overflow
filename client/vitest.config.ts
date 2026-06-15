import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['test/unit/**/*.test.ts', 'test/unit/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: [
        'lib/errors/field-errors.ts',
        'lib/validation/password-strength.ts',
        'lib/validation/registro.ts',
        'lib/validation/login.ts',
        'lib/validation/reset-password.ts',
        'lib/api/auth.ts',
        'lib/session/jwt.ts',
        'lib/session/next-redirect.ts',
        'lib/api/catalogo.ts',
        'lib/catalogo/query-params.ts',
        'lib/catalogo/disponibilidad.ts',
        'lib/catalogo/rating.ts',
        'lib/validation/busqueda.ts',
        'lib/validation/solicitud.ts',
        'lib/api/contrataciones.ts',
        'lib/server/backend-fetch.ts',
      ],
    },
  },
})
