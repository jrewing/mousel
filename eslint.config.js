import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
});

export default [
  ...compat.extends("xo-typescript"),
  {
    // 1. A specific, simple configuration for the ESLint config file itself
    files: ["eslint.config.js"],
    ...tseslint.configs.disableTypeChecked, // IMPORTANT: Disable type-checking
  },
  {
    // 2. A configuration for all your project's source files
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/indent": "off",
      indent: "off",
      quotes: "off",
      "@typescript-eslint/quotes": "off",
      "object-curly-spacing": "off",
      "@typescript-eslint/object-curly-spacing": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/padding-line-between-statements": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylisticTypeChecked,
  pluginReactConfig,
];
