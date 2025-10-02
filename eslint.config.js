import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-base-to-string": "off",
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".wrangler/**",
      "**/*.config.js",
      "**/*.config.ts",
      "**/*.config.cjs",
      "worker-configuration.d.ts",
      "user-shard-drizzle/**",
    ],
  },
);
