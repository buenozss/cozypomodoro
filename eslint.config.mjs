import js from "@eslint/js";
import globals from "globals";

export default [
    {
        ignores: ["node_modules/**", "coverage/**"]
    },

    js.configs.recommended,

    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: globals.node
        }
    },

    {
        files: ["public/**/*.js"],
        languageOptions: {
            globals: globals.browser
        }
    },

    {
        files: ["tests/**/*.js"],
        languageOptions: {
            globals: globals.jest
        }
    }
];
