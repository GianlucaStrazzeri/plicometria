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
  ]),
  // Project-level rule overrides to reduce noise during development.
  // These relax a few strict rules that currently generate many errors
  // across the codebase. We prefer warnings for now so the app can build
  // and we can progressively fix code issues.
  {
    rules: {
      // Calling setState synchronously inside effects is flagged heavily
      // across the codebase; make it a warning to unblock development.
      "react-hooks/set-state-in-effect": "warn",
      // Many files use `any` temporarily; treat as warning to avoid
      // blocking the lint run — fix gradually.
      "@typescript-eslint/no-explicit-any": "warn",
      // Some scripts use CommonJS `require()`; allow it for node scripts.
      "@typescript-eslint/no-require-imports": "off",
      // Reduce unused var strictness to warnings.
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      // Allow unescaped entities in JSX strings for now.
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
