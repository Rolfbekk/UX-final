import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Allow any types for AI analysis and Puppeteer operations
      "no-unused-vars": "warn",
      // Allow img elements for screenshots (they're external images)
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
