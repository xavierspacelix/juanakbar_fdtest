import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules", "dist"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },
];
