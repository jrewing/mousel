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
  {
    // 1. A specific, simple configuration for the ESLint config file itself
    files: ["eslint.config.js"],
    ...compat.extends("xo-typescript"), // Apply basic XO rules
    ...tseslint.configs.disableTypeChecked, // IMPORTANT: Disable type-checking
  },
  {
    // 2. A configuration for all your project's source files
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    ...compat.extends("xo-typescript"), // Apply full XO rules with type-checking
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylisticTypeChecked,
  },
  pluginReactConfig,
];
