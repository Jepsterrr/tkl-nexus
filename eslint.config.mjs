import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Tooling utanför appen — lintas inte mot app-reglerna:
    "workers/**",
  ]),
  {
    rules: {
      // React Compiler-regler (react-hooks v6) som flaggar etablerade mönster:
      // SSR-säker localStorage-sync efter mount och setLoading() i fetch-effects.
      // Korrekt omskrivning (useSyncExternalStore m.m.) är en egen refaktor —
      // tills dess varningar, inte blockerande fel.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
]);

export default eslintConfig;
