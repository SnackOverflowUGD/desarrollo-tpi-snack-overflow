import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // `server-only` is a Next.js pseudo-package (no real npm resolution) —
      // Next's own webpack aliases it to a no-op under client/browser
      // conditions. Under `environment: 'jsdom'` Vite eagerly resolves bare
      // imports (unlike 'node', where it defers to runtime and `vi.mock`
      // alone is enough), so `test/unit/backend-fetch.test.ts`'s
      // `vi.mock("server-only", ...)` needs this alias to resolve at all.
      'server-only': require.resolve('next/dist/compiled/server-only/empty.js'),
    },
  },
  test: {
    // jsdom (not 'node'): renderHook/RTL need DOM globals for the new
    // hook/component suites. Vitest 4 dropped `environmentMatchGlobs`, and a
    // per-file override would need one docblock per test file, so we run the
    // whole unit suite under jsdom — pure-function tests (date-input,
    // accionesPara, etc.) are unaffected since jsdom only adds browser
    // globals on top of Node, it doesn't remove anything they rely on.
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
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
