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
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-base-to-string": "off",
      // Prevent raw D1 SQL queries - use Drizzle ORM instead
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='db'][property.name='prepare']",
          message:
            "Avoid using db.prepare() - use Drizzle ORM methods (db.select(), db.insert(), etc.) instead for type safety",
        },
        {
          selector:
            "MemberExpression[property.name='prepare'] > CallExpression > Literal[value=/INSERT|UPDATE|DELETE|SELECT/i]",
          message:
            "Raw SQL queries detected. Use Drizzle ORM for type-safe database operations",
        },
      ],
    },
    settings: {
      // Suppress warnings, only show errors
      "import/ignore": ["warn"],
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
