import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".next_backup/**",
    ".next_backup*/**",
    "out/**",
    "build/**",
    "public/agent-mail-dashboard/renderer/**",
    "public/agent-mail-dashboard/runner/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
