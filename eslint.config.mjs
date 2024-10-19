import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin"; // El plugin de TypeScript ESLint
import tsParser from "@typescript-eslint/parser";       // El parser de TypeScript ESLint
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    
    // Configuración del lenguaje
    languageOptions: {
      parser: tsParser,  // Usa el parser de TypeScript
      globals: {
        ...globals.node,  // Globales de Node.js
        ...globals.browser,  // Si también necesitas el entorno del navegador
      },
      ecmaVersion: 2021,  // Usa ECMAScript 2021, adecuado para Node.js 18
      sourceType: "module",
    },

    // Aquí debes incluir el plugin de TypeScript
    plugins: {
      "@typescript-eslint": tsPlugin,
    },

    // Definir las reglas
    rules: {
      // Reglas recomendadas de ESLint para JavaScript
      ...js.configs.recommended.rules,

      // Reglas recomendadas de @typescript-eslint
      ...tsPlugin.configs.recommended.rules,

      // Reglas personalizadas
      "object-curly-spacing": ["error", "always"],
      "brace-style": ["error", "1tbs"],
      curly: ["error", "multi-line"],

      // Reglas para TypeScript
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
];