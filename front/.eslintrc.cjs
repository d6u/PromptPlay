module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  ignorePatterns: [
    ".eslintrc.cjs",
    "vite.config.ts",
    "codegen.ts",
    "src/gql",
    "dist",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // "plugin:@typescript-eslint/recommended-type-checked",
    // "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:react-hooks/recommended",
  ],
  plugins: ["@typescript-eslint", "react-refresh"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "no-duplicate-imports": "error",
  },
};
