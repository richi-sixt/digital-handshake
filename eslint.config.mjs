import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  globalIgnores([
    '.next/**',
    '.claude/**',
    'out/**',
    'deploy/**',
    'next-env.d.ts',
  ]),
  {
    // Newer react-hooks rules flag existing hydration patterns (read
    // localStorage / mount flags in an effect). They work; keep as warnings.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
])
